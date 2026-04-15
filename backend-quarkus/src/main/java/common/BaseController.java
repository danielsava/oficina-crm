package common;

import jakarta.ws.rs.*;
import java.util.List;

public abstract class BaseController<Entity extends BaseEntity, EditDTO, ListDTO> {


    protected final BaseService<Entity, EditDTO, ListDTO> service;


    protected BaseController(BaseService<Entity, EditDTO, ListDTO> service) {

        this.service = service;
    }


    @GET
    public List<Entity> listar() {

        return service.listar();
    }

    @GET
    @Path("/{id}")
    public Entity buscarPorId(@PathParam("id") Long id) {

        Entity entity = service.buscarPorId(id);

        if (entity == null)
            throw new NotFoundException("Registro não encontrado");

        return entity; // Response.ok(usuario).build();
    }

    @POST
    public void inserir(Entity entity) {

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
