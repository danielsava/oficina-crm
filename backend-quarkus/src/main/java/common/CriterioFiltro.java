package common;

public record CriterioFiltro(

    String campo,

    OperadorFiltro operador,

    Object valor,

    Object valor2

) { }
