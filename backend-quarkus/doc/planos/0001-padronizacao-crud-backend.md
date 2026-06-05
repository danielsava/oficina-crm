# Plano de Padronização do CRUD — Backend (Pendências)

> **Status**: vivo (editável conforme avançamos)
> **Última atualização**: 2026-06-04 (análise do #7 concluída — paginação/ordenação/filtros: decisões consolidadas em sessão dedicada (S1), implementação delegada ao plano [`0002-paginacao-ordenacao-filtros-backend.md`](0002-paginacao-ordenacao-filtros-backend.md) (modo básico) e plano [`0003-busca-avancada-backend.md`](0003-busca-avancada-backend.md) (modo avançado, apenas planejamento por enquanto); concluído #12 — `UsuarioListDTO` mantido como está; ADR-0002 reafirmado (não expor `id` numérico), `status` e `avatar` mantidos conforme atual; concluído #14 — `NOT NULL` adicionado em `version`, `created_at` e `updated_at` em `V1__init.sql`, alinhando DDL com `BaseEntity`; concluído #18 — `@Produces` explícito no `BaseRest` e `@Consumes` apenas em `POST`/`PUT`, registrado na ADR-0007; concluído #17 — remoção do método inseguro `BaseService.atualizar(Long, Map<String,Object>)`; concluído #16 — índice parcial em `status = 'ATIVO'` adotado como decisão caso a caso, registrado na ADR-0008 e no `AGENTS.md`; concluído #15 — `senha_hash` ampliado para `VARCHAR(255)` em `V1__init.sql`; concluídos #9 — opções para divergência futura registradas como referência; #13 — `@Valid` duplicado em `Rest` e `Service`)
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
| 17 | Remoção do método inseguro `BaseService.atualizar(Long, Map<String,Object>)` | Código (`BaseService`; sem ADR)                               |
| 16 | Índice parcial em `status = 'ATIVO'` avaliado caso a caso, não como padrão | ADR-0008 + `AGENTS.md`                                      |
| 15 | `senha_hash` ampliado para `VARCHAR(255)` em `V1__init.sql`        | Migração (`V1__init.sql`; sem ADR)                                    |
| 14 | `NOT NULL` em `version`, `created_at`, `updated_at` em `V1__init.sql` | Migração (`V1__init.sql`; sem ADR)                              |
| 12 | `UsuarioListDTO` — campos expostos revisados (sem mudança)        | Plano 0001 (ADR-0002 reafirmado; sem novo ADR)                        |
| 7  | Paginação, ordenação e filtros — modo básico implementado         | Decisões consolidadas, implementação concluída via plano [`0002`](0002-paginacao-ordenacao-filtros-backend.md) e registrada na [ADR-0009](../adr/0009-paginacao-ordenacao-filtros-no-baserest.md). Modo avançado segue em [`0003`](0003-busca-avancada-backend.md). |

---

## Pendências (ordem recomendada)

> Não há pendências de análise neste plano. A última (item #7) teve as decisões consolidadas na sessão S1 e a implementação foi delegada a planos próprios:
>
> - [`0002-paginacao-ordenacao-filtros-backend.md`](0002-paginacao-ordenacao-filtros-backend.md) — modo básico (paginação + ordenação + filtros por coluna), pronto para implementação.
> - [`0003-busca-avancada-backend.md`](0003-busca-avancada-backend.md) — modo avançado (POST `/buscar` com `FiltroDTO`), apenas planejamento; implementação só quando o desenho do frontend exigir.

---

## Agrupamento sugerido em sessões do agente

Estratégia para preservar a qualidade da análise do agente de IA, evitando contexto inchado em sessões longas. Cada sessão deve ser **iniciada do zero**, com prompt direto referenciando este plano e as pendências a tratar. Toda a "memória" necessária está nos ADRs, no `AGENTS.md` e neste plano — o agente relê sob demanda.

| Sessão  | Pendências | Natureza                       | Por que agrupar (ou isolar)                                                                          |
|---------|------------|--------------------------------|------------------------------------------------------------------------------------------------------|
| **S1**  | **#7**     | Maior item, ADR próprio        | Paginação/ordenação/filtros — sessão dedicada concluída. Análise consolidada nos planos 0002 e 0003. |

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
| 17 | Remoção do método inseguro `BaseService.atualizar(Long, Map<String,Object>)` | 2026-06-04 | Código (`BaseService`; sem ADR) |
| 16 | Índice parcial em `status = 'ATIVO'` avaliado caso a caso, não como padrão | 2026-06-04 | ADR-0008 + `AGENTS.md` |
| 15 | `senha_hash` ampliado para `VARCHAR(255)` em `V1__init.sql`        | 2026-06-04 | Migração (`V1__init.sql`; sem ADR) |
| 14 | `NOT NULL` em `version`, `created_at`, `updated_at` em `V1__init.sql` | 2026-06-04 | Migração (`V1__init.sql`; sem ADR) |
| 12 | `UsuarioListDTO` — campos expostos revisados (sem mudança)        | 2026-06-04 | Plano 0001 (ADR-0002 reafirmado; sem novo ADR) |
| 7  | Paginação, ordenação e filtros — modo básico implementado         | 2026-06-04 | Implementação concluída via [`0002-paginacao-ordenacao-filtros-backend.md`](0002-paginacao-ordenacao-filtros-backend.md), registrada na [ADR-0009](../adr/0009-paginacao-ordenacao-filtros-no-baserest.md). Modo avançado segue em [`0003-busca-avancada-backend.md`](0003-busca-avancada-backend.md). |
