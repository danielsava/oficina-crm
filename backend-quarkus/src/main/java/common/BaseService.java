package common;


import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Map;

public abstract class BaseService<Entity extends BaseEntity, EditDTO, ListDTO> {


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

    public List<ListDTO> listarDTO() {

        return this.repository().find("status", EnumStatusEntity.ATIVO)
                .project(listDTO())
                .list();
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

        return this.repository().find("uuid", java.util.UUID.fromString(uuid))
                .project(editDTO())
                .firstResult();
    }

    // --

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

        return excluirPor("id", id) > 0;  // repository.deleteById(id)
    }

    @Transactional
    public boolean excluirPorUUID(String uuid) {

        return excluirPor("uuid", uuid) > 0;
    }


    /*

    //
    //  Código removido por risco de SqlInjection
    public int atualizar(Long id, Map<String, Object> params) {

        String query = params.keySet().stream()
                .map(key -> key + " = :" + key)
                .reduce((a, b) -> a + ", " + b)
                .orElse("");

        query = query + " where id = :id";

        params.put("id", id);

        return repository().update(query, params);

    }

    default List<E> listarPaginado(int pageIndex, int pageSize, String sortBy, String sortDirection) {

        return findAll(Sort.by(sortBy)
                .direction(Sort.Direction.valueOf(sortDirection)))
                .page(pageIndex, pageSize)
                .list();
    }

    default List<E> findByDynamicFilters(String name, Integer minRanking) {

        String query = "1=1"; // Base da consulta

        Map<String, Object> params = new HashMap<>();

        if (name != null) {
            query += " and name like :name";
            params.put("name", "%" + name + "%");
        }

        if (minRanking != null) {
            query += " and ranking >= :minRanking";
            params.put("minRanking", minRanking);
        }

        return find(query, params).list();
    }*/

}
