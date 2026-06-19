package common.paginacao;

// Critério de ordenação já parseado e validado.
// A validação contra a whitelist de campos permitidos é feita fora do parser.
public record SortCriterio(String campo, SortDirecao direcao) { }
