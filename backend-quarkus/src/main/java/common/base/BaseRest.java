package common.base;

import common.filtro.FiltroDTO;
import common.paginacao.Pagina;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Produces(MediaType.APPLICATION_JSON)
public abstract class BaseRest<Entity extends BaseEntity, EditDTO, ListDTO> {


    public abstract BaseService<Entity, EditDTO, ListDTO> service();


    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void inserir(@Valid EditDTO editDTO) {

        this.service().inserir(editDTO);
    }

    @PUT
    @Path("/{uuid}")
    @Consumes(MediaType.APPLICATION_JSON)
    public void atualizar(@PathParam("uuid") String uuid, @Valid EditDTO editDTO) {

        this.service().atualizarPorUUID(uuid, editDTO);
    }

    @POST
    @Path("/buscar")
    @Consumes(MediaType.APPLICATION_JSON)
    public Pagina<ListDTO> buscar(@Valid FiltroDTO filtro) {

        return this.service().buscarAvancado(filtro);
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
