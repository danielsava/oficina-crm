# Plano de Implementação — Busca Avançada (Caminho B Avançado) — Backend

> **Status**: pendente (apenas planejamento; **não implementar ainda**)
> **Última atualização**: 2026-06-04
> **Escopo**: apenas backend. O plano do frontend será criado em momento posterior.
> **Origem**: extensão natural do modo básico definido em [`0002-paginacao-ordenacao-filtros-backend.md`](0002-paginacao-ordenacao-filtros-backend.md). A divisão entre básico (querystring tipada) e avançado (corpo estruturado) foi decidida na sessão S1 do plano [`0001-padronizacao-crud-backend.md`](0001-padronizacao-crud-backend.md).

## Como ler este documento

- Este é um **plano detalhado de design e implementação**, mas **não autoriza implementação imediata**. Serve de referência para quando a primeira tela com filtro avançado for projetada no `frontend-ultima`.
- A seção **Decisões** registra as escolhas já fechadas conceitualmente. Antes da implementação, revisar e confirmar — algumas podem mudar com base no desenho do frontend.
- Decisões arquiteturais finais virarão um ADR próprio (provavelmente ADR-0010 ou o próximo livre na época) **antes** do merge da implementação.

## Objetivo

Oferecer, no `common.BaseRest`, um endpoint adicional de busca que aceite **operadores explícitos por campo** e **operador lógico** entre campos (AND/OR, possivelmente com agrupamentos), permitindo que telas administrativas montem filtros complexos sem depender de DSL textual nem multiplicar query params.

Continua válido o modo básico (`GET /` com query params tipados) como caminho principal para tabelas simples. O modo avançado é **adicional**, não substitui o básico.

## Decisões consolidadas

### 1. Endpoint dedicado: `POST /buscar`

- **Método**: `POST` (corpo estruturado em JSON, possivelmente grande; URLs ficariam ilegíveis se isso virasse query string).
- **Path**: `/buscar` relativo ao path do `*Rest` concreto (ex.: `/usuario/buscar`).
- **Content-Type**: `application/json` (request); resposta `application/json` (sucesso) ou `application/problem+json` (erro), conforme padrão (ADR-0004, ADR-0007).
- **Resposta de sucesso**: envelope `Pagina<ListDTO>` — **o mesmo** record `common.Pagina<T>` definido no plano 0002. Reuso direto.
- **Localização da declaração**: o endpoint vive no `BaseRest`, herdado por todos os `*Rest` concretos (assim como `GET /`, `POST /`, `PUT /{uuid}`, etc.).

Justificativa para POST em vez de GET:
- Corpos JSON na query string são feios, exigem URL-encoding e são limitados em tamanho por proxies.
- Tipagem rica no OpenAPI: `FiltroDTO` vira schema completo, gerando tipos precisos no `frontend-ultima`.
- Semântica: POST aqui não cria recurso; é "POST como mecanismo de transporte de query estruturada", padrão aceito (Elasticsearch, GitHub GraphQL, várias APIs corporativas). Documentar isso na descrição da operação OpenAPI.

### 2. DTO de entrada: `common.FiltroDTO`

Record genérico no pacote `common`. Estrutura proposta:

```java
package common;

import java.util.List;

public record FiltroDTO(
    int page,
    int size,
    List<String> sort,           // mesmo formato do modo básico: ["campo,direcao", ...]
    OperadorLogico operadorLogico, // AND | OR (aplicado entre os criterios do nível raiz)
    List<CriterioFiltro> criterios
) {}
```

Tipos auxiliares:

```java
package common;

public enum OperadorLogico { AND, OR }

public enum OperadorFiltro {
    EQ,            // igual a
    NOT_EQ,        // diferente de
    GT,            // maior que
    GTE,           // maior ou igual a
    LT,            // menor que
    LTE,           // menor ou igual a
    BETWEEN,       // entre valor1 e valor2 (inclusivo)
    IN,            // pertence à lista
    NOT_IN,        // não pertence à lista
    STARTS_WITH,   // string: começa com (ILIKE 'valor%')
    ENDS_WITH,     // string: termina com (ILIKE '%valor')
    CONTAINS,      // string: contém (ILIKE '%valor%')
    IS_NULL,       // campo é null
    IS_NOT_NULL    // campo não é null
}

public record CriterioFiltro(
    String campo,
    OperadorFiltro operador,
    Object valor,         // null para IS_NULL/IS_NOT_NULL; lista para IN/NOT_IN; objeto único nos demais
    Object valor2,        // segundo valor apenas para BETWEEN (null nos demais)
    OperadorLogico operadorLogico, // AND/OR; usado quando este critério é um grupo aninhado
    List<CriterioFiltro> subCriterios // não-null quando este nó é um grupo (sintaxe de agrupamento)
) {}
```

#### Critérios "folha" vs critérios "grupo"

- **Folha**: `subCriterios == null`. Avalia `campo operador valor [valor2]`. Os campos `operadorLogico` e `subCriterios` são ignorados.
- **Grupo**: `subCriterios != null && !subCriterios.isEmpty()`. Os campos `campo`, `operador`, `valor`, `valor2` devem ser `null`. O `operadorLogico` define como combinar os `subCriterios`.

Isso permite expressar:

```
(nome STARTS_WITH 'jo' OR email CONTAINS 'jo')
AND status NOT_EQ 'INATIVO'
AND createdAt BETWEEN '2026-01-01' AND '2026-12-31'
```

como:

```json
{
  "page": 0,
  "size": 20,
  "sort": ["createdAt,desc"],
  "operadorLogico": "AND",
  "criterios": [
    {
      "operadorLogico": "OR",
      "subCriterios": [
        { "campo": "nome", "operador": "STARTS_WITH", "valor": "jo" },
        { "campo": "email", "operador": "CONTAINS", "valor": "jo" }
      ]
    },
    { "campo": "status", "operador": "NOT_EQ", "valor": "INATIVO" },
    { "campo": "createdAt", "operador": "BETWEEN", "valor": "2026-01-01", "valor2": "2026-12-31" }
  ]
}
```

#### Validações no DTO

- `page >= 0`, `size >= 1`, `size <= 100` (mesmos limites do modo básico — plano 0002, decisão 5). Bean Validation com `@Min`/`@Max` no record.
- `operadorLogico` no nível raiz: default `AND` quando `null`.
- `criterios` no nível raiz: pode ser `null` ou lista vazia (significa "sem filtros", retorna tudo paginado).
- `sort` segue o mesmo parser do modo básico (`common.SortParser`), com a mesma whitelist por entidade. Direção obrigatória, fallback `[createdAt desc, id desc]`.
- Tamanho máximo de critérios (raiz + aninhados, profundidade total): **a definir na implementação**. Sugestão inicial: profundidade máxima de aninhamento = 5, total de nós = 100. Evita ataque por payload patológico.

### 3. Whitelist de campos — reuso da do modo básico

- O `*Service.camposFiltraveis()` (definido no plano 0002) **é reusado integralmente**. Qualquer `campo` em `CriterioFiltro` precisa estar na whitelist.
- Campo fora da whitelist → **400 + Problem Details** com mensagem explícita (`"Campo 'X' não é filtrável nesta entidade"`).
- Justificativa: evita duas listas paralelas a manter; o que é filtrável no básico continua filtrável no avançado.
- **Atenção**: pode aparecer caso em que um campo é filtrável só no modo avançado (ex.: filtro por `isNull` em campo que no básico não fazia sentido expor). Se aparecer, adicionar segundo método opcional `camposFiltraveisAvancado()` que, quando não sobrescrito, retorna `camposFiltraveis()`. Decisão pode ficar para a implementação.

### 4. Operadores permitidos por tipo de campo

| Tipo do campo | Operadores válidos |
|---|---|
| **String** | `EQ`, `NOT_EQ`, `STARTS_WITH`, `ENDS_WITH`, `CONTAINS`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **Número, Data, Timestamp** | `EQ`, `NOT_EQ`, `GT`, `GTE`, `LT`, `LTE`, `BETWEEN`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **Boolean** | `EQ`, `NOT_EQ`, `IS_NULL`, `IS_NOT_NULL` |
| **Enum** | `EQ`, `NOT_EQ`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **UUID** | `EQ`, `NOT_EQ`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |

- Operador incompatível com o tipo do campo → **400 + Problem Details**.
- Validação feita no `BaseService.buscarAvancado()` ao montar a query, antes de tocar o banco.
- Inferência de tipo: por reflexão sobre a classe da entidade JPA (mesma estratégia do modo básico).

### 5. Tradução JPQL

O `BaseService.buscarAvancado()` percorre a árvore de critérios em DFS e gera dinamicamente:

- Trecho JPQL parametrizado (`?1`, `?2`, ... ou `:param1`, `:param2`, ...).
- `Map<String, Object>` de parâmetros (ou `Parameters.with(...).and(...)`).

Exemplo do JSON acima vira aproximadamente:

```sql
WHERE
  (LOWER(nome) LIKE LOWER(:p1) OR LOWER(email) LIKE LOWER(:p2))
  AND status <> :p3
  AND createdAt BETWEEN :p4 AND :p5
  AND status_entity = 'ATIVO'  -- filtro implícito mantido (ver item 7)
```

- Nunca concatenar valor do cliente em string SQL; sempre parametrizar.
- Nomes de campos: vêm da whitelist (não do cliente); portanto seguros para concatenar diretamente como nome de coluna/campo JPQL.

### 6. Sort no modo avançado

- Mesmo formato do modo básico (`["campo,direcao", ...]`).
- Mesma whitelist (`camposSortaveis()`).
- Mesmo fallback de `defaultSort()` quando vazio.
- Mesmas regras de validação (direção obrigatória; campo na whitelist).
- Reusa `common.SortParser` integralmente.

### 7. Filtro implícito de status = ATIVO

- Mantém o comportamento do modo básico: `status = ATIVO` é adicionado por padrão.
- Pode ser sobrescrito explicitamente se o cliente incluir um `CriterioFiltro` para o campo `status` (ex.: `{ campo: 'status', operador: 'IN', valor: ['ATIVO', 'INATIVO'] }`).
- Detalhe de implementação: quando a árvore de critérios contém referência ao campo `status`, **não** adicionar o filtro implícito. Caso contrário, adicionar.
- Documentar esse comportamento no OpenAPI e em código.

### 8. Defaults e limites (reuso do modo básico)

| Aspecto | Valor |
|---|---|
| `page` default | `0` |
| `size` default | `20` |
| `size` máximo | `100` |
| `size` mínimo | `1` |
| Profundidade máx. de aninhamento | `5` (sugerido) |
| Quantidade total máx. de critérios (folhas + grupos) | `100` (sugerido) |
| Validação | Bean Validation no `FiltroDTO` + validação programática no `BaseService` |

### 9. Tratamento de erros — Problem Details (RFC 7807)

Códigos relevantes:

- **400** — payload inválido, campo fora da whitelist, operador incompatível com tipo do campo, profundidade/quantidade excedida, sort inválido.
- **422** — opcional: distinguir erro semântico (estrutura válida, mas combinação não permitida) de erro de schema (400). **Decisão para implementação**: começar com 400 para tudo; só introduzir 422 se houver demanda real de granularidade. Manter consistência com o modo básico.
- **500** — erro inesperado de servidor.

Cada caso conhecido gera uma mensagem clara em `detail` do Problem Details. `instance` continua `null` por enquanto (mesmo padrão dos demais endpoints).

## Escopo de implementação

### Arquivos a criar

1. **`common/FiltroDTO.java`** — record com `page`, `size`, `sort`, `operadorLogico`, `criterios`. Anotado com `@Schema` (OpenAPI) e validações (`@Min`, `@Max`).
2. **`common/CriterioFiltro.java`** — record com `campo`, `operador`, `valor`, `valor2`, `operadorLogico`, `subCriterios`. Anotado com `@Schema`.
3. **`common/OperadorLogico.java`** — enum (`AND`, `OR`).
4. **`common/OperadorFiltro.java`** — enum com os 13 operadores listados acima.
5. **`common/FiltroAvancadoQueryBuilder.java`** (utilitário) — recebe `FiltroDTO` + `Class<Entity>` + whitelist, devolve `(String jpql, Map<String,Object> parametros)`. Encapsula a lógica de tradução. Implementação testável isoladamente (sem CDI).
6. **Exceptions específicas** (em `infra/exception/` ou `common/`):
   - `CampoNaoFiltavelException`
   - `OperadorIncompativelException`
   - `EstruturaFiltroInvalidaException` (profundidade, contagem)
   - Cada uma com seu `ExceptionMapper` correspondente em `infra/exception/`, retornando 400 + Problem Details (padrão ADR-0004).
   - Alternativa: usar uma única `BuscaAvancadaException` com `code` interno. **Decisão para implementação**: priorizar mapper único com discriminador, evita inflar `infra/exception/`.

### Arquivos a modificar

1. **`common/BaseRest.java`** — adicionar endpoint:
   ```java
   @POST
   @Path("/buscar")
   @Consumes(MediaType.APPLICATION_JSON)
   @Operation(summary = "Busca avançada paginada",
              description = "Aceita filtros estruturados com operadores explícitos e combinação lógica AND/OR.")
   @APIResponse(responseCode = "200", description = "Página de resultados retornada")
   @APIResponse(responseCode = "400", description = "Payload inválido (RFC 7807)")
   public Pagina<ListDTO> buscar(@Valid FiltroDTO filtro) {
       return this.service().buscarAvancado(filtro);
   }
   ```

2. **`common/BaseService.java`** — adicionar método:
   ```java
   public Pagina<ListDTO> buscarAvancado(FiltroDTO filtro) {
       // 1. Validar whitelist de cada campo (camposFiltraveis / camposFiltraveisAvancado).
       // 2. Validar compatibilidade operador <-> tipo do campo.
       // 3. Validar profundidade e quantidade.
       // 4. Parsear sort (SortParser) com a whitelist camposSortaveis.
       // 5. Aplicar defaultSort se sort vazio.
       // 6. Montar JPQL via FiltroAvancadoQueryBuilder.
       // 7. Adicionar filtro implícito status=ATIVO se não houver critério em 'status'.
       // 8. Executar com paginação e projeção em ListDTO.
       // 9. Contar totalElements; calcular totalPages.
       // 10. Retornar Pagina<ListDTO>.
   }
   ```
   Reusa internamente os pontos de extensão já existentes (`camposSortaveis`, `camposFiltraveis`, `defaultSort`).

3. **`backend-quarkus/AGENTS.md`** — adicionar referência ao endpoint avançado na seção `BaseRest` e link para este plano + ADR correspondente.

### Não exige mudança

- Os `*Rest` e `*Service` concretos **não precisam ser modificados** para ganhar o endpoint avançado. Eles o herdam automaticamente do `BaseRest`/`BaseService`. Só precisam garantir que `camposFiltraveis()` e `camposSortaveis()` cobrem o que querem expor (decisão já feita no modo básico — plano 0002).
- A whitelist é responsabilidade de cada `*Service`; cobre os dois modos.

### Documentação a produzir

1. **ADR (provavelmente 0010 ou próximo livre na época)** — `NNNN-busca-avancada-no-baserest.md`. Conteúdo previsto:
   - **Contexto**: limitação do modo básico para telas com filtros complexos; necessidade de operadores explícitos e OR; opções avaliadas (manter só básico, DSL RSQL, JSON-in-query, endpoint POST estruturado).
   - **Decisão**: `POST /buscar` com `FiltroDTO`, reuso de envelope `Pagina<T>` e whitelist do modo básico.
   - **Consequências**: superfície adicional de API; complexidade controlada (sem DSL textual); tipagem completa no OpenAPI; reuso da infra existente.
   - **Alternativas consideradas**: DSL RSQL, JSON em query string, ampliação do modo básico com sufixos por operador.

2. **Atualização do `AGENTS.md`** — descrever o endpoint avançado e o reuso da whitelist.

## Ordem de execução recomendada (quando for implementar)

1. **Confirmar pré-requisitos**: plano 0002 implementado e em produção (whitelist `camposFiltraveis`/`camposSortaveis` já existindo nos `*Service` ativos; envelope `Pagina<T>` já em uso).
2. **Confirmar requisitos com o frontend**: revisar o desenho do componente de filtro avançado. Pode levar a ajustes neste plano (ex.: necessidade de operador adicional, agrupamento mais profundo, etc.).
3. **Criar ADR-NNNN** (rascunho aceito antes do código).
4. **Criar os records e enums em `common/`** (`FiltroDTO`, `CriterioFiltro`, `OperadorLogico`, `OperadorFiltro`).
5. **Implementar `FiltroAvancadoQueryBuilder`** com testes unitários cobrindo cada operador e cenários de árvore (raiz AND, raiz OR, grupo aninhado, BETWEEN, IN, IS_NULL, etc.).
6. **Adicionar `buscar()` ao `BaseRest`** e `buscarAvancado(FiltroDTO)` ao `BaseService`.
7. **Criar `ExceptionMapper`(s)** para as exceções específicas, com Problem Details.
8. **Testes manuais via Swagger UI** com vários payloads (sucesso e erro).
9. **Atualizar `AGENTS.md`**.
10. **Marcar ADR como Accepted**.
11. **Comunicar ao `frontend-ultima`** o novo endpoint disponível para regerar tipos OpenAPI.

## Riscos e observações

- **Complexidade do query builder**: a árvore de critérios com agrupamento aninhado é a parte mais delicada. Bug aqui = bug de segurança em potencial (filtro errado, vazamento de dados). **Mitigação**: cobertura de testes unitários alta no `FiltroAvancadoQueryBuilder`; validação rigorosa antes de montar JPQL; nunca interpolar valores do cliente em texto SQL.
- **DoS via payload patológico**: cliente malicioso poderia enviar árvore com 10000 nós aninhados. **Mitigação**: limites de profundidade e quantidade total declarados; rejeitar 400 cedo, antes de tocar o banco.
- **Performance**: filtros avançados podem gerar queries com muitos `OR`s e `LIKE`s que não usam índices. **Mitigação**: monitorar via logs SQL em produção; se aparecerem hotspots, criar índices específicos por caso ou recusar combinações patológicas (ex.: `LIKE '%algo%'` em tabela > N linhas sem outro filtro restritivo).
- **Reflexão para inferir tipo do campo**: assume nomes de campo da entidade JPA exatamente como declarados. Campos renomeados via `@Column(name="...")` ainda funcionam (JPQL usa o nome do atributo Java, não da coluna), mas é ponto de atenção.
- **Acoplamento com modo básico**: a whitelist é única para ambos. Mudança que removesse campo de `camposFiltraveis()` afetaria os dois modos. Aceito; manter consistência é desejável.
- **`status = ATIVO` implícito vs explícito**: a regra "se cliente menciona `status` no filtro, desliga o implícito" precisa de teste cuidadoso (não pode haver bug do tipo "consigo ver inativos sem permissão"). Quando o tema autenticação/autorização entrar no projeto, revisitar essa lógica para amarrar com perfil do usuário.
- **OpenAPI e `FiltroDTO` recursivo**: o tipo `CriterioFiltro` contém `List<CriterioFiltro>` (recursivo). O SmallRye OpenAPI suporta isso, mas vale verificar a geração de tipos no `openapi-typescript` do `frontend-ultima` — pode exigir ajuste de configuração para tipos auto-referenciantes.
- **Conversão de `valor: Object`**: o campo `valor` é tipado como `Object` no record para suportar string/número/data/lista. A desserialização Jackson preserva o tipo conforme o JSON (`"abc"` → String; `42` → Integer; `[...]` → List). A validação posterior no `BaseService` precisa converter para o tipo esperado pelo campo da entidade. Datas em ISO-8601 (configuração já vigente, ver `UsuarioRest`) podem ser convertidas explicitamente quando o operador for `BETWEEN`/`GT`/`LT` em campo `LocalDate`/`Instant`.

## Pontos a confirmar antes da implementação

- Lista final de operadores: a tabela atual é proposta. Validar com o frontend se há operadores faltando (ex.: `LIKE` arbitrário, `REGEX`).
- Operador lógico no nível raiz pode ser apenas `AND`? Algumas APIs simplificam assim e só permitem OR via grupos. **Decisão atual**: aceitar AND/OR no raiz para consistência com grupos aninhados.
- Profundidade e quantidade máximas (5/100 sugeridos) — confirmar.
- Existência de `camposFiltraveisAvancado()` separado de `camposFiltraveis()` — decidir com base no caso real.
- Eventual 422 vs 400 para erros semânticos — confirmar postura ao implementar.

## Relação com outros planos e ADRs

- **Pré-requisito**: [`0002-paginacao-ordenacao-filtros-backend.md`](0002-paginacao-ordenacao-filtros-backend.md) (modo básico).
- **ADR a criar antes do merge**: novo (provavelmente 0010 ou próximo livre).
- **ADRs reusados**: ADR-0002 (UUID público), ADR-0004 (RFC 7807), ADR-0006 (OpenAPI), ADR-0007 (Media Types), ADR-0009 (paginação/sort/filtros básicos, será criada com o plano 0002).
- **Plano do frontend**: ainda não criado; será produzido quando o desenho da tela com filtro avançado for definido.
