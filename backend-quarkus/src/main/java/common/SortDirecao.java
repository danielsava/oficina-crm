package common;

import io.quarkus.panache.common.Sort.Direction;

/** Direção de um critério de ordenação ({@link SortCriterio}) */
public enum SortDirecao {

    ASC,
    DESC;

    public Direction toPanache() {

        return this == ASC ? Direction.Ascending : Direction.Descending;
    }

}
