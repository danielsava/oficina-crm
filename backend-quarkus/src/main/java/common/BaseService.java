package common;


import jakarta.transaction.Transactional;

import java.util.List;

public abstract class BaseService<E extends BaseEntity> {


    protected final BaseRepository<E> repository;


    protected BaseService(BaseRepository<E> repository) {

        this.repository = repository;
    }


    public List<E> listar() {

        return repository.listAll();
    }

    public List<E> listarPor(String atributo, Object valor) {

        return repository.find(atributo, valor).list();
    }

    public E buscarPor(String atributo, Object valor) {

        return repository.find(atributo, valor).firstResult();
    }

    public E buscarPorId(Long id) {

        return buscarPor("id", id);
    }

    public E buscarPorUUID(Long id) {

        return buscarPor("uuid", id);
    }

    public Long contarPor(String atributo, Object valor) {

        return repository.count(atributo, valor);
    }

    public boolean existePor(String atributo, Object valor) {

        return contarPor(atributo, valor) > 0;
    }

    @Transactional
    public void inserir(E e) {

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

        return excluirPor("id", id) > 0;
    }

    @Transactional
    public boolean excluirPorUUID(Long uuid) {

        return excluirPor("uuid", uuid) > 0;
    }

}
