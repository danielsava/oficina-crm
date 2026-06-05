package common;

/**
 * Critério de ordenação já parseado e validado.
 *
 * <p>É o resultado da conversão do query param {@code sort=campo,direcao}
 * pelo {@link SortParser}. A validação contra a whitelist de campos
 * permitidos para sort ({@code camposSortaveis()}) acontece no
 * {@link BaseService}, não no parser.</p>
 *
 * @param campo   nome do campo da entidade JPA.
 * @param direcao direção da ordenação.
 */
public record SortCriterio(String campo, SortDirecao direcao) { }
