# Backend API Project Guidelines: Quarkus Enterprise Best Practices

You are an expert Java engineer and developer specializing in high-performance enterprise applications. You write clean, scalable, and maintainable backend code.

## Core Stack & Tooling
- **Language**: Java 25. You MUST utilize modern Java features where applicable (Records, Pattern Matching, Switch Expressions, Virtual Threads).
- **Framework**: Quarkus (v3.34+).
- **Dependency Management**: Maven

## Database & ORM
- **Database**: PostgreSQL.
- **ORM**: Use Hibernate ORM with Panache. Prefer the Repository Pattern (`PanacheRepository`) over Active Record for better separation of concerns in enterprise environments.
- **CRITICAL CONFIGURATION WARNING**: The property `quarkus.hibernate-orm.database.generation` is DEPRECATED in Quarkus 3.34+. You MUST NOT use or suggest this property. Rely strictly on migration tools (e.g., Flyway or Liquibase) for schema management.

## API Standards
- **Data Transfer**: Never expose JPA Entities directly in REST controllers. Always use DTOs (implemented as Java Records).
- **RFC 7807 (Problem Details)**: ALL HTTP errors and API exceptions MUST adhere to the **RFC 7807** standard (Problem Details for HTTP APIs).

## Architecture and Structure
- **Modular Approach**: Organize code into modules under `src/main/java/modules/`. Each module should represent a functional area (e.g., `iam`, `atendimento`).
- **Standard Layers**: Each entity should follow a consistent layer pattern:
    - `Entity`: Extending `common.BaseEntity`.
    - `Repository`: Interface extending `common.BaseRepository<Entity>`.
    - `Service`: Class extending `common.BaseService<Entity, EditDTO, ListDTO>`.
    - `Controller`: Class extending `common.BaseController<Entity, EditDTO, ListDTO>`.
    - `DTOs`: Specifically `EditDTO` for creation/updates and `ListDTO` for listings.
    - `Mapper`: MapStruct interface extending `common.BaseMapper<Entity, EditDTO>`.

## Common Base Components
- **BaseEntity**: Provides `id`, `uuid`, `version`, `createdAt`, and `updatedAt`. Use `@PrePersist` and `@PreUpdate` for timestamps.
- **BaseRepository**: Leverages Quarkus Panache for data access.
- **BaseService**: Implements common CRUD operations. Requires implementations of `mapper()`, `repository()`, and `listDTO()`.
- **BaseController**: Provides standard JAX-RS endpoints (`GET /`, `GET /{id}`, `POST /`, `DELETE /inativar/id/{id}`, etc.).

## Coding Standards
- **Dependency Injection**: Use `@Inject` for CDI. Prefer constructor injection in Controllers if needed, or field injection in Services.
- **Scopes**: Services should be `@ApplicationScoped`.
- **Transactions**: Use `@Transactional` for methods that modify the database (usually in Service layer).
- **Mapping**: Use MapStruct for DTO-Entity conversions. Ensure `componentModel = "cdi"` is set.
- **Validation**: Use Jakarta Bean Validation annotations (e.g., `@Valid`, `@NotBlank`) on DTOs.
- **Response Handling**:
    - Prefer returning entities or DTOs directly in Controllers (Quarkus handles JSON serialization).
    - Throw `NotFoundException` or other JAX-RS exceptions for error states.
- **Statuses**: Use `common.EnumStatusEntity` (`ATIVO`, `INATIVO`) for soft deletes/record status.

## Naming Conventions
- Modules: `modules.[functional_area].[sub_area]` (e.g., `modules.iam.usuario`).
- Entities: Singular PascalCase (e.g., `Usuario`).
- Repositories: `[Entity]Repository`.
- Services: `[Entity]Service`.
- Controllers: `[Entity]Controller`.
- DTOs: `[Entity][Purpose]DTO` (e.g., `UsuarioEditDTO`, `UsuarioListDTO`).
- Mappers: `[Entity]Mapper`.