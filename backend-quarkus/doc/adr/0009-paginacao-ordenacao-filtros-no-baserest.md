# ADR-0009: Paginação, ordenação e filtros básicos no `BaseRest`

- **Status**: Accepted
- **Data**: 2026-06-04
- **Autores**: Time backend

## Contexto

O `GET /` herdado por todas as subclasses de `BaseRest` retornava `List<ListDTO>` integral — sem paginação, ordenação ou filtros. Conforme o número de entidades CRUD cresce no monorepo (`iam`, `crm`, `estoque` etc.), manter esse contrato:

- Acopla o tamanho da resposta ao volume da tabela, comprometendo latência e memória.
- Empurra para cada `*Rest` a tarefa de inventar sua própria convenção de paginação/ordenação/filtro quando a necessidade aparece, abrindo divergência.
- Não casa com a tela administrativa de listagem (PrimeNG `p-table` em lazy mode no `frontend-ultima`), que precisa de `first`, `rows`, ordenação por coluna e filtros por coluna.

Antes de replicar a entidade `Usuario` como referência para outras entidades, é necessário consolidar um contrato HTTP único e implementá-lo no `BaseRest` + `BaseService`. A análise das alternativas e o detalhamento técnico estão em [`doc/planos/0002-paginacao-ordenacao-filtros-backend.md`](../planos/0002-paginacao-ordenacao-filtros-backend.md). O modo avançado (operadores explícitos, OR, agrupamentos via `POST /buscar`) é tema do plano `0003` e fica fora desta decisão.

## Decisão

Adotamos para o `GET /` de todo `*Rest` que estende `BaseRest` o seguinte contrato:

1. **Paginação obrigatória offset/limit** via query params `?page=<int>&size=<int>`, implementada com `io.quarkus.panache.common.Page.of(page, size)`.
2. **Envelope JSON `common.Pagina<T>`** como tipo de resposta, com campos mínimos `content`, `page`, `size`, `totalElements`, `totalPages`. O nome em português é deliberado para evitar colisão com `io.quarkus.panache.common.Page`.
3. **Ordenação Spring-style** via `?sort=<campo>,<direcao>` (parâmetro repetido para múltiplos critérios). A **direção é obrigatória** (`asc` ou `desc`, case-insensitive); ausência de direção retorna `400 application/problem+json`. Sem limite numérico de critérios; segurança garantida pela mesma whitelist única usada para filtros (ver item 4). Default quando `sort` vazio: **constante fixa `[id desc]` no `BaseService`** (não sobrescritível por `*Service`). É o contrato técnico mínimo exigido pela paginação offset/limit — sem `ORDER BY` que produza ordem total, PostgreSQL não garante a mesma ordem entre `?page=0` e `?page=1`, gerando registros duplicados/ausentes entre páginas. A PK `id` (herdada de `BaseEntity`) é única por construção e atende esse requisito sem opinião de UX. Ordenação com significado de apresentação (alfabética, cronológica, etc.) é decisão do frontend, enviada via `?sort=...` quando necessário. O `DEFAULT_SORT` é fonte interna do backend e **não** passa pela validação de whitelist (usa o campo técnico `id` que normalmente não está no `ListDTO`).
4. **Filtros básicos por coluna** captados via `UriInfo` no `BaseRest` (sem declaração tipada por entidade no `*Rest`) e autorizados pela whitelist única `BaseService#camposPermitidos()`, **derivada automaticamente dos componentes do `ListDTO`** da entidade. Princípio orientador: "o que aparece na tabela do frontend é o que pode ser filtrado e ordenado". AND implícito entre os filtros. Convenções automáticas no `BaseService` (via reflexão sobre o tipo do campo na entidade):
   - Campo `String` → `ILIKE '%' || valor || '%'` (contém, case-insensitive).
   - Enum, `UUID`, número, `Boolean` → igualdade exata.
   - Sufixos `From` (≥) e `To` (≤) → comparação de range em data/número.
   - Query param repetido → cláusula `IN`.
   - Filtros fora da whitelist ou inexistentes na entidade são ignorados silenciosamente (sem erro), com registro em log `DEBUG` para facilitar depuração.
   - O frontend (`frontend-ultima`) declara seus próprios tipos TypeScript para os filtros de cada tela. O `ListDTO` no backend é a fonte autoritativa sobre o que é aceito.
   - Para habilitar filtro/sort em um campo (ex.: `createdAt`, `updatedAt`), basta incluí-lo no `ListDTO`. Para bloquear, basta retirá-lo do `ListDTO`. Não há método de whitelist por `*Service` para manter sincronizado.
5. **Defaults e clamp**: `size` default `20`, mínimo `1`, máximo `100`; `page` default `0`, mínimo `0`. Valores fora do intervalo retornam `400` (Bean Validation `@Min`/`@Max`). `page` além do total retorna `200` com `content: []` (não é erro).

O filtro fixo herdado `status = ATIVO` é mantido como default e é **substituído** quando a requisição traz `status` explicitamente (e `status` faz parte do `ListDTO`).

## Consequências

### Positivas

- Contrato HTTP único e previsível para todas as listagens do CRUD, alinhado ao consumo do `frontend-ultima` (PrimeNG `p-table` lazy).
- **Zero manutenção adicional por entidade**: a whitelist de filtros e sort é derivada automaticamente do `ListDTO` por reflexão (cache por classe). O `*Rest` concreto fica praticamente vazio (`@Path` + `@Tag` + injeção do service); o `*Service` concreto não precisa declarar whitelist.
- **Fonte única da verdade**: o `ListDTO` define simultaneamente (i) o que o frontend exibe na tabela, (ii) o que pode ser filtrado e (iii) o que pode ser ordenado. Renomear/remover um campo afeta os três comportamentos numa única edição.
- **Defesa contra exposição de campos sensíveis**: campos que existem na entidade mas não no `ListDTO` (ex.: `Usuario.senhaHash`, futuros `cpf`, `salario`, etc.) ficam automaticamente fora do filtro e do sort, impedindo enumeração silenciosa via probing.
- Reflexão para detectar tipo do campo elimina duplicação (campo já está declarado na entidade JPA).
- Frontend mantém a liberdade de declarar seus próprios tipos para os filtros de cada tela, refletindo a decisão de UX sem ficar amarrado a uma lista exaustiva de query params no contrato.
- **`DEFAULT_SORT` mínimo (`[id desc]`)** mantém apenas o que é responsabilidade técnica do backend (ordem total para paginação consistente), sem opinião de apresentação. Telas declaram a ordenação inicial desejada no frontend via `?sort=...`, mantendo a decisão de UX exclusivamente onde ela vive.

### Negativas

- **Breaking change** no contrato: `GET /usuario` (e equivalentes) passa a retornar `Pagina<UsuarioListDTO>` em vez de `List<UsuarioListDTO>`. Aceitável porque o CRUD interno não tem versionamento (ver ADR-0006); deploy backend + frontend coordenados na mesma janela.
- Cada `GET /` faz duas queries (dados + count). Custo padrão de offset/limit; aceitável para CRUD admin com filtros indexados. Se aparecer hotspot, avaliar caso a caso.
- O contrato OpenAPI publicado em `/q/openapi` documenta apenas `page`, `size` e `sort` para o `GET /`. Os filtros aceitos por cada entidade ficam implícitos (são os componentes do `ListDTO`). Mitigação: log `DEBUG` no `BaseService` registra os query params recebidos que foram ignorados; consumidores externos (caso surjam no futuro como APIs de integração — endpoint separado, ver ADR-0006) terão contrato tipado próprio.
- **Acoplamento controlado entre `ListDTO` e capacidades de filtro/sort**: para suportar range em `createdAt` (ex.: `?createdAtFrom=2026-01-01`), o `ListDTO` precisa incluir `createdAt` como componente. Isso é considerado aceitável e até desejável (se o usuário pode filtrar por um campo, faz sentido que ele veja esse campo na tabela ou pelo menos saiba que ele existe). Para casos em que o componente do DTO precisa ser diferente do nome do atributo da entidade (renomeação de exposição), o `*Service` pode sobrescrever `camposPermitidos()`.
- Reflexão para inferir tipo de campo cobre o caso comum, mas filtros com tipo diferente do tipo natural do campo (ex.: campo `LocalDateTime` filtrando por `LocalDate`) exigem sobrescrita pontual de `aplicarFiltros` no `*Service`.
- Drift silencioso possível entre backend e frontend: se o backend remover um campo do `ListDTO`, o frontend pode continuar enviando o filtro e o backend o ignorará sem erro. Mitigação: log `DEBUG` ajuda na depuração; revisão de impacto no PR quando o `ListDTO` mudar.
- **Convenção `nome do componente do ListDTO = nome do atributo da entidade JPA`**: é obrigatória, porque o componente vira identificador direto na cláusula JPQL. Quebrar essa convenção implica falha em runtime (Hibernate não encontra o atributo). Mitigação: revisão de PR + log `DEBUG` em desenvolvimento. Caso uma entidade precise expor o campo no DTO com nome diferente do atributo JPA, o `*Service` sobrescreve `camposPermitidos()`.

### Neutras

- Sort por campos de relacionamento (`?sort=cliente.nome,asc`) **não** é suportado neste modo básico. Pode ser tratado em sobrescrita pontual do `*Service` ou em plano futuro se houver demanda.
- O record `common.Pagina` aparece tipado por entidade no contrato OpenAPI (`Pagina_UsuarioListDTO`, etc.), o que o SmallRye OpenAPI já resolve sem configuração adicional.
- O modo avançado de busca (operadores explícitos, OR, agrupamentos, `POST /buscar` com `FiltroDTO`) é planejado em `doc/planos/0003-busca-avancada-backend.md` e fica fora desta decisão.
- Se em algum momento aparecer caso pontual em que um filtro específico precise ficar tipado no contrato (ex.: para destacá-lo na documentação consumida por integradores), o `*Rest` concreto pode sobrescrever `listar(...)` adicionando o `@QueryParam` desejado e delegando ao `super.listar(...)`. A porta fica aberta como exceção, não como regra.

## Alternativas consideradas

- **Cursor pagination** (`?cursor=...`): descartado para CRUD admin de baixa volatilidade; complicaria o cliente sem ganho real. Pode ser revisitado se aparecer entidade tipo log/auditoria com requisitos diferentes.
- **Headers + array sem envelope**: `Link`/`X-Total-Count` ao lado de um array JSON. Descartado: contrato menos descobrível, integração com geração de tipos no frontend fica menos limpa.
- **Sintaxe compacta de sort** (`?sort=nome,-createdAt`): descartada por ser menos explícita; convenção Spring-style (campo + vírgula + direção) é familiar a quem já trabalhou com Spring Data e mais legível.
- **Direção implícita** (assume `asc` quando ausente): descartada por ser fonte clássica de bug e contradizer a postura geral do projeto ("validação rigorosa, sem implicitude").
- **JSON-in-query / DSL RSQL** (`?filter=eq(nome,...)` ou similar): descartado para o modo básico. Complexidade alta, contrato OpenAPI pobre. Será reavaliado no plano `0003` (modo avançado).
- **Clamp silencioso de `size`** (truncar `size > 100` para 100 sem erro): descartado. Melhor falhar rápido com `400` e mensagem clara do que produzir resposta diferente da pedida sem aviso.
- **Limite numérico de critérios de sort** (`max=3`): descartado. Risco teórico já é mitigado pela whitelist; limite arbitrário cria fricção sem ganho.
- **Whitelist via `Map<String, TipoFiltro>` declarativo por entidade**: descartado em favor de reflexão sobre a classe da entidade. Reflexão é determinística, evita duplicação e mantém consistência automática quando o tipo do campo muda. Migração para declarativo só se aparecer caso real que justifique.
- **Filtros declarados como `@QueryParam` tipados em cada `*Rest` concreto**: considerado para tornar o contrato OpenAPI rico (filtros tipados, autocompletar no Swagger UI, geração precisa de tipos no `openapi-typescript`). Descartado porque: (a) o `@QueryParam` não é derivado da entidade nem do `ListDTO`, exigindo manutenção em pontos sincronizados ao renomear/remover um campo; (b) os parâmetros declarados não eram lidos no corpo do método (a leitura real ficava no `UriInfo`), criando código morto que envelhece como mentira contra o comportamento real; (c) o "ganho de tipagem" no frontend é limitado — toda query string vira `string` mesmo, o que se ganha é autocomplete de nomes; (d) o frontend é dono da decisão de UX "quais filtros expor", e essa decisão raramente é "todos os campos filtráveis"; faz mais sentido declarar o tipo no frontend, onde a tela é definida. O custo do boilerplate por entidade não se justifica para um CRUD interno consumido por um único frontend que mora no mesmo monorepo.
- **Whitelist explícita por método (`camposSortaveis()` + `camposFiltraveis()` em cada `*Service`)**: foi a versão intermediária deste plano. Descartada porque introduz manutenção adicional (dois `Set<String>` por entidade) com baixo ganho informacional — a lista de campos filtráveis tende a coincidir com a lista de campos exibidos na tabela. Derivar do `ListDTO` (decisão atual) elimina a duplicação preservando a defesa contra exposição de campos sensíveis: tudo que está fora do `ListDTO` está automaticamente fora do filtro e do sort.
- **Whitelist por exclusão (blacklist `camposNaoFiltraveis()`)**: descartada porque inverte o princípio "default seguro" — exige listar explicitamente os campos sensíveis para protegê-los. Em entidades novas, é fácil esquecer (`Cliente.cpf` recém-adicionado nasce filtrável até alguém lembrar de incluir na blacklist). Whitelist derivada do `ListDTO` é "default seguro" (campo novo na entidade nasce **não** filtrável até ser adicionado explicitamente ao `ListDTO`).
- **Anotação `@Filtravel` em campos da entidade**: descartada para não acoplar a entidade JPA a conhecimento de HTTP/UX. Derivar do `ListDTO` mantém a responsabilidade no DTO (camada de apresentação), onde a decisão "isso aparece para o usuário" já vive.
- **Remover whitelist completamente** (qualquer query param vira filtro): considerada com base no argumento "JPQL/PreparedStatement já protege contra SQL Injection". Descartada porque a proteção do JPQL é apenas sobre **valores** (bind parameters), não sobre **nomes de campos**, que entram como identificador cru na query montada. Sem whitelist, `?senhaHash=$2a$10$...` viraria filtro válido, abrindo enumeração silenciosa de hashes via probing. O mesmo se aplicaria a qualquer campo sensível futuro (CPF, salário, número de cartão). A defesa em profundidade justifica o custo (zero, no design adotado).
- **Sem `ORDER BY` quando o cliente não envia `sort`**: considerada como tradução literal do princípio "desacoplar UX do backend". Descartada porque a ordenação default não é apenas tema de UX — é **requisito técnico** da paginação offset/limit. [PostgreSQL não garante ordem entre execuções de uma query sem `ORDER BY`](https://www.postgresql.org/docs/current/queries-limit.html); o resultado de `?page=0&size=20` seguido de `?page=1&size=20` pode trazer registros duplicados e/ou ausentes, conforme cache de buffer, updates concorrentes, plano escolhido pelo planner e paralelismo de leitura. Bug silencioso, intermitente, difícil de reproduzir em dev. A solução adotada (`DEFAULT_SORT = [id desc]`) preserva o desacoplamento de UX — o backend não opina sobre "ordem natural" — e mantém o contrato técnico de paginação consistente. Frontend é livre para sobrepor com `?sort=...` quando quiser ordem com significado de apresentação.
- **Sort obrigatório** (retorna `400` quando ausente): considerada como máxima coerência com a postura "sem implicitude" do projeto. Descartada por custo de DX — cada nova chamada exploratória (Swagger UI, curl ad-hoc, script de integração novo) falharia na primeira tentativa, criando fricção desproporcional ao ganho para um CRUD interno coordenado com o frontend do mesmo monorepo. O `DEFAULT_SORT = [id desc]` resolve a maior parte do mesmo problema (ordem estável garantida) sem essa fricção.

## Referências

- Plano de implementação: [`doc/planos/0002-paginacao-ordenacao-filtros-backend.md`](../planos/0002-paginacao-ordenacao-filtros-backend.md)
- Plano futuro (modo avançado): [`doc/planos/0003-busca-avancada-backend.md`](../planos/0003-busca-avancada-backend.md)
- ADR-0004 — RFC 7807 Problem Details (formato dos erros 400 deste contrato)
- ADR-0006 — Não versionamento de APIs internas de CRUD (justifica o breaking change controlado)
- [Quarkus Hibernate ORM with Panache — Paging and sorting](https://quarkus.io/guides/hibernate-orm-panache#paging)
