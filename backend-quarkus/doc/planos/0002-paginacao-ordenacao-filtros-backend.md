# Plano de Implementação — Paginação, Ordenação e Filtros (Caminho B Básico)

> **Status**: pendente (análise concluída; implementação a executar)
> **Última atualização**: 2026-06-04
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
- **Sem limite numérico** de critérios; segurança garantida pela whitelist de campos.
- **Default quando `sort` vazio**:
  - O `*Service` concreto **pode** sobrescrever um método (`defaultSort()`) para fornecer o sort padrão da entidade.
  - **Fallback no `BaseService`** quando o `*Service` não declarar: `createdAt desc, id desc` (estável, sem ambiguidade entre registros com mesmo `createdAt`).
- Validação por valor: regex `^[a-zA-Z][a-zA-Z0-9]*,(asc|desc)$` (case-insensitive na direção) + verificação na whitelist.

### 4. Filtros (modo básico) — Query params livres, tipados

- Filtros são declarados como `@QueryParam` **explícitos no `*Rest` concreto** (para aparecerem tipados no contrato OpenAPI e na geração de tipos do `frontend-ultima`). O `BaseRest` **não** declara filtros (eles são específicos da entidade).
- **AND implícito** entre todos os filtros.
- **Convenção de operadores por tipo de campo** (aplicada pelo `*Service` ao construir a `PanacheQuery`):
  - **String** → `ILIKE '%' || valor || '%'` (contém, case-insensitive).
  - **Enum, UUID, número, boolean** → igualdade exata.
  - **Data/número com range** → sufixos `From` (≥) e `To` (≤) no nome do `@QueryParam` (ex.: `createdAtFrom`, `createdAtTo`).
  - **IN (múltiplos valores)** → query param repetido (`?status=ATIVO&status=PENDENTE`), recebido como `List<T>` no `*Rest`.
- **Filtros não declarados pelo `*Rest`** → **ignorados silenciosamente** (não retornam erro). Aceita-se que o cliente envie query params arbitrários sem impacto.
- **Whitelist**: implícita pela própria declaração dos `@QueryParam` no `*Rest`. Não há `Map<String,String>` opaco circulando entre camadas.

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

3. **Pontos de extensão no `BaseService`** (novos métodos abstratos ou com default):
   - `protected Set<String> camposSortaveis()` — retorna nomes de campos da entidade permitidos para sort. **Obrigatório implementar** em cada `*Service`.
   - `protected Set<String> camposFiltraveis()` — retorna nomes de campos da entidade permitidos para filtro básico. **Obrigatório implementar** em cada `*Service`. Mesmo conjunto pode coincidir com `camposSortaveis()` em muitos casos, mas a separação dá flexibilidade.
   - `protected List<SortCriterio> defaultSort()` — opcional; default no `BaseService` retorna `[createdAt desc, id desc]`. O `*Service` sobrescreve se a entidade tiver ordenação natural diferente (ex.: `nome asc`).
   - `protected FiltroAplicado aplicarFiltros(MultivaluedMap<String,String> queryParams)` — constrói o trecho JPQL + parâmetros a partir dos query params válidos. Implementação padrão no `BaseService` resolve por convenção (tipo do campo via reflexão sobre a entidade; sufixos `From`/`To`). Sobrescritível para filtros mais complexos sem precisar virar busca avançada.

   > Detalhe interno: o `FiltroAplicado` é um record auxiliar (não exposto na API) com `String jpql` e `Map<String,Object> parametros`. Pode viver em `common/FiltroAplicado.java` ou ser inner record de `BaseService`. Decidir na implementação.

4. **`modules/iam/usuario/UsuarioService.java`** — adicionar implementação concreta:
   - `camposSortaveis()` → `Set.of("nome", "login", "email", "createdAt")`.
   - `camposFiltraveis()` → `Set.of("nome", "login", "email", "status")` (ou conforme tela). Status já vem fixado em ATIVO no `BaseService`; incluir em `camposFiltraveis()` permite refinar no futuro se a tela precisar mostrar inativos por filtro explícito.
   - Pode opcionalmente sobrescrever `defaultSort()` → `[nome asc, id asc]` se for o padrão da tela de usuários.

5. **`modules/iam/usuario/UsuarioRest.java`** — declarar filtros tipados:
   - Sobrescrever `listar()` adicionando os `@QueryParam` específicos (`nome`, `login`, `email`).
   - Alternativa simples: **não sobrescrever** e deixar os filtros chegarem via `UriInfo`. **Decisão para a implementação**: vamos sobrescrever no `*Rest` concreto para garantir tipagem no OpenAPI. Pode ser mecanizado com pequeno boilerplate inicial (4-5 linhas por `*Rest`).

### Tratamento de erros

- **Sort com formato inválido** (não casa regex) → `IllegalArgumentException` no `SortParser` → mapeada para **400** + Problem Details.
- **Sort em campo fora da whitelist** → exceção dedicada (`CampoNaoSortavelException` ou reuso de `IllegalArgumentException` com mensagem clara) → **400** + Problem Details.
- **Validação Bean Validation falha em `@Min`/`@Max`** → cai no `ConstraintViolationExceptionMapper` (já existente, ver ADR-0004) → **400** + Problem Details.
- **Nenhum mapper novo é estritamente necessário** se for usado `IllegalArgumentException` e este já estiver coberto pelo catch-all `WebApplicationException`/`Throwable`. Se não estiver, criar `IllegalArgumentExceptionMapper` em `infra/exception/`.

### Impacto no contrato OpenAPI

- `GET /usuario` (e equivalentes em outros `*Rest`) passa a retornar `Pagina<UsuarioListDTO>` em vez de `List<UsuarioListDTO>`. **Breaking change** no contrato; aceitável conforme ADR-0006 (CRUD interno não tem versionamento, evolui junto com `frontend-ultima`).
- `?page`, `?size`, `?sort` aparecem como query params no contrato, com defaults documentados.
- Filtros aparecem como query params tipados (declarados em cada `*Rest` concreto).
- Respostas 400 documentadas com Problem Details (já é prática vigente).
- **Impacto no `frontend-ultima`**: a geração de tipos via `openapi-typescript` será atualizada e produzirá `Pagina<UsuarioListDTO>` em TypeScript. Todas as chamadas ao serviço de listagem do frontend precisarão acessar `.content` em vez de tratar a resposta como array. Coordenar a entrega backend + frontend no mesmo ciclo.

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
5. **Atualizar `UsuarioService`** com `camposSortaveis()` e `camposFiltraveis()`.
6. **Atualizar `UsuarioRest`** sobrescrevendo `listar()` com os `@QueryParam` tipados.
7. **Testes manuais** via Swagger UI (`/q/swagger-ui`):
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

- **Tipos de campo via reflexão na convenção de operadores**: a implementação default de `aplicarFiltros` precisa inferir se um campo é `String` (→ ILIKE), `Enum`/`UUID`/numérico (→ igualdade), ou se há sufixo `From`/`To` (→ range). Isso pode ser feito por reflexão sobre a classe da entidade (`Class<Entity>`). Alternativa mais explícita: o `*Service` declara via `Map<String, TipoFiltro>`. **Decisão para a implementação**: começar com reflexão por simplicidade, evoluir se aparecer problema.
- **Status sempre `ATIVO`**: o filtro fixo de status precisa ser preservado para não quebrar comportamento atual do CRUD admin (que só lista ativos). Documentar que o filtro `status` no `*Rest`, se declarado, **substitui** o default; quando ausente, default `ATIVO` é aplicado. Cuidado para não permitir injeção via query param `status=*` (a whitelist resolve isso).
- **`count()` por requisição**: cada chamada `GET /` faz duas queries (uma para dados, uma para `count`). É o custo padrão de offset/limit; aceitável para CRUD admin com filtros (índices cobrem). Monitorar se aparecer hotspot.
- **Reflexão e nomes de campos**: a whitelist deve usar **exatamente** os nomes dos campos da entidade JPA, não os nomes dos campos do DTO. Isso é importante para a query JPQL ser válida.
- **Sort sobre campos calculados/relacionamentos**: este plano cobre apenas campos diretos da entidade. Sort por campo de relacionamento (`?sort=cliente.nome,asc`) **não** é suportado no modo básico. Se necessário, abrir caso de uso específico e/ou tratar no plano 0003 ou em sobrescrita pontual do `*Service`.
- **Coordenação com o frontend**: a mudança no formato da resposta (envelope) é breaking change. Combinar deploy backend + frontend na mesma janela, conforme ADR-0006.

## Pontos de atenção que ficam fora deste plano

- **Modo avançado de busca** (operadores explícitos, OR, agrupamentos, `POST /buscar` com `FiltroDTO`): coberto em [`0003-busca-avancada-backend.md`](0003-busca-avancada-backend.md).
- **Sort por campos de relacionamento**: pode ser tratado em plano futuro se houver demanda.
- **Cache de resultados de listagem**: fora de escopo; pode ser avaliado se métricas indicarem necessidade.
- **Cursor pagination**: descartado nesta versão; só revisitar se aparecer entidade tipo log/auditoria com requisitos diferentes.
