# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Oficina CRM** is a full-stack monorepo CRM system for automotive repair shops. It has two active parts:

- `backend-quarkus/` — Quarkus 3 + Java 25 REST API
- `frontend-ultima/` — Angular 21 + PrimeNG + Tailwind CSS frontend

> **`/frontend-angular` is a deprecated legacy frontend. Never read, search, or suggest modifications to it.**

---

## Commands

### Backend (`backend-quarkus/`)

```bash
# Start dev server with live reload
./mvnw quarkus:dev

# Build
./mvnw package

# Run tests
./mvnw test
```

### Database (PostgreSQL via Docker)

```bash
# From project root
docker compose -f compose-postgres.yml up -d
docker compose -f compose-postgres.yml stop
docker compose -f compose-postgres.yml down -v   # destroys volumes
```

Connection: `jdbc:postgresql://localhost:5432/oficina-crm` / user: `user` / password: `123456`

### Frontend (`frontend-ultima/`)

```bash
npm start          # dev server
npm run build      # production build
npm test           # unit tests
npm run format     # Prettier formatting
```

---

## Backend Architecture

### Module Structure

All business logic lives under `src/main/java/modules/{functional_area}/{sub_area}/`. Each module follows this layout (using `usuario` as the reference example):

```
modules/iam/usuario/
├── Usuario.java            # JPA entity (extends BaseEntity)
├── UsuarioRepository.java  # Extends BaseRepository<Usuario>
├── UsuarioService.java     # Extends BaseService, @ApplicationScoped
├── UsuarioController.java  # Extends BaseController, JAX-RS @Path
└── dto/
    ├── UsuarioEditDTO.java # Input DTO (use Java Records)
    ├── UsuarioListDTO.java # Output DTO (use Java Records)
    └── UsuarioMapper.java  # MapStruct interface
```

### Base Classes (`src/main/java/common/`)

- `BaseEntity` — provides `id` (Long), `uuid` (UUID), `version`, `createdAt`, `updatedAt`
- `BaseRepository<T>` — Panache repository interface (Repository Pattern, not Active Record)
- `BaseService` — common CRUD operations
- `BaseController` — standard JAX-RS endpoints
- `BaseMapper` — MapStruct base interface

### Key Rules

- **Java 25 features are mandatory**: Records, Pattern Matching, Switch Expressions, Virtual Threads
- **Never expose JPA entities in REST responses** — always use DTOs (Records preferred)
- **All data mutations must use `@Transactional`**
- **Flyway is required for all schema changes** — never use `hibernate-orm.database.generation`
- **Error responses must follow RFC 7807** (Problem Details for HTTP APIs)
- **DTOs**: `[Entity]EditDTO` for create/update input, `[Entity]ListDTO` for list responses

### Flyway Migration Naming

```
V<version>__<type>_<description>.sql

Types:
  ddl  → structural changes (tables, columns, indexes, constraints)
  dml  → data changes (seed data, updates)

Examples:
  V2__ddl_create_usuario_table.sql
  V4__dml_seed_usuario_admin.sql
```

---

## Frontend Architecture

### Module Structure

Feature modules live under `src/app/modules/{domain}/{sub-feature}/`:

```
modules/iam/usuarios/
├── usuario-table.component.ts   # List view
├── usuario-form.component.ts    # Create/edit form
├── usuario.model.ts
├── usuario.service.ts
└── usuario.routes.ts            # Lazy-loaded routes
```

`src/app/core/` — singleton services, guards, interceptors  
`src/app/shared/` — reusable "dumb" components, directives, pipes  
`src/app/layout/` — global layout (AppLayout, Topbar, Menu, Sidebar)

### Key Rules

- **Standalone components only** — no NgModules
- **Strict TypeScript** — no `any`, no type assertions without justification
- **State via Angular Signals** — use `signal()` and `computed()`, not RxJS Subjects
- **Native control flow** — `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`
- **`OnPush` change detection** on all components
- **PrimeNG components** for all UI elements (`p-button`, `p-table`, `p-inputtext`, etc.)
- **Icons via Primeicons only** — no other icon libraries
- **Tailwind CSS** with `tailwindcss-primeui` plugin for styling; semantic theme colors preferred
- **Dark mode** supported via `app-dark` selector
- **Accessibility**: must pass AXE checks and meet WCAG AA minimums
- **Reactive Forms** for all forms
- **No `@HostBinding`/`@HostListener`** — use `host` metadata in `@Component` instead
