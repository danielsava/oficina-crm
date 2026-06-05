package common;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Conversor de query params {@code sort=campo,direcao} em uma lista de
 * {@link SortCriterio} já validada sintaticamente.
 *
 * <p>O contrato HTTP exige direção obrigatória ({@code asc} ou {@code desc},
 * case-insensitive na entrada, normalizada para uppercase). Ausência de
 * direção ou formato fora do regex resulta em {@link IllegalArgumentException},
 * mapeada para {@code 400 application/problem+json} pelo
 * {@code IllegalArgumentExceptionMapper}.</p>
 *
 * <p>Este parser <b>não</b> consulta whitelist de campos — essa
 * responsabilidade fica no {@link BaseService}, que conhece os campos
 * permitidos por entidade.</p>
 */
public final class SortParser {

    /**
     * Formato aceito: nome de campo iniciando por letra, seguido por
     * letras/dígitos, vírgula e direção {@code asc}/{@code desc}
     * (case-insensitive).
     */
    private static final Pattern FORMATO_SORT = Pattern.compile(
            "^([a-zA-Z][a-zA-Z0-9]*),(asc|desc)$",
            Pattern.CASE_INSENSITIVE
    );

    private SortParser() { }

    /**
     * Converte os valores brutos do query param {@code sort} em
     * {@link SortCriterio criterios} já normalizados.
     *
     * @param valoresBrutos lista de valores do query param. Pode ser
     *                      {@code null} ou vazia; nesse caso, retorna lista
     *                      vazia (o {@code BaseService} aplicará o default).
     * @return lista imutável de critérios; vazia quando entrada vazia.
     * @throws IllegalArgumentException quando algum valor não casa o regex.
     */
    public static List<SortCriterio> parse(List<String> valoresBrutos) {

        if (valoresBrutos == null || valoresBrutos.isEmpty())
            return Collections.emptyList();

        List<SortCriterio> resultado = new ArrayList<>(valoresBrutos.size());

        for (String bruto : valoresBrutos) {

            if (bruto == null || bruto.isBlank())
                throw new IllegalArgumentException(
                        "Parâmetro 'sort' inválido: valor vazio. Formato esperado: 'campo,asc' ou 'campo,desc'."
                );

            var matcher = FORMATO_SORT.matcher(bruto.trim());

            if (!matcher.matches())
                throw new IllegalArgumentException(
                        "Parâmetro 'sort' inválido: '" + bruto + "'. Formato esperado: 'campo,asc' ou 'campo,desc'."
                );

            String campo = matcher.group(1);
            SortDirecao direcao = SortDirecao.valueOf(matcher.group(2).toUpperCase());

            resultado.add(new SortCriterio(campo, direcao));
        }

        return List.copyOf(resultado);
    }

}
