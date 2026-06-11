package common;


/**
 * Operador a ser aplicado a um {@link CriterioFiltro} individual.
 *
 * <p>A compatibilidade entre operador e tipo do campo é validada no
 * {@code FiltroAvancadoQueryBuilder} antes da montagem do JPQL — ver tabela
 * na ADR-0009.</p>
 */
public enum OperadorFiltro {

    /** Igualdade exata ({@code campo = :valor}). */
    EQ,

    /** Diferente de ({@code campo <> :valor}). */
    NOT_EQ,

    /** Maior que ({@code campo > :valor}). */
    GT,

    /** Maior ou igual a ({@code campo >= :valor}). */
    GTE,

    /** Menor que ({@code campo < :valor}). */
    LT,

    /** Menor ou igual a ({@code campo <= :valor}). */
    LTE,

    /** Intervalo inclusivo ({@code campo BETWEEN :valor AND :valor2}); exige {@code valor2}. */
    BETWEEN,

    /** Pertence à lista ({@code campo IN (:valor)}); {@code valor} DEVE ser {@code List}. */
    IN,

    /** Não pertence à lista ({@code campo NOT IN (:valor)}); {@code valor} DEVE ser {@code List}. */
    NOT_IN,

    /** String começa com ({@code lower(campo) LIKE lower('valor%')}). */
    STARTS_WITH,

    /** String termina com ({@code lower(campo) LIKE lower('%valor')}). */
    ENDS_WITH,

    /** String contém ({@code lower(campo) LIKE lower('%valor%')}). */
    CONTAINS,

    /** Campo nulo ({@code campo IS NULL}); ignora {@code valor} e {@code valor2}. */
    IS_NULL,

    /** Campo não nulo ({@code campo IS NOT NULL}); ignora {@code valor} e {@code valor2}. */
    IS_NOT_NULL

}
