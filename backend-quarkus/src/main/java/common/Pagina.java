package common;

import java.util.List;

public record Pagina<T>(

        List<T> content,

        int page,

        int size,

        long totalElements,

        int totalPages

) { }
