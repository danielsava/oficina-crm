package common;


import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MultivaluedMap;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Base de Service para o CRUD padrão.
 *
 * <p>Provê a implementação genérica de listagem paginada
 * ({@link #listarDTO(int, int, List, MultivaluedMap)}), com:</p>
 *
 * <ul>
 *   <li>Paginação offset/limit via {@link Page}.</li>
 *   <li>Ordenação por múltiplos campos validados contra a whitelist única
 *       {@link #camposPermitidos()}.</li>
 *   <li>Filtros por coluna validados contra a mesma whitelist
 *       {@link #camposPermitidos()}, com convenção de operadores por tipo
 *       (String → ILIKE; enum/UUID/número/boolean → igualdade; data/número
 *       com sufixos {@code From}/{@code To} → range; query param repetido
 *       → IN).</li>
 *   <li>Filtro fixo {@code status = ATIVO} aplicado por padrão, mas
 *       substituído quando a requisição já filtra explicitamente por
 *       {@code status} (e {@code status} faz parte do {@code ListDTO}).</li>
 * </ul>
 *
 * <p>Pontos de extensão sobrescritíveis: {@link #camposPermitidos()} (raro,
 * pois o default deriva do {@code ListDTO}) e
 * {@link #aplicarFiltros(MultivaluedMap)} (raro, pois o default cobre a
 * convenção de tipos por reflexão).</p>
 *
 * <p>A ordenação default ({@code id desc}) é fixa, mínima e não sobrescritível
 * — atende apenas ao requisito técnico de paginação consistente. Ordenação
 * com significado de apresentação (alfabética, cronológica, etc.) é decisão
 * de UX e vive no frontend, que envia {@code ?sort=...} quando necessário.</p>
 *
 * @see Pagina
 * @see BaseRest
 */
public abstract class BaseService<Entity extends BaseEntity, EditDTO, ListDTO> {


    /**
     * Cache de campos da entidade por classe, para evitar reflexão em todo
     * request. Populado preguiçosamente em {@link #camposEntidade()}.
     */
    private static final Map<Class<?>, Map<String, Class<?>>> CACHE_CAMPOS_ENTIDADE = new ConcurrentHashMap<>();

    /**
     * Cache de nomes de campos do {@code ListDTO} por classe, para evitar
     * reflexão a cada request. Populado preguiçosamente em
     * {@link #camposPermitidos()}.
     */
    private static final Map<Class<?>, Set<String>> CACHE_CAMPOS_LISTDTO = new ConcurrentHashMap<>();

    /**
     * Query params consumidos pelo próprio {@link BaseRest} (paginação e
     * ordenação) e que, portanto, <b>não</b> devem ser tratados como
     * candidatos a filtro nem como "ignorados" no log de depuração.
     */
    private static final Set<String> PARAMS_RESERVADOS = Set.of("page", "size", "sort");

    /**
     * Ordenação default fixa aplicada quando o cliente não envia {@code sort}.
     *
     * <p>Usa <b>somente</b> {@code id desc} (PK herdada de {@link BaseEntity},
     * existente em toda entidade do CRUD). É o contrato técnico mínimo
     * exigido pela paginação offset/limit: sem um {@code ORDER BY} que
     * produza ordem total, PostgreSQL não garante a mesma ordem entre
     * requisições sequenciais ({@code ?page=0} seguido de {@code ?page=1}),
     * o que causa registros duplicados/ausentes entre páginas. A PK é única
     * por construção e atende esse requisito.</p>
     *
     * <p><b>Sem opinião de UX</b>: o backend não escolhe "mais recentes
     * primeiro" nem qualquer outro critério de apresentação. Telas que
     * queiram ordenação inicial específica (alfabética por nome, cronológica
     * por {@code createdAt}, etc.) DEVEM enviar {@code ?sort=...}
     * explicitamente.</p>
     *
     * <p>Esta lista é fonte interna do backend e <b>não</b> passa pela
     * validação contra {@link #camposPermitidos()} — por isso pode usar o
     * campo técnico {@code id}, que normalmente não faz parte do
     * {@code ListDTO}.</p>
     */
    private static final List<SortCriterio> DEFAULT_SORT = List.of(
            new SortCriterio("id", SortDirecao.DESC)
    );


    public abstract BaseMapper<Entity, EditDTO> mapper();

    public abstract BaseRepository<Entity> repository();

    public abstract Class<ListDTO> listDTO();

    public abstract Class<EditDTO> editDTO();



    @Transactional
    public void inserir(@Valid EditDTO editDTO) {

        Entity e = this.mapper().toEntity(editDTO);

        repository().persist(e);
    }

    @Transactional
    public void atualizar(Long id, @Valid EditDTO editDTO) {

        Entity e = buscarPorId(id);

        if(e == null)
            throw new NotFoundException("Registro não encontrado");

        mapper().updatedEntityFromDTO(editDTO, e);
    }

    @Transactional
    public void atualizarPorUUID(String uuid, @Valid EditDTO editDTO) {

        Entity e = buscarPorUUID(uuid);

        if(e == null)
            throw new NotFoundException("Registro não encontrado");

        mapper().updatedEntityFromDTO(editDTO, e);
    }

    /**
     * Listagem paginada, ordenada e filtrada, retornando o envelope
     * {@link Pagina} com a página atual de {@code ListDTO}.
     *
     * @param page         índice zero-based da página (já validado em
     *                     {@code >= 0} pelo {@link BaseRest}).
     * @param size         tamanho de página (já validado no intervalo
     *                     {@code [1, 100]} pelo {@link BaseRest}).
     * @param sortBruto    valores brutos do query param {@code sort}.
     *                     {@code null}/vazio aplica o {@link #DEFAULT_SORT}.
     * @param queryParams  todos os query params da requisição; só os campos
     *                     pertencentes a {@link #camposPermitidos()} são
     *                     aplicados.
     */
    public Pagina<ListDTO> listarDTO(int page, int size, List<String> sortBruto, MultivaluedMap<String, String> queryParams) {

        // 1. Parseia o sort vindo do cliente (validação sintática).
        List<SortCriterio> criteriosCliente = SortParser.parse(sortBruto);

        // 2. Valida campos vindos do cliente contra a whitelist (mesma usada para filtros).
        //    O DEFAULT_SORT é fonte interna do backend e por isso não passa pela whitelist
        //    (usa campos técnicos como 'id' e 'createdAt' que normalmente não estão no ListDTO).
        Set<String> permitidos = camposPermitidos();
        for (SortCriterio c : criteriosCliente) {
            if (!permitidos.contains(c.campo()))
                throw new IllegalArgumentException(
                        "Campo '" + c.campo() + "' não é permitido para ordenação. "
                                + "Campos permitidos: " + permitidos + "."
                );
        }

        // 3. Aplica DEFAULT_SORT quando cliente não enviou sort.
        List<SortCriterio> criterios = criteriosCliente.isEmpty() ? DEFAULT_SORT : criteriosCliente;

        // 4. Monta o Sort do Panache.
        Sort sort = montarSort(criterios);

        // 5. Aplica filtros (whitelist + convenção de tipos).
        FiltroAplicado filtro = aplicarFiltros(queryParams);

        // 6. Combina com filtro fixo de status = ATIVO quando ausente da request.
        FiltroAplicado efetivo = combinarComStatusAtivo(filtro, queryParams);

        // 7. Executa a query paginada.
        PanacheQuery<?> query;

        if (efetivo.jpql().isBlank()) {

            // Sem filtros: usa busca sem WHERE.
            query = repository().findAll(sort);
        } else {

            query = repository().find(efetivo.jpql(), sort, efetivo.parametros());
        }

        long totalElements = query.count();

        List<ListDTO> content = query.project(listDTO()).page(Page.of(page, size)).list();

        int totalPages = size > 0 ? (int) Math.ceil(totalElements / (double) size) : 0;

        return new Pagina<>(content, page, size, totalElements, totalPages);
    }

    /**
     * Retorna o {@code EditDTO} populado com os dados do registro identificado
     * pelo {@code uuid}, pronto para alimentar o formulário de edição no
     * frontend.
     *
     * <p>Usa projeção Panache para evitar carregar a entidade completa quando
     * o EditDTO basta. Módulos que precisem de campos calculados ou
     * associações podem sobrescrever este método.</p>
     */
    public EditDTO buscarEditDTOporUUID(String uuid) {

        return this.repository().find("uuid", UUID.fromString(uuid))
                .project(editDTO())
                .firstResult();
    }


    // ----------------------------------------------------------------------
    //  Pontos de extensão (whitelist e defaults)
    // ----------------------------------------------------------------------

    /**
     * Whitelist única de campos permitidos para <b>filtro</b> e <b>ordenação</b>,
     * derivada automaticamente dos componentes declarados no record
     * {@code ListDTO}.
     *
     * <p>Princípio: o {@code ListDTO} representa exatamente o que o frontend
     * exibe na tabela; o usuário pode filtrar/ordenar pelas colunas que vê,
     * nada mais. Isso elimina a necessidade de manter whitelists explícitas
     * por entidade e fecha a porta para exposição de campos sensíveis que
     * existem na entidade mas não no DTO (ex.: {@code Usuario.senhaHash}).</p>
     *
     * <p>Para incluir um campo no filtro/sort, basta adicioná-lo ao
     * {@code ListDTO}. Para suportar range em {@code createdAt} ou
     * {@code updatedAt}, inclua-os no {@code ListDTO} da entidade.</p>
     *
     * <p>Os nomes dos componentes do record DEVEM corresponder aos atributos
     * da entidade JPA, porque são usados diretamente como nomes de campo na
     * cláusula JPQL ({@code where nome like ...}, {@code order by createdAt}).
     * Renomeamentos de coluna no banco são absorvidos pelo {@code @Column}
     * da entidade; o JPQL trabalha com o nome do atributo Java.</p>
     *
     * <p>Resultado cacheado por classe de {@code ListDTO}. {@code *Service}
     * com necessidade incomum (campos calculados, projeções específicas) pode
     * sobrescrever este método.</p>
     */
    protected Set<String> camposPermitidos() {

        return CACHE_CAMPOS_LISTDTO.computeIfAbsent(listDTO(), BaseService::descobrirCamposListDTO);
    }

    private static Set<String> descobrirCamposListDTO(Class<?> tipoListDTO) {

        if (tipoListDTO.isRecord()) {

            Set<String> nomes = new java.util.LinkedHashSet<>();

            for (java.lang.reflect.RecordComponent rc : tipoListDTO.getRecordComponents())
                nomes.add(rc.getName());

            return Collections.unmodifiableSet(nomes);
        }

        // Fallback para ListDTOs que não sejam records (caso futuro).
        Set<String> nomes = new java.util.LinkedHashSet<>();

        for (Field f : tipoListDTO.getDeclaredFields()) {

            if (java.lang.reflect.Modifier.isStatic(f.getModifiers()))
                continue;

            nomes.add(f.getName());
        }

        return Collections.unmodifiableSet(nomes);
    }

    /**
     * Constrói o trecho JPQL e os parâmetros nomeados a partir dos query
     * params da requisição, aplicando a whitelist única
     * {@link #camposPermitidos()} (derivada do {@code ListDTO}).
     *
     * <p>Convenções aplicadas via reflexão sobre o tipo do campo na entidade
     * JPA:</p>
     *
     * <ul>
     *   <li>Campo {@code String} → {@code ILIKE '%' || valor || '%'}.</li>
     *   <li>Campo enum, {@code UUID}, número, {@code Boolean} → igualdade.</li>
     *   <li>Sufixos {@code From} (≥) e {@code To} (≤) no nome do query param
     *       → comparação de range em campos numéricos e de data.</li>
     *   <li>Query param repetido → cláusula {@code IN}.</li>
     * </ul>
     *
     * <p>Cada {@code *Service} pode sobrescrever este método para tratar
     * filtros que fujam da convenção (ex.: igualdade exata em uma {@code
     * String} específica).</p>
     */
    protected FiltroAplicado aplicarFiltros(MultivaluedMap<String, String> queryParams) {

        if (queryParams == null || queryParams.isEmpty())
            return FiltroAplicado.vazio();

        Set<String> filtraveis = camposPermitidos();
        Map<String, Class<?>> camposEntidade = camposEntidade();

        List<String> trechos = new ArrayList<>();
        Map<String, Object> parametros = new LinkedHashMap<>();
        List<String> ignorados = new ArrayList<>();
        int contadorParam = 0;

        for (Map.Entry<String, List<String>> entry : queryParams.entrySet()) {

            String chave = entry.getKey();
            List<String> valores = entry.getValue();

            if (valores == null || valores.isEmpty())
                continue;

            // Params reservados (page/size/sort) são consumidos pelo BaseRest;
            // não tratamos como filtro nem como ignorados.
            if (PARAMS_RESERVADOS.contains(chave))
                continue;

            // Detecta sufixo de range (From/To) e identifica o campo base.
            String campoBase;
            String sufixo;

            if (chave.endsWith("From")) {

                campoBase = chave.substring(0, chave.length() - "From".length());

                sufixo = "From";

            } else if (chave.endsWith("To")) {

                campoBase = chave.substring(0, chave.length() - "To".length());

                sufixo = "To";

            } else {

                campoBase = chave;

                sufixo = "";
            }

            // Ignora silenciosamente filtros fora da whitelist (registrando em log DEBUG).
            if (!filtraveis.contains(campoBase)) {
                ignorados.add(chave);
                continue;
            }

            Class<?> tipoCampo = camposEntidade.get(campoBase);

            if (tipoCampo == null) {
                ignorados.add(chave);
                continue; // Campo não existe na entidade; ignora.
            }

            // IN: query param repetido (apenas para igualdade exata).
            if (sufixo.isEmpty() && valores.size() > 1 && !String.class.equals(tipoCampo)) {

                String paramNome = "p_" + (contadorParam++);

                List<Object> convertidos = new ArrayList<>(valores.size());

                for (String v : valores)
                    convertidos.add(converterValor(v, tipoCampo, campoBase));

                trechos.add(campoBase + " in :" + paramNome);

                parametros.put(paramNome, convertidos);

                continue;
            }

            String valor = valores.get(0);

            if (valor == null || valor.isBlank())
                continue;

            String paramNome = "p_" + (contadorParam++);

            if (!sufixo.isEmpty()) {

                // Range From/To.
                Object convertido = converterValor(valor, tipoCampo, campoBase);

                String operador = "From".equals(sufixo) ? ">=" : "<=";

                trechos.add(campoBase + " " + operador + " :" + paramNome);

                parametros.put(paramNome, convertido);

            } else if (String.class.equals(tipoCampo)) {

                // ILIKE para strings.
                trechos.add("lower(" + campoBase + ") like lower(:" + paramNome + ")");

                parametros.put(paramNome, "%" + valor + "%");

            } else {

                // Igualdade exata para os demais tipos.
                Object convertido = converterValor(valor, tipoCampo, campoBase);

                trechos.add(campoBase + " = :" + paramNome);

                parametros.put(paramNome, convertido);

            }

        }

        if (!ignorados.isEmpty() && Log.isDebugEnabled())
            Log.debugf(
                    "Filtros ignorados em %s (fora de camposPermitidos() ou inexistentes na entidade): %s",
                    getClass().getSimpleName(),
                    ignorados
            );

        if (trechos.isEmpty())
            return FiltroAplicado.vazio();

        return new FiltroAplicado(String.join(" and ", trechos), parametros);
    }


    // ----------------------------------------------------------------------
    //  Helpers internos
    // ----------------------------------------------------------------------

    private Sort montarSort(List<SortCriterio> criterios) {

        Sort sort = null;

        for (SortCriterio c : criterios) {

            if (sort == null)
                sort = Sort.by(c.campo(), c.direcao().toPanache());
            else
                sort = sort.and(c.campo(), c.direcao().toPanache());
        }

        return sort;
    }

    /**
     * Combina o filtro construído por {@link #aplicarFiltros} com o filtro
     * fixo de {@code status = ATIVO}. O filtro fixo é aplicado apenas quando
     * a requisição não traz o campo {@code status} explicitamente — assim,
     * uma tela administrativa que queira listar inativos pode mandar
     * {@code ?status=INATIVO} (desde que {@code status} faça parte do
     * {@code ListDTO}, i.e., esteja em {@link #camposPermitidos()}) e ter
     * seu filtro respeitado.
     */
    private FiltroAplicado combinarComStatusAtivo(FiltroAplicado base, MultivaluedMap<String, String> queryParams) {

        boolean statusJaFiltrado = queryParams != null
                && queryParams.containsKey("status")
                && queryParams.get("status") != null
                && !queryParams.get("status").isEmpty()
                && camposPermitidos().contains("status");

        if (statusJaFiltrado)
            return base;

        String trechoStatus = "status = :statusFixo";
        Map<String, Object> parametros = new HashMap<>(base.parametros());
        parametros.put("statusFixo", EnumStatusEntity.ATIVO);

        String jpql = base.jpql().isBlank()
                ? trechoStatus
                : base.jpql() + " and " + trechoStatus;

        return new FiltroAplicado(jpql, parametros);
    }

    /**
     * Mapa {@code nomeCampo -> tipo} dos campos declarados na entidade e em
     * suas superclasses (inclui {@link BaseEntity}). Resultado cacheado por
     * {@code Class<Entity>}.
     */
    private Map<String, Class<?>> camposEntidade() {

        Class<?> tipoEntity = resolverTipoEntity();

        return CACHE_CAMPOS_ENTIDADE.computeIfAbsent(tipoEntity, BaseService::descobrirCampos);
    }

    private static Map<String, Class<?>> descobrirCampos(Class<?> tipo) {

        Map<String, Class<?>> resultado = new HashMap<>();
        Class<?> atual = tipo;

        while (atual != null && atual != Object.class) {

            for (Field f : atual.getDeclaredFields()) {

                if (java.lang.reflect.Modifier.isStatic(f.getModifiers()))
                    continue;

                // Não sobrescreve em caso de shadowing — a subclasse vem primeiro.
                resultado.putIfAbsent(f.getName(), f.getType());
            }

            atual = atual.getSuperclass();
        }

        return Collections.unmodifiableMap(resultado);
    }

    /**
     * Resolve o argumento de tipo {@code Entity} declarado pela subclasse de
     * {@link BaseService}. Usado para localizar os campos da entidade via
     * reflexão.
     */
    @SuppressWarnings("unchecked")
    private Class<? extends BaseEntity> resolverTipoEntity() {

        Class<?> classe = getClass();

        while (classe != null && classe.getSuperclass() != BaseService.class)
            classe = classe.getSuperclass();

        if (classe == null)
            throw new IllegalStateException("Subclasse de BaseService não localizada para " + getClass().getName());

        Type generico = classe.getGenericSuperclass();

        if (!(generico instanceof ParameterizedType pt))
            throw new IllegalStateException("BaseService precisa ser parametrizado em " + getClass().getName());

        Type arg = pt.getActualTypeArguments()[0];

        if (!(arg instanceof Class<?> c))
            throw new IllegalStateException("Tipo Entity não é uma Class em " + getClass().getName());

        return (Class<? extends BaseEntity>) c;
    }

    private Object converterValor(String valor, Class<?> tipo, String campo) {

        try {

            if (tipo.isEnum()) {

                @SuppressWarnings({"rawtypes", "unchecked"})
                Object convertido = Enum.valueOf((Class<Enum>) tipo, valor);
                return convertido;
            }

            if (UUID.class.equals(tipo))
                return UUID.fromString(valor);

            if (Boolean.class.equals(tipo) || boolean.class.equals(tipo))
                return Boolean.parseBoolean(valor);

            if (Long.class.equals(tipo) || long.class.equals(tipo))
                return Long.parseLong(valor);

            if (Integer.class.equals(tipo) || int.class.equals(tipo))
                return Integer.parseInt(valor);

            if (Short.class.equals(tipo) || short.class.equals(tipo))
                return Short.parseShort(valor);

            if (Double.class.equals(tipo) || double.class.equals(tipo))
                return Double.parseDouble(valor);

            if (Float.class.equals(tipo) || float.class.equals(tipo))
                return Float.parseFloat(valor);

            if (java.math.BigDecimal.class.equals(tipo))
                return new java.math.BigDecimal(valor);

            if (java.math.BigInteger.class.equals(tipo))
                return new java.math.BigInteger(valor);

            if (LocalDate.class.equals(tipo))
                return LocalDate.parse(valor);

            if (LocalDateTime.class.equals(tipo))
                return LocalDateTime.parse(valor);

            if (OffsetDateTime.class.equals(tipo))
                return OffsetDateTime.parse(valor);

            if (String.class.equals(tipo))
                return valor;

        } catch (IllegalArgumentException | DateTimeParseException ex) {

            throw new IllegalArgumentException(
                    "Valor '" + valor + "' inválido para o filtro '" + campo + "': " + ex.getMessage()
            );
        }

        // Tipo não reconhecido — repassa string crua e deixa o Hibernate falhar de forma controlada.
        return valor;
    }


    // ----------------------------------------------------------------------
    //  Métodos utilitários herdados (CRUD básico, busca por atributo, etc.)
    // ----------------------------------------------------------------------

    public List<Entity> listar() {

        return repository().listAll();
    }

    public List<Entity> listarPor(String atributo, Object valor) {

        return repository().list(atributo, valor);
    }

    public Entity buscarPor(String atributo, Object valor) {

        return repository().find(atributo, valor).firstResult();
    }

    public Entity buscarPorId(Long id) {

        return buscarPor("id", id);
    }

    public Entity buscarPorUUID(String uuid) {

        return buscarPor("uuid", uuid);
    }

    public Long contarPor(String atributo, Object valor) {

        return repository().count(atributo, valor);
    }

    public boolean existePor(String atributo, Object valor) {

        return contarPor(atributo, valor) > 0;
    }

    @Transactional
    public void inserir(Entity e) {

        repository().persist(e);
    }

    @Transactional
    public boolean inativarPorId(Long id) {

        return repository().update("status = ?1 where id = ?2", EnumStatusEntity.INATIVO, id) > 0;
    }

    @Transactional
    public boolean inativarPorUUID(String uuid) {

        return repository().update("status = ?1 where uuid = ?2", EnumStatusEntity.INATIVO, uuid) > 0;
    }

    @Transactional
    public Long excluirPor(String atributo, Object valor) {

        return repository().delete(atributo, valor);
    }

    @Transactional
    public boolean excluirPorId(Long id) {

        return repository().deleteById(id);
    }

    @Transactional
    public boolean excluirPorUUID(String uuid) {

        return excluirPor("uuid", uuid) > 0;
    }

}
