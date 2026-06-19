package common.paginacao;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

public final class SortParser {

    // Formato: 'campo,asc' ou 'campo,desc' (case-insensitive). Campo começa por letra.
    private static final Pattern FORMATO_SORT = Pattern.compile(
            "^([a-zA-Z][a-zA-Z0-9]*),(asc|desc)$",
            Pattern.CASE_INSENSITIVE
    );

    private SortParser() { }

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
