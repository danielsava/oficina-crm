package common;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Utilitário sem CDI que traduz uma {@link FiltroDTO} em um trecho JPQL
 * parametrizado, aplicando todas as validações exigidas pela ADR-0009:
 *
 * <ul>
 *   <li>{@code campo} de cada {@link CriterioFiltro} precisa estar em
 *       {@code camposPermitidos} (whitelist derivada do {@code ListDTO}).</li>
 *   <li>{@link OperadorFiltro} precisa ser compatível com o tipo do campo na
 *       entidade JPA (ver tabela na ADR-0009).</li>
 *   <li>Combinações operador↔valor são checadas antes da conversão:
 *       {@link OperadorFiltro#IN}/{@code NOT_IN} exigem {@link List};
 *       {@link OperadorFiltro#BETWEEN} exige {@code valor2};
 *       {@link OperadorFiltro#IS_NULL}/{@code IS_NOT_NULL} dispensam valores;
 *       demais operadores exigem {@code valor} não-nulo.</li>
 *   <li>Conversão de valor a partir de {@link String} para o tipo Java do
 *       campo (Enum, UUID, números, datas ISO-8601). Falha de conversão
 *       resulta em {@link IllegalArgumentException} com mensagem
 *       específica.</li>
 * </ul>
 *
 * <p>Erros de validação são reportados via {@link IllegalArgumentException},
 * mapeados para {@code 400 application/problem+json} pelo
 * {@code IllegalArgumentExceptionMapper}.</p>
 *
 * <p>O builder não conhece o filtro implícito de {@code status = ATIVO}; quem
 * adiciona é o {@link BaseService#buscarAvancado(FiltroDTO)}, sempre com
 * {@code AND} ao bloco devolvido por este utilitário.</p>
 *
 * <p>Classe sem estado interno persistente; segura para uso concorrente.</p>
 */
public final class FiltroAvancadoQueryBuilder {

    /**
     * Resultado da montagem: trecho JPQL do {@code WHERE} (sem a palavra
     * "where") e o mapa de parâmetros nomeados correspondente.
     *
     * <p>Quando a lista de critérios é vazia, {@link #jpql()} é
     * {@code ""} e {@link #parametros()} é um mapa vazio.</p>
     */
    public record Resultado(String jpql, Map<String, Object> parametros) {

        public static Resultado vazio() {

            return new Resultado("", Map.of());
        }

    }

    private FiltroAvancadoQueryBuilder() { }

    /**
     * Constrói o trecho JPQL e os parâmetros para a lista plana de critérios
     * combinados pelo {@link OperadorLogico} único do {@link FiltroDTO}.
     *
     * @param filtro            payload da busca (não pode ser {@code null}).
     * @param camposPermitidos  whitelist única ({@code BaseService#camposPermitidos()}).
     * @param camposEntidade    mapa {@code nomeCampo -> tipoJava} para a entidade.
     * @return {@link Resultado} com o trecho JPQL e os parâmetros nomeados.
     * @throws IllegalArgumentException quando algum critério é inválido (campo
     *                                  fora da whitelist, operador incompatível
     *                                  com o tipo, combinação operador↔valor
     *                                  inválida ou conversão de valor falha).
     */
    public static Resultado construir(
            FiltroDTO filtro,
            Set<String> camposPermitidos,
            Map<String, Class<?>> camposEntidade
    ) {

        if (filtro == null)
            throw new IllegalArgumentException("FiltroDTO não pode ser nulo.");

        List<CriterioFiltro> criterios = filtro.criterios();

        if (criterios == null || criterios.isEmpty())
            return Resultado.vazio();

        OperadorLogico operadorLogico = filtro.operadorLogico() == null ? OperadorLogico.AND : filtro.operadorLogico();

        List<String> trechos = new ArrayList<>(criterios.size());

        Map<String, Object> parametros = new LinkedHashMap<>();

        int contadorParam = 0;

        for (CriterioFiltro c : criterios) {

            if (c == null)
                throw new IllegalArgumentException("Critério nulo na lista de critérios.");

            String campo = c.campo();

            OperadorFiltro op = c.operador();

            if (campo == null || campo.isBlank())
                throw new IllegalArgumentException("Critério com 'campo' vazio ou nulo.");

            if (op == null)
                throw new IllegalArgumentException("Critério com 'operador' nulo (campo '" + campo + "').");

            // 1. Whitelist do campo.
            if (!camposPermitidos.contains(campo))
                throw new IllegalArgumentException("Campo '" + campo + "' não é filtrável nesta entidade. Campos permitidos: " + camposPermitidos + ".");

            // 2. Existência na entidade JPA (defesa contra divergência ListDTO ↔ entidade).
            Class<?> tipoCampo = camposEntidade.get(campo);

            if (tipoCampo == null)
                throw new IllegalArgumentException("Campo '" + campo + "' está no ListDTO mas não foi encontrado na entidade JPA. Quebra da convenção 'nome do componente do ListDTO = atributo JPA'."
                );

            // 3. Compatibilidade operador ↔ tipo do campo.
            CategoriaTipo categoria = categorizarTipo(tipoCampo);

            if (!operadorCompativel(op, categoria))
                throw new IllegalArgumentException("Operador '" + op + "' não é compatível com campo '" + campo+ "' (" + tipoCampo.getSimpleName() + ").");

            // 4. Geração do trecho JPQL conforme o operador.
            String paramBase = "p" + (contadorParam++);

            String trecho = switch (op) {

                case IS_NULL -> campo + " is null";

                case IS_NOT_NULL -> campo + " is not null";

                case EQ, NOT_EQ, GT, GTE, LT, LTE -> {

                    Object valor = exigirValor(c, campo);

                    Object convertido = converterValor(valor, tipoCampo, campo);

                    parametros.put(paramBase, convertido);

                    String simboloOperador = switch (op) {
                        case EQ -> "=";
                        case NOT_EQ -> "<>";
                        case GT -> ">";
                        case GTE -> ">=";
                        case LT -> "<";
                        case LTE -> "<=";
                        default -> throw new IllegalStateException("Operador inesperado: " + op);
                    };

                    yield campo + " " + simboloOperador + " :" + paramBase;
                }

                case BETWEEN -> {

                    Object valor1 = exigirValor(c, campo);

                    Object valor2 = c.valor2();

                    if (valor2 == null)
                        throw new IllegalArgumentException("Operador BETWEEN exige 'valor2' não-nulo (campo '" + campo + "').");

                    Object conv1 = converterValor(valor1, tipoCampo, campo);
                    Object conv2 = converterValor(valor2, tipoCampo, campo);

                    String paramFim = paramBase + "b";

                    parametros.put(paramBase, conv1);
                    parametros.put(paramFim, conv2);

                    yield campo + " between :" + paramBase + " and :" + paramFim;
                }

                case IN, NOT_IN -> {

                    Object valor = exigirValor(c, campo);

                    if (!(valor instanceof List<?> lista))
                        throw new IllegalArgumentException("Operador " + op + " exige 'valor' como List (campo '" + campo + "').");

                    if (lista.isEmpty())
                        throw new IllegalArgumentException("Operador " + op + " exige lista não-vazia (campo '" + campo + "').");

                    List<Object> convertidos = new ArrayList<>(lista.size());

                    for (Object item : lista)
                        convertidos.add(converterValor(item, tipoCampo, campo));

                    parametros.put(paramBase, convertidos);

                    String simbolo = op == OperadorFiltro.IN ? "in" : "not in";

                    yield campo + " " + simbolo + " :" + paramBase;
                }

                case STARTS_WITH, ENDS_WITH, CONTAINS -> {

                    Object valor = exigirValor(c, campo);

                    String valorStr = valor.toString();

                    String padrao = switch (op) {
                        case STARTS_WITH -> valorStr + "%";
                        case ENDS_WITH -> "%" + valorStr;
                        case CONTAINS -> "%" + valorStr + "%";
                        default -> throw new IllegalStateException("Operador inesperado: " + op);
                    };

                    parametros.put(paramBase, padrao);

                    yield "lower(" + campo + ") like lower(:" + paramBase + ")";
                }

            };

            trechos.add(trecho);
        }

        String separador = operadorLogico == OperadorLogico.AND ? " and " : " or ";

        String jpql = String.join(separador, trechos);

        // Envolve com parênteses quando há mais de um critério, para preservar a
        // precedência quando o BaseService combina o bloco com 'and status = ATIVO'.
        if (trechos.size() > 1)
            jpql = "(" + jpql + ")";

        return new Resultado(jpql, parametros);
    }


    // ----------------------------------------------------------------------
    //  Helpers
    // ----------------------------------------------------------------------

    private static Object exigirValor(CriterioFiltro c, String campo) {

        Object valor = c.valor();

        if (valor == null)
            throw new IllegalArgumentException("Operador '" + c.operador() + "' exige 'valor' não-nulo (campo '" + campo + "').");

        return valor;
    }

    /** Categorias de tipo usadas para validar compatibilidade operador ↔ tipo. */
    private enum CategoriaTipo {
        STRING, NUMERICO, DATA, BOOLEAN, ENUM, UUID_, OUTRO
    }

    private static CategoriaTipo categorizarTipo(Class<?> tipo) {

        if (String.class.equals(tipo))
            return CategoriaTipo.STRING;

        if (tipo.isEnum())
            return CategoriaTipo.ENUM;

        if (UUID.class.equals(tipo))
            return CategoriaTipo.UUID_;

        if (Boolean.class.equals(tipo) || boolean.class.equals(tipo))
            return CategoriaTipo.BOOLEAN;

        if (Number.class.isAssignableFrom(tipo) || tipo.isPrimitive())
            return CategoriaTipo.NUMERICO;

        if (LocalDate.class.equals(tipo) || LocalDateTime.class.equals(tipo) || OffsetDateTime.class.equals(tipo))
            return CategoriaTipo.DATA;

        return CategoriaTipo.OUTRO;
    }

    private static boolean operadorCompativel(OperadorFiltro op, CategoriaTipo categoria) {

        // IS_NULL / IS_NOT_NULL: válidos em qualquer tipo.
        if (op == OperadorFiltro.IS_NULL || op == OperadorFiltro.IS_NOT_NULL)
            return true;

        return switch (categoria) {

            case STRING -> switch (op) {
                case EQ, NOT_EQ, STARTS_WITH, ENDS_WITH, CONTAINS, IN, NOT_IN -> true;
                default -> false;
            };

            case NUMERICO, DATA -> switch (op) {
                case EQ, NOT_EQ, GT, GTE, LT, LTE, BETWEEN, IN, NOT_IN -> true;
                default -> false;
            };

            case BOOLEAN -> switch (op) {
                case EQ, NOT_EQ -> true;
                default -> false;
            };

            case ENUM, UUID_ -> switch (op) {
                case EQ, NOT_EQ, IN, NOT_IN -> true;
                default -> false;
            };

            // Tipo desconhecido: aceita apenas EQ/NOT_EQ por segurança. Casos legítimos exigem sobrescrita do *Service.
            case OUTRO -> op == OperadorFiltro.EQ || op == OperadorFiltro.NOT_EQ;

        };
    }

    /**
     * Converte o valor cru (vindo do JSON) para o tipo Java do campo.
     *
     * <p>Jackson preserva o tipo conforme o JSON ({@code "abc"} → String;
     * {@code 42} → Integer/Long; {@code [...]} → List). Quando o tipo já bate
     * com o esperado, devolve o próprio objeto. Caso contrário, tenta
     * conversão a partir de {@code String} (suficiente para a maioria dos
     * casos: enums, UUID, datas ISO-8601, números em formato textual).</p>
     */
    static Object converterValor(Object valor, Class<?> tipo, String campo) {

        if (valor == null)
            return null;

        // Tipo já compatível.
        if (tipo.isInstance(valor))
            return valor;

        // Boxing/unboxing de primitivos.
        if (tipo.isPrimitive() && tipoEquivalente(tipo).isInstance(valor))
            return valor;

        String texto = valor.toString();

        try {

            if (tipo.isEnum()) {

                @SuppressWarnings({"rawtypes", "unchecked"})
                Object convertido = Enum.valueOf((Class<Enum>) tipo, texto);
                return convertido;
            }

            if (UUID.class.equals(tipo))
                return UUID.fromString(texto);

            if (Boolean.class.equals(tipo) || boolean.class.equals(tipo))
                return Boolean.parseBoolean(texto);

            if (Long.class.equals(tipo) || long.class.equals(tipo)) {

                if (valor instanceof Number n)
                    return n.longValue();

                return Long.parseLong(texto);
            }

            if (Integer.class.equals(tipo) || int.class.equals(tipo)) {

                if (valor instanceof Number n)
                    return n.intValue();

                return Integer.parseInt(texto);
            }

            if (Short.class.equals(tipo) || short.class.equals(tipo)) {

                if (valor instanceof Number n)
                    return n.shortValue();

                return Short.parseShort(texto);
            }

            if (Double.class.equals(tipo) || double.class.equals(tipo)) {

                if (valor instanceof Number n)
                    return n.doubleValue();

                return Double.parseDouble(texto);
            }

            if (Float.class.equals(tipo) || float.class.equals(tipo)) {

                if (valor instanceof Number n)
                    return n.floatValue();

                return Float.parseFloat(texto);
            }

            if (BigDecimal.class.equals(tipo)) {

                if (valor instanceof BigDecimal bd)
                    return bd;

                if (valor instanceof Number n)
                    return new BigDecimal(n.toString());

                return new BigDecimal(texto);
            }

            if (BigInteger.class.equals(tipo)) {

                if (valor instanceof BigInteger bi)
                    return bi;

                if (valor instanceof Number n)
                    return BigInteger.valueOf(n.longValue());

                return new BigInteger(texto);
            }

            if (LocalDate.class.equals(tipo))
                return LocalDate.parse(texto);

            if (LocalDateTime.class.equals(tipo))
                return LocalDateTime.parse(texto);

            if (OffsetDateTime.class.equals(tipo))
                return OffsetDateTime.parse(texto);

            if (String.class.equals(tipo))
                return texto;

        } catch (IllegalArgumentException | DateTimeParseException ex) {

            throw new IllegalArgumentException("Valor '" + texto + "' inválido para campo '" + campo + "' ("+ tipo.getSimpleName() + "): " + ex.getMessage());
        }

        // Tipo não reconhecido — repassa string crua e deixa o Hibernate falhar
        // de forma controlada (raríssimo; coberto por exceção do mapper).
        return texto;
    }

    /** Mapeia um tipo primitivo para o seu wrapper, para checagem com {@code isInstance}. */
    private static Class<?> tipoEquivalente(Class<?> primitivo) {

        if (primitivo == boolean.class) return Boolean.class;
        if (primitivo == byte.class)    return Byte.class;
        if (primitivo == short.class)   return Short.class;
        if (primitivo == int.class)     return Integer.class;
        if (primitivo == long.class)    return Long.class;
        if (primitivo == float.class)   return Float.class;
        if (primitivo == double.class)  return Double.class;
        if (primitivo == char.class)    return Character.class;

        return primitivo;
    }

}
