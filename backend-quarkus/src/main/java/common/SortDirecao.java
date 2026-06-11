package common;

import io.quarkus.panache.common.Sort.Direction;

/**
 * Direção de um critério de ordenação ({@link SortCriterio}).
 *
 * <p>Modelo deliberadamente explícito: o contrato HTTP exige que a direção
 * apareça sempre no query param {@code sort} ({@code campo,asc} ou
 * {@code campo,desc}). Direção implícita é fonte clássica de bug ("sempre
 * foi {@code asc} por default"); a obrigatoriedade evita ambiguidade.</p>
 */
public enum SortDirecao {

    ASC,
    DESC;

    /**
     * Converte para {@link io.quarkus.panache.common.Sort.Direction} usado
     * pelo Panache na montagem do {@link io.quarkus.panache.common.Sort}.
     */
    public Direction toPanache() {

        return this == ASC ? Direction.Ascending : Direction.Descending;
    }

}
