package common.filtro;

// Operador aplicado a um critério individual. A compatibilidade operador x tipo
// do campo é validada antes da montagem do JPQL.
public enum OperadorFiltro {

    // Igualdade exata (campo = :valor).
    EQ,

    // Diferente de (campo <> :valor).
    NOT_EQ,

    // Maior que (campo > :valor).
    GT,

    // Maior ou igual a (campo >= :valor).
    GTE,

    // Menor que (campo < :valor).
    LT,

    // Menor ou igual a (campo <= :valor).
    LTE,

    // Intervalo inclusivo (campo BETWEEN :valor AND :valor2); exige valor2.
    BETWEEN,

    // Pertence à lista (campo IN (:valor)); valor deve ser List.
    IN,

    // Não pertence à lista (campo NOT IN (:valor)); valor deve ser List.
    NOT_IN,

    // String começa com (lower(campo) LIKE lower('valor%')).
    STARTS_WITH,

    // String termina com (lower(campo) LIKE lower('%valor')).
    ENDS_WITH,

    // String contém (lower(campo) LIKE lower('%valor%')).
    CONTAINS,

    // Campo nulo (campo IS NULL); ignora valor e valor2.
    IS_NULL,

    // Campo não nulo (campo IS NOT NULL); ignora valor e valor2.
    IS_NOT_NULL

}
