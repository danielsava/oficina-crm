package common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

class FiltroAvancadoQueryBuilderTest {

    private enum CategoriaTeste { A, B, C }

    private static final Set<String> CAMPOS_PERMITIDOS = Set.of(
            "nome", "login", "email", "status", "createdAt", "registradoEm",
            "ativo", "idade", "uuidExterno", "categoria"
    );

    private static final Map<String, Class<?>> CAMPOS_ENTIDADE = camposEntidade();

    private static Map<String, Class<?>> camposEntidade() {

        Map<String, Class<?>> m = new LinkedHashMap<>();

        m.put("nome", String.class);
        m.put("login", String.class);
        m.put("email", String.class);
        m.put("status", EnumStatusEntity.class);
        m.put("createdAt", LocalDateTime.class);
        m.put("registradoEm", LocalDate.class);
        m.put("ativo", Boolean.class);
        m.put("idade", Integer.class);
        m.put("uuidExterno", UUID.class);
        m.put("categoria", CategoriaTeste.class);

        return Map.copyOf(m);
    }

    private static FiltroDTO filtro(OperadorLogico logico, CriterioFiltro... criterios) {

        return new FiltroDTO(0, 20, List.of(), logico, List.of(criterios));
    }

    private static FiltroAvancadoQueryBuilder.Resultado construir(FiltroDTO filtro) {

        return FiltroAvancadoQueryBuilder.construir(filtro, CAMPOS_PERMITIDOS, CAMPOS_ENTIDADE);
    }


    // ----------------------------------------------------------------------
    //  Lista vazia / nula
    // ----------------------------------------------------------------------

    @Nested
    @DisplayName("Lista de critérios vazia ou nula")
    class ListaVazia {

        @Test
        @DisplayName("criterios nulo devolve Resultado vazio")
        void criteriosNulo() {

            FiltroDTO f = new FiltroDTO(0, 20, List.of(), OperadorLogico.AND, null);

            FiltroAvancadoQueryBuilder.Resultado r = construir(f);

            assertEquals("", r.jpql());
            assertTrue(r.parametros().isEmpty());
        }

        @Test
        @DisplayName("criterios vazio devolve Resultado vazio")
        void criteriosVazio() {

            FiltroDTO f = new FiltroDTO(0, 20, List.of(), OperadorLogico.AND, List.of());

            FiltroAvancadoQueryBuilder.Resultado r = construir(f);

            assertEquals("", r.jpql());
            assertTrue(r.parametros().isEmpty());
        }
    }


    // ----------------------------------------------------------------------
    //  Operadores isolados
    // ----------------------------------------------------------------------

    @Nested
    @DisplayName("Operadores isolados")
    class OperadoresIsolados {

        @Test
        void eqString() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.EQ, "Maria", null));

            var r = construir(f);

            assertEquals("nome = :p0", r.jpql());
            assertEquals("Maria", r.parametros().get("p0"));
        }

        @Test
        void notEqString() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.NOT_EQ, "Maria", null));

            var r = construir(f);

            assertEquals("nome <> :p0", r.jpql());
        }

        @Test
        void gtNumerico() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("idade", OperadorFiltro.GT, 18, null));

            var r = construir(f);

            assertEquals("idade > :p0", r.jpql());
            assertEquals(18, r.parametros().get("p0"));
        }

        @Test
        void gteNumerico() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("idade", OperadorFiltro.GTE, 18, null));

            var r = construir(f);

            assertEquals("idade >= :p0", r.jpql());
        }

        @Test
        void ltData() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("registradoEm", OperadorFiltro.LT, "2026-12-31", null));

            var r = construir(f);

            assertEquals("registradoEm < :p0", r.jpql());
            assertEquals(LocalDate.of(2026, 12, 31), r.parametros().get("p0"));
        }

        @Test
        void lteData() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("registradoEm", OperadorFiltro.LTE, "2026-01-01", null));

            var r = construir(f);

            assertEquals("registradoEm <= :p0", r.jpql());
        }

        @Test
        void betweenData() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("registradoEm", OperadorFiltro.BETWEEN,
                            "2026-01-01", "2026-12-31"));

            var r = construir(f);

            assertEquals("registradoEm between :p0 and :p0b", r.jpql());
            assertEquals(LocalDate.of(2026, 1, 1), r.parametros().get("p0"));
            assertEquals(LocalDate.of(2026, 12, 31), r.parametros().get("p0b"));
        }

        @Test
        void inEnum() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("status", OperadorFiltro.IN,
                            List.of("ATIVO", "INATIVO"), null));

            var r = construir(f);

            assertEquals("status in :p0", r.jpql());

            Object param = r.parametros().get("p0");
            assertTrue(param instanceof List);

            @SuppressWarnings("unchecked")
            List<Object> lista = (List<Object>) param;

            assertEquals(2, lista.size());
            assertEquals(EnumStatusEntity.ATIVO, lista.get(0));
            assertEquals(EnumStatusEntity.INATIVO, lista.get(1));
        }

        @Test
        void notInEnum() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("status", OperadorFiltro.NOT_IN,
                            List.of("INATIVO"), null));

            var r = construir(f);

            assertEquals("status not in :p0", r.jpql());
        }

        @Test
        void startsWith() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.STARTS_WITH, "Ma", null));

            var r = construir(f);

            assertEquals("lower(nome) like lower(:p0)", r.jpql());
            assertEquals("Ma%", r.parametros().get("p0"));
        }

        @Test
        void endsWith() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.ENDS_WITH, "lva", null));

            var r = construir(f);

            assertEquals("lower(nome) like lower(:p0)", r.jpql());
            assertEquals("%lva", r.parametros().get("p0"));
        }

        @Test
        void contains() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.CONTAINS, "ari", null));

            var r = construir(f);

            assertEquals("lower(nome) like lower(:p0)", r.jpql());
            assertEquals("%ari%", r.parametros().get("p0"));
        }

        @Test
        void isNull() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("email", OperadorFiltro.IS_NULL, null, null));

            var r = construir(f);

            assertEquals("email is null", r.jpql());
            assertTrue(r.parametros().isEmpty());
        }

        @Test
        void isNotNull() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("email", OperadorFiltro.IS_NOT_NULL, null, null));

            var r = construir(f);

            assertEquals("email is not null", r.jpql());
        }
    }


    // ----------------------------------------------------------------------
    //  Combinações AND / OR
    // ----------------------------------------------------------------------

    @Nested
    @DisplayName("Combinações lógicas")
    class CombinacoesLogicas {

        @Test
        @DisplayName("AND com 3 critérios envolve em parênteses e usa 'and'")
        void andTresCriterios() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.CONTAINS, "jo", null),
                    new CriterioFiltro("status", OperadorFiltro.NOT_EQ, "INATIVO", null),
                    new CriterioFiltro("registradoEm", OperadorFiltro.BETWEEN, "2026-01-01", "2026-12-31"));

            var r = construir(f);

            String esperado = "(lower(nome) like lower(:p0)"
                    + " and status <> :p1"
                    + " and registradoEm between :p2 and :p2b)";

            assertEquals(esperado, r.jpql());
            assertEquals("%jo%", r.parametros().get("p0"));
            assertEquals(EnumStatusEntity.INATIVO, r.parametros().get("p1"));
            assertEquals(LocalDate.of(2026, 1, 1), r.parametros().get("p2"));
            assertEquals(LocalDate.of(2026, 12, 31), r.parametros().get("p2b"));
        }

        @Test
        @DisplayName("OR com 3 critérios envolve em parênteses e usa 'or'")
        void orTresCriterios() {

            FiltroDTO f = filtro(OperadorLogico.OR,
                    new CriterioFiltro("nome", OperadorFiltro.CONTAINS, "jo", null),
                    new CriterioFiltro("login", OperadorFiltro.CONTAINS, "jo", null),
                    new CriterioFiltro("email", OperadorFiltro.CONTAINS, "jo", null));

            var r = construir(f);

            String esperado = "(lower(nome) like lower(:p0)"
                    + " or lower(login) like lower(:p1)"
                    + " or lower(email) like lower(:p2))";

            assertEquals(esperado, r.jpql());
        }

        @Test
        @DisplayName("Critério único não envolve em parênteses")
        void criterioUnicoSemParenteses() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.EQ, "Maria", null));

            var r = construir(f);

            assertEquals("nome = :p0", r.jpql());
        }

        @Test
        @DisplayName("operadorLogico nulo trata como AND")
        void operadorLogicoNuloTrataComoAnd() {

            FiltroDTO f = new FiltroDTO(0, 20, List.of(), null, List.of(
                    new CriterioFiltro("nome", OperadorFiltro.EQ, "Maria", null),
                    new CriterioFiltro("login", OperadorFiltro.EQ, "maria", null)
            ));

            var r = construir(f);

            assertTrue(r.jpql().contains(" and "));
        }
    }


    // ----------------------------------------------------------------------
    //  Whitelist e operador incompatível
    // ----------------------------------------------------------------------

    @Nested
    @DisplayName("Validações de whitelist / compatibilidade")
    class Validacoes {

        @Test
        @DisplayName("Campo fora da whitelist lança IllegalArgumentException")
        void campoForaDaWhitelist() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("senhaHash", OperadorFiltro.EQ, "abc", null));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> construir(f));

            assertTrue(ex.getMessage().contains("senhaHash"));
            assertTrue(ex.getMessage().contains("não é filtrável"));
        }

        @Test
        @DisplayName("BETWEEN em campo String é incompatível e lança 400")
        void betweenEmString() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.BETWEEN, "a", "z"));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> construir(f));

            assertTrue(ex.getMessage().contains("BETWEEN"));
            assertTrue(ex.getMessage().contains("nome"));
        }

        @Test
        @DisplayName("CONTAINS em campo numérico é incompatível e lança 400")
        void containsEmNumero() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("idade", OperadorFiltro.CONTAINS, "1", null));

            assertThrows(IllegalArgumentException.class, () -> construir(f));
        }

        @Test
        @DisplayName("GT em campo Boolean é incompatível")
        void gtEmBoolean() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("ativo", OperadorFiltro.GT, true, null));

            assertThrows(IllegalArgumentException.class, () -> construir(f));
        }

        @Test
        @DisplayName("BETWEEN sem valor2 lança 400")
        void betweenSemValor2() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("registradoEm", OperadorFiltro.BETWEEN, "2026-01-01", null));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> construir(f));

            assertTrue(ex.getMessage().contains("BETWEEN"));
            assertTrue(ex.getMessage().contains("valor2"));
        }

        @Test
        @DisplayName("IN com valor que não é lista lança 400")
        void inSemLista() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("status", OperadorFiltro.IN, "ATIVO", null));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> construir(f));

            assertTrue(ex.getMessage().contains("IN"));
            assertTrue(ex.getMessage().contains("List"));
        }

        @Test
        @DisplayName("IN com lista vazia lança 400")
        void inComListaVazia() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("status", OperadorFiltro.IN, List.of(), null));

            assertThrows(IllegalArgumentException.class, () -> construir(f));
        }

        @Test
        @DisplayName("EQ sem valor (null) em campo não-nulável lança 400")
        void eqSemValor() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("nome", OperadorFiltro.EQ, null, null));

            assertThrows(IllegalArgumentException.class, () -> construir(f));
        }
    }


    // ----------------------------------------------------------------------
    //  Conversão de valores
    // ----------------------------------------------------------------------

    @Nested
    @DisplayName("Conversão de valores a partir de String")
    class Conversoes {

        @Test
        @DisplayName("LocalDate ISO-8601 convertido corretamente em BETWEEN")
        void localDateBetween() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("registradoEm", OperadorFiltro.BETWEEN,
                            "2026-01-01", "2026-12-31"));

            var r = construir(f);

            assertEquals(LocalDate.of(2026, 1, 1), r.parametros().get("p0"));
            assertEquals(LocalDate.of(2026, 12, 31), r.parametros().get("p0b"));
        }

        @Test
        @DisplayName("LocalDateTime ISO-8601 convertido corretamente")
        void localDateTime() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("createdAt", OperadorFiltro.GTE,
                            "2026-01-01T12:34:56", null));

            var r = construir(f);

            assertEquals(LocalDateTime.of(2026, 1, 1, 12, 34, 56), r.parametros().get("p0"));
        }

        @Test
        @DisplayName("LocalDate inválido lança 400 com mensagem do campo")
        void localDateInvalido() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("registradoEm", OperadorFiltro.EQ, "data-invalida", null));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> construir(f));

            assertTrue(ex.getMessage().contains("registradoEm"));
            assertTrue(ex.getMessage().contains("data-invalida"));
        }

        @Test
        @DisplayName("Enum convertido a partir de String")
        void enumDeString() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("categoria", OperadorFiltro.EQ, "A", null));

            var r = construir(f);

            assertEquals(CategoriaTeste.A, r.parametros().get("p0"));
        }

        @Test
        @DisplayName("Enum inválido lança 400")
        void enumInvalido() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("categoria", OperadorFiltro.EQ, "X", null));

            assertThrows(IllegalArgumentException.class, () -> construir(f));
        }

        @Test
        @DisplayName("UUID convertido a partir de String")
        void uuidDeString() {

            String uuidStr = "9b1b1d3c-3e2c-4d57-9a3f-2c5b5d1e7a10";

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("uuidExterno", OperadorFiltro.EQ, uuidStr, null));

            var r = construir(f);

            assertEquals(UUID.fromString(uuidStr), r.parametros().get("p0"));
        }

        @Test
        @DisplayName("UUID inválido lança 400")
        void uuidInvalido() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("uuidExterno", OperadorFiltro.EQ, "nao-eh-uuid", null));

            assertThrows(IllegalArgumentException.class, () -> construir(f));
        }

        @Test
        @DisplayName("IN com lista de UUIDs convertidos")
        void inComUuids() {

            String u1 = "9b1b1d3c-3e2c-4d57-9a3f-2c5b5d1e7a10";
            String u2 = "00000000-0000-0000-0000-000000000001";

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("uuidExterno", OperadorFiltro.IN,
                            List.of(u1, u2), null));

            var r = construir(f);

            @SuppressWarnings("unchecked")
            List<Object> lista = (List<Object>) r.parametros().get("p0");

            assertEquals(UUID.fromString(u1), lista.get(0));
            assertEquals(UUID.fromString(u2), lista.get(1));
        }

        @Test
        @DisplayName("Número entregue como Integer pelo Jackson é preservado")
        void numeroDireto() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("idade", OperadorFiltro.EQ, 42, null));

            var r = construir(f);

            assertEquals(42, r.parametros().get("p0"));
        }

        @Test
        @DisplayName("Número entregue como String é convertido")
        void numeroDeString() {

            FiltroDTO f = filtro(OperadorLogico.AND,
                    new CriterioFiltro("idade", OperadorFiltro.EQ, "42", null));

            var r = construir(f);

            assertEquals(42, r.parametros().get("p0"));
        }
    }


    // ----------------------------------------------------------------------
    //  Sanidade geral
    // ----------------------------------------------------------------------

    @Test
    @DisplayName("Resultado não-vazio sempre carrega o mesmo número de parâmetros declarados no JPQL")
    void numeroDeParametrosConsistente() {

        FiltroDTO f = filtro(OperadorLogico.AND,
                new CriterioFiltro("nome", OperadorFiltro.EQ, "Maria", null),
                new CriterioFiltro("idade", OperadorFiltro.BETWEEN, 18, 65),
                new CriterioFiltro("ativo", OperadorFiltro.EQ, true, null));

        var r = construir(f);

        assertNotNull(r.jpql());

        // Sanidade: para BETWEEN são 2 placeholders; para os demais EQ é 1 cada.
        // Total esperado: 4 parâmetros.
        assertEquals(4, r.parametros().size());
    }

    @Test
    @DisplayName("filtro null lança IllegalArgumentException")
    void filtroNulo() {

        try {

            FiltroAvancadoQueryBuilder.construir(null, CAMPOS_PERMITIDOS, CAMPOS_ENTIDADE);

            fail("Esperava IllegalArgumentException para filtro null");

        } catch (IllegalArgumentException ex) {

            // OK
            assertNotNull(ex.getMessage());
        }
    }

    @Test
    @DisplayName("operadorLogico OR com critério único também não envolve em parênteses")
    void orCriterioUnicoSemParenteses() {

        FiltroDTO f = filtro(OperadorLogico.OR,
                new CriterioFiltro("nome", OperadorFiltro.CONTAINS, "x", null));

        assertDoesNotThrow(() -> construir(f));

        var r = construir(f);

        assertEquals("lower(nome) like lower(:p0)", r.jpql());
    }

}
