# Plano de Implementação — Busca Paginada com Filtros (Caminho B Único) — Backend

> **Status**: pendente (planejamento revisado; implementação a executar)
> **Última atualização**: 2026-06-04 (rev.2 — após análise comparativa com a implementação do plano 0002, o desenho foi simplificado e passa a ser o **mecanismo único** de listagem com filtros. Decisões revisadas: operador lógico único por requisição (AND **ou** OR, sem aninhamento), whitelist herdada do `ListDTO` (rev.3 do plano 0002), `DEFAULT_SORT = [id desc]` (rev.5 do plano 0002), sem limite de quantidade de critérios, sem dependência de `openapi-typescript`. O plano 0002 será **removido** quando este plano for implementado.)
> **Escopo**: apenas backend. O plano do frontend será criado em momento posterior.
> **Origem**: extensão natural do modo básico definido em [`0002-paginacao-ordenacao-filtros-backend.md`](0002-paginacao-ordenacao-filtros-backend.md). Após implementação do 0002 e análise comparativa, decidiu-se substituir o 0002 por este plano (que cobre todos os casos com contrato explícito).

## Como ler este documento

- Este é um **plano detalhado de design e implementação**, mas **não autoriza implementação imediata**. Serve de referência para quando a primeira tela com listagem paginada for projetada no `frontend-ultima` na nova arquitetura.
- A seção **Decisões consolidadas** registra as escolhas já fechadas conceitualmente. Servem de entrada para a implementação e para a reescrita da ADR-0009.
- A seção **Escopo de implementação** detalha o que muda no código.
- A seção **Ordem de execução** define a sequência recomendada, incluindo a **remoção do código do plano 0002**.

## Objetivo

Substituir o mecanismo de listagem paginada com filtros do plano 0002 (`GET /` com query string e convenção implícita de operadores) por um endpoint único com **contrato HTTP explícito**: filtros com operador por campo, operador lógico AND ou OR (um por requisição, sem agrupamento), sort multi-campo e paginação offset/limit.

A motivação foi consolidada em análise comparativa: o 0002 entregou complexidade espalhada (convenção implícita de operadores por tipo, drift silencioso entre frontend e backend, ambiguidade entre `ListDTO`/whitelist/entidade), enquanto o desenho deste plano concentra a complexidade num único query builder testável, com contrato sem ambiguidade. Detalhes em [`0002-paginacao-ordenacao-filtros-backend.md`](0002-paginacao-ordenacao-filtros-backend.md) (que será descontinuado).

## Decisões consolidadas

### 1. Endpoint único: `POST /buscar`

- **Método**: `POST` (corpo estruturado em JSON; URLs ficariam ilegíveis se isso virasse query string).
- **Path**: `/buscar` relativo ao path do `*Rest` concreto (ex.: `/usuario/buscar`).
- **Content-Type**: `application/json` (request); resposta `application/json` (sucesso) ou `application/problem+json` (erro), conforme padrão (ADR-0004, ADR-0007).
- **Resposta de sucesso**: envelope `common.Pagina<ListDTO>` — o **mesmo** record introduzido com o plano 0002. Reuso direto.
- **Localização da declaração**: o endpoint vive no `BaseRest`, herdado por todos os `*Rest` concretos (assim como `POST /`, `PUT /{uuid}`, `GET /{uuid}`, `DELETE /inativar/{uuid}`).
- **Não há `GET /` paginado**: o endpoint `GET /` do `BaseRest` deixa de existir como parte deste plano (ver "Ordem de execução"). Listagem só pelo `POST /buscar`.

Justificativa para POST em vez de GET:

- Corpos JSON na query string são feios, exigem URL-encoding e são limitados em tamanho por proxies/servidores.
- Contrato HTTP explícito: `FiltroDTO` vira schema completo no OpenAPI, visível no Swagger UI.
- Semântica: POST aqui não cria recurso; é "POST como mecanismo de transporte de query estruturada". Padrão aceito (Elasticsearch, GitHub GraphQL, várias APIs corporativas). Documentar isso na descrição da operação OpenAPI.
- Trade-off conhecido: `POST` não é cacheado por proxies HTTP. Aceitável para CRUD admin interno (cache HTTP fora de escopo).

### 2. DTO de entrada: `common.FiltroDTO`

Record genérico no pacote `common`. Estrutura final:

```java
package common;

import java.util.List;

public record FiltroDTO(
    int page,
    int size,
    List<String> sort,             // mesmo formato do plano 0002: ["campo,asc", "outroCampo,desc", ...]
    OperadorLogico operadorLogico, // AND (default) ou OR — único para toda a lista de criterios
    List<CriterioFiltro> criterios // lista plana (sem aninhamento)
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
    Object valor,   // null para IS_NULL/IS_NOT_NULL; lista para IN/NOT_IN; objeto único nos demais
    Object valor2   // segundo valor apenas para BETWEEN (null nos demais)
) {}
```

#### Estrutura plana — sem aninhamento

Decisão deliberada de simplificação:

- **Toda a lista de `criterios` é combinada com o mesmo `operadorLogico`** (`AND` ou `OR`). Não há `subCriterios`, não há agrupamento, não há árvore.
- A grande maioria das telas administrativas resolve seus filtros com "todos esses critérios juntos" (AND) ou, ocasionalmente, "qualquer um desses critérios" (OR — caso típico de busca global por trecho em vários campos). Casos legítimos de "(A OR B) AND C" são raros em CRUD admin; quando aparecerem, podem ser tratados via:
  - múltiplas chamadas do frontend que mesclam resultados, ou
  - sobrescrita pontual de `aplicarFiltros` no `*Service` da entidade afetada, ou
  - extensão futura deste plano (não bloqueante).
- Remover aninhamento elimina recursão no query builder, simplifica validação (sem profundidade) e produz contrato OpenAPI mais simples (sem schema auto-referenciante).

#### Exemplo

Query desejada:

```
nome CONTAINS 'jo'
AND status NOT_EQ 'INATIVO'
AND createdAt BETWEEN '2026-01-01' AND '2026-12-31'
```

Payload:

```json
{
  "page": 0,
  "size": 20,
  "sort": ["nome,asc"],
  "operadorLogico": "AND",
  "criterios": [
    { "campo": "nome",      "operador": "CONTAINS", "valor": "jo" },
    { "campo": "status",    "operador": "NOT_EQ",   "valor": "INATIVO" },
    { "campo": "createdAt", "operador": "BETWEEN",  "valor": "2026-01-01", "valor2": "2026-12-31" }
  ]
}
```

Exemplo com OR (busca global por trecho em vários campos):

```json
{
  "page": 0,
  "size": 20,
  "sort": ["nome,asc"],
  "operadorLogico": "OR",
  "criterios": [
    { "campo": "nome",  "operador": "CONTAINS", "valor": "jo" },
    { "campo": "login", "operador": "CONTAINS", "valor": "jo" },
    { "campo": "email", "operador": "CONTAINS", "valor": "jo" }
  ]
}
```

#### Validações no DTO

- `page >= 0`, `size >= 1`, `size <= 100` (mesmos limites do plano 0002). Bean Validation com `@Min`/`@Max` no record.
- `operadorLogico` no nível raiz: default `AND` quando `null`. Nunca falha por ausência.
- `criterios` no nível raiz: pode ser `null` ou lista vazia (significa "sem filtros", retorna tudo paginado).
- `sort` segue o mesmo `common.SortParser` introduzido pelo plano 0002, com a mesma whitelist (`camposPermitidos()`). Direção obrigatória, fallback `DEFAULT_SORT = [id desc]`.
- **Sem limite de quantidade de critérios**. A proteção contra payload patológico fica delegada ao limite de tamanho de request body do Quarkus (`quarkus.http.limits.max-body-size`, default 10MB). Decisão consciente: CRUD admin interno, frontend coordenado no mesmo monorepo, custo de implementar limite arbitrário (e mantê-lo) supera o ganho.

### 3. Whitelist de campos — herdada do `ListDTO` (mantém rev.3 do plano 0002)

- O `BaseService.camposPermitidos()` introduzido no plano 0002 (rev.3) **é reusado integralmente**. Whitelist única, derivada por reflexão dos componentes do record `ListDTO`, com cache estático.
- Qualquer `campo` em `CriterioFiltro` precisa estar em `camposPermitidos()`. Caso contrário → **400 + Problem Details** com mensagem explícita (`"Campo 'X' não é filtrável nesta entidade"`).
- Qualquer `campo` em `sort` segue a mesma regra (validação já existente desde o plano 0002).
- **Princípio orientador (continua válido)**: "o que aparece na tabela do frontend é o que pode ser filtrado e ordenado". O `ListDTO` é a fonte única da verdade.
- **Convenção obrigatória (continua válida)**: nome do componente do `ListDTO` = nome do atributo da entidade JPA. Caso a tela precise expor um campo com nome diferente, o `*Service` sobrescreve `camposPermitidos()`.
- **Defesa contra exposição preservada**: campos sensíveis (ex.: `senhaHash`) ficam automaticamente fora do filtro porque ficam fora do `ListDTO`.

### 4. Operadores permitidos por tipo de campo

A tabela abaixo é validada **no `BaseService.buscarAvancado()`** antes de tocar o banco. Inferência de tipo: por reflexão sobre a classe da entidade JPA (mesmo cache `CACHE_CAMPOS_ENTIDADE` já existente no `BaseService` desde o plano 0002).

| Tipo do campo | Operadores válidos |
|---|---|
| **String** | `EQ`, `NOT_EQ`, `STARTS_WITH`, `ENDS_WITH`, `CONTAINS`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **Número, Data, Timestamp** | `EQ`, `NOT_EQ`, `GT`, `GTE`, `LT`, `LTE`, `BETWEEN`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **Boolean** | `EQ`, `NOT_EQ`, `IS_NULL`, `IS_NOT_NULL` |
| **Enum** | `EQ`, `NOT_EQ`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **UUID** | `EQ`, `NOT_EQ`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |

- Operador incompatível com o tipo do campo → **400 + Problem Details** com mensagem clara (`"Operador 'BETWEEN' não é compatível com campo 'nome' (String)"`).
- Combinações operador↔valor:
  - `IN`/`NOT_IN` exigem `valor` como `List`; caso contrário → 400.
  - `BETWEEN` exige `valor` e `valor2` não-nulos; caso contrário → 400.
  - `IS_NULL`/`IS_NOT_NULL` ignoram `valor` e `valor2`.
  - Demais operadores exigem `valor` não-nulo.

### 5. Tradução para JPQL

O `BaseService.buscarAvancado(FiltroDTO)` delega ao utilitário `FiltroAvancadoQueryBuilder`, que:

1. Recebe `FiltroDTO`, `Class<Entity>`, `Set<String> camposPermitidos`, e o cache de tipos de campos da entidade.
2. Valida cada `CriterioFiltro` (whitelist + operador↔tipo + combinação operador↔valor).
3. Itera sobre `filtro.criterios()` (lista plana) e gera, para cada um, um trecho JPQL parametrizado.
4. Junta todos os trechos com o `operadorLogico` único (`AND` ou `OR`).
5. Retorna `(String jpql, Map<String, Object> parametros)`.

Exemplo do payload de AND mostrado em "Decisões / 2" vira aproximadamente:

```sql
WHERE
  LOWER(nome) LIKE LOWER(:p1)
  AND status <> :p2
  AND createdAt BETWEEN :p3 AND :p4
  AND status = 'ATIVO'  -- filtro implícito mantido (ver decisão 6)
```

Exemplo do payload de OR vira aproximadamente:

```sql
WHERE
  (
    LOWER(nome) LIKE LOWER(:p1)
    OR LOWER(login) LIKE LOWER(:p2)
    OR LOWER(email) LIKE LOWER(:p3)
  )
  AND status = 'ATIVO'  -- filtro implícito sempre AND com o bloco de critérios do cliente
```

Regras invioláveis:

- **Nunca concatenar valor do cliente em texto SQL/JPQL**. Sempre parametrizar (`:p1`, `:p2`, ...).
- **Nomes de campos vêm da whitelist** (não diretamente do cliente sem validação). Portanto, seguros para concatenar como identificador na cláusula JPQL.
- O filtro implícito de `status` (decisão 6) é sempre combinado com **AND** ao bloco de critérios do cliente — independentemente do `operadorLogico` que o cliente escolheu para seus próprios critérios.

### 6. Filtro implícito de `status = ATIVO`

Mantém o comportamento do plano 0002:

- `status = ATIVO` é adicionado por padrão.
- Substituído quando o cliente inclui pelo menos um `CriterioFiltro` com `campo = "status"` (ex.: `{ campo: "status", operador: "IN", valor: ["ATIVO", "INATIVO"] }`).
- Detalhe: a verificação é simples (varrer `filtro.criterios()` procurando `campo == "status"`). Se encontrar, não adicionar o implícito; caso contrário, adicionar.
- O filtro implícito sempre se combina com **AND** ao bloco de critérios do cliente (ver exemplo de OR na decisão 5).
- Condição adicional: só faz sentido se `status` faz parte do `ListDTO` (e portanto da `camposPermitidos()`). Para entidades cujo `ListDTO` não expõe `status` (caso raro), o filtro implícito segue sendo aplicado (status sempre = ATIVO, sem possibilidade de override).

### 7. Sort no modo único

- Mesmo formato do plano 0002 (`["campo,asc", ...]`).
- Mesma whitelist (`camposPermitidos()`).
- Mesmo `DEFAULT_SORT = [id desc]` (constante fixa universal, não sobrescritível por `*Service`).
- Mesmas regras de validação (direção obrigatória; campo na whitelist).
- Reusa `common.SortParser` integralmente.

### 8. Defaults e limites

| Aspecto | Valor |
|---|---|
| `page` default | `0` |
| `size` default | `20` |
| `size` máximo | `100` |
| `size` mínimo | `1` |
| Quantidade de critérios | **sem limite** (delegado ao limite de body do Quarkus) |
| Validação | Bean Validation no `FiltroDTO` + validação programática no `BaseService` |

### 9. Tratamento de erros — Problem Details (RFC 7807)

Códigos relevantes:

- **400** — payload inválido (page/size fora dos limites), campo fora da whitelist, operador incompatível com tipo do campo, combinação operador↔valor inválida, sort em formato inválido, sort em campo fora da whitelist.
- **500** — erro inesperado de servidor (catch-all do `ThrowableExceptionMapper`).

Não usaremos `422`: manter consistência com o restante do CRUD e simplificar o contrato. Todos os erros do cliente caem em `400` com `detail` específico.

Cada caso conhecido gera uma mensagem clara em `detail` do Problem Details. `instance` continua `null` por enquanto (padrão atual do projeto). O `IllegalArgumentExceptionMapper` introduzido com o plano 0002 cobre o caso "campo fora da whitelist" e "sort em formato inválido" sem modificação.

## Escopo de implementação

### Arquivos a criar

1. **`common/FiltroDTO.java`** — record com `page`, `size`, `sort`, `operadorLogico`, `criterios`. Anotado com `@Schema` (OpenAPI) e validações (`@Min`, `@Max`).
2. **`common/CriterioFiltro.java`** — record com `campo`, `operador`, `valor`, `valor2`. Anotado com `@Schema`. **Sem `subCriterios` nem `operadorLogico`** (estrutura plana).
3. **`common/OperadorLogico.java`** — enum (`AND`, `OR`).
4. **`common/OperadorFiltro.java`** — enum com os 13 operadores listados na decisão 2.
5. **`common/FiltroAvancadoQueryBuilder.java`** (utilitário) — recebe `FiltroDTO` + `Class<Entity>` + whitelist + cache de tipos de campos, devolve `(String jpql, Map<String,Object> parametros)`. Encapsula toda a lógica de tradução e validação. Implementação testável isoladamente (sem CDI).

### Arquivos a modificar

1. **`common/BaseRest.java`** — adicionar endpoint:
   ```java
   @POST
   @Path("/buscar")
   @Consumes(MediaType.APPLICATION_JSON)
   @Operation(summary = "Busca paginada com filtros",
              description = "Aceita filtros estruturados com operadores explícitos e combinação lógica AND ou OR (única por requisição, sem aninhamento). Retorna o envelope Pagina<ListDTO>.")
   @APIResponse(responseCode = "200", description = "Página de resultados retornada")
   @APIResponse(responseCode = "400", description = "Payload inválido (RFC 7807)")
   public Pagina<ListDTO> buscar(@Valid FiltroDTO filtro) {
       return this.service().buscarAvancado(filtro);
   }
   ```
   - Remover (na mesma janela) o `listar()` introduzido pelo plano 0002 (ver "Ordem de execução").

2. **`common/BaseService.java`** — adicionar método:
   ```java
   public Pagina<ListDTO> buscarAvancado(FiltroDTO filtro) {
       // 1. Validar whitelist de cada campo em filtro.criterios() (camposPermitidos()).
       // 2. Validar compatibilidade operador <-> tipo do campo.
       // 3. Validar combinação operador <-> valor (IN exige List; BETWEEN exige valor2; etc.).
       // 4. Parsear sort (SortParser) com a mesma whitelist.
       // 5. Aplicar DEFAULT_SORT se sort vazio.
       // 6. Montar JPQL via FiltroAvancadoQueryBuilder (junta criterios com operadorLogico unico).
       // 7. Adicionar filtro implicito status=ATIVO (sempre AND) se não houver critério em 'status'.
       // 8. Executar com paginação e projeção em ListDTO.
       // 9. Contar totalElements; calcular totalPages.
       // 10. Retornar Pagina<ListDTO>.
   }
   ```
   - Remover (na mesma janela) o `listarDTO(...)` introduzido pelo plano 0002 e seus auxiliares: `aplicarFiltros`, `combinarComStatusAtivo`, `montarSort`, `converterValor`. O `FiltroAplicado.java` é removido.
   - **Mantém** dos artefatos do plano 0002:
     - `CACHE_CAMPOS_ENTIDADE`, `camposEntidade()`, `descobrirCampos()`, `resolverTipoEntity()` — reusados pelo `FiltroAvancadoQueryBuilder` para inferir tipos de campos da entidade.
     - `CACHE_CAMPOS_LISTDTO`, `camposPermitidos()`, `descobrirCamposListDTO()` — whitelist única ainda derivada do `ListDTO`.
     - `DEFAULT_SORT` (constante `[id desc]`) — sort default fixo universal.
     - `PARAMS_RESERVADOS` — pode ser removido (não há mais query params livres a categorizar).

3. **`backend-quarkus/AGENTS.md`** — reescrever a seção `Common Base Components` / `BaseService` / `BaseRest`:
   - Remover descrições do `GET /` paginado, `aplicarFiltros`, convenção implícita de operadores, log `DEBUG` de filtros ignorados.
   - Adicionar descrição do `POST /buscar`, `FiltroDTO`, lista de operadores, regras de validação.
   - Mencionar que o `GET /` paginado **não existe**; toda listagem com paginação passa pelo `POST /buscar`.
   - Mencionar a convenção "componente do `ListDTO` = atributo JPA" (continua válida).
   - Atualizar referência à ADR-0009 (que será reescrita in-place — ver "Documentação a produzir").

4. **Plano 0001** — item #7: atualizar de "concluído via plano 0002" para "concluído via plano 0003 (plano 0002 descontinuado)".

5. **Plano 0002** — marcar como `Descontinuado / Substituído pelo plano 0003`. Adicionar nota explicativa curta no cabeçalho referenciando este plano.

### Arquivos a remover

1. **`common/FiltroAplicado.java`** — artefato interno do `aplicarFiltros` do plano 0002. Substituído pelo retorno do `FiltroAvancadoQueryBuilder`.
2. **Método `BaseService.listarDTO(int, int, List<String>, MultivaluedMap)`** e auxiliares (`aplicarFiltros`, `combinarComStatusAtivo`, `montarSort`, `converterValor`) — substituídos por `buscarAvancado(FiltroDTO)` + `FiltroAvancadoQueryBuilder`.
3. **Método `BaseRest.listar(int, int, List<String>, UriInfo)`** — substituído por `buscar(FiltroDTO)`.

### Não exige mudança

- Os `*Rest` e `*Service` concretos **não precisam ser modificados** para ganhar o endpoint `POST /buscar`. Eles o herdam automaticamente do `BaseRest`/`BaseService`.
- A whitelist `camposPermitidos()` continua derivada do `ListDTO` por reflexão — sem método por entidade.
- O `UsuarioService` e o `UsuarioRest` continuam mínimos (mesmo estado pós-rev.5 do plano 0002).
- O `UsuarioListDTO` segue como está; campos a filtrar/ordenar devem estar nele.

### Documentação a produzir / atualizar

1. **ADR-0009 (reescrita in-place)** — `0009-paginacao-ordenacao-filtros-no-baserest.md`. Reflete a decisão final (este plano) em vez do plano 0002.
   - **Justificativa para reescrita in-place** (em vez de criar ADR nova com `Superseded by`): o projeto está em fase inicial, a decisão registrada na ADR-0009 nunca foi "lançada" em produção, e o plano 0002 está sendo retirado por completo (não substituído por superseding). Manter ADR-0009 com decisão obsoleta criaria ruído documental. Esta flexibilização da regra de imutabilidade é consciente e pontual.
   - **Conteúdo da nova ADR-0009**:
     - **Status**: Accepted.
     - **Contexto**: `GET /` retornava lista integral; tentativa inicial (plano 0002) de padronizar via query string + convenção implícita mostrou-se complexa (várias convenções, drift silencioso, ambiguidade entre `ListDTO`/whitelist/entidade). Análise comparativa apontou desenho via DTO estruturado como mais simples no longo prazo.
     - **Decisão**: as 9 decisões consolidadas deste plano (endpoint único `POST /buscar`, `FiltroDTO` plano com operadorLogico único, whitelist herdada do `ListDTO`, sort default `[id desc]`, etc.).
     - **Consequências**: breaking change (mas o plano 0002 nunca foi consumido por frontend além de testes manuais); contrato HTTP explícito; query builder isolado e testável.
     - **Alternativas consideradas**: manter o desenho do plano 0002, manter ambos (0002 + 0003 coexistindo), DSL RSQL, JSON em query string. Cada uma descartada com motivo.

2. **`AGENTS.md`** (já listado em "Arquivos a modificar").

3. **Plano 0001** (já listado em "Arquivos a modificar").

4. **Plano 0002** (já listado em "Arquivos a modificar") — descontinuado.

## Ordem de execução recomendada (quando for implementar)

> Sessão recomendada: **dedicada exclusivamente** a este plano. Não tentar fazer na mesma sessão da análise/planejamento por questões de tamanho de contexto.

1. **Confirmar pré-requisitos**:
   - `Pagina<T>`, `SortCriterio`, `SortDirecao`, `SortParser` já existem no pacote `common` (introduzidos pelo plano 0002, **mantidos**).
   - `IllegalArgumentExceptionMapper` já existe em `infra/exception/` (introduzido pelo plano 0002, **mantido**).
   - `BaseService.camposPermitidos()` derivada do `ListDTO` e `DEFAULT_SORT = [id desc]` já existem (introduzidos pelas revisões 3 e 5 do plano 0002, **mantidos**).

2. **Reescrever ADR-0009 in-place** (rascunho aceito antes do código). Estado: Accepted.

3. **Criar os records e enums em `common/`**:
   - `OperadorLogico.java` (enum)
   - `OperadorFiltro.java` (enum)
   - `CriterioFiltro.java` (record)
   - `FiltroDTO.java` (record com Bean Validation `@Min`/`@Max`)
   - Todos com `@Schema` apropriado.

4. **Implementar `FiltroAvancadoQueryBuilder`** com testes unitários cobrindo:
   - Cada operador isoladamente (EQ, NOT_EQ, GT, GTE, LT, LTE, BETWEEN, IN, NOT_IN, STARTS_WITH, ENDS_WITH, CONTAINS, IS_NULL, IS_NOT_NULL).
   - Combinação AND de vários critérios.
   - Combinação OR de vários critérios.
   - Lista de critérios vazia (gera trecho vazio).
   - Whitelist rejeitando campo desconhecido.
   - Operador incompatível com tipo do campo.
   - `BETWEEN` sem `valor2` → erro.
   - `IN` com `valor` que não é lista → erro.
   - Datas em ISO-8601 sendo convertidas corretamente (`LocalDate`, `LocalDateTime`).
   - Enum sendo convertido a partir de string.
   - UUID sendo convertido a partir de string.

5. **Adicionar `buscar()` ao `BaseRest`** e `buscarAvancado(FiltroDTO)` ao `BaseService`.

6. **Remover o endpoint `GET /` paginado e os auxiliares do plano 0002**:
   - `BaseRest.listar(...)` (método).
   - `BaseService.listarDTO(...)`, `aplicarFiltros`, `combinarComStatusAtivo`, `montarSort`, `converterValor`.
   - `common/FiltroAplicado.java` (arquivo inteiro).
   - Constante `PARAMS_RESERVADOS` (não é mais usada).
   - Imports não usados.

7. **Atualizar `AGENTS.md`**, `Plano 0001` (item #7) e `Plano 0002` (status descontinuado).

8. **Testes manuais via Swagger UI** com vários payloads:
   - `POST /usuario/buscar` com body vazio `{ "page": 0, "size": 20 }` (espera sucesso, lista paginada).
   - `POST /usuario/buscar` com `criterios: []` e `operadorLogico: "AND"` (espera sucesso, equivalente ao anterior).
   - AND com 3 critérios.
   - OR com 3 critérios em campos String (busca global).
   - `BETWEEN` em `createdAt` (assumindo que `createdAt` está no `ListDTO`).
   - `IN` com lista de enums.
   - `IS_NULL` em campo opcional.
   - Campo fora do `ListDTO` → 400.
   - `BETWEEN` em campo String → 400 (operador incompatível).
   - `IN` com `valor` que não é lista → 400.
   - Sort inválido → 400.
   - `size > 100` → 400.
   - Filtro com `status = INATIVO` explícito (deve listar inativos, se `status` estiver no `ListDTO`).

9. **Marcar ADR-0009 como Accepted** (já está, mas confirmar coerência com a implementação final).

10. **Comunicar ao `frontend-ultima`** o novo endpoint disponível. Como o plano 0002 não foi consumido pelo frontend (nunca implementado lá), não há breaking change no consumo real — só novo contrato a adotar.

## Riscos e observações

- **Complexidade do query builder**: a lista plana com operador único reduz significativamente a complexidade que existia no plano original (com árvore recursiva). Mesmo assim, é a parte mais delicada da implementação. **Mitigação**: cobertura de testes unitários alta no `FiltroAvancadoQueryBuilder`; validação rigorosa antes de montar JPQL; nunca interpolar valores do cliente em texto SQL.

- **Sem limite de quantidade de critérios**: decisão consciente. A proteção contra payload patológico é o limite de body do Quarkus (`quarkus.http.limits.max-body-size`, default 10MB — equivale a dezenas de milhares de critérios JSON). Se aparecer abuso real em produção, adicionar limite arbitrário no `BaseService` é mudança não-quebrante.

- **Conversão de `valor: Object`**: o campo `valor` é tipado como `Object` no record para suportar string/número/data/lista. A desserialização Jackson preserva o tipo conforme o JSON (`"abc"` → String; `42` → Integer; `[...]` → List). A conversão para o tipo Java do campo da entidade acontece no `FiltroAvancadoQueryBuilder`, com regras explícitas:
  - Operadores `EQ`, `NOT_EQ`, `GT`, etc. + campo `Enum` → `Enum.valueOf(...)` a partir de String.
  - `BETWEEN` + campo `LocalDate` → `LocalDate.parse(...)` (ISO-8601).
  - `IN`/`NOT_IN` + lista → converter cada elemento individualmente.
  - Falha de conversão → 400 com mensagem clara (`"Valor 'abc' inválido para campo 'createdAt' (LocalDate)"`).
  - Reusar o método `converterValor` que existia no plano 0002 (sobrevive como helper interno do `FiltroAvancadoQueryBuilder` ou do `BaseService`).

- **Performance**: filtros com `CONTAINS` (`LIKE '%algo%'`) não usam índices B-tree convencionais. Já era risco no plano 0002. **Mitigação**: monitorar via logs SQL em produção; se aparecerem hotspots, criar índices específicos (ex.: `pg_trgm` para `LIKE`) por caso.

- **Reflexão para inferir tipo do campo**: assume nomes de campo da entidade JPA exatamente como declarados. Campos renomeados via `@Column(name="...")` ainda funcionam (JPQL usa o nome do atributo Java, não da coluna). Continua válido o cache estático do `BaseService`.

- **`status = ATIVO` implícito vs explícito**: a regra "se cliente menciona `status` em algum critério, desliga o implícito" precisa de teste cuidadoso (não pode haver bug do tipo "consigo ver inativos sem permissão"). Quando autenticação/autorização entrar no projeto, revisitar essa lógica para amarrar com perfil do usuário.

- **Sort por campos de relacionamento** (`["cliente.nome,asc"]`): este plano cobre apenas campos diretos da entidade. Não suportado. Casos que aparecerem podem ser tratados em sobrescrita pontual do `*Service`.

- **OR aplicado a tudo**: na decisão 2 ficou explícito que `operadorLogico = OR` se aplica a **todos** os critérios. Não há como expressar "(A OR B) AND C" diretamente. Casos legítimos devem ser tratados por:
  - múltiplas chamadas do frontend que mesclam resultados;
  - sobrescrita pontual de `buscarAvancado` no `*Service` da entidade afetada;
  - extensão futura deste plano (re-introduzir aninhamento).
  Aceito como simplificação consciente; raramente apareceu como necessidade em CRUD admin durante a análise.

- **`POST` para leitura**: não é cacheado por proxies HTTP. Não há uso de cache HTTP no projeto atualmente, então não é problema. Se aparecer no futuro, considerar caching no client ou na aplicação.

## Pontos a confirmar antes da implementação

- Lista final de operadores: a tabela atual é o consolidado. Validar com o frontend se há operadores faltando (ex.: `REGEX`).
- Comportamento de `status = ATIVO` implícito vs explícito: confirmar que o `ListDTO` da entidade que vai usar primeiro tem (ou não) `status` como componente, e validar o comportamento esperado em ambos os casos.
- Limite de tamanho de body do Quarkus: confirmar que o default (10MB) é adequado para o uso esperado.

## Relação com outros planos e ADRs

- **Pré-requisito (de artefatos)**: [`0002-paginacao-ordenacao-filtros-backend.md`](0002-paginacao-ordenacao-filtros-backend.md) (introduziu `Pagina`, `SortCriterio`, `SortDirecao`, `SortParser`, `IllegalArgumentExceptionMapper`, `camposPermitidos()`, `DEFAULT_SORT`, cache de campos da entidade — todos **mantidos**).
- **Plano 0002 será descontinuado** na conclusão deste plano. Documentação atualizada; nenhum código do 0002 a manter exceto os artefatos reusados listados acima.
- **ADR-0009 reescrita in-place** (em vez de criar ADR nova com `Superseded by`), justificado pelo fato de o projeto estar em fase inicial e a decisão do plano 0002 nunca ter chegado a produção.
- **ADRs reusados sem alteração**: ADR-0002 (UUID público), ADR-0004 (RFC 7807), ADR-0006 (OpenAPI / não versionamento), ADR-0007 (Media Types).
- **Plano do frontend**: ainda não criado; será produzido quando o desenho da tela com listagem for definido. Deve cobrir desde o caso simples ("listar tudo paginado") até o caso de busca com filtros, todos via `POST /buscar`.
