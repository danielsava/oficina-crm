# Project AI Guidelines (Root): Enterprise Monorepo - AI Agent Routing Instructions 

You are an elite AI coding agent assisting a senior and engineer developer. This repository contains a full-stack enterprise application

## Project Overview

**Oficina CRM** is a full-stack monorepo CRM complete system for automotive repair shops. It has two active parts:

- `backend-quarkus/` — Backend API with Quarkus 3 + Java 25 REST API
- `frontend-ultima/` — Frontend Web with Angular 21 + PrimeNG + Tailwind CSS


## Project Structure

You MUST respect the directory boundaries and project structures. This repository is composed of:

- **Backend API**: Located strictly within `/backend-quarkus`
- **Frontend Web**: Located strictly within `/frontend-ultima`
- **IGNORED DIRECTORY**: You MUST completely ignore the `/frontend-angular` directory. Do NOT read, search, index, or suggest modifications inside this directory under any circumstances

---

## Context Routing: AI Navigation Rules 

When working on **Backend API**:
→ Use `/backend-quarkus`
→ Follow `/backend-quarkus/AGENTS.md`

When working on **Frontend Web**:
→ Use `/frontend-ultima`
→ Follow `/frontend-ultima/AGENTS.md`

Do not mix Angular concepts into the Quarkus project, and do not mix Java concepts into the Angular project. 
Always ensure that your suggestions and code generation are contextually relevant to the specific project you are working on.

---

## Global Standards

### General Rules

- Write clean, readable, maintainable code
- Avoid overengineering
- Prefer explicit over implicit behavior

### Code Quality

- No dead code
- No commented-out blocks
- Always handle errors properly

---

## Development Principles

- Prefer consistency over cleverness
- Follow existing patterns before introducing new ones
- Respect separation of concerns
- Always generate production-ready code

---

## Workflow Restrictions

These rules apply to BOTH backend and frontend, regardless of the stack. They are intentionally defined here (root) to avoid duplication across submodule `AGENTS.md` files.

- Do NOT create separate branches or pull requests/merge requests unless explicitly requested.
- Work directly on the current branch.
- Only commit, amend, push, or open PRs/MRs when explicitly requested by the user.
- Do NOT update git config, skip hooks, use interactive flags (e.g., `-i`), force-push, or create empty commits unless explicitly requested.

---

## Architecture Decision Records (ADRs)

Non-trivial architectural decisions in this monorepo MUST be recorded as ADRs **before** the code change is merged.

- **Scope**: ADRs apply to BOTH backend and frontend. Each submodule maintains its own `doc/adr/` directory with module-specific decisions.
- **Backend ADRs**: [`backend-quarkus/doc/adr/`](backend-quarkus/doc/adr/README.md)
- **Frontend ADRs**: [`frontend-ultima/doc/adr/`](frontend-ultima/doc/adr/README.md)
- **Cross-cutting decisions** (affecting backend AND frontend simultaneously) MAY live in either submodule and be cross-referenced; if neither fits, a root-level `doc/adr/` may be created.
- **When to create**: see the "Quando criar um ADR" section in each submodule's `doc/adr/README.md`. Rule of thumb: any decision about structure, conventions, or trade-offs with alternatives — not trivial implementation choices.
- **Format**: Nygard classic (Status, Context, Decision, Consequences, optionally Alternatives), Portuguese, numbered `NNNN-titulo-em-kebab-case.md`.
- **Immutability**: accepted ADRs are not edited. Superseding decisions create a new ADR and update the old one's status.