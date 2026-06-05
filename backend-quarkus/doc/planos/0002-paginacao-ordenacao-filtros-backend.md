# Plano de Implementação — Paginação, Ordenação e Filtros (Caminho B Básico)

> **Status**: concluído (implementação aplicada; ADR-0009 publicada)
> **Última atualização**: 2026-06-04 (rev.5 — `DEFAULT_SORT` reduzido a `[id desc]` para remover opinião de UX do backend, mantendo apenas o contrato técnico mínimo de paginação consistente; rev.4 — `defaultSort()` deixa de ser ponto de extensão por `*Service` e vira constante fixa no `BaseService`; rev.3 — whitelist única `camposPermitidos()` derivada automaticamente do `ListDTO`, eliminando `camposSortaveis()`/`camposFiltraveis()` por entidade; rev.2 — filtros captados via `UriInfo` no `BaseRest`, sem `@QueryParam` tipados por entidade nos `*Rest` concretos. Ver R4 e R5 para o rationale.)
> **Origem**: item #7 do plano [`0001-padronizacao-crud-backend.md`](0001-padronizacao-crud-backend.md), com análise das 5 decisões realizada na sessão dedicada (S1).
> **Plano relacionado (futuro)**: [`0003-busca-avancada-backend.md`](0003-busca-avancada-backend.md) — modo avançado de busca (POST `/buscar` com `FiltroDTO`), planejado mas não implementado neste plano.

## Como ler este documento

- A seção **Decisões consolidadas** registra o resultado da análise prévia (sessão S1) que deu origem a este plano. Servem de entrada para a implementação e para o ADR-0009.
- A seção **Escopo de implementação** detalha o que muda no código.
- A seção **Ordem de execução** define a sequência recomendada de passos.
- Quando este plano for concluído, mover para `Concluídos` do plano 0001 (já feito ao criar este plano) e fechar o ADR-0009.

## Objetivo

Padronizar no `common.BaseRest` (e nos `*Service` que dele dependem) o contrato HTTP de listagem com **paginação obrigatória**, **ordenação por múltiplos campos** e **filtros por coluna**, mantendo o restante do CRUD inalterado. Este plano cobre apenas o **modo básico** (filtros AND implícitos via query params). O modo avançado (operadores explícitos, OR, agrupamentos) é planejado separadamente em `0003-busca-avancada-backend.md`.

## Decisões consolidadas (entrada para a implementação)

### 1. Estratégia de paginação — Offset/limit

- Query params: `?page=<int>&size=<int>`.
- Implementação via `io.quarkus.panache.common.Page.of(page, size)` aplicado à `PanacheQuery`.
- Justificativa: CRUD admin interno, baixa volatilidade de dados, casa com PrimeNG `p-table` em lazy mode, dispensa cursor.

### 2. Formato da resposta — Envelope JSON `common.Pagina<T>`

Record genérico no pacote `common`:

```java
package common;

public record Pagina<T>(
    java.util.List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {}
```

- Shape mínimo. Sem `hasNext`/`hasPrevious`/`numberOfElements` no contrato inicial (deriváveis no frontend; podem ser adicionados em evolução posterior se necessário).
- Genérico para reuso entre todas as entidades; aparece tipado como `Pagina<UsuarioListDTO>`, `Pagina<ClienteListDTO>`, etc. no contrato OpenAPI.
- **Nome em português intencional**: o record é `common.Pagina` (e não `common.Page`) justamente para evitar colisão com `io.quarkus.panache.common.Page` (classe utilitária do Panache usada para representar offset/limit) e com qualquer outra API que possa introduzir uma classe `Page` no projeto. As duas convivem em qualquer arquivo sem necessidade de importação qualificada.

### 3. Sintaxe de sort — Spring-style com parâmetro repetido

- Query param: `?sort=<campo>,<direcao>` (vírgula entre campo e direção; parâmetro repetido para múltiplos critérios).
- **Direção obrigatória e explícita**: `asc` ou `desc` (case-insensitive na entrada, normalizada). `?sort=nome` (sem direção) → **400 + Problem Details**.
- **Sem limite numérico** de critérios; segurança garantida pela whitelist única (derivada do `ListDTO`).
- **Mesma whitelist usada para filtros** (`camposPermitidos()`): "o que aparece na tabela é o que se pode ordenar". Princípio único.
- **Default quando `sort` vazio**:
  - **Constante fixa mínima** `[id desc]` no `BaseService` (PK herdada de `BaseEntity`, presente em toda entidade do CRUD). **Não sobrescritível por `*Service`**.
  - Justificativa técnica: paginação offset/limit exige `ORDER BY` que produza ordem total. Sem isso, PostgreSQL não garante a mesma ordem entre `?page=0` e `?page=1`, causando registros duplicados/ausentes entre páginas (bug silencioso e intermitente). A PK `id` é única por construção e atende o requisito sem opinião de UX.
  - Justificativa de design: o backend não opina sobre apresentação ("mais recentes primeiro", "alfabético", etc.). Telas que queiram ordem com significado declaram via `?sort=nome,asc` (ou `?sort=createdAt,desc&sort=id,desc`) quando carregam. UX vive no frontend.
  - O `DEFAULT_SORT` **não** passa pela validação contra `camposPermitidos()` — é fonte interna do backend, não vem do cliente, e pode usar o campo técnico `id` que normalmente não aparece no `ListDTO`. Apenas o sort vindo do cliente passa pela whitelist.
- Validação por valor: regex `^[a-zA-Z][a-zA-Z0-9]*,(asc|desc)$` (case-insensitive na direção) + verificação na whitelist (`camposPermitidos()`).

### 4. Filtros (modo básico) — Query params livres, whitelist derivada do `ListDTO`

- Filtros são captados via `UriInfo` no `BaseRest`. **Não há declaração tipada por entidade no `*Rest` concreto** — a sobrescrita seria boilerplate sem ganho funcional e introduziria um ponto extra de manutenção. Ver R5 (revisado) para o rationale completo.
- **Whitelist única `camposPermitidos()` no `BaseService`**, derivada automaticamente dos componentes do record `ListDTO` (reflexão com cache). Não há método de whitelist por `*Service` para manter sincronizado. Ver R4 (revisado) para o rationale completo.
- **Princípio orientador**: "o que aparece na tabela do frontend é o que pode ser filtrado e ordenado". O `ListDTO` é a fonte única da verdade para ambos.
- **AND implícito** entre todos os filtros.
- **Convenção de operadores por tipo de campo** (aplicada pelo `BaseService` ao construir a `PanacheQuery`, via reflexão sobre a entidade):
  - **String** → `ILIKE '%' || valor || '%'` (contém, case-insensitive).
  - **Enum, UUID, número, boolean** → igualdade exata.
  - **Data/número com range** → sufixos `From` (≥) e `To` (≤) no nome do query param (ex.: `createdAtFrom`, `createdAtTo`). Para suportar range em `createdAt`, basta incluir `createdAt` no `ListDTO`.
  - **IN (múltiplos valores)** → query param repetido (`?status=ATIVO&status=PENDENTE`).
- **Filtros fora da whitelist** ou inexistentes na entidade → **ignorados silenciosamente** (não retornam erro). Aceita-se que o cliente envie query params arbitrários sem impacto. Para depuração, o `BaseService` registra em log `DEBUG` os query params que foram ignorados.
- **Convenção obrigatória**: nome do componente do `ListDTO` = nome do atributo da entidade JPA. Quebrar essa convenção causa falha em runtime (Hibernate não localiza o atributo). Caso a tela precise expor um campo com nome diferente do atributo JPA, o `*Service` sobrescreve `camposPermitidos()` para mapear explicitamente.
- **Defesa contra exposição**: campos sensíveis (ex.: `senhaHash`) que existem na entidade mas não no `ListDTO` ficam automaticamente fora do filtro e do sort, impedindo enumeração silenciosa via probing.
- O frontend declara seus próprios tipos TypeScript para os filtros de cada tela, refletindo a decisão de UX (raramente "todos os campos filtráveis"). Internamente, o `BaseService` recebe a `MultivaluedMap<String,String>` do `UriInfo` e cruza com a whitelist derivada do `ListDTO`.

### 5. Defaults e clamp

| Aspecto | Valor |
|---|---|
| `size` default | `20` |
| `size` máximo | `100` |
| `size` mínimo | `1` |
| `page` default | `0` (zero-based) |
| `page` mínimo | `0` |
| `size > 100`, `size ≤ 0` ou `page < 0` | **400 + Problem Details** |
| `page` além do total | retorna `content: []` (não é erro) |
| Validação | `@Min` / `@Max` em Bean Validation, no `@QueryParam` do `BaseRest` |

## Decisões de implementação já discutidas (rationale resumido)

Pontos discutidos na sessão S1 que não cabiam dentro das 5 decisões consolidadas, mas que orientam escolhas concretas na hora de implementar. Servem para evitar re-questionamento em sessões futuras.

### R1. Por que `ILIKE '%valor%'` automático em campos `String` (e não igualdade exata)

- Filtros de tela admin são predominantemente "filtre por trecho de nome/login/email", não "exatamente igual a X".
- Igualdade exata em `String` é caso raro no CRUD; quando aparecer (ex.: validação de unicidade), o `*Service` pode expor método dedicado em vez de filtro genérico.
- A convenção de "campo String → ILIKE" reduz boilerplate por entidade.
- Risco: se uma entidade tiver campo `String` que precisa de igualdade exata (ex.: código de produto), o `*Service` sobrescreve `aplicarFiltros` para esse campo específico. Caso esperado de ser raro.

### R2. Por que "ignorar silenciosamente" filtros fora da whitelist (e não rejeitar com 400)

- Clientes podem precisar enviar query params para finalidades não relacionadas a filtro (analytics, cache busting, debug, parâmetros de UI persistidos na URL).
- Rejeitar com 400 cria fricção desnecessária e acopla cliente ao conhecimento exato do contrato do backend.
- O modelo "explícito no `*Rest`" já garante que só os filtros desejados sejam aplicados; o resto é ruído inofensivo.
- Para a segurança o que importa é o que **entra** na query, não o que é **ignorado**. A whitelist no `*Service` resolve o lado do que entra.
- Comportamento alinhado com Spring Data, JAX-RS padrão e a maioria das APIs REST corporativas.

### R3. Por que `status = ATIVO` implícito continua, com regra de override

- Comportamento atual do `BaseService.listarDTO()` já filtra `status = ATIVO`. Manter preserva semântica do CRUD admin e evita expor inativos por engano.
- Quando o `*Rest` concreto declara `@QueryParam("status")`, é decisão deliberada de permitir filtrar status. Nesse caso, o filtro explícito **substitui** o implícito (caso contrário seria impossível listar inativos via tela).
- Implementação cuidadosa: ao montar a query, verificar se `status` está presente nos filtros aceitos da requisição **antes** de adicionar `status = ATIVO`. Cobrir com teste manual ambos os cenários (com e sem `status` na request).
- Quando autenticação/autorização entrar no projeto, revisitar essa regra para amarrar com perfil do usuário (admin vs operador).

### R4. Por que derivar a whitelist do `ListDTO` (revisado)

> **Histórico**: a versão anterior deste plano propunha dois métodos abstratos por `*Service` (`camposSortaveis()` e `camposFiltraveis()`), e este R4 falava apenas da escolha entre reflexão e `Map<String, TipoFiltro>` declarativo para os tipos dos filtros. Após discussão (resumida abaixo), a decisão evoluiu: a whitelist em si também é derivada por reflexão — diretamente dos componentes do `ListDTO`. A escolha "reflexão sobre tipo do campo da entidade" segue como antes.

**Sobre derivar a whitelist do `ListDTO`**:

- O `ListDTO` define o que o frontend exibe na tabela. Em CRUD admin, cada coluna da tabela é tipicamente pesquisável e ordenável — a coincidência "campos visíveis = campos filtráveis/ordenáveis" é estrutural, não acidental.
- Declarar `camposSortaveis()` + `camposFiltraveis()` por entidade duplica essa lista, introduzindo manutenção (toda alteração no `ListDTO` exige espelho nas whitelists) e um ponto de drift silencioso (se alguém esquece de atualizar a whitelist depois de adicionar campo no DTO, o filtro não funciona e ninguém vê erro).
- Derivar do `ListDTO` (record) por reflexão dá: zero manutenção adicional, fonte única da verdade, default seguro (campo novo na entidade só vira filtrável se for explicitamente adicionado ao `ListDTO`).
- **Defesa contra exposição preservada**: campos sensíveis (`senhaHash`, futuros CPFs/salários) ficam fora do `ListDTO` por princípio (ADR-0002, ADR-0003), portanto automaticamente fora da whitelist de filtro/sort.
- **Convenção obrigatória** (limitação aceita): nome do componente do `ListDTO` = nome do atributo JPA da entidade. Quebrar essa convenção causa falha em runtime. Casos legítimos de divergência (renomeação de exposição) são tratados sobrescrevendo `camposPermitidos()` no `*Service`.

**Sobre reflexão para tipo do campo na entidade** (decisão antiga, ainda válida):

- Reflexão sobre `Class<Entity>` é determinística: `entity.getDeclaredField("nome").getType()` devolve o tipo Java do campo, suficiente para escolher entre ILIKE, igualdade, range.
- Declarar `Map<String, TipoFiltro>` por entidade dobraria o trabalho e ficaria fora de sincronia se alguém alterar tipo do campo sem atualizar o map.
- Reflexão é cacheada em `static Map<Class, Map<String, Class>>` no `BaseService` (acontece uma vez por classe de entidade).
- Se algum filtro precisar de tipo diferente do tipo natural do campo (ex.: campo `LocalDateTime` mas filtro aceita só `LocalDate`), `*Service` sobrescreve `aplicarFiltros` pontualmente.

### R5. Por que **não** sobrescrever `listar()` no `*Rest` concreto (revisado)

> **Histórico**: a versão inicial deste plano sugeria sobrescrever `listar()` em cada `*Rest` concreto para declarar os filtros como `@QueryParam` tipados, com o objetivo de enriquecer o contrato OpenAPI. Após implementação inicial e discussão, a decisão foi **revertida**. A análise abaixo é a justificativa atual.

- O `BaseRest.listar()` recebe `UriInfo` e repassa a `MultivaluedMap<String,String>` ao `BaseService.listarDTO(...)`. O `BaseService` cruza com a whitelist `camposFiltraveis()` do `*Service` concreto e aplica a convenção de operadores por tipo via reflexão. **Resultado funcional idêntico** ao caso de declarar `@QueryParam` no `*Rest`.
- **Custo do `@QueryParam` por entidade**: introduz um terceiro ponto de manutenção sincronizada. Renomear/remover um campo da entidade exige tocar em: entidade JPA, `camposFiltraveis()` do service **e** assinatura do `*Rest`. Três strings precisam ficar iguais. Drift entre elas é silencioso (não quebra build).
- **Os `@QueryParam` declarados não eram lidos pelo método**: a leitura real continuava pelo `UriInfo`. Os parâmetros existiam apenas para alimentar o gerador OpenAPI, criando código morto que envelhece como mentira contra o comportamento real.
- **Ganho de tipagem no frontend é limitado**: toda query string é `string` mesmo; `openapi-typescript` produz `{ nome?: string; login?: string; ... }`. O ganho é autocomplete de nomes — pequeno, comparado ao custo de manutenção.
- **O frontend é quem decide quais filtros expor**: a tela raramente expõe todos os campos filtráveis do backend. Faz mais sentido declarar o tipo dos filtros no frontend, onde a decisão de UX vive.
- **Whitelist autoritativa no `*Service`** (`camposFiltraveis()`) é a fonte única da verdade sobre o que é filtrável. Mudou a whitelist → mudou o contrato real, sem precisar manter assinatura espelhada no `*Rest`.
- **Mitigações para "drift silencioso"**: log `DEBUG` no `BaseService.aplicarFiltros` registra os query params que não bateram com a whitelist (ajuda quando o frontend manda `?nomeErrado=...` e estranha que nada filtrou). Revisão de impacto no PR é prática esperada quando a whitelist mudar.
- **Porta aberta como exceção**: se aparecer caso pontual em que um filtro específico precisa ficar tipado no contrato (ex.: para destacá-lo na documentação), o `*Rest` concreto pode sobrescrever `listar(...)`, adicionar o `@QueryParam` desejado e delegar ao `super.listar(...)`. Exceção, não regra.

### R6. Por que `Pagina` (português) e não `Page`

- Já registrado na decisão 2 acima. Resumo aqui apenas para rastreabilidade: evitar colisão com `io.quarkus.panache.common.Page` e qualquer outra `Page` que apareça em libs futuras. Permite usar ambos no mesmo arquivo sem importação qualificada.

### R7. Por que sort com direção obrigatória

- Direção implícita ("se omitir, assume `asc`") é fonte clássica de bug ("achei que era desc por padrão; sempre foi asc; só descobri em produção").
- Custo de tornar explícito: usuário escreve `,asc` ou `,desc` no query param. Trivial.
- Ganho: contrato sem ambiguidade; mensagem de erro clara quando alguém esquece (400 + Problem Details).
- Mesma linha de raciocínio da postura geral do projeto: "validação rigorosa, sem implicitude".

### R8. Por que sem limite de número de critérios de sort

- Risco de sort patológico (10+ critérios) é teórico; a whitelist de campos já filtra qualquer tentativa de sort em campo sem índice.
- Limite arbitrário (`max=3` ou `max=5`) cria fricção sem ganho real.
- Se aparecer abuso em produção (improvável em CRUD admin), adicionar limite depois é mudança não-quebrante (rejeitar com 400 quando `sort.size() > N`).

## Escopo de implementação

### Arquivos a criar

1. **`common/Pagina.java`** — record envelope, conforme shape acima. Anotado com `@Schema` (OpenAPI) descrevendo cada campo.
2. **`common/SortCriterio.java`** — record auxiliar (`campo`, `direcao`) para representar um critério de ordenação já validado.
3. **`common/SortDirecao.java`** — enum (`ASC`, `DESC`).
4. **`common/SortParser.java`** (utilitário estático) — converte `List<String>` do query param em `List<SortCriterio>`, aplicando regex e validação. Lança `IllegalArgumentException` (mapeada para 400 pelo `ExceptionMapper` correspondente) quando o formato é inválido. Não consulta whitelist — a whitelist é responsabilidade do `BaseService`.

### Arquivos a modificar

1. **`common/BaseRest.java`** — refatorar `listar()`:
   - Assinatura: `public Pagina<ListDTO> listar(@QueryParam("page") @DefaultValue("0") @Min(0) int page, @QueryParam("size") @DefaultValue("20") @Min(1) @Max(100) int size, @QueryParam("sort") List<String> sort, @Context UriInfo uriInfo)`.
   - Documentação OpenAPI atualizada (`@Operation`, `@APIResponse` para 200 envelope, 400 paginação/sort inválidos).
   - Repassa `page`, `size`, `sort`, e os `queryParameters` do `UriInfo` para `service().listarDTO(...)`.

2. **`common/BaseService.java`** — refatorar `listarDTO()`:
   - Nova assinatura: `public Pagina<ListDTO> listarDTO(int page, int size, List<String> sortBruto, MultivaluedMap<String,String> queryParams)`.
   - Passos:
     1. Parsear `sortBruto` via `SortParser` → `List<SortCriterio>`.
     2. Validar cada `SortCriterio.campo()` contra `camposSortaveis()` (whitelist). Campo fora da whitelist → 400 + Problem Details.
     3. Se `List<SortCriterio>` vazio, usar `defaultSort()` (sobrescritível) com fallback `[createdAt desc, id desc]`.
     4. Montar `io.quarkus.panache.common.Sort` a partir dos critérios.
     5. Aplicar filtros da `queryParams` consultando a whitelist `camposFiltraveis()`; filtros fora da whitelist são ignorados.
     6. Sempre adicionar `status = ATIVO` ao filtro (comportamento herdado da implementação atual).
     7. Executar `repository().find(jpql, parametros).project(listDTO()).page(Page.of(page, size))`.
     8. Calcular `totalElements` via `count()` na mesma query.
     9. Calcular `totalPages = (int) Math.ceil(totalElements / (double) size)` (com tratamento para `size > 0` garantido pela validação).
      10. Retornar `new Pagina<>(content, page, size, totalElements, totalPages)`.
   - **Importante**: o método antigo `listarDTO()` (sem args) é **removido** (assinatura única paginada). Como nenhuma chamada externa fora do `BaseRest` usa o método, não há quebra de API.

3. **Pontos de extensão no `BaseService`** (métodos com default; nenhum abstrato adicional além dos já existentes):
   - `protected Set<String> camposPermitidos()` — whitelist única para filtro e sort, derivada por padrão dos componentes do record `ListDTO` (reflexão com cache). **Não precisa ser sobrescrito** no caso comum. Apenas em entidades cuja exposição diverge do nome do atributo JPA é necessário sobrescrever (ver R4 revisado).
   - `protected FiltroAplicado aplicarFiltros(MultivaluedMap<String,String> queryParams)` — constrói o trecho JPQL + parâmetros a partir dos query params válidos. Implementação padrão no `BaseService` resolve por convenção (tipo do campo via reflexão sobre a entidade; sufixos `From`/`To`). Sobrescritível para filtros mais complexos sem precisar virar busca avançada.
   - **Não há `defaultSort()` sobrescritível**: o sort default é a constante `DEFAULT_SORT = [id desc]` no `BaseService`, fixa para todas as entidades — apenas o contrato técnico mínimo (ordem total para paginação consistente), sem opinião de UX.

   > Detalhe interno: o `FiltroAplicado` é um record auxiliar (não exposto na API) com `String jpql` e `Map<String,Object> parametros`. Vive em `common/FiltroAplicado.java`.

4. **`modules/iam/usuario/UsuarioService.java`** — sem alterações além do CRUD existente:
   - **Não declara** `camposPermitidos()` — usa o default derivado de `UsuarioListDTO`.
   - **Não declara** ordenação default — usa o `DEFAULT_SORT` universal do `BaseService`. Se a tela de usuários precisar de ordem alfabética inicial, o frontend envia `?sort=nome,asc` ao carregar.
   - O `UsuarioListDTO` precisa conter os campos que devem ser filtráveis/ordenáveis (`uuid`, `nome`, `login`, `email`). Para suportar filtros como `createdAtFrom`/`createdAtTo` na tela, adicionar `createdAt` ao `UsuarioListDTO`.

5. **`modules/iam/usuario/UsuarioRest.java`** — **sem alterações funcionais**:
   - O `*Rest` concreto continua mínimo (`@Path`, `@Tag`, injeção do service). Não sobrescreve `listar()`.
   - Os filtros chegam ao `BaseService` via `UriInfo` e são autorizados pela whitelist única `camposPermitidos()` derivada do `UsuarioListDTO`.

### Tratamento de erros

- **Sort com formato inválido** (não casa regex) → `IllegalArgumentException` no `SortParser` → mapeada para **400** + Problem Details.
- **Sort em campo fora da whitelist** → exceção dedicada (`CampoNaoSortavelException` ou reuso de `IllegalArgumentException` com mensagem clara) → **400** + Problem Details.
- **Validação Bean Validation falha em `@Min`/`@Max`** → cai no `ConstraintViolationExceptionMapper` (já existente, ver ADR-0004) → **400** + Problem Details.
- **Nenhum mapper novo é estritamente necessário** se for usado `IllegalArgumentException` e este já estiver coberto pelo catch-all `WebApplicationException`/`Throwable`. Se não estiver, criar `IllegalArgumentExceptionMapper` em `infra/exception/`.

### Impacto no contrato OpenAPI

- `GET /usuario` (e equivalentes em outros `*Rest`) passa a retornar `Pagina<UsuarioListDTO>` em vez de `List<UsuarioListDTO>`. **Breaking change** no contrato; aceitável conforme ADR-0006 (CRUD interno não tem versionamento, evolui junto com `frontend-ultima`).
- `?page`, `?size`, `?sort` aparecem como query params no contrato, com defaults documentados.
- Filtros por coluna **não** aparecem no contrato (decisão revisada — ver R5). A lista do que é aceito vive em `camposFiltraveis()` do `*Service` correspondente e o frontend declara os tipos por tela.
- Respostas 400 documentadas com Problem Details (já é prática vigente).
- **Impacto no `frontend-ultima`**: a geração de tipos via `openapi-typescript` será atualizada e produzirá `Pagina<UsuarioListDTO>` em TypeScript. Todas as chamadas ao serviço de listagem do frontend precisarão acessar `.content` em vez de tratar a resposta como array. Os tipos dos filtros (`{ nome?: string; ... }`) ficam declarados manualmente no frontend, por tela. Coordenar a entrega backend + frontend no mesmo ciclo.

### Documentação a atualizar

1. **`backend-quarkus/AGENTS.md`** — seção `Common Base Components` e `BaseRest`: descrever a nova assinatura de `listar()` com paginação obrigatória, e mencionar pontos de extensão do `BaseService` para whitelist.
2. **ADR-0009** (novo) — `0009-paginacao-ordenacao-filtros-no-baserest.md`. Conteúdo:
   - **Status**: Accepted (na conclusão).
   - **Contexto**: hoje `GET /` devolve `List<ListDTO>` integral; não escala; necessidade de padronizar antes de replicar entidades.
   - **Decisão**: as 5 decisões consolidadas (paginação offset/limit, envelope `Pagina<T>`, sort Spring-style com direção obrigatória, filtros básicos via query params, defaults/clamp).
   - **Consequências**: breaking change controlado no contrato; reuso entre entidades; abre porta para modo avançado (plano 0003).
   - **Alternativas consideradas**: cursor, headers + array, sintaxe compacta de sort, JSON-in-query, DSL RSQL, clamp silencioso. Todas descartadas com motivos registrados na análise da sessão S1.
3. **Plano 0001** — mover item #7 para `Concluídos` referenciando ADR-0009 e este plano.

## Ordem de execução recomendada

1. **Criar ADR-0009** (rascunho aceito) com as 5 decisões. Necessário **antes** do merge da implementação (regra do `AGENTS.md`).
2. **Criar `common.Pagina`, `common.SortDirecao`, `common.SortCriterio`, `common.SortParser`**.
3. **Refatorar `BaseService.listarDTO()`** com a nova assinatura e métodos de extensão (`camposSortaveis`, `camposFiltraveis`, `defaultSort`, `aplicarFiltros`).
4. **Refatorar `BaseRest.listar()`** com os novos `@QueryParam` e validações.
5. **`UsuarioService`** segue inalterado (a whitelist vem do `UsuarioListDTO`; o sort default vem da constante do `BaseService`).
6. **`UsuarioRest`** segue inalterado (não sobrescreve `listar()`); os filtros chegam pelo `UriInfo`.
7. **Testes manuais** via Swagger UI (`/q/swagger-ui`) e/ou cURL:
   - `GET /usuario` (defaults).
   - `GET /usuario?page=0&size=5`.
   - `GET /usuario?sort=nome,asc&sort=createdAt,desc`.
   - `GET /usuario?nome=ma` (LIKE).
   - `GET /usuario?createdAtFrom=2026-01-01&createdAtTo=2026-12-31`.
   - `GET /usuario?size=999` (espera 400).
   - `GET /usuario?sort=nome` (espera 400).
   - `GET /usuario?sort=camposInexistente,asc` (espera 400).
   - `GET /usuario?page=99999` (espera 200 com `content: []`).
8. **Atualizar `AGENTS.md`** (seção `Common Base Components` e `BaseRest`).
9. **Marcar ADR-0009 como Accepted**.
10. **Mover item #7 para `Concluídos` no plano 0001** (já feito na criação deste plano; revisar texto se necessário ao fim).
11. **Avisar o `frontend-ultima`** sobre o breaking change no contrato (regerar tipos OpenAPI, ajustar chamadas).

## Riscos e observações

- **Tipos de campo via reflexão na convenção de operadores**: a implementação default de `aplicarFiltros` infere se um campo é `String` (→ ILIKE), `Enum`/`UUID`/numérico (→ igualdade), ou se há sufixo `From`/`To` (→ range), por reflexão sobre a classe da entidade (`Class<Entity>`). Cacheada em `static Map<Class, Map<String, Class>>`. Se aparecer caso fora da convenção, `*Service` sobrescreve `aplicarFiltros` pontualmente.
- **Status sempre `ATIVO`**: o filtro fixo de status é preservado para não quebrar comportamento atual do CRUD admin (que só lista ativos). Quando a requisição traz `status` explicitamente **e** `status` faz parte do `ListDTO` (i.e., está em `camposPermitidos()`), o filtro explícito **substitui** o default. Para uma tela que precise listar inativos, basta incluir `status` no `ListDTO`.
- **`count()` por requisição**: cada chamada `GET /` faz duas queries (uma para dados, uma para `count`). É o custo padrão de offset/limit; aceitável para CRUD admin com filtros (índices cobrem). Monitorar se aparecer hotspot.
- **Convenção de nomes `ListDTO` ↔ entidade**: os nomes dos componentes do `ListDTO` (record) DEVEM corresponder aos atributos da entidade JPA, porque são usados diretamente como identificadores na cláusula JPQL. Quebrar essa convenção causa falha em runtime (Hibernate não encontra o atributo). Mitigação: revisão de PR + log `DEBUG` em desenvolvimento + sobrescrita pontual de `camposPermitidos()` quando a divergência for legítima.
- **Defesa contra exposição de campos sensíveis**: campos que existem na entidade mas não no `ListDTO` (`senhaHash`, futuros CPF/salário) ficam automaticamente fora do filtro e do sort. Não há janela acidental para enumeração via probing — a única forma de habilitar é decidir conscientemente expô-lo no `ListDTO`.
- **Sort sobre campos calculados/relacionamentos**: este plano cobre apenas campos diretos da entidade. Sort por campo de relacionamento (`?sort=cliente.nome,asc`) **não** é suportado no modo básico. Se necessário, abrir caso de uso específico e/ou tratar no plano 0003 ou em sobrescrita pontual do `*Service`.
- **Coordenação com o frontend**: a mudança no formato da resposta (envelope) é breaking change. Combinar deploy backend + frontend na mesma janela, conforme ADR-0006.

## Pontos de atenção que ficam fora deste plano

- **Modo avançado de busca** (operadores explícitos, OR, agrupamentos, `POST /buscar` com `FiltroDTO`): coberto em [`0003-busca-avancada-backend.md`](0003-busca-avancada-backend.md).
- **Sort por campos de relacionamento**: pode ser tratado em plano futuro se houver demanda.
- **Cache de resultados de listagem**: fora de escopo; pode ser avaliado se métricas indicarem necessidade.
- **Cursor pagination**: descartado nesta versão; só revisitar se aparecer entidade tipo log/auditoria com requisitos diferentes.
