# Backend API Project Guidelines: Quarkus Enterprise Best Practices

You are an expert Java engineer and developer specializing in high-performance enterprise applications. You write clean, scalable, and maintainable backend code.

## Core Stack & Tooling
- **Language**: Java 25. You MUST utilize modern Java features where applicable (Records, Pattern Matching, Switch Expressions, Virtual Threads).
- **Framework**: Quarkus (v3.34+).
- **Dependency Management**: Maven

## Database & ORM
- **Database**: PostgreSQL.
- **ORM**: Use Hibernate ORM with Panache. Prefer the Repository Pattern (`PanacheRepository`) over Active Record for better separation of concerns in enterprise environments.
- **Migration Standard**: Flyway is the official and mandatory database migration tool for this project.
- **CRITICAL CONFIGURATION WARNING**: The property `quarkus.hibernate-orm.database.generation` is DEPRECATED in Quarkus 3.34+. You MUST NOT use or suggest this property. Rely strictly on Flyway for schema management.

### Schemas
- **Schema Strategy**: The application uses multiple PostgreSQL schemas to physically segregate modules. The `public` schema MUST NOT be used.
- **Technical Schema (`core`)**: Reserved for cross-cutting infrastructure objects. It hosts:
  - `flyway_schema_history` (Flyway control table for the entire application).
  - `global_id_seq` (application-wide PK sequence — see note below).
  - Any future shared technical artifacts (e.g., utility functions, audit tables).
- **Functional Schemas**: One schema per functional module, matching the module package name under `modules.[functional_area]`:
  - `iam` → entities of `modules.iam.*`
  - `crm` → entities of `modules.crm.*`
  - `estoque` → entities of `modules.estoque.*`
  - New modules MUST follow the same 1:1 mapping (module name = schema name).
- **Flyway Configuration**: `quarkus.flyway.schemas` MUST list every schema managed by the application, starting with `core`. The property `quarkus.flyway.default-schema=core` ensures the Flyway history table lives in `core`. Use `quarkus.flyway.create-schemas=true` so missing schemas are created automatically.
- **Migration Rules**:
  - Every `CREATE TABLE`, `CREATE INDEX`, `CREATE SEQUENCE`, etc. in migrations MUST be schema-qualified (e.g., `iam.tb_usuario`, `core.global_id_seq`).
  - Never rely on `search_path` or implicit schema resolution in migrations.
- **Entity Mapping**: Every JPA entity MUST declare its schema explicitly via `@Table(name = "...", schema = ...)`. Do not set a global `quarkus.hibernate-orm.database.default-schema`; schema ownership belongs to each entity.
- **Schema Constants (`common.DbSchemas`)**: Schema names MUST NOT be hardcoded as string literals inside entities or other JPA annotations. Always reference the constants in `common.DbSchemas` (e.g., `DbSchemas.IAM`, `DbSchemas.CORE`). When a new module/schema is introduced, add a new `public static final String` to `DbSchemas` and reuse it everywhere. This rule applies to `@Table`, `@SequenceGenerator`, `@TableGenerator`, `@SecondaryTable`, and any other JPA annotation that accepts a `schema` attribute.

### Global ID Sequence
- The application uses a **single shared sequence**, `core.global_id_seq`, as the PK source for every entity that extends `BaseEntity`.
- **Rationale**: produces globally unique IDs across all modules/schemas, simplifying logging, auditing, integrations, and inter-module references. The numeric "waste" is negligible for `BIGINT`.
- **Location**: lives in the `core` schema (transversal, not owned by any business module).
- **JPA wiring**: `BaseEntity` declares `@SequenceGenerator(sequenceName = "global_id_seq", schema = "core", allocationSize = 20)`. The `allocationSize` MUST stay aligned with the `CACHE` value of the PostgreSQL sequence to avoid ID gaps or collisions.
- **Do NOT** create per-schema or per-entity sequences; always reuse `core.global_id_seq`.

## Flyway
- **Location**: Versioned migrations MUST be created under `src/main/resources/db/migration`.
- **Naming Pattern**: All versioned migrations MUST follow the pattern `V<versao>__<tipo>_<acao_objeto>.sql`.
- **Repeatable Migrations**: If repeatable migrations are introduced, they MUST follow Flyway's native `R__<descricao>.sql` convention. The `V<versao>__<tipo>_<acao_objeto>.sql` pattern applies only to versioned migrations.
- **Naming Examples**:
  - `V2__ddl_create_usuario_table.sql`
  - `V3__ddl_add_index_usuario_login.sql`
  - `V4__dml_seed_usuario_admin.sql`
- **Migration Types**:
  - `ddl`: Use for structural database changes such as table, column, index, constraint, and sequence creation or alteration.
  - `dml`: Use for controlled data changes such as seed data, corrective updates, and backfills.
- **Content Rule**: Do not mix `ddl` and `dml` responsibilities in the same migration unless there is a strong and explicit justification.
- **Temporary Project-Phase Directive (initial stage)**: The project is currently in its initial phase and no migration has been executed yet in any environment. While this phase lasts, DO NOT create new versioned migrations for schema changes to entities already defined in `V1__init.sql`. Instead, adjust the table definitions directly inside `V1__init.sql`. New migrations (`V2__...`, `V3__...`, etc.) should only start being created after the first deployment/execution of `V1__init.sql` in any shared environment. This directive is temporary and must be removed once the project leaves the initial phase.

## API Standards
- **Data Transfer**: Never expose JPA Entities directly in REST resources. Always use DTOs (implemented as Java Records).
- **RFC 7807 (Problem Details)**: ALL HTTP errors and API exceptions MUST adhere to the **RFC 7807** standard (Problem Details for HTTP APIs). The canonical payload is `infra.exception.ProblemDetails` and the official media type is `application/problem+json` (constant `ProblemDetails.MEDIA_TYPE`). All `ExceptionMapper` implementations live in `infra.exception.*ExceptionMapper`, one per exception type; new exceptions that surface to the client MUST get a dedicated mapper (or fall through the `WebApplicationException` / `Throwable` catch-alls already in place). The `type` field uses `about:blank` until problem URIs are published; `instance` is currently left `null`. See [ADR-0004](doc/adr/0004-rfc-7807-problem-details-para-erros-http.md).
- **Public Identifier**: `uuid` is the public identifier exposed in URLs (`/usuario/{uuid}`) and DTOs. The numeric `id` is strictly internal (PK, FKs, joins, technical logs) and MUST NOT appear in REST paths or response payloads. List DTOs MUST include `uuid` so clients can reference the resource. See [ADR-0002](doc/adr/0002-uuid-como-identificador-publico.md).
- **DTO Roles**: `ListDTO` is used for listings (`GET /`), `EditDTO` is the single form DTO used both for input (`POST`, `PUT /{uuid}`) and for populating the edit form on read (`GET /{uuid}` returns the `EditDTO`). Sensitive or write-only fields (e.g., passwords) MUST NOT live in `EditDTO`; they are handled by dedicated endpoints. See [ADR-0003](doc/adr/0003-editdto-como-dto-unico-de-formulario.md).

## Architecture and Structure

All business logic lives under `src/main/java/modules/{functional_area}/{sub_area}/`. Each module follows this layout (using `usuario` as the reference example):

```
modules/iam/usuario/
├── Usuario.java            # JPA entity (extends BaseEntity)
├── UsuarioRepository.java  # Extends BaseRepository<Usuario>
├── UsuarioService.java     # Extends BaseService, @ApplicationScoped
├── UsuarioRest.java        # Extends BaseRest, JAX-RS @Path
└── dto/
    ├── UsuarioEditDTO.java # Input DTO (use Java Records)
    ├── UsuarioListDTO.java # Output DTO (use Java Records)
    └── UsuarioMapper.java  # MapStruct interface
```

- **Modular Approach**: Organize code into modules under `src/main/java/modules/`. Each module should represent a functional area (e.g., `iam`, `atendimento`).
- **Standard Layers**: Each entity should follow a consistent layer pattern:
    - `Entity`: Extending `common.BaseEntity`.
    - `Repository`: Interface extending `common.BaseRepository<Entity>`.
    - `Service`: Class extending `common.BaseService<Entity, EditDTO, ListDTO>`.
    - `Rest`: Class extending `common.BaseRest<Entity, EditDTO, ListDTO>`.
    - `DTOs`: Specifically `EditDTO` for creation/updates and `ListDTO` for listings.
    - `Mapper`: MapStruct interface extending `common.BaseMapper<Entity, EditDTO>`.

## Common Base Components

Bases classes are located in `src/main/java/common/`.

- **BaseEntity**: Provides `id`, `uuid`, `version`, `createdAt`, and `updatedAt`. Use `@PrePersist` and `@PreUpdate` for timestamps.
- **BaseRepository**: Leverages Quarkus Panache for data access. Panache repository interface (Repository Pattern, not Active Record)
- **BaseService**: Implements common CRUD operations. Requires implementations of `mapper()`, `repository()`, and `listDTO()`.
- **BaseRest**: Provides standard JAX-RS endpoints (`GET /`, `GET /{uuid}`, `POST /`, `PUT /{uuid}`, `DELETE /inativar/{uuid}`). The generic CRUD exposes **only soft delete** (`status = INATIVO`) via `DELETE /inativar/{uuid}`; **hard delete is NOT exposed by `BaseRest`**. The internal method `BaseService#excluirPorUUID` remains available for the rare cases where an entity-specific `*Rest` truly needs physical deletion — in that case, the endpoint MUST be declared explicitly in the concrete `*Rest`, with its own path and (when applicable) role-based restriction. See [ADR-0005](doc/adr/0005-remocao-do-hard-delete-no-baserest.md).
- **BaseMapper**: Provides MapStruct base interface

## Coding Standards
- **Dependency Injection**: Use `@Inject` for CDI. Prefer constructor injection in Rest classes if needed, or field injection in Services.
- **Scopes**: Services should be `@ApplicationScoped`.
- **Transactions**: Use `@Transactional` for methods that modify the database (usually in Service layer).
- **Mapping**: Use MapStruct for DTO-Entity conversions. Ensure `componentModel = "cdi"` is set.
- **Validation**: Use Jakarta Bean Validation annotations (e.g., `@Valid`, `@NotBlank`) on DTOs.
- **Response Handling**:
    - Prefer returning DTOs directly in Rest classes (Quarkus handles JSON serialization).
    - Throw `NotFoundException` or other JAX-RS exceptions for error states.
- **Statuses**: Use `common.EnumStatusEntity` (`ATIVO`, `INATIVO`) for soft deletes/record status.
- **Enum Mapping**: Every JPA enum field MUST be annotated with `@Enumerated(EnumType.STRING)`. `EnumType.ORDINAL` is forbidden (fragile against enum refactoring, illegible in the database).

## Naming Conventions
- Modules: `modules.[functional_area].[sub_area]` (e.g., `modules.iam.usuario`).
- Entities: Singular PascalCase (e.g., `Usuario`).
- Repositories: `[Entity]Repository`.
- Services: `[Entity]Service`.
- Rest: `[Entity]Rest`.
- DTOs: `[Entity][Purpose]DTO` (e.g., `UsuarioEditDTO`, `UsuarioListDTO`).
- Mappers: `[Entity]Mapper`.

## Validation Execution
- Tests and compilation for verification and validation MUST be executed only when explicitly requested.

## Workflow Restrictions
- Do NOT run build or compile commands (`./mvnw package`, `./mvnw verify`, etc.) unless explicitly requested.

> Git workflow restrictions (branches, PRs/MRs, commits) are defined globally in the root `AGENTS.md`.

## Architecture Decision Records (ADRs)

Non-trivial architectural decisions MUST be recorded as ADRs in [`doc/adr/`](doc/adr/README.md) **before** the corresponding code change is merged. The directory's `README.md` defines the criteria, format (Nygard classic, Portuguese) and the numbering convention. Accepted ADRs are immutable; superseding decisions create a new ADR.

When a change in this `AGENTS.md` reflects a deliberate architectural decision, the change MUST be accompanied by a new ADR, and the relevant section here SHOULD link to it.
