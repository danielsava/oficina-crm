package common.base;


import common.filtro.CriterioFiltro;
import common.filtro.FiltroAvancadoQueryBuilder;
import common.filtro.FiltroDTO;
import common.filtro.OperadorLogico;
import common.paginacao.Pagina;
import common.paginacao.SortCriterio;
import common.paginacao.SortDirecao;
import common.paginacao.SortParser;
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

public abstract class BaseService<Entity extends BaseEntity, EditDTO, ListDTO> {


    // Cache de campos da entidade por classe, para evitar reflexão por request.
    private static final Map<Class<?>, Map<String, Class<?>>> CACHE_CAMPOS_ENTIDADE = new ConcurrentHashMap<>();

    // Cache de nomes de campos do ListDTO por classe, para evitar reflexão por request.
    private static final Map<Class<?>, Set<String>> CACHE_CAMPOS_LISTDTO = new ConcurrentHashMap<>();

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
                throw new IllegalArgumentException("Campo '" + c.campo() + "' não é permitido para ordenação. Campos permitidos: " + permitidos + ".");

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

    public EditDTO buscarEditDTOporUUID(String uuid) {

        return this.repository().find("uuid", UUID.fromString(uuid))
                .project(editDTO())
                .firstResult();
    }


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

        Set<String> nomes = new LinkedHashSet<>();

        for (Field f : tipoListDTO.getDeclaredFields()) {

            if (java.lang.reflect.Modifier.isStatic(f.getModifiers()))
                continue;

            nomes.add(f.getName());
        }

        return Collections.unmodifiableSet(nomes);
    }


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

    // Quando o cliente filtra explicitamente por 'status', o filtro implícito
    // status = ATIVO é desligado (permite listar inativos, por exemplo).
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

    // Mapa nomeCampo -> tipo dos campos declarados na entidade e superclasses.
    // Resultado cacheado por classe de entidade.
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

    // Resolve o argumento de tipo Entity declarado pela subclasse, via reflexão.
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
