package common;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Critério individual da busca avançada (ver ADR-0009).
 *
 * <p>Estrutura {@b plana}: não há {@code subCriterios} nem {@code operadorLogico}
 * por critério. A combinação lógica vem do {@link FiltroDTO#operadorLogico()}
 * e se aplica a todos os critérios da requisição.</p>
 *
 * <p>Regras de preenchimento por operador:</p>
 * <ul>
 *   <li>{@link OperadorFiltro#IS_NULL} / {@link OperadorFiltro#IS_NOT_NULL}:
 *       {@code valor} e {@code valor2} são ignorados.</li>
 *   <li>{@link OperadorFiltro#IN} / {@link OperadorFiltro#NOT_IN}: {@code valor}
 *       DEVE ser {@link java.util.List}.</li>
 *   <li>{@link OperadorFiltro#BETWEEN}: {@code valor} e {@code valor2} DEVEM ser
 *       não-nulos.</li>
 *   <li>Demais operadores: {@code valor} DEVE ser não-nulo; {@code valor2} é
 *       ignorado.</li>
 * </ul>
 *
 * @param campo    nome do campo permitido pela whitelist derivada do
 *                 {@code ListDTO} (e correspondente ao atributo da entidade JPA).
 * @param operador {@link OperadorFiltro} aplicado ao critério.
 * @param valor    valor principal do critério (objeto, lista ou {@code null}).
 * @param valor2   segundo valor (somente para {@link OperadorFiltro#BETWEEN}).
 */
@Schema(description = "Critério individual da busca avançada. Estrutura plana, sem aninhamento.")
public record CriterioFiltro(

        @Schema(description = "Nome do campo (deve estar na whitelist derivada do ListDTO).", example = "nome")
        String campo,

        @Schema(description = "Operador aplicado ao critério.", example = "CONTAINS")
        OperadorFiltro operador,

        @Schema(
                description = "Valor principal. Null para IS_NULL/IS_NOT_NULL; List para IN/NOT_IN; objeto único nos demais.",
                example = "jo"
        )
        Object valor,

        @Schema(
                description = "Segundo valor, usado apenas em BETWEEN. Null nos demais operadores.",
                example = "null",
                nullable = true
        )
        Object valor2

) { }
