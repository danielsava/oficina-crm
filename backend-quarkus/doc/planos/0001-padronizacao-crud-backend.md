# Plano de Padronização do CRUD — Backend (Pendências)

> **Status**: vivo (editável conforme avançamos)
> **Última atualização**: 2026-05-26
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
| 10 | Bug `BaseService.excluirPorUUID(Long → String)`                   | Corrigido junto com o ponto 2                                          |
| 11 | Mensagem "Senha fraca" em check de e-mail duplicado               | Removido junto com o ponto 3 (trecho deletado)                         |

---

## Pendências (ordem recomendada)

### 5. RFC 7807 — Problem Details para erros HTTP

- **Objetivo**: padronizar todas as respostas de erro da API no formato RFC 7807 (`application/problem+json`).
- **Contexto**: o `AGENTS.md` exige RFC 7807 ("ALL HTTP errors and API exceptions MUST adhere"), mas hoje:
  - `NotFoundException` em `BaseRest` retorna apenas texto simples no body.
  - `ValidationException` lançada em services não é mapeada para um payload estruturado.
  - Erros de Bean Validation (`@Valid`) retornam o formato padrão do Quarkus, fora do contrato.
- **Decisões necessárias**:
  - Onde fica o pacote? Sugestão: `infra.exception` (já temos `infra.event`).
  - Estrutura do payload: `record ProblemDetails(URI type, String title, int status, String detail, URI instance, ...)`. Incluir campo de erros de validação por campo (`Map<String, List<String>> errors` ou estrutura tipada)?
  - URIs do campo `type`: usar URIs reais (`https://api.oficinacrm.com.br/problems/not-found`) ou `"about:blank"` (default RFC quando não há documentação de erro)?
  - Quais exceções mapear inicialmente? Mínimo recomendado:
    - `NotFoundException` → 404
    - `ConstraintViolationException` (Bean Validation) → 400
    - `ValidationException` → 400
    - `OptimisticLockException` → 409 (futuro)
    - `WebApplicationException` (catch-all JAX-RS) → status do exception
    - `Exception` (catch-all final) → 500
- **Escopo de mudança**:
  - Criar `infra/exception/ProblemDetails.java` (record).
  - Criar `infra/exception/*ExceptionMapper.java` por tipo (cada um `@Provider implements ExceptionMapper<X>`).
  - Ajustar `BaseRest`: pode parar de tratar `NotFoundException` manualmente (o mapper cuida), mas hoje a lógica é "se retornou null, lança NotFoundException" — manter.
  - Documentar no `AGENTS.md` o pacote e o contrato.
  - **ADR-0004**: registrar a decisão (formato, URIs, lista inicial de mappers).
- **Risco/observação**: o `quarkus-rest-jackson` já lida com a serialização do record; não precisa de dependência nova. O `Content-Type` precisa ser `application/problem+json`, configurado por mapper.
- **Status**: pendente.

---

### 6. Hard delete (`DELETE /{uuid}`) no `BaseRest` — manter, restringir ou remover?

- **Objetivo**: decidir o destino do endpoint de exclusão física da base genérica.
- **Contexto**: hoje `BaseRest` expõe `DELETE /{uuid}` que chama `excluirPorUUID` (delete físico no banco). Convive com `DELETE /inativar/{uuid}` (soft delete via `status = INATIVO`). Em sistema enterprise com auditoria, hard delete é geralmente proibido ou restrito a admin.
- **Decisões necessárias**:
  - Manter, restringir por papel (`@RolesAllowed("admin")`), ou remover da base genérica e expor caso a caso?
  - Se manter, qual o impacto em FKs (CASCADE? RESTRICT? hoje não há FKs ainda)?
  - Definição de "auditoria" — vamos manter histórico de inativações? (Influencia ponto 5 indiretamente, mas é mais um item futuro.)
- **Escopo de mudança**:
  - Se remover: deletar método `excluirPorUUID` de `BaseRest` (manter em `BaseService` como API interna).
  - Se restringir: adicionar dependência `quarkus-security` + anotar o método.
  - Atualizar `AGENTS.md` com a regra.
  - **ADR-0005**: registrar a decisão.
- **Recomendação prévia**: **remover do `BaseRest`** por enquanto. Soft delete é suficiente para o CRUD padrão; hard delete vira endpoint específico no `*Rest` da entidade que justificar (raríssimo).
- **Status**: pendente.

---

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

### 8. OpenAPI / Swagger

- **Objetivo**: expor contrato OpenAPI 3 automaticamente para o frontend e para testes manuais.
- **Contexto**: parte integral do "CRUD enterprise". O `quarkus-smallrye-openapi` integra-se nativamente.
- **Decisões necessárias**:
  - Habilitar Swagger UI em dev? Em prod (atrás de auth)?
  - Anotar DTOs com `@Schema` para documentação rica, ou aceitar o default?
  - Versionar a API no path (`/api/v1/...`)?
- **Escopo de mudança**:
  - Adicionar `quarkus-smallrye-openapi` ao `pom.xml`.
  - Configurar `application.properties` (path, info, server URL).
  - Adicionar `@Tag`, `@Operation` em `*Rest` (opcional inicialmente; defaults bastam).
  - **ADR-0007**: registrar a decisão (versionamento, exposição em prod, padrão de anotação).
- **Status**: pendente.

---

### 9. Create vs Update DTO — estratégia futura

- **Objetivo**: definir a estratégia para quando criação e atualização precisarem divergir.
- **Contexto**: ADR-0003 estabeleceu `EditDTO` único para criação e edição. Funciona enquanto os campos são iguais. Quando divergirem (campo `senha` que volta no fluxo dedicado, campos read-only no update, etc.), precisamos de mecanismo.
- **Decisões necessárias**:
  - **Grupos de validação Bean Validation**: `@NotBlank(groups = OnCreate.class)`, `@Validated(OnCreate.class)` no `*Rest`. Mantém DTO único, validação contextual.
  - **DTOs separados** (`UsuarioCreateDTO` / `UsuarioUpdateDTO`): mais explícito, mais boilerplate, quebra parcialmente o genérico.
  - **MapStruct com `@MappingTarget`**: já usamos (`updatedEntityFromDTO`). Resolve "campos que não devem ser sobrescritos no update".
- **Recomendação prévia**: adotar **grupos de validação** como padrão; DTOs separados só em casos extremos (forma muito divergente). Já temos exemplo do `login` ignorado no update via MapStruct (`UsuarioMapper.java:18`).
- **Escopo de mudança**:
  - Criar interfaces `common.validation.OnCreate` e `common.validation.OnUpdate`.
  - Documentar uso no `AGENTS.md`.
  - Aplicar como exemplo em `UsuarioEditDTO` (mesmo que hoje não diferencie, deixar pronto).
  - **ADR-0008**: registrar a decisão.
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

### 13. `@Valid` no controller vs service

- **Objetivo**: garantir que a validação Bean Validation dispare consistentemente.
- **Contexto**: hoje `@Valid` está em `BaseService.inserir(EditDTO)`. Funciona via interceptação CDI, mas o ponto canônico em JAX-RS é o `*Rest`. Hoje `BaseRest.inserir(EditDTO editDTO)` **não** tem `@Valid`.
- **Decisões necessárias**: mover, duplicar ou manter? Recomendação: **adicionar `@Valid` no `BaseRest`** (camada REST) e manter no service como segurança adicional. Validação em duas camadas é aceitável e barata.
- **Escopo de mudança**:
  - Adicionar `@Valid` em `BaseRest.inserir`, `BaseRest.atualizar`.
  - Resolve junto: erros de validação serão capturados pelo `ConstraintViolationExceptionMapper` do ponto 5.
- **Status**: pendente. **Dependente do ponto 5** (sem o mapper, validação no `*Rest` retorna 400 com payload inconsistente).

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

### 18. `@Produces` / `@Consumes` explícitos

- **Objetivo**: tornar o contrato HTTP explícito em vez de depender dos defaults Quarkus.
- **Contexto**: hoje `UsuarioRest` (e o `BaseRest`) não declaram `@Produces`/`@Consumes`. Funciona porque o Jackson é o default. Para enterprise + OpenAPI, explicitar melhora documentação e remove surpresas.
- **Decisões necessárias**:
  - Anotar no `BaseRest` (vale para todos os métodos) ou em cada método?
  - `application/json` apenas, ou também `application/problem+json` (para errors — relacionado ao ponto 5)?
- **Recomendação prévia**: anotar no `BaseRest` (class-level) com `@Produces(MediaType.APPLICATION_JSON)` e `@Consumes(MediaType.APPLICATION_JSON)`. Exception mappers do ponto 5 definem seu próprio `Content-Type` (`application/problem+json`).
- **Escopo de mudança**: 2 anotações no `BaseRest`.
- **Status**: pendente. Sem ADR (decisão técnica pequena).

---

## Itens que podem entrar em paralelo (sem dependência)

- **14** (DDL NOT NULL) e **15** (senhaHash 255) podem ser feitos juntos em uma migração de uma linha cada.
- **17** (remover método inseguro) é independente.
- **18** (`@Produces`/`@Consumes`) é independente.

## Dependências entre itens

```
5 (RFC 7807) ──┬─→ 13 (@Valid no controller, pois validation errors usam o mapper)
               └─→ 18 parcialmente (problem+json content-type)

7 (paginação) → independente, mas grande

8 (OpenAPI) → melhor depois de 5, 7, 18 (contrato fica completo)

9 (Create/Update validation groups) → independente; pode entrar antes ou depois de 5

6 (hard delete) → independente

12, 14, 15, 16, 17 → independentes, pequenos
```

## Ordem sugerida de execução

1. **5** — RFC 7807 (destrava 13 e parte de 18)
2. **6** — Hard delete (decisão de design, rápida)
3. **9** — Grupos de validação (padrão para o futuro, rápido)
4. **13** — `@Valid` no `*Rest` (rápido, depende de 5)
5. **18** — `@Produces`/`@Consumes` (rápido)
6. **14**, **15** — DDL NOT NULL + `senha_hash VARCHAR(255)` (rápidos, juntos)
7. **17** — Remover `atualizar(Long, Map)` (rápido)
8. **12** — Revisar `UsuarioListDTO` (rápido)
9. **16** — Índice parcial (provavelmente vira só nota no `AGENTS.md`)
10. **7** — Paginação, ordenação e filtros (sessão dedicada)
11. **8** — OpenAPI (fecha o contrato externo)

## Concluídos

| #  | Item                                                              | Data       | Onde foi registrado |
|----|-------------------------------------------------------------------|------------|---------------------|
| 1  | Padrão de nomenclatura `*Rest`                                    | 2026-05-26 | ADR-0001            |
| 2  | UUID como identificador público                                   | 2026-05-26 | ADR-0002            |
| 3  | `EditDTO` único de formulário + dívida da senha temporária        | 2026-05-26 | ADR-0003            |
| 4  | `@Enumerated(EnumType.STRING)` + `status VARCHAR(20)`             | 2026-05-26 | `AGENTS.md`         |
| 10 | Bug `excluirPorUUID(Long → String)`                               | 2026-05-26 | (corrigido junto com #2) |
| 11 | Mensagem "Senha fraca" em check de e-mail duplicado               | 2026-05-26 | (removido junto com #3) |
