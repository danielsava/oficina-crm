package common.filtro;

public record CriterioFiltro(

    String campo,

    OperadorFiltro operador,

    Object valor,

    Object valor2

) { }
