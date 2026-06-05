package common;

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
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;

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
 * <p>Endpoints expostos:</p>
 * <ul>
 *   <li>{@code POST /}                       — cria um novo registro a partir do {@code EditDTO}.</li>
 *   <li>{@code PUT  /{uuid}}                 — atualiza o registro identificado pelo UUID.</li>
 *   <li>{@code GET  /{uuid}}                 — retorna o {@code EditDTO} para alimentar o formulário de edição.</li>
 *   <li>{@code POST /buscar}                 — busca paginada com filtros estruturados; retorna {@link Pagina} de {@code ListDTO}.</li>
 *   <li>{@code DELETE /inativar/{uuid}}      — soft delete (status = INATIVO).</li>
 * </ul>
 *
 * <p>O CRUD genérico expõe apenas soft delete ({@code DELETE /inativar/{uuid}});
 * hard delete <b>não</b> é exposto pelo {@code BaseRest} (ver ADR-0005).</p>
 *
 * <p>A listagem com paginação acontece <b>exclusivamente</b> via
 * {@code POST /buscar} (corpo {@link FiltroDTO}). Não há {@code GET /}
 * paginado — o contrato HTTP completo da busca está documentado na
 * ADR-0009.</p>
 *
 * <p>As anotações OpenAPI declaradas aqui (operações e respostas) são herdadas
 * pelas subclasses. Cada {@code *Rest} concreto deve declarar seu próprio
 * {@code @Tag} para agrupar os endpoints por entidade.</p>
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

        this.service().inserir(editDTO);
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

    @POST
    @Path("/buscar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(
            summary = "Busca paginada com filtros estruturados",
            description = "Aceita filtros com operadores explícitos e combinação lógica AND ou OR "
                    + "(única por requisição, sem aninhamento). Retorna o envelope Pagina<ListDTO>. "
                    + "POST é usado como mecanismo de transporte para uma query estruturada — não cria recurso. "
                    + "Filtro implícito status = ATIVO é aplicado por padrão (sempre com AND ao bloco de critérios "
                    + "do cliente) e substituído quando a requisição inclui algum critério com campo = 'status' "
                    + "(desde que 'status' faça parte do ListDTO). Ver ADR-0009."
    )
    @APIResponse(responseCode = "200", description = "Página de resultados retornada")
    @APIResponse(
            responseCode = "400",
            description = "Payload inválido: page/size fora dos limites, campo fora da whitelist, "
                    + "operador incompatível com tipo do campo, combinação operador↔valor inválida, "
                    + "sort em formato inválido ou falha de conversão de valor (RFC 7807)"
    )
    public Pagina<ListDTO> buscar(@Valid FiltroDTO filtro) {

        return this.service().buscarAvancado(filtro);
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
