package common;


import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.RecordComponent;
import java.lang.reflect.Type;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Base de Service para o CRUD padrão.
 *
 * <p>Provê a implementação genérica de busca paginada com filtros
 * estruturados ({@link #buscarAvancado(FiltroDTO)}), com:</p>
 *
 * <ul>
 *   <li>Paginação offset/limit via {@link Page}.</li>
 *   <li>Ordenação por múltiplos campos validados contra a whitelist única
 *       {@link #camposPermitidos()}, derivada do {@code ListDTO}.</li>
 *   <li>Filtros estruturados (operadores explícitos, AND ou OR únicos por
 *       requisição, sem aninhamento) traduzidos por
 *       {@link FiltroAvancadoQueryBuilder}.</li>
 *   <li>Filtro fixo {@code status = ATIVO} aplicado por padrão, sempre com
 *       {@code AND} ao bloco de critérios do cliente, substituído quando a
 *       requisição inclui algum critério com {@code campo = "status"} (e
 *       {@code status} faz parte do {@code ListDTO}).</li>
 * </ul>
 *
 * <p>O endpoint público correspondente é {@code POST /buscar}, herdado pelo
 * {@link BaseRest}. Não há {@code GET /} paginado — ver ADR-0009.</p>
 *
 * <p>Pontos de extensão: {@link #camposPermitidos()} (raro; default deriva do
 * {@code ListDTO}) e {@link #buscarAvancado(FiltroDTO)} (raro; default cobre o
 * caso comum). O sort default ({@code id desc}) é fixo, mínimo e não
 * sobrescritível — atende apenas ao requisito técnico de paginação
 * consistente.</p>
 *
 * @see Pagina
 * @see FiltroDTO
 * @see FiltroAvancadoQueryBuilder
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
     * Ordenação default fixa aplicada quando o cliente não envia {@code sort}.
     *
     * <p>Usa <b>somente</b> {@code id desc} (PK herdada de {@link BaseEntity},
     * existente em toda entidade do CRUD). É o contrato técnico mínimo
     * exigido pela paginação offset/limit: sem um {@code ORDER BY} que
     * produza ordem total, PostgreSQL não garante a mesma ordem entre
     * requisições sequenciais ({@code page=0} seguido de {@code page=1}),
     * o que causa registros duplicados/ausentes entre páginas. A PK é única
     * por construção e atende esse requisito.</p>
     *
     * <p><b>Sem opinião de UX</b>: o backend não escolhe "mais recentes
     * primeiro" nem qualquer outro critério de apresentação. Telas que
     * queiram ordenação inicial específica DEVEM enviar {@code sort}
     * explicitamente no {@code FiltroDTO}.</p>
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
     * Busca paginada com filtros estruturados, retornando o envelope
     * {@link Pagina} com a página atual de {@code ListDTO}.
     *
     * <p>Sequência:</p>
     * <ol>
     *   <li>Parseia {@code filtro.sort()} via {@link SortParser} (validação
     *       sintática).</li>
     *   <li>Valida cada campo do sort contra {@link #camposPermitidos()}.</li>
     *   <li>Aplica {@link #DEFAULT_SORT} quando o cliente não envia sort.</li>
     *   <li>Constrói o trecho JPQL dos critérios via
     *       {@link FiltroAvancadoQueryBuilder} (whitelist, operador↔tipo,
     *       combinação operador↔valor, conversão).</li>
     *   <li>Combina com o filtro implícito {@code status = ATIVO} (sempre com
     *       {@code AND}) quando o cliente não filtra explicitamente por
     *       {@code status} e {@code status} faz parte do {@code ListDTO}.</li>
     *   <li>Executa a query paginada com projeção em {@code ListDTO} e
     *       calcula o envelope.</li>
     * </ol>
     *
     * @param filtro payload da busca (Bean Validation aplicado no
     *               {@link BaseRest}). Nulo é tratado como filtro vazio.
     */
    public Pagina<ListDTO> buscarAvancado(FiltroDTO filtro) {

        FiltroDTO efetivo = filtro == null
                ? new FiltroDTO(0, 20, List.of(), OperadorLogico.AND, List.of())
                : filtro;

        int page = efetivo.page();
        int size = efetivo.size() <= 0 ? 20 : efetivo.size();

        // 1. Sort.
        List<SortCriterio> criteriosCliente = SortParser.parse(efetivo.sort());

        Set<String> permitidos = camposPermitidos();

        for (SortCriterio c : criteriosCliente) {

            if (!permitidos.contains(c.campo()))
                throw new IllegalArgumentException(
                        "Campo '" + c.campo() + "' não é permitido para ordenação. "
                                + "Campos permitidos: " + permitidos + "."
                );
        }

        List<SortCriterio> criteriosSort = criteriosCliente.isEmpty() ? DEFAULT_SORT : criteriosCliente;

        Sort sort = montarSort(criteriosSort);

        // 2. Filtros estruturados.
        FiltroAvancadoQueryBuilder.Resultado resultado = FiltroAvancadoQueryBuilder.construir(
                efetivo,
                permitidos,
                camposEntidade()
        );

        // 3. Combina com filtro implícito de status = ATIVO.
        String jpql = resultado.jpql();
        Map<String, Object> parametros = new LinkedHashMap<>(resultado.parametros());

        boolean clienteFiltrouStatus = criterioMencionaStatus(efetivo);

        if (!clienteFiltrouStatus) {

            String trechoStatus = "status = :statusFixo";
            parametros.put("statusFixo", EnumStatusEntity.ATIVO);

            jpql = jpql.isBlank()
                    ? trechoStatus
                    : jpql + " and " + trechoStatus;
        }

        // 4. Executa.
        PanacheQuery<?> query;

        if (jpql.isBlank())
            query = repository().findAll(sort);
        else
            query = repository().find(jpql, sort, parametros);

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
    //  Pontos de extensão (whitelist)
    // ----------------------------------------------------------------------

    /**
     * Whitelist única de campos permitidos para <b>filtro</b> e
     * <b>ordenação</b>, derivada automaticamente dos componentes declarados
     * no record {@code ListDTO}.
     *
     * <p>Princípio: o {@code ListDTO} representa exatamente o que o frontend
     * exibe na tabela; o usuário pode filtrar/ordenar pelas colunas que vê,
     * nada mais. Isso elimina a necessidade de manter whitelists explícitas
     * por entidade e fecha a porta para exposição de campos sensíveis que
     * existem na entidade mas não no DTO (ex.: {@code Usuario.senhaHash}).</p>
     *
     * <p>Para incluir um campo no filtro/sort, basta adicioná-lo ao
     * {@code ListDTO}. Os nomes dos componentes do record DEVEM corresponder
     * aos atributos da entidade JPA, porque são usados diretamente como nomes
     * de campo na cláusula JPQL.</p>
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

            Set<String> nomes = new LinkedHashSet<>();

            for (RecordComponent rc : tipoListDTO.getRecordComponents())
                nomes.add(rc.getName());

            return Collections.unmodifiableSet(nomes);
        }

        // Fallback para ListDTOs que não sejam records (caso futuro).
        Set<String> nomes = new LinkedHashSet<>();

        for (Field f : tipoListDTO.getDeclaredFields()) {

            if (java.lang.reflect.Modifier.isStatic(f.getModifiers()))
                continue;

            nomes.add(f.getName());
        }

        return Collections.unmodifiableSet(nomes);
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
     * Indica se o cliente incluiu algum critério com {@code campo = "status"}
     * e se {@code status} é um componente do {@code ListDTO} (whitelist).
     *
     * <p>Quando verdadeiro, o filtro implícito {@code status = ATIVO} é
     * desligado para permitir, por exemplo, listar inativos.</p>
     */
    private boolean criterioMencionaStatus(FiltroDTO filtro) {

        if (!camposPermitidos().contains("status"))
            return false;

        List<CriterioFiltro> criterios = filtro.criterios();

        if (criterios == null || criterios.isEmpty())
            return false;

        for (CriterioFiltro c : criterios) {

            if (c != null && "status".equals(c.campo()))
                return true;
        }

        return false;
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
