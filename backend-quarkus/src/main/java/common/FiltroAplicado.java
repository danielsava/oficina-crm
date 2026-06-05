package common;

import java.util.Map;

/**
 * Resultado interno da montagem de filtros do {@link BaseService} a partir
 * dos query params da requisição.
 *
 * <p>Não faz parte da API pública: é apenas o veículo entre
 * {@code aplicarFiltros(...)} e o ponto de execução da query no
 * {@code BaseService}. Carrega o trecho JPQL do {@code WHERE} (sem o
 * próprio "where") e os parâmetros nomeados correspondentes.</p>
 *
 * <p>Quando não há filtros aplicáveis, {@link #jpql()} é {@code ""} e
 * {@link #parametros()} é um mapa vazio. O {@code BaseService} concatena
 * o filtro fixo de {@code status = ATIVO} quando aplicável.</p>
 *
 * @param jpql       trecho JPQL do {@code WHERE} (sem a palavra "where"),
 *                   ou string vazia quando não há filtros.
 * @param parametros parâmetros nomeados referenciados no {@code jpql}.
 */
public record FiltroAplicado(String jpql, Map<String, Object> parametros) {

    public static FiltroAplicado vazio() {

        return new FiltroAplicado("", Map.of());
    }

}
