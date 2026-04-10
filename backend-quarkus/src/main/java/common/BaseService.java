package common;


import jakarta.transaction.Transactional;

import java.util.List;

public abstract class BaseService<Entity extends BaseEntity, EditDTO> {


    protected final BaseMapper<Entity, EditDTO> mapper;

    protected final BaseRepository<Entity> repository;



    /* Gambi por conta do Quarkus IoC Arc proxy com @ApplicationScoped */
    public BaseService() {
        this.repository = null;
        this.mapper = null;
    }
    

    protected BaseService(
            BaseRepository<Entity> repository,
            BaseMapper<Entity, ?> mapper
    ) {

        this.repository = repository;

        this.mapper = mapper;
    }


    public List<Entity> listar() {

        return repository.listAll();
    }

    public List<Entity> listarPor(String atributo, Object valor) {

        return repository.list(atributo, valor);
    }

    public Entity buscarPor(String atributo, Object valor) {

        return repository.find(atributo, valor).firstResult();
    }

    public Entity buscarPorId(Long id) {

        return buscarPor("id", id);
    }

    public Entity buscarPorUUID(Long id) {

        return buscarPor("uuid", id);
    }

    public Long contarPor(String atributo, Object valor) {

        return repository.count(atributo, valor);
    }

    public boolean existePor(String atributo, Object valor) {

        return contarPor(atributo, valor) > 0;
    }

    @Transactional
    public void inserir(Entity e) {

        repository.persist(e);
    }

    @Transactional
    public boolean inativarPorId(Long id) {

        return repository.inativarPorId(id) > 0;
    }

    @Transactional
    public boolean inativarPorUUID(String uuid) {

        return repository.inativarPorUUID(uuid) > 0;
    }

    @Transactional
    public Long excluirPor(String atributo, Object valor) {

        return repository.delete(atributo, valor);
    }

    @Transactional
    public boolean excluirPorId(Long id) {

        return excluirPor("id", id) > 0;  // repository.deleteById(id)
    }

    @Transactional
    public boolean excluirPorUUID(Long uuid) {

        return excluirPor("uuid", uuid) > 0;
    }

}
