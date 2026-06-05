package common;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.List;

/**
 * Payload de entrada do endpoint herdado {@code POST /buscar} (ver ADR-0009).
 *
 * <p>Estrutura {@b plana} por decisão consciente:</p>
 * <ul>
 *   <li>{@link #operadorLogico()} é {@b único} para toda a lista de critérios.
 *       Quando {@code OR} é escolhido, ele se aplica a {@b todos} os critérios
 *       informados pelo cliente — não há como expressar {@code (A OR B) AND C}
 *       diretamente. Esse trade-off foi aceito conscientemente (raramente
 *       apareceu como necessidade em CRUD admin durante a análise). Casos
 *       legítimos podem ser tratados por múltiplas chamadas do frontend,
 *       sobrescrita pontual de {@link BaseService#buscarAvancado(FiltroDTO)}
 *       no {@code *Service} da entidade afetada ou evolução futura do
 *       contrato.</li>
 *   <li>O filtro implícito {@code status = ATIVO} é sempre combinado com
 *       {@code AND} ao bloco de critérios do cliente, independentemente do
 *       {@link #operadorLogico()} escolhido. Ele é substituído quando o
 *       cliente envia algum critério com {@code campo = "status"}.</li>
 *   <li>{@link #criterios()} é uma lista plana — não há {@code subCriterios}
 *       nem profundidade. Veja o ADR-0009 para a justificativa.</li>
 * </ul>
 *
 * <p>Defaults aplicados pelo {@link BaseService}:</p>
 * <ul>
 *   <li>{@link #operadorLogico()} {@code null} ⇒ {@link OperadorLogico#AND}.</li>
 *   <li>{@link #criterios()} {@code null} ou vazia ⇒ "sem filtros" (retorna
 *       tudo paginado, respeitando o filtro implícito de status).</li>
 *   <li>{@link #sort()} {@code null} ou vazia ⇒ {@code DEFAULT_SORT = [id desc]}.</li>
 * </ul>
 *
 * <p>Validações estruturais via Bean Validation: {@link #page()} {@code >= 0}
 * e {@link #size()} no intervalo {@code [1, 100]}. Demais validações
 * (whitelist de campo, compatibilidade operador↔tipo, combinação
 * operador↔valor) acontecem no {@code FiltroAvancadoQueryBuilder}.</p>
 */
@Schema(description = "Payload da busca avançada paginada (POST /buscar). Ver ADR-0009.")
public record FiltroDTO(

        @Schema(description = "Índice zero-based da página.", example = "0")
        @Min(0)
        int page,

        @Schema(description = "Tamanho da página. Intervalo aceito: [1, 100].", example = "20")
        @Min(1)
        @Max(100)
        int size,

        @Schema(
                description = "Critérios de ordenação no formato 'campo,asc' ou 'campo,desc'. Vazio aplica o default [id desc].",
                example = "[\"nome,asc\"]"
        )
        List<String> sort,

        @Schema(
                description = "Combinador lógico aplicado a TODOS os critérios. Default AND quando ausente.",
                example = "AND",
                defaultValue = "AND"
        )
        OperadorLogico operadorLogico,

        @Schema(description = "Lista plana de critérios. Pode ser nula ou vazia (sem filtros).")
        List<CriterioFiltro> criterios

) { }
