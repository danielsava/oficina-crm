package common;

import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;

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
 *
 * <p>As anotações OpenAPI declaradas aqui (operações e respostas) são herdadas
 * pelas subclasses e aparecem no contrato gerado em <code>/q/openapi</code>
 * e no Swagger UI em <code>/q/swagger-ui</code>. Cada {@code *Rest} concreto
 * deve declarar seu próprio {@code @Tag} para agrupar os endpoints por entidade.</p>
 */
@Produces(MediaType.APPLICATION_JSON)
public abstract class BaseRest<Entity extends BaseEntity, EditDTO, ListDTO> {


    public abstract BaseService<Entity, EditDTO, ListDTO> service();


    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Cria um novo registro", description = "Cria um novo registro a partir do EditDTO informado.")
    @APIResponse(responseCode = "204", description = "Registro criado com sucesso")
    @APIResponse(responseCode = "400", description = "Payload inválido (RFC 7807)")
    @APIResponse(responseCode = "409", description = "Conflito de regra de negócio (RFC 7807)")
    public void inserir(@Valid EditDTO editDTO) {

        this.service().inserir(editDTO); // return Response.status(Response.Status.CREATED).entity(novoUsuario).build();
    }

    @PUT
    @Path("/{uuid}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Atualiza um registro existente", description = "Atualiza o registro identificado pelo UUID público.")
    @APIResponse(responseCode = "204", description = "Registro atualizado com sucesso")
    @APIResponse(responseCode = "400", description = "Payload inválido (RFC 7807)")
    @APIResponse(responseCode = "404", description = "Registro não encontrado (RFC 7807)")
    @APIResponse(responseCode = "409", description = "Conflito de regra de negócio (RFC 7807)")
    public void atualizar(@Parameter(description = "UUID") @PathParam("uuid") String uuid, @Valid EditDTO editDTO) {

        this.service().atualizarPorUUID(uuid, editDTO);
    }

    @GET
    @Operation(summary = "Lista os registros ativos", description = "Retorna a lista dos registros com status ATIVO.")
    @APIResponse(responseCode = "200", description = "Lista retornada")
    public List<ListDTO> listar() {

        return this.service().listarDTO();
    }

    @GET
    @Path("/{uuid}")
    @Operation(summary = "Busca um registro por UUID", description = "Retorna o EditDTO do registro identificado pelo UUID público.")
    @APIResponse(responseCode = "200", description = "Registro encontrado")
    @APIResponse(responseCode = "404", description = "Registro não encontrado (RFC 7807)")
    public EditDTO buscarPorUUID(@Parameter(description = "UUID") @PathParam("uuid") String uuid) {

        EditDTO editDTO = this.service().buscarEditDTOporUUID(uuid);

        if (editDTO == null)
            throw new NotFoundException("Registro não encontrado");

        return editDTO;
    }

    @DELETE
    @Path("/inativar/{uuid}")
    @Operation(summary = "Inativa um registro (soft delete)", description = "Marca o registro como INATIVO. O CRUD padrão não expõe hard delete (ver ADR-0005).")
    @APIResponse(responseCode = "204", description = "Registro inativado com sucesso")
    @APIResponse(responseCode = "404", description = "Registro não encontrado (RFC 7807)")
    public void inativarPorUUID(@Parameter(description = "UUID") @PathParam("uuid") String uuid) {

        boolean inativado = this.service().inativarPorUUID(uuid);

        if (!inativado)
            throw new NotFoundException("Registro não encontrado");

    }

}
