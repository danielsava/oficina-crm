package common;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;
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
 * <p>O {@code GET /} retorna o envelope paginado {@link Pagina} (ver ADR-0009).
 * Os parâmetros de paginação e ordenação ({@code page}, {@code size},
 * {@code sort}) são declarados aqui e aparecem no contrato OpenAPI. Os
 * <b>filtros por coluna</b> são captados via {@link UriInfo} e autorizados
 * pela whitelist única do {@code BaseService}, que é derivada automaticamente
 * dos componentes do {@code ListDTO} (princípio: "o que aparece na tabela do
 * frontend é o que pode ser filtrado/ordenado"). Não há declaração tipada por
 * entidade no {@code *Rest} nem método de whitelist por {@code *Service}.
 * Subclasses que precisarem destacar um filtro específico na documentação
 * (caso raro) podem sobrescrever {@link #listar(int, int, List, UriInfo)}
 * pontualmente.</p>
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

    @GET
    @Operation(
            summary = "Lista os registros (paginado)",
            description = "Retorna o envelope Pagina com os registros que atendem aos filtros, "
                    + "ordenados conforme o parâmetro 'sort'. Por padrão, apenas registros com "
                    + "status ATIVO são retornados (a requisição pode incluir o filtro 'status' "
                    + "para sobrepor esse default, desde que 'status' faça parte do ListDTO). "
                    + "Filtros por coluna são captados via query params livres e autorizados pela "
                    + "whitelist única derivada automaticamente do ListDTO (ver ADR-0009)."
    )
    @APIResponse(responseCode = "200", description = "Página retornada")
    @APIResponse(responseCode = "400", description = "Parâmetros inválidos: page<0, size fora de [1,100], sort em formato inválido ou campo fora da whitelist (RFC 7807)")
    public Pagina<ListDTO> listar(
            @Parameter(description = "Índice zero-based da página.", example = "0")
            @QueryParam("page") @DefaultValue("0") @Min(0) int page,

            @Parameter(description = "Tamanho da página. Intervalo aceito: [1, 100].", example = "20")
            @QueryParam("size") @DefaultValue("20") @Min(1) @Max(100) int size,

            @Parameter(description = "Critérios de ordenação no formato 'campo,asc' ou 'campo,desc'. Pode ser repetido para múltiplos critérios.")
            @QueryParam("sort") List<String> sort,

            @Context UriInfo uriInfo
    ) {

        return this.service().listarDTO(page, size, sort, uriInfo.getQueryParameters());
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
