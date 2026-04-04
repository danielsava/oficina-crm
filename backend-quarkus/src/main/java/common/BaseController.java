package common;

import jakarta.ws.rs.*;
import java.util.List;

public abstract class BaseController<E extends BaseEntity> {


    protected final BaseService<E> service;


    protected BaseController(BaseService<E> service) {

        this.service = service;
    }


    @GET
    public List<E> listar() {

        return service.listar();
    }

    @GET
    @Path("/{id}")
    public E buscarPorId(@PathParam("id") Long id) {

        E entity = service.buscarPorId(id);

        if (entity == null)
            throw new NotFoundException("Registro não encontrado");

        return entity; // Response.ok(usuario).build();
    }

    @POST
    public void inserir(E entity) {

        service.inserir(entity); // return Response.status(Response.Status.CREATED).entity(novoUsuario).build();
    }

    @DELETE
    @Path("/inativar/id/{id}")
    public void inativarPorId(@PathParam("id") Long id) {

        boolean inativado = service.inativarPorId(id);

        if (!inativado)
            throw new NotFoundException("Registro não encontrado");

    }

    @DELETE
    @Path("/inativar/uuid/{uuid}")
    public void inativarPorUUID(@PathParam("uuid") String uuid) {

        boolean inativado = service.inativarPorUUID(uuid);

        if (!inativado)
            throw new NotFoundException("Registro não encontrado");

    }

    @DELETE
    @Path("/{id}")
    public void excluir(@PathParam("id") Long id) {

        boolean excluido = service.excluirPorId(id);

        if (!excluido)
            throw new NotFoundException("Registro não encontrado");

    }

}
