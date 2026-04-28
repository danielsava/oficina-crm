package common;

import jakarta.ws.rs.*;
import java.util.List;

public abstract class BaseRest<Entity extends BaseEntity, EditDTO, ListDTO> {


    public abstract BaseService<Entity, EditDTO, ListDTO> service();


    @POST
    public void inserir(EditDTO editDTO) {

        this.service().inserir(editDTO); // return Response.status(Response.Status.CREATED).entity(novoUsuario).build();
    }

    @PUT
    @Path("/{id}")
    public void atualizar(@PathParam("id") Long id, EditDTO editDTO) {

        this.service().atualizar(id, editDTO);
    }

    @GET
    public List<ListDTO> listar() {

        return this.service().listarDTO();
    }

    @GET
    @Path("/{id}")
    public Entity buscarPorId(@PathParam("id") Long id) {

        Entity entity = this.service().buscarPorId(id);

        if (entity == null)
            throw new NotFoundException("Registro não encontrado");

        return entity; // Response.ok(usuario).build();
    }

    @DELETE
    @Path("/inativar/id/{id}")
    public void inativarPorId(@PathParam("id") Long id) {

        boolean inativado = this.service().inativarPorId(id);

        if (!inativado)
            throw new NotFoundException("Registro não encontrado");

    }

    @DELETE
    @Path("/inativar/uuid/{uuid}")
    public void inativarPorUUID(@PathParam("uuid") String uuid) {

        boolean inativado = this.service().inativarPorUUID(uuid);

        if (!inativado)
            throw new NotFoundException("Registro não encontrado");

    }

    @DELETE
    @Path("/{id}")
    public void excluir(@PathParam("id") Long id) {

        boolean excluido = this.service().excluirPorId(id);

        if (!excluido)
            throw new NotFoundException("Registro não encontrado");

    }

}
