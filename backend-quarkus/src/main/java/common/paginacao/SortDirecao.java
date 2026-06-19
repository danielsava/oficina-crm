package common.paginacao;

import io.quarkus.panache.common.Sort.Direction;

// Direção de um critério de ordenação.
public enum SortDirecao {

    ASC,
    DESC;

    public Direction toPanache() {

        return this == ASC ? Direction.Ascending : Direction.Descending;
    }

}
