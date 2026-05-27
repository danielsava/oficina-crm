# ADR-0002: UUID como identificador público em URLs e DTOs

- **Status**: Accepted
- **Data**: 2026-05-26

## Contexto

Toda entidade que estende `BaseEntity` tem dois identificadores:

- `id` (`Long`) — gerado pela sequence global `core.global_id_seq`, usado como PK e em FKs.
- `uuid` (`UUID`) — gerado no `@PrePersist`, único e indexado.

Era necessário decidir **qual deles trafega na API pública** (URLs JAX-RS e payloads de DTOs) e qual permanece estritamente interno. A decisão impacta o `BaseRest`, todos os `*Rest` concretos e todos os `*ListDTO` / `*EditDTO`.

Antes desta decisão, o `BaseRest` misturava os dois: a maioria dos endpoints usava `{id}` (Long), mas o endpoint de inativação tinha duas variantes (`/inativar/id/{id}` e `/inativar/uuid/{uuid}`), o que era inconsistente e duplicava superfície de API.

## Decisão

Adotamos **`uuid` como identificador público** em URLs e DTOs. O `id` numérico fica **estritamente interno** (PK, FKs, joins, queries técnicas, logs).

Regra prática:

| Contexto                                   | Identificador |
|--------------------------------------------|---------------|
| URLs públicas (`/usuario/{xxx}`)           | `uuid`        |
| Payload JSON exposto ao cliente (DTOs)     | `uuid`        |
| FK entre tabelas                           | `id`          |
| Joins, queries internas, logs técnicos     | `id`          |
| Auditoria, integrações externas, links     | `uuid`        |

Endpoints padronizados no `BaseRest`:

- `GET /`              → lista
- `GET /{uuid}`        → busca
- `POST /`             → cria
- `PUT /{uuid}`        → atualiza
- `DELETE /inativar/{uuid}` → soft delete
- `DELETE /{uuid}`     → hard delete

Endpoints duplicados (`/inativar/id/{id}` + `/inativar/uuid/{uuid}`) foram consolidados em **um único** endpoint por UUID.

Todos os `*ListDTO` MUST incluir `uuid` como primeiro campo, para que o cliente consiga referenciar o recurso após a listagem.

## Consequências

### Positivas

- **Mitiga enumeração**: `id` sequencial vaza volume e taxa de crescimento do negócio (quantos usuários, ordens de serviço por dia). UUID v4 elimina essa janela.
- **Mitiga IDOR trivial** (OWASP API1): UUID não é adivinhável. Não substitui autorização correta, mas remove a parte mais óbvia do ataque.
- **Desacopla a API da estratégia de PK**: futuras mudanças (sharding, particionamento, consolidação de bases) não quebram contratos públicos.
- **Seguro para integrações externas**: webhooks, links em e-mail, QR codes não vazam estrutura interna.
- **API uniforme**: um único endpoint para inativação, não dois. Menos superfície, menos confusão.

### Negativas

- **Pior DX em testes manuais**: `curl -X GET /usuario/e3b0c442-98fc-1c14-9afb-...` é menos confortável do que `/usuario/1`. Mitigação: bons seeds, Swagger funcional (ADR futuro), variáveis em coleções Postman/HTTPie.
- **Logs ligeiramente mais verbosos**: UUID ocupa mais espaço que Long. Mitigação: logs técnicos continuam usando `id` (regra interna).
- **Queries por UUID são marginalmente mais caras**: índice em UUID é maior que em BIGINT. Impacto desprezível em escala atual; mitigado pelo índice único já existente em `uuid`.

### Neutras

- O `BaseService` continua expondo variantes por `id` (`buscarPorId`, `inativarPorId`, etc.) para **uso interno** (jobs, integrações entre módulos, testes). Elas não são chamadas pelo `BaseRest` mas permanecem disponíveis.

## Alternativas consideradas

- **`id` (Long) público**: descartado pelos riscos de enumeração, IDOR e acoplamento da API à PK interna.
- **IDs ofuscados (Hashids, Sqids, ULID)**: introduzem complexidade extra (codec, biblioteca, possível colisão), sem vantagem clara sobre UUID para este caso. UUID já é nativo do JDK e do PostgreSQL.
- **Slug** (ex.: `/usuario/joao-silva`): viável em entidades com nome único e estável, mas inadequado como padrão genérico do CRUD (a maioria das entidades não tem identificador natural humano).

## Referências

- `common.BaseRest` — implementação dos endpoints por UUID.
- `common.BaseService` — variantes `*PorUUID` (públicas via REST) e `*PorId` (internas).
- `backend-quarkus/AGENTS.md` — seção *API Standards*, regra "Public Identifier".
- OWASP API Security Top 10 — API1: Broken Object Level Authorization.
