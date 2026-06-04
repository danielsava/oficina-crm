# Plano de Padronização do CRUD — Backend (Pendências)

> **Status**: vivo (editável conforme avançamos)
> **Última atualização**: 2026-06-04 (concluído #18 — `@Produces` explícito no `BaseRest` e `@Consumes` apenas em `POST`/`PUT`, registrado na ADR-0007; concluídos #9 — opções para divergência futura registradas como referência; #13 — `@Valid` duplicado em `Rest` e `Service`)
> **Contexto-mãe**: revisão arquitetural do esqueleto CRUD genérico (`common.*`) usando a entidade `Usuario` como referência de implementação.

## Como ler este documento

- Itens estão organizados na **ordem recomendada de execução**.
- Cada item tem: **objetivo**, **contexto** (por que importa), **decisões necessárias** antes de implementar, **escopo de mudança**, **risco/observação**, **status**.
- Itens já concluídos ficam fora deste plano; ver histórico no commit log e nos ADRs em [`../adr/`](../adr/README.md).
- Quando um item for resolvido, mover para a seção "Concluídos" no final e atualizar a data.
- Decisões arquiteturais resultantes devem virar um **ADR** novo em [`../adr/`](../adr/README.md) antes do merge (regra do `AGENTS.md`).

## Resumo do que já foi feito (referência)

| #  | Item                                                              | Onde foi registrado                                                   |
|----|-------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1  | Padrão de nomenclatura `*Rest` / `BaseRest`                       | ADR-0001                                                              |
| 2  | UUID como identificador público em URLs e DTOs                    | ADR-0002                                                              |
| 3  | `EditDTO` como DTO único de formulário (`POST`, `PUT`, `GET /{uuid}`) | ADR-0003 (inclui dívida técnica da senha temporária `"123456"`)     |
| 4  | `@Enumerated(EnumType.STRING)` obrigatório + `status VARCHAR(20)` | `AGENTS.md` (sem ADR; decisão técnica simples)                        |
| 9  | Create vs Update DTO — opções para divergência futura de validação | Plano 0001 (sem ADR; tratar caso a caso quando houver necessidade real) |
| 13 | `@Valid` no controller e no service                               | Código (`BaseRest` + `BaseService`; sem ADR)                          |
| 10 | Bug `BaseService.excluirPorUUID(Long → String)`                   | Corrigido junto com o ponto 2                                          |
| 11 | Mensagem "Senha fraca" em check de e-mail duplicado               | Removido junto com o ponto 3 (trecho deletado)                         |
| 5  | RFC 7807 — Problem Details para erros HTTP                        | ADR-0004                                                              |
| 6  | Hard delete (`DELETE /{uuid}`) removido do `BaseRest`             | ADR-0005                                                              |
| 8  | OpenAPI/Swagger (dev e prod) + decisão de não versionar CRUD interno | ADR-0006                                                          |
| 18 | `@Produces` explícito no `BaseRest` + `@Consumes` apenas em `POST`/`PUT` | ADR-0007                                                          |

---

## Pendências (ordem recomendada)

### 7. Paginação, ordenação e filtros no contrato base

- **Objetivo**: definir o contrato HTTP padrão de listagem (paginação obrigatória, ordenação e filtros opcionais).
- **Contexto**: hoje `GET /` retorna `List<ListDTO>` completo. Não escala. Há rascunho comentado em `BaseService.java` (linhas finais). Decisão precisa ser tomada **antes** de replicar entidades, senão multiplica débito.
- **Decisões necessárias**:
  - **Estratégia de paginação**:
    - Offset/limit: `?page=0&size=20` (simples, mas inconsistente em datasets que mudam durante a navegação).
    - Cursor: `?cursor=abc&size=20` (correto, mas exige cursor estável).
    - Recomendação: **offset/limit** para CRUD admin (telas internas), suficiente.
  - **Formato da resposta**: envelope (`{ content: [...], totalElements, totalPages, page, size }`) ou só array com headers (`X-Total-Count`)?
    - Recomendação: **envelope**, melhor DX para Angular/PrimeNG (que esperam objeto).
  - **Sort**: `?sort=nome,asc&sort=createdAt,desc` (Spring style) ou `?sort=nome:asc,createdAt:desc`?
  - **Filtros**: query params livres (`?nome=joao`), ou objeto de filtro estruturado, ou DSL (RSQL/`?filter=nome==joao*`)?
    - Recomendação: começar com **query params livres** (mais campo=valor), e cada `*Rest` documenta os filtros que aceita. RSQL pode entrar depois se houver demanda real.
  - **Default `size`**: 20? 50? Máximo permitido (clamp)?
- **Escopo de mudança**:
  - Criar `common/Pagina.java` (record envelope).
  - Refatorar `BaseService.listarDTO()` para aceitar `int page, int size, Sort sort, Map<String,Object> filters`.
  - Refatorar `BaseRest.listar()` para receber `@QueryParam` correspondentes.
  - Validar limites (size máximo).
  - **ADR-0006**: registrar a decisão completa.
- **Risco/observação**: maior item da lista. Provavelmente vai consumir uma sessão inteira. Filtros dinâmicos têm risco de injection se não restringir whitelist de campos — relacionado ao ponto 17.
- **Status**: pendente.

---

### 12. `UsuarioListDTO` — revisar campos expostos

- **Objetivo**: confirmar que o `ListDTO` expõe o mínimo necessário para a listagem (sem vazar `senhaHash`, e com `uuid` para navegação).
- **Contexto**: já adicionamos `uuid` no ponto 2. Falta revisar se a lista de campos atual (`uuid, nome, login, email, avatar`) é apropriada ou se deve incluir/excluir algo. Avatar em URL? Status (para filtrar inativos no frontend)?
- **Decisões necessárias**:
  - Manter `avatar` no listDTO ou só no editDTO?
  - Incluir `status` (já filtramos por `ATIVO` no `listarDTO()`, mas se um dia listarmos inativos, precisa)?
- **Escopo de mudança**: pequeno; ajustar o record.
- **Status**: pendente (provavelmente não precisará de ADR — decisão pequena por entidade).

---

### 14. Divergências DDL ↔ entidade (`version`, `created_at`, `updated_at`)

- **Objetivo**: alinhar `NOT NULL` entre as anotações JPA e a DDL.
- **Contexto**: `BaseEntity` declara `version`, `createdAt`, `updatedAt` como `nullable = false`. `V1__init.sql` declara essas colunas **sem** `NOT NULL`. Funciona em runtime (Hibernate preenche), mas é divergência documental que confunde leitura do SQL.
- **Decisões necessárias**: alinhar — adicionar `NOT NULL` na DDL. Não há discussão real, só execução.
- **Escopo de mudança**:
  - Em `V1__init.sql` (diretiva temporária permite editar o V1):
    ```sql
    version    BIGINT       NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP    NOT NULL,
    ```
- **Status**: pendente. Item pequeno, sem ADR.

---

### 15. `senhaHash VARCHAR(100)` → `VARCHAR(255)`

- **Objetivo**: prevenir estouro de coluna se o algoritmo de hash mudar.
- **Contexto**: BCrypt gera ~60 chars; 100 cabe. Se migrarmos para Argon2 (mais longo), estoura. `VARCHAR(255)` é o padrão defensivo, sem custo real.
- **Escopo de mudança**: `V1__init.sql` → `senha_hash VARCHAR(255) NOT NULL`.
- **Status**: pendente. Item pequeno, sem ADR. Pode entrar junto com o ponto 14.

---

### 16. Índice parcial em `status = 'ATIVO'`

- **Objetivo**: otimizar listagens que filtram sempre `status = ATIVO`.
- **Contexto**: `BaseService.listarDTO()` filtra `status = ATIVO`. Em tabelas com muitos inativos, índice parcial ajuda. Discussão pertinente como **padrão para todas as tabelas** ou só onde a cardinalidade justificar.
- **Decisões necessárias**:
  - Criar índice parcial padrão em todas as tabelas (regra geral), ou caso a caso?
  - Faz parte do padrão de "criar tabela" deste projeto?
- **Recomendação prévia**: **caso a caso**. Em tabelas pequenas (`tb_usuario` raramente passa de centenas), o índice é desperdício de manutenção. Criar índice parcial só quando o `EXPLAIN` mostrar problema real.
- **Escopo de mudança**: documentar a regra no `AGENTS.md` ("avalie criar índice parcial em `status` se a tabela for grande e a leitura de ativos for hot path").
- **Status**: pendente. Provavelmente vira nota no `AGENTS.md`, sem ADR.

---

### 17. `BaseService.atualizar(Long, Map<String,Object>)` — risco de injection

- **Objetivo**: eliminar superfície de risco de injeção HQL/JPQL.
- **Contexto**: `BaseService.java:42-55` constrói query concatenando chaves do `Map` (`key + " = :" + key`). Se um dia o `Map` vier de input externo (PATCH dinâmico), abre porta para injection. Hoje não está exposto no `BaseRest`, mas o método existe.
- **Decisões necessárias**:
  - **A) Remover o método**: mais seguro. Quando precisarmos de PATCH, criamos endpoint específico com whitelist de campos.
  - **B) Manter, mas validar `key` contra whitelist** (`Set<String>` de campos permitidos, idealmente derivado por reflexão).
  - **C) Manter e marcar como `@Deprecated` + Javadoc proibindo uso com input externo**.
- **Recomendação prévia**: **A — remover**. Não está sendo usado, e quando precisarmos a forma certa é endpoint dedicado.
- **Escopo de mudança**: deletar método e qualquer referência (não há).
- **Status**: pendente. Sem ADR (limpeza simples).

---

## Itens que podem entrar em paralelo (sem dependência)

- **14** (DDL NOT NULL) e **15** (senhaHash 255) podem ser feitos juntos em uma migração de uma linha cada.
- **17** (remover método inseguro) é independente.

## Dependências entre itens

```
7 (paginação) → independente, mas grande

12, 14, 15, 16, 17 → independentes, pequenos

```

## Ordem sugerida de execução

1. **14**, **15** — DDL NOT NULL + `senha_hash VARCHAR(255)` (rápidos, juntos)
2. **17** — Remover `atualizar(Long, Map)` (rápido)
3. **12** — Revisar `UsuarioListDTO` (rápido)
4. **16** — Índice parcial (provavelmente vira só nota no `AGENTS.md`)
5. **7** — Paginação, ordenação e filtros (sessão dedicada)

## Agrupamento sugerido em sessões do agente

Estratégia para preservar a qualidade da análise do agente de IA, evitando contexto inchado em sessões longas. Cada sessão deve ser **iniciada do zero**, com prompt direto referenciando este plano e as pendências a tratar. Toda a "memória" necessária está nos ADRs, no `AGENTS.md` e neste plano — o agente relê sob demanda.

| Sessão  | Pendências                                  | Natureza                                  | Por que agrupar (ou isolar)                                                                          |
|---------|---------------------------------------------|-------------------------------------------|------------------------------------------------------------------------------------------------------|
| **S1**  | **#14** + **#15** + **#17** + **#12** + **#16** | Mecânicas, agrupadas                  | Itens pequenos, baixo risco, sem ADR (ou só nota no `AGENTS.md`). Lote eficiente.                    |
| **S2**  | **#7**                                      | Maior item, ADR próprio                   | Paginação/ordenação/filtros é a maior decisão restante. Sessão dedicada e provavelmente longa.       |

### Diretrizes para abrir uma nova sessão

- **Prompt inicial padrão**: *"Leia o documento `backend-quarkus/doc/planos/0001-padronizacao-crud-backend.md` e vamos prosseguir com a(s) pendência(s) **#N** (e **#M**). Quero discutir as opções antes de implementar."*
- **Não recontar o histórico** ao agente — está nos ADRs (`doc/adr/`) e no `AGENTS.md`. O agente lê sob demanda.
- **Atualizar este plano ao final de cada sessão**: mover a pendência para "Concluídos", registrar ADR criado (se houver), atualizar a data no cabeçalho.

### Quando consolidar em uma única sessão (exceções)

- Trabalho **iniciado e incompleto** que exige continuidade direta.
- Decisão pendente que depende de discussão recente **ainda não registrada em ADR**.
- Itens muito pequenos (uma ou duas edições) onde o overhead de reiniciar não compensa.

## Concluídos

| #  | Item                                                              | Data       | Onde foi registrado |
|----|-------------------------------------------------------------------|------------|---------------------|
| 1  | Padrão de nomenclatura `*Rest`                                    | 2026-05-26 | ADR-0001            |
| 2  | UUID como identificador público                                   | 2026-05-26 | ADR-0002            |
| 3  | `EditDTO` único de formulário + dívida da senha temporária        | 2026-05-26 | ADR-0003            |
| 4  | `@Enumerated(EnumType.STRING)` + `status VARCHAR(20)`             | 2026-05-26 | `AGENTS.md`         |
| 9  | Create vs Update DTO — opções para divergência futura de validação | 2026-06-03 | Plano 0001 (sem ADR; tratar caso a caso) |
| 13 | `@Valid` no controller e no service                               | 2026-06-03 | Código (`BaseRest` + `BaseService`; sem ADR) |
| 5  | RFC 7807 — Problem Details para erros HTTP                        | 2026-05-27 | ADR-0004            |
| 6  | Hard delete (`DELETE /{uuid}`) removido do `BaseRest`             | 2026-05-28 | ADR-0005            |
| 8  | OpenAPI/Swagger (dev e prod) + não versionar CRUD interno         | 2026-05-28 | ADR-0006            |
| 10 | Bug `excluirPorUUID(Long → String)`                               | 2026-05-26 | (corrigido junto com #2) |
| 11 | Mensagem "Senha fraca" em check de e-mail duplicado               | 2026-05-26 | (removido junto com #3) |
| 18 | `@Produces` explícito no `BaseRest` + `@Consumes` apenas em `POST`/`PUT` | 2026-06-04 | ADR-0007 |
