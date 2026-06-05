package common;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.List;

/**
 * Envelope genérico de resposta paginada para endpoints de listagem.
 *
 * <p>É o shape padrão retornado por {@code GET /} em todas as subclasses de
 * {@link BaseRest}. O nome em português é intencional para evitar colisão com
 * {@link io.quarkus.panache.common.Page} (utilitário do Panache usado para
 * representar offset/limit).</p>
 *
 * <p>Campos derivados como {@code hasNext}/{@code hasPrevious} não fazem parte
 * deste contrato inicial e podem ser calculados no frontend a partir de
 * {@code page}, {@code size}, {@code totalElements} e {@code totalPages}.</p>
 *
 * @param <T>           tipo do conteúdo paginado (geralmente um {@code *ListDTO}).
 * @param content       lista da página atual (pode ser vazia quando {@code page}
 *                      ultrapassa o total de páginas).
 * @param page          índice zero-based da página retornada.
 * @param size          tamanho de página solicitado (após clamp e validação).
 * @param totalElements total de registros que atendem aos filtros.
 * @param totalPages    total de páginas para o {@code size} informado.
 */
@Schema(description = "Envelope padrão de resposta paginada.")
public record Pagina<T>(

        @Schema(description = "Conteúdo da página atual.")
        List<T> content,

        @Schema(description = "Índice zero-based da página retornada.", example = "0")
        int page,

        @Schema(description = "Tamanho de página efetivo.", example = "20")
        int size,

        @Schema(description = "Total de registros que atendem aos filtros.", example = "137")
        long totalElements,

        @Schema(description = "Total de páginas para o tamanho informado.", example = "7")
        int totalPages

) { }
