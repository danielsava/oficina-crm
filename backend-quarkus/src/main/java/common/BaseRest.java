package common;

import jakarta.ws.rs.*;
import java.util.List;

/**
 * Base para recursos REST do CRUD padrão.
 *
 * <p>Convenção de identificadores:</p>
 * <ul>
 *   <li><b>UUID</b> é o identificador <b>público</b>, exposto em URLs e payloads.</li>
 *   <li><b>id</b> (Long) é identificador <b>interno</b> (PK, FKs, joins, logs técnicos),
 *       nunca trafega em endpoints públicos.</li>
 * </ul>
 */
public abstract class BaseRest<Entity extends BaseEntity, EditDTO, ListDTO> {


    public abstract BaseService<Entity, EditDTO, ListDTO> service();


    @POST
    public void inserir(EditDTO editDTO) {

        this.service().inserir(editDTO); // return Response.status(Response.Status.CREATED).entity(novoUsuario).build();
    }

    @PUT
    @Path("/{uuid}")
    public void atualizar(@PathParam("uuid") String uuid, EditDTO editDTO) {

        this.service().atualizarPorUUID(uuid, editDTO);
    }

    @GET
    public List<ListDTO> listar() {

        return this.service().listarDTO();
    }

    @GET
    @Path("/{uuid}")
    public EditDTO buscarPorUUID(@PathParam("uuid") String uuid) {

        EditDTO editDTO = this.service().buscarEditDTOporUUID(uuid);

        if (editDTO == null)
            throw new NotFoundException("Registro não encontrado");

        return editDTO;
    }

    @DELETE
    @Path("/inativar/{uuid}")
    public void inativarPorUUID(@PathParam("uuid") String uuid) {

        boolean inativado = this.service().inativarPorUUID(uuid);

        if (!inativado)
            throw new NotFoundException("Registro não encontrado");

    }

}
