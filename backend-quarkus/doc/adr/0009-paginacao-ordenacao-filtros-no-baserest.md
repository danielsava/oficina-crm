# ADR-0009: Busca paginada com filtros estruturados (`POST /buscar`) no `BaseRest`

- **Status**: Accepted
- **Data**: 2026-06-04 (reescrita in-place — ver "Nota sobre a reescrita")
- **Autores**: Time backend

## Nota sobre a reescrita

A versão anterior desta ADR registrava a decisão de paginar/ordenar/filtrar via `GET /` com query string e convenção implícita de operadores (plano [`0002-paginacao-ordenacao-filtros-backend.md`](../planos/0002-paginacao-ordenacao-filtros-backend.md)). Após implementação inicial e análise comparativa, optou-se por **substituir** integralmente esse desenho por um endpoint único `POST /buscar` com contrato HTTP explícito (plano [`0003-busca-avancada-backend.md`](../planos/0003-busca-avancada-backend.md)).

Esta ADR é **reescrita in-place** (em vez de criar nova ADR com `Superseded by`) porque:

- O projeto está em fase inicial; nenhuma migração foi executada em ambiente compartilhado, nenhuma tela do `frontend-ultima` consumiu o contrato do plano 0002.
- O plano 0002 está sendo **descontinuado por completo** (não substituído por uma decisão sucessora que evolui o desenho anterior), tornando uma sequência `ADR-0009 superseded by ADR-NNNN` ruído documental.
- A flexibilização da regra de imutabilidade de ADRs aceitas é consciente, pontual e justificada — registrada também no plano 0003.

## Contexto

O `GET /` herdado por todas as subclasses de `BaseRest` retornava `List<ListDTO>` integral — sem paginação, ordenação ou filtros. Conforme o número de entidades CRUD cresce no monorepo (`iam`, `crm`, `estoque` etc.), manter esse contrato:

- Acopla o tamanho da resposta ao volume da tabela, comprometendo latência e memória.
- Empurra para cada `*Rest` a tarefa de inventar sua própria convenção de paginação/ordenação/filtro quando a necessidade aparece, abrindo divergência.
- Não casa com a tela administrativa de listagem (PrimeNG `p-table` em lazy mode no `frontend-ultima`), que precisa de paginação, ordenação por coluna e filtros por coluna.

A tentativa inicial (plano 0002) foi padronizar via `GET /` com query string e convenção implícita de operadores por tipo do campo (String → ILIKE; enum/UUID/número/boolean → igualdade; sufixos `From`/`To` → range; query param repetido → IN; whitelist derivada do `ListDTO`). Após implementação e análise comparativa, identificaram-se problemas estruturais:

- **Convenção implícita de operadores** espalha complexidade entre cliente e servidor (cliente precisa saber "campo `String` quer ILIKE", "use `From`/`To` para range") e cria ambiguidade quando o operador desejado foge da convenção.
- **Drift silencioso** entre frontend e backend: query params fora da whitelist são ignorados sem erro, dificultando depuração quando o nome do filtro muda no backend.
- **Contrato OpenAPI pobre** para filtros: apenas `page`, `size` e `sort` aparecem; os filtros aceitos ficam implícitos (lista de componentes do `ListDTO`).
- **Sem operador OR explícito**, sem `BETWEEN` único, sem `IS_NULL`/`IS_NOT_NULL`, sem `NOT_EQ`.

A análise concluiu que concentrar a complexidade num **único query builder testável**, com **contrato HTTP explícito** via DTO estruturado, produz desenho mais simples no longo prazo. O modo avançado deixa de ser plano futuro e passa a ser o **mecanismo único** de listagem com filtros.

## Decisão

Adotamos para todas as subclasses de `BaseRest` o seguinte contrato de listagem paginada com filtros:

### 1. Endpoint único `POST /buscar`

- Herdado por todo `*Rest` que estende `BaseRest`; vive como método `buscar(FiltroDTO)` na classe base.
- Path relativo ao `@Path` do `*Rest` concreto (ex.: `POST /usuario/buscar`).
- Request `Content-Type: application/json`; corpo: `FiltroDTO`.
- Resposta de sucesso: `200 application/json` com o envelope `common.Pagina<ListDTO>` (mesmo record introduzido pelo plano 0002, mantido).
- Resposta de erro: `400 application/problem+json` para payloads inválidos (RFC 7807, ADR-0004).
- **Não existe `GET /` paginado**. O `GET /` foi **removido** do `BaseRest` como parte desta decisão. Toda listagem paginada passa por `POST /buscar`.

Justificativa para `POST` em vez de `GET`:

- Corpos JSON na query string são ilegíveis, exigem URL-encoding e enfrentam limite de tamanho por proxies/servidores.
- Contrato HTTP explícito: `FiltroDTO` vira schema completo no OpenAPI, visível no Swagger UI.
- Semântica: aqui `POST` não cria recurso; é "POST como mecanismo de transporte de query estruturada". Padrão aceito (Elasticsearch `_search`, GitHub GraphQL, várias APIs corporativas). Documentado na descrição da operação OpenAPI.
- Trade-off conhecido: `POST` não é cacheado por proxies HTTP. Aceitável para CRUD admin interno (cache HTTP fora de escopo).

### 2. DTO de entrada: `common.FiltroDTO` (estrutura plana)

Record genérico no pacote `common`:

```java
public record FiltroDTO(
    int page,                       // default 0, >= 0
    int size,                       // default 20, [1, 100]
    List<String> sort,              // ["campo,asc", "campo,desc", ...]; vazio aplica DEFAULT_SORT
    OperadorLogico operadorLogico,  // AND (default) ou OR — único para toda a lista de critérios
    List<CriterioFiltro> criterios  // lista plana (sem aninhamento); pode ser null ou vazia
) {}

public record CriterioFiltro(
    String campo,
    OperadorFiltro operador,
    Object valor,    // null para IS_NULL/IS_NOT_NULL; List para IN/NOT_IN; objeto único nos demais
    Object valor2    // segundo valor apenas para BETWEEN
) {}

public enum OperadorLogico { AND, OR }

public enum OperadorFiltro {
    EQ, NOT_EQ, GT, GTE, LT, LTE,
    BETWEEN, IN, NOT_IN,
    STARTS_WITH, ENDS_WITH, CONTAINS,
    IS_NULL, IS_NOT_NULL
}
```

- **Estrutura plana, sem aninhamento**: toda a lista de `criterios` é combinada com o mesmo `operadorLogico` (`AND` ou `OR`). Não há `subCriterios`, agrupamento ou árvore. Decisão consciente de simplificação (ver Alternativas).
- Validações Bean Validation no `FiltroDTO`: `page >= 0`, `size` em `[1, 100]`.
- **Sem limite de quantidade de critérios** (delegado ao limite de body do Quarkus, default 10MB). Decisão consciente para CRUD admin coordenado num único monorepo.

### 3. Whitelist única derivada do `ListDTO` (mantida do plano 0002)

- `BaseService.camposPermitidos()` continua derivada por reflexão dos componentes do record `ListDTO`, com cache estático. **Reuso integral**.
- Qualquer `campo` em `CriterioFiltro` ou em `sort` precisa estar em `camposPermitidos()`; caso contrário → **400 + Problem Details**.
- **Princípio orientador**: "o que aparece na tabela do frontend é o que pode ser filtrado e ordenado". O `ListDTO` é a fonte única da verdade.
- **Convenção obrigatória**: nome do componente do `ListDTO` = nome do atributo da entidade JPA. Caso a tela precise expor um campo com nome diferente, o `*Service` sobrescreve `camposPermitidos()`.
- **Defesa contra exposição preservada**: campos sensíveis (ex.: `senhaHash`) ficam fora do `ListDTO`, portanto fora de filtro/sort.

### 4. Operadores válidos por tipo de campo

Tabela validada no `FiltroAvancadoQueryBuilder` antes de tocar o banco. Inferência de tipo via reflexão sobre a classe da entidade JPA (cache `CACHE_CAMPOS_ENTIDADE` reusado do plano 0002).

| Tipo do campo | Operadores válidos |
|---|---|
| **String** | `EQ`, `NOT_EQ`, `STARTS_WITH`, `ENDS_WITH`, `CONTAINS`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **Número, Data, Timestamp** | `EQ`, `NOT_EQ`, `GT`, `GTE`, `LT`, `LTE`, `BETWEEN`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **Boolean** | `EQ`, `NOT_EQ`, `IS_NULL`, `IS_NOT_NULL` |
| **Enum** | `EQ`, `NOT_EQ`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |
| **UUID** | `EQ`, `NOT_EQ`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL` |

Combinações operador↔valor:

- `IN`/`NOT_IN` exigem `valor` como `List`; caso contrário → 400.
- `BETWEEN` exige `valor` e `valor2` não-nulos; caso contrário → 400.
- `IS_NULL`/`IS_NOT_NULL` ignoram `valor` e `valor2`.
- Demais operadores exigem `valor` não-nulo.

### 5. Tradução para JPQL (`FiltroAvancadoQueryBuilder`)

Utilitário em `common.FiltroAvancadoQueryBuilder`:

1. Recebe `FiltroDTO`, `Class<Entity>`, whitelist e cache de tipos de campos.
2. Valida cada `CriterioFiltro` (whitelist + operador↔tipo + combinação operador↔valor).
3. Itera sobre `criterios` (lista plana) gerando trechos JPQL parametrizados.
4. Junta os trechos com o `operadorLogico` único.
5. Retorna `(String jpql, Map<String,Object> parametros)`.

Regras invioláveis:

- **Nunca concatenar valor do cliente em texto JPQL**. Sempre parametrizar (`:p1`, `:p2`, ...).
- **Nomes de campos vêm da whitelist** (validados antes); seguros como identificadores na cláusula.
- O filtro implícito de `status = ATIVO` é sempre combinado com **AND** ao bloco de critérios do cliente — independentemente do `operadorLogico` escolhido.

### 6. Filtro implícito `status = ATIVO`

Mantém o comportamento herdado:

- Aplicado por padrão.
- **Substituído** quando o cliente inclui pelo menos um `CriterioFiltro` com `campo = "status"`.
- Combinado com `AND` ao bloco de critérios do cliente (mesmo quando o cliente escolheu `OR` para seus próprios critérios).
- Só faz sentido se `status` está no `ListDTO` (e portanto na `camposPermitidos()`). Para entidades cujo `ListDTO` não expõe `status`, o filtro segue sendo aplicado (status sempre = ATIVO, sem override possível).

### 7. Sort

- Mesmo formato do plano 0002 (`["campo,asc", ...]`).
- Mesma whitelist (`camposPermitidos()`).
- Mesmo `DEFAULT_SORT = [id desc]` (constante fixa universal no `BaseService`, não sobrescritível por `*Service`).
- Mesmas regras de validação (direção obrigatória; campo na whitelist).
- Reusa `common.SortParser` integralmente.

### 8. Defaults e limites

| Aspecto | Valor |
|---|---|
| `page` default | `0` |
| `size` default | `20` |
| `size` máximo | `100` |
| `size` mínimo | `1` |
| Quantidade de critérios | sem limite (delegado ao limite de body do Quarkus) |
| Validação | Bean Validation no `FiltroDTO` + validação programática no `BaseService`/`FiltroAvancadoQueryBuilder` |

### 9. Tratamento de erros (RFC 7807)

- **400** — payload inválido (page/size fora dos limites), campo fora da whitelist, operador incompatível com tipo do campo, combinação operador↔valor inválida, sort em formato inválido, sort em campo fora da whitelist, falha de conversão de valor.
- **500** — erro inesperado de servidor (catch-all do `ThrowableExceptionMapper`).
- Não usamos `422`: todos os erros do cliente caem em `400` com `detail` específico.
- `IllegalArgumentExceptionMapper` (introduzido pelo plano 0002) cobre os erros levantados pelo `SortParser` e pelo `FiltroAvancadoQueryBuilder` sem modificação.

## Consequências

### Positivas

- **Contrato HTTP explícito**: `FiltroDTO` é schema completo no OpenAPI, visível no Swagger UI. O frontend gera tipos TypeScript precisos (incluindo enums `OperadorLogico` e `OperadorFiltro`).
- **Concentração da complexidade**: toda a lógica de tradução vive no `FiltroAvancadoQueryBuilder`, utilitário sem CDI, testável isoladamente com cobertura alta.
- **Sem ambiguidade**: operadores são escolhidos explicitamente pelo cliente; não há convenção implícita por tipo de campo.
- **Zero manutenção adicional por entidade**: a whitelist continua derivada do `ListDTO` (reuso do plano 0002). `*Rest` concretos não precisam declarar nada; herdam `POST /buscar` automaticamente.
- **Fonte única da verdade**: o `ListDTO` continua sendo (i) o que aparece na tabela, (ii) o que pode ser filtrado, (iii) o que pode ser ordenado.
- **Defesa contra exposição preservada**: campos fora do `ListDTO` continuam fora do filtro e do sort.
- **`DEFAULT_SORT = [id desc]` mantido**: contrato técnico de paginação consistente sem opinião de UX.

### Negativas

- **Breaking change interno**: o `GET /` paginado introduzido pelo plano 0002 é removido. Aceitável porque o `frontend-ultima` ainda não consumia o contrato em produção. Coordenar a nova chamada (`POST /buscar`) no mesmo ciclo da reabilitação das telas.
- **`POST` para leitura não é cacheado por proxies HTTP**. Sem impacto atual (não há uso de cache HTTP no projeto); revisitar se aparecer demanda.
- **Cliente carrega complexidade de montar `FiltroDTO`**: mais verbose do que `?nome=jo` no estilo antigo. Mitigado pela tipagem precisa no frontend e por helpers de construção do payload na camada de serviço Angular.
- **Reflexão para inferir tipo do campo**: cache por entidade resolve performance; convenção "nome do componente do `ListDTO` = nome do atributo JPA" continua obrigatória.
- **Sort/filtro por campo de relacionamento (`cliente.nome`)** não é suportado via dot notation. Caminho idiomático: expor campo achatado no `ListDTO` (ex.: `clienteNome`) e popular via mapper/JPQL. Custo localizado no `*Service` da entidade que precisa, não no `BaseService`.
- **`operadorLogico = OR` se aplica a todos os critérios**: não há como expressar "(A OR B) AND C" diretamente. Casos legítimos (raros em CRUD admin) podem ser resolvidos por múltiplas chamadas do frontend, sobrescrita pontual no `*Service`, ou evolução futura deste contrato.

### Neutras

- O record `common.Pagina` aparece tipado por entidade no contrato OpenAPI (`Pagina_UsuarioListDTO`, etc.), resolvido pelo SmallRye OpenAPI sem configuração adicional.
- Sort com `BETWEEN` em campo `String` ou `IN` com `valor` que não é lista → 400. Erros de cliente sempre falham rápido, com mensagem específica em `detail`.

## Alternativas consideradas

- **Manter o desenho do plano 0002** (`GET /` com query string + convenção implícita): descartado pelos problemas estruturais listados em "Contexto" (convenção espalhada, drift silencioso, contrato pobre, sem OR/BETWEEN/IS_NULL).
- **Manter ambos (0002 + 0003 coexistindo)**: descartado. Dois mecanismos para a mesma necessidade dobram a manutenção (duas validações, duas rotas para o mesmo conceito, duas seções no `AGENTS.md`) sem ganho funcional, dado que `POST /buscar` cobre todos os casos do `GET /`.
- **`FiltroDTO` com aninhamento** (`subCriterios` + `operadorLogico` por nível): considerado por permitir "(A OR B) AND C". Descartado para o estado atual porque (i) raramente apareceu como necessidade em CRUD admin durante a análise; (ii) adiciona recursão no query builder, validação de profundidade e schema OpenAPI auto-referenciante. Pode ser re-introduzido em revisão futura se demanda real aparecer.
- **DSL RSQL** (`?filter=(nome==jo;status!=INATIVO)`): expressivo, mas contrato OpenAPI pobre (`filter` vira string opaca), parser dedicado a manter, curva de aprendizado para o frontend.
- **JSON em query string** (`?q={...}`): URL-encoding feio, limite de tamanho por proxies. Esconde o problema fundamental sem resolvê-lo.
- **`GET /buscar` com corpo JSON**: alguns servidores e proxies não suportam corpo em `GET`; comportamento indefinido em parte do ecossistema HTTP.
- **`422 Unprocessable Entity` para erros semânticos** (operador incompatível com tipo): considerado. Descartado para manter consistência com o restante do CRUD (todos os erros de cliente caem em `400`) e simplificar o contrato.
- **Whitelist por método (`camposSortaveis()` + `camposFiltraveis()`)**: já descartada no plano 0002 (rev.3); permanece descartada aqui. Whitelist única derivada do `ListDTO` continua válida.
- **Limite numérico de critérios** (`max=20`): descartado. CRUD admin coordenado no mesmo monorepo; proteção contra payload patológico fica no limite de body do Quarkus.

## Referências

- Plano de implementação: [`doc/planos/0003-busca-avancada-backend.md`](../planos/0003-busca-avancada-backend.md)
- Plano descontinuado (artefatos parcialmente reusados): [`doc/planos/0002-paginacao-ordenacao-filtros-backend.md`](../planos/0002-paginacao-ordenacao-filtros-backend.md)
- ADR-0002 — UUID como identificador público
- ADR-0003 — `EditDTO` como DTO único de formulário
- ADR-0004 — RFC 7807 Problem Details para erros HTTP
- ADR-0006 — Não versionamento de APIs internas de CRUD (justifica o breaking change controlado)
- ADR-0007 — Media Types no `BaseRest`
- [Quarkus Hibernate ORM with Panache — Paging and sorting](https://quarkus.io/guides/hibernate-orm-panache#paging)
