package common;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

public record FiltroDTO(

        @Min(0)
        int page,

        @Min(1)
        @Max(100)
        int size,

        /* Critérios de ordenação no formato 'campo,asc' ou 'campo,desc'. Vazio aplica o default [id desc]  */
        List<String> sort,

        OperadorLogico operadorLogico,

        List<CriterioFiltro> criterios

) { }
