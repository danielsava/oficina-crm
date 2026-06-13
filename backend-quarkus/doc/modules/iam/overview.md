# Módulo IAM — Visão Geral e Proposta de Modelagem

## Introdução e Contexto

Este documento consolida a proposta de arquitetura e modelagem de dados para o
módulo de **IAM (Identity and Access Management)** do projeto Oficina CRM.

A solicitação que originou este documento foi a seguinte: projetar um módulo de
autenticação e autorização **embarcado na própria aplicação**, conceitualmente
semelhante ao [Keycloak](https://www.keycloak.org/), porém implementado
internamente em Java + Quarkus + JPA/Hibernate, e que atenda aos seguintes
objetivos de negócio:

1. Autenticar usuários de forma centralizada para múltiplas aplicações cliente
   (Sistema Financeiro, RH, Estoque, Administrativo, etc.).
2. Emitir tokens **JWT** para uso por frontend e backends.
3. Permitir que o mesmo usuário autenticado acesse múltiplas aplicações
   cadastradas **sem precisar autenticar novamente** enquanto o token estiver
   ativo (SSO interno).
4. Permitir **revogação de tokens** a qualquer momento, antes mesmo da expiração
   natural.
5. Controlar autorização **de forma independente por aplicação**.
6. Suportar **permissões altamente granulares** (não apenas roles globais).
7. Associar permissões a usuários por meio de **grupos, perfis, papéis ou
   estruturas equivalentes**.
8. Permitir que cada aplicação tenha suas próprias funcionalidades, ações e
   permissões, sem misturar conceitos entre aplicações.

A proposta abaixo cobre: arquitetura geral, entidades JPA, relacionamentos,
cardinalidades, índices, estratégias de emissão/refresh/revogação de JWT,
sessões de usuário, auditoria, fluxos de autenticação e autorização, claims
sugeridas, boas práticas de segurança e caminhos de evolução (MFA, login social,
SSO federado, ABAC, multi-tenant).

> **Status**: proposta de arquitetura, ainda não implementada. Decisões aqui
> registradas deverão ser formalizadas via ADRs em
> [`backend-quarkus/doc/adr/`](../../adr/README.md) antes da implementação.

---

# 1. Resumo da Solução Proposta

A modelagem proposta é um **IAM próprio embarcado** no monorepo (módulo Quarkus separado, ex.: `iam-service`), inspirado conceitualmente no Keycloak, com os seguintes pilares:

- **Modelo híbrido RBAC + Permissões granulares por Aplicação** — não apenas roles globais. Roles são "atalhos" para conjuntos de permissões dentro de uma aplicação.
- **Autorização escopada por Aplicação (ClientApp)** — cada aplicação cliente possui seu próprio catálogo de Funcionalidades (Resources) × Ações.
- **Permissões atribuídas a Grupos/Roles**, nunca diretamente ao usuário (regra geral; exceções via concessão direta com vigência).
- **Tokens JWT curtos (5–15 min) + Refresh Tokens longos (horas/dias) persistidos** para permitir revogação real.
- **Revogação via tabela de denylist + versão de credenciais** (sem precisar consultar IAM a cada request).
- **JWT carrega claims resumidas** (sub, roles por app, permission version), não a árvore inteira de permissões. Backend resolve permissões granulares via cache local sincronizado.
- **Multi-tenant preparado desde já** via entidade `Organization`, mesmo que inicialmente exista apenas uma organização default.
- **Tabelas associativas como entidades próprias** quando carregam metadados (vigência, quem concedeu, status).

---

# 2. Diagrama Textual das Entidades

```
Organization (tenant)
   │
   ├──< User >──── UserCredential (1:1)
   │      │
   │      ├──< UserGroupMembership >── Group
   │      ├──< UserRoleAssignment >── Role ──< ClientApp
   │      ├──< UserDirectPermission >── Permission
   │      ├──< UserSession (1:N) ──< RefreshToken
   │      └──< AuthEventLog
   │
   └──< ClientApp >── Module ──< Resource ──< Permission >── Action
              │                                     │
              │                                     └──< RolePermission >── Role
              │                                     └──< GroupPermission >── Group
              │
              └──< Role
              └──< UserAppAccess (vínculo usuário ↔ aplicação)

RevokedToken (denylist global por jti)
AuthorizationDecisionLog (auditoria fina)
```

---

# 3. Lista de Entidades e Responsabilidades

| Entidade | Responsabilidade |
|---|---|
| `Organization` | Tenant lógico. Isola usuários, grupos, aplicações. |
| `User` | Identidade do usuário (dados de perfil). |
| `UserCredential` | Hash de senha, política, versão, `passwordChangedAt`, `credentialVersion`. |
| `ClientApp` | Aplicação cliente do IAM (Financeiro, RH, Estoque…). |
| `Module` | Agrupamento lógico dentro de uma `ClientApp` (opcional). |
| `Resource` | Funcionalidade/recurso de uma aplicação (`clientes`, `relatorios`). |
| `Action` | Ação granular (`CREATE`, `READ`, `APPROVE`…). Catálogo. |
| `Permission` | Tripla `(Resource, Action, ClientApp)` — unidade atômica de autorização. |
| `Role` | Conjunto nomeado de permissões dentro de uma `ClientApp` (ex.: "Financeiro Gestor"). |
| `Group` | Agrupador organizacional de usuários, pode receber Roles e Permissões. |
| `RolePermission` | Associativa Role↔Permission com metadados. |
| `GroupRole` | Associativa Group↔Role. |
| `UserGroupMembership` | User↔Group com vigência, quem concedeu. |
| `UserRoleAssignment` | User↔Role direto (exceções), com vigência. |
| `UserDirectPermission` | User↔Permission (exceções pontuais, com vigência). |
| `UserAppAccess` | User↔ClientApp — habilita acesso ao app independente de roles. |
| `UserSession` | Sessão lógica (login ativo) — base para refresh tokens. |
| `RefreshToken` | Refresh token persistido (rotacionável, revogável). |
| `RevokedToken` | Denylist de `jti` de access tokens revogados antes de expirar. |
| `AuthEventLog` | Auditoria de login, logout, falha, troca de senha, refresh. |
| `AuthorizationDecisionLog` | Auditoria opcional de decisões PERMIT/DENY. |
| `PasswordResetToken` | Token único para fluxo "esqueci minha senha". |

---

# 4. Modelo Relacional Sugerido

| Tabela | PK | FKs principais | Notas |
|---|---|---|---|
| `iam_organization` | `id` BIGINT | — | `code` UNIQUE |
| `iam_user` | `id` BIGINT | `organization_id` | `username` UNIQUE por org, `email` UNIQUE por org |
| `iam_user_credential` | `id` BIGINT | `user_id` (UNIQUE) | hash bcrypt/argon2, `credential_version` INT |
| `iam_client_app` | `id` BIGINT | `organization_id` | `client_id` UNIQUE, `client_secret_hash` |
| `iam_module` | `id` BIGINT | `client_app_id` | `code` UNIQUE por app |
| `iam_resource` | `id` BIGINT | `client_app_id`, `module_id` | `code` UNIQUE por app |
| `iam_action` | `id` BIGINT | — | catálogo global (`CREATE`, `READ`…) |
| `iam_permission` | `id` BIGINT | `client_app_id`, `resource_id`, `action_id` | UNIQUE (`client_app_id`, `resource_id`, `action_id`) |
| `iam_role` | `id` BIGINT | `client_app_id` | `code` UNIQUE por app |
| `iam_role_permission` | `id` BIGINT | `role_id`, `permission_id` | UNIQUE (role_id, permission_id) |
| `iam_group` | `id` BIGINT | `organization_id` | `code` UNIQUE por org |
| `iam_group_role` | `id` BIGINT | `group_id`, `role_id` | vigência |
| `iam_user_group` | `id` BIGINT | `user_id`, `group_id` | vigência, `granted_by` |
| `iam_user_role` | `id` BIGINT | `user_id`, `role_id` | vigência (exceção) |
| `iam_user_permission` | `id` BIGINT | `user_id`, `permission_id` | vigência (exceção) |
| `iam_user_app_access` | `id` BIGINT | `user_id`, `client_app_id` | flag de acesso à app |
| `iam_user_session` | `id` UUID | `user_id`, `client_app_id` | `revoked` bool |
| `iam_refresh_token` | `id` UUID | `session_id`, `user_id` | `token_hash`, `expires_at`, `revoked` |
| `iam_revoked_token` | `jti` VARCHAR | `user_id` | TTL = expiração do JWT |
| `iam_auth_event_log` | `id` BIGINT | `user_id`, `client_app_id` | tipo, IP, UA, timestamp |
| `iam_authz_decision_log` | `id` BIGINT | `user_id`, `permission_id` | resultado, timestamp |
| `iam_password_reset_token` | `id` UUID | `user_id` | hash, expires_at, used |

---

# 5. Classes JPA Principais

> Convenções: `@MappedSuperclass` para auditoria, `Long` para PKs de entidades de domínio estável, `UUID` para tokens/sessões. Hibernate 6 com Quarkus 3 / Java 25.

### 5.1 Base auditável

```java
package com.oficina.iam.domain;

import jakarta.persistence.*;
import java.time.Instant;

@MappedSuperclass
public abstract class AuditableEntity {

    @Column(name = "created_at", nullable = false, updatable = false)
    protected Instant createdAt;

    @Column(name = "updated_at")
    protected Instant updatedAt;

    @Column(name = "created_by", length = 100, updatable = false)
    protected String createdBy;

    @Column(name = "updated_by", length = 100)
    protected String updatedBy;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // getters/setters omitidos
}
```

### 5.2 Organization (tenant)

```java
@Entity
@Table(name = "iam_organization",
       uniqueConstraints = @UniqueConstraint(name = "uk_org_code", columnNames = "code"))
public class Organization extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private boolean active = true;
}
```

### 5.3 User e UserCredential

```java
@Entity
@Table(name = "iam_user",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_user_org_username", columnNames = {"organization_id", "username"}),
           @UniqueConstraint(name = "uk_user_org_email",    columnNames = {"organization_id", "email"})
       },
       indexes = {
           @Index(name = "ix_user_email", columnList = "email"),
           @Index(name = "ix_user_org",   columnList = "organization_id")
       })
public class User extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_user_org"))
    private Organization organization;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(name = "full_name", length = 200)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true,
              fetch = FetchType.LAZY)
    private UserCredential credential;

    public enum UserStatus { ACTIVE, INACTIVE, LOCKED, PENDING }
}
```

```java
@Entity
@Table(name = "iam_user_credential",
       uniqueConstraints = @UniqueConstraint(name = "uk_cred_user", columnNames = "user_id"))
public class UserCredential extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_cred_user"))
    private User user;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash; // argon2id ou bcrypt

    @Column(name = "password_algorithm", nullable = false, length = 30)
    private String passwordAlgorithm; // "argon2id"

    @Column(name = "password_changed_at", nullable = false)
    private Instant passwordChangedAt;

    /** Incrementado a cada troca de senha / revogação global do usuário.
     *  Embutido como claim "cv" no JWT — desbate todos os tokens emitidos antes. */
    @Column(name = "credential_version", nullable = false)
    private int credentialVersion = 1;

    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;
}
```

### 5.4 ClientApp, Module, Resource, Action, Permission

```java
@Entity
@Table(name = "iam_client_app",
       uniqueConstraints = @UniqueConstraint(name = "uk_app_client_id", columnNames = "client_id"))
public class ClientApp extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "client_id", nullable = false, length = 100)
    private String clientId; // ex.: "sistema-financeiro"

    @Column(name = "client_secret_hash", length = 255)
    private String clientSecretHash; // só para confidential clients

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "access_token_ttl_seconds", nullable = false)
    private int accessTokenTtlSeconds = 900;       // 15 min

    @Column(name = "refresh_token_ttl_seconds", nullable = false)
    private int refreshTokenTtlSeconds = 28800;    // 8 h

    @Column(nullable = false)
    private boolean active = true;
}
```

```java
@Entity
@Table(name = "iam_resource",
       uniqueConstraints = @UniqueConstraint(name = "uk_resource_app_code",
                                             columnNames = {"client_app_id", "code"}))
public class Resource extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_app_id", nullable = false)
    private ClientApp clientApp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @Column(nullable = false, length = 80)
    private String code;          // ex.: "clientes", "relatorios"

    @Column(nullable = false, length = 200)
    private String name;
}
```

```java
@Entity
@Table(name = "iam_action",
       uniqueConstraints = @UniqueConstraint(name = "uk_action_code", columnNames = "code"))
public class Action {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String code; // CREATE, READ, UPDATE, DELETE, APPROVE, EXPORT...

    @Column(nullable = false, length = 100)
    private String name;
}
```

```java
@Entity
@Table(name = "iam_permission",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_perm_app_resource_action",
           columnNames = {"client_app_id", "resource_id", "action_id"}),
       indexes = {
           @Index(name = "ix_perm_app", columnList = "client_app_id")
       })
public class Permission extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_app_id", nullable = false)
    private ClientApp clientApp;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "action_id", nullable = false)
    private Action action;

    /** Forma canônica usada em JWT/cache: "<app>:<resource>:<action>" */
    @Column(name = "permission_code", nullable = false, length = 200, unique = true)
    private String permissionCode;

    @PrePersist @PreUpdate
    void buildCode() {
        this.permissionCode = clientApp.getClientId() + ":" + resource.getCode() + ":" + action.getCode();
    }
}
```

### 5.5 Role, Group e associativas com metadados

```java
@Entity
@Table(name = "iam_role",
       uniqueConstraints = @UniqueConstraint(name = "uk_role_app_code",
                                             columnNames = {"client_app_id", "code"}))
public class Role extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_app_id", nullable = false)
    private ClientApp clientApp;

    @Column(nullable = false, length = 80)
    private String code; // ex.: "FINANCEIRO_GESTOR"

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private boolean active = true;
}
```

```java
@Entity
@Table(name = "iam_role_permission",
       uniqueConstraints = @UniqueConstraint(name = "uk_role_perm",
                                             columnNames = {"role_id", "permission_id"}))
public class RolePermission extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @Column(name = "granted_by", length = 100)
    private String grantedBy;

    @Column(name = "valid_from")
    private Instant validFrom;

    @Column(name = "valid_until")
    private Instant validUntil;

    @Column(nullable = false)
    private boolean active = true;
}
```

```java
@Entity
@Table(name = "iam_group",
       uniqueConstraints = @UniqueConstraint(name = "uk_group_org_code",
                                             columnNames = {"organization_id", "code"}))
public class Group extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false, length = 80)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    /** Hierarquia opcional de grupos */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_group_id")
    private Group parent;
}
```

```java
@Entity
@Table(name = "iam_user_group",
       uniqueConstraints = @UniqueConstraint(name = "uk_user_group",
                                             columnNames = {"user_id", "group_id"}),
       indexes = @Index(name = "ix_ug_user", columnList = "user_id"))
public class UserGroupMembership extends AuditableEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(name = "granted_by", length = 100)
    private String grantedBy;

    @Column(name = "valid_from")
    private Instant validFrom;

    @Column(name = "valid_until")
    private Instant validUntil;

    @Column(nullable = false)
    private boolean active = true;
}
```

(Análogos: `GroupRole`, `UserRoleAssignment`, `UserDirectPermission`, `UserAppAccess` — mesma estrutura: FKs + `validFrom/validUntil` + `grantedBy` + `active`.)

### 5.6 Sessão, Refresh Token e Revogação

```java
@Entity
@Table(name = "iam_user_session",
       indexes = {
           @Index(name = "ix_session_user", columnList = "user_id"),
           @Index(name = "ix_session_active", columnList = "revoked,expires_at")
       })
public class UserSession {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_app_id")
    private ClientApp clientApp;

    @Column(name = "ip_address", length = 60)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_activity_at", nullable = false)
    private Instant lastActivityAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @PrePersist
    void init() {
        if (id == null) id = UUID.randomUUID();
        createdAt = Instant.now();
        lastActivityAt = createdAt;
    }
}
```

```java
@Entity
@Table(name = "iam_refresh_token",
       indexes = {
           @Index(name = "ix_rt_hash", columnList = "token_hash", unique = true),
           @Index(name = "ix_rt_session", columnList = "session_id")
       })
public class RefreshToken {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private UserSession session;

    /** SHA-256 do refresh token entregue ao cliente — nunca armazenar o token em claro */
    @Column(name = "token_hash", nullable = false, length = 100)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    /** Para rotação: aponta para o RT que substituiu este */
    @Column(name = "replaced_by", columnDefinition = "uuid")
    private UUID replacedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void init() {
        if (id == null) id = UUID.randomUUID();
        createdAt = Instant.now();
    }
}
```

```java
@Entity
@Table(name = "iam_revoked_token",
       indexes = @Index(name = "ix_rev_exp", columnList = "expires_at"))
public class RevokedToken {

    /** jti do access token revogado */
    @Id
    @Column(length = 64)
    private String jti;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "revoked_at", nullable = false)
    private Instant revokedAt;

    /** Quando o TTL passa, registro pode ser excluído por job */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(length = 100)
    private String reason;
}
```

### 5.7 Auditoria

```java
@Entity
@Table(name = "iam_auth_event_log",
       indexes = {
           @Index(name = "ix_evt_user_time", columnList = "user_id,occurred_at"),
           @Index(name = "ix_evt_type",      columnList = "event_type")
       })
public class AuthEventLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId; // nullable: falha em usuário inexistente

    @Column(name = "username_attempt", length = 200)
    private String usernameAttempt;

    @Column(name = "client_app_id")
    private Long clientAppId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 40)
    private AuthEventType eventType;

    @Column(name = "ip_address", length = 60)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(length = 500)
    private String details;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    public enum AuthEventType {
        LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT,
        TOKEN_REFRESH, TOKEN_REVOKED,
        PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_DONE,
        ACCOUNT_LOCKED, ACCOUNT_UNLOCKED
    }
}
```

---

# 6. Estratégia de Autorização Granular

**Modelo: RBAC com Permissões + opcional Direct Grants (híbrido).**

1. **Unidade atômica** = `Permission` = `(ClientApp, Resource, Action)`. Forma canônica: `sistema-financeiro:clientes:CREATE`.
2. **Distribuição preferencial**:
   - `User` → `Group` (via `UserGroupMembership`)
   - `Group` → `Role` (via `GroupRole`)
   - `Role` → `Permission` (via `RolePermission`)
3. **Exceções controladas**:
   - `UserRoleAssignment` para vincular role diretamente (com vigência).
   - `UserDirectPermission` para conceder/negar permissão pontual com `valid_from`/`valid_until`.
4. **Resolução efetiva** (algoritmo `PermissionResolver`):
   ```
   effective(user) =
       ⋃ permissions(roles(groups(user)))
     ∪ ⋃ permissions(directRoles(user))
     ∪ directPermissions(user)
       — filtrado por vigência (valid_from <= now <= valid_until) e active=true
       — filtrado por ClientApp ativo e UserAppAccess habilitado
   ```
5. **Diferentes perfis por aplicação**: como `Role` pertence a uma `ClientApp`, basta atribuir roles distintas para o mesmo usuário em apps distintas. Naturalmente resolvido pelo modelo.

---

# 7. Estratégia de JWT, Refresh Token, Sessão e Revogação

### 7.1 Tokens

- **Access Token (JWT)** assinado com **RS256** (chave privada do IAM; chave pública distribuída via JWKS endpoint `/iam/.well-known/jwks.json`).
- **TTL curto**: 5–15 min (configurável por `ClientApp`).
- **Refresh Token**: string opaca (não-JWT), 256 bits aleatórios. Persistido como **hash SHA-256** em `iam_refresh_token`. TTL longo (4h–24h).

### 7.2 Sessão

- Login cria `UserSession` (UUID) + 1 `RefreshToken` inicial.
- O JWT carrega `sid = session.id` como claim.
- Logout = `session.revoked = true` (cascata lógica em todos os RTs).

### 7.3 Rotação de Refresh Token

- A cada `/refresh`: invalida o RT atual (`revoked=true`, `replaced_by=novoId`), emite novo RT + novo access token.
- **Detecção de reuso**: se um RT já revogado for usado, **revoga toda a sessão** (sinal de roubo de token).

### 7.4 Revogação de JWT antes da expiração

Combinação de três mecanismos (defesa em profundidade):

1. **`sid` na denylist de sessão** (Redis ou tabela `UserSession.revoked`) — chamada `revokeSession(sid)`.
2. **`jti` na denylist `iam_revoked_token`** — para revogar um access token específico.
3. **`cv` (credential_version)** no JWT — comparado com `UserCredential.credentialVersion` ao validar; trocas de senha ou “revogar tudo” incrementam o valor e invalidam todos os tokens anteriores.

### 7.5 Como evitar consulta ao IAM a cada request

- Backends das aplicações **validam JWT localmente** (assinatura via JWKS cacheado).
- Cache em memória (Caffeine) das três denylists, sincronizado por:
  - **Polling** leve (a cada N segundos) em `/iam/revocations?since=...`, OU
  - **Pub/Sub** (Redis pub/sub, Kafka, RabbitMQ) — recomendado em produção.
- TTL curto do access token + propagação rápida do denylist = janela de exposição mínima (segundos).

---

# 8. Claims Sugeridas para o JWT

```json
{
  "iss": "https://iam.oficina.com",
  "sub": "1042",                              // user.id
  "aud": "sistema-financeiro",                // client_id da aplicação destino
  "exp": 1718000000,
  "iat": 1717999100,
  "nbf": 1717999100,
  "jti": "8c5a...",                           // ID único do access token
  "sid": "f1b2c3d4-...",                      // UserSession.id
  "cv":  7,                                   // credential_version
  "org": "default",                           // organization.code (multi-tenant)
  "upn": "joao.silva",                        // username
  "email": "joao@empresa.com",
  "name": "João Silva",
  "groups": ["FINANCEIRO_GESTOR"],            // roles do user NESTA app — formato do MicroProfile JWT
  "apps": ["sistema-financeiro","sistema-rh"],// apps habilitadas
  "perm_version": 23                          // versão das permissões do user (incrementa quando perms mudam)
}
```

**Não colocar a árvore inteira de permissões** no JWT. Razões:
- Tamanho do header HTTP cresce.
- Difícil invalidar quando perms mudam.
- Vazamento de informação.

A claim `perm_version` permite ao backend detectar e recarregar permissões do cache quando necessário.

---

# 9. Fluxo de Autenticação

```
[Frontend] ── POST /iam/auth/login {username, password, client_id} ──> [IAM]
                                                                       │
                                                                       ├─ valida credencial (argon2id)
                                                                       ├─ checa UserAppAccess para client_id
                                                                       ├─ cria UserSession
                                                                       ├─ gera Access Token (JWT) + Refresh Token
                                                                       ├─ persiste hash(RT) em iam_refresh_token
                                                                       └─ grava AuthEventLog(LOGIN_SUCCESS)
[Frontend] <─── { access_token, refresh_token, expires_in, token_type } ───
[Frontend] ── GET /financeiro/api/x  (Authorization: Bearer ...) ──> [Backend Financeiro]
                                                                       │
                                                                       ├─ valida assinatura (JWKS cache)
                                                                       ├─ checa exp/iss/aud
                                                                       ├─ checa sid e jti não revogados (cache local)
                                                                       ├─ checa cv == credential_version do user (cache)
                                                                       └─ extrai roles/perms
```

### Refresh
```
POST /iam/auth/refresh { refresh_token }
  → busca hash → valida não-revogado, não-expirado
  → revoga atual, cria novo RT (rotação), novo access token
  → AuthEventLog(TOKEN_REFRESH)
```

### Logout
```
POST /iam/auth/logout (Bearer)
  → session.revoked = true, todos RTs da sessão revoked = true
  → opcional: adiciona jti em iam_revoked_token
  → AuthEventLog(LOGOUT)
```

---

# 10. Fluxo de Autorização (no Backend da Aplicação)

```
Request → JWT extraído pelo SmallRye JWT
       → SecurityIdentityAugmentor injeta permissões resolvidas localmente
       → @PermissionsAllowed("clientes:CREATE") OU verificação programática
       → PermitAll/Deny/Decision logada (opcional) em iam_authz_decision_log
```

Exemplo com Quarkus:

```java
@Path("/clientes")
public class ClienteResource {

    @Inject JsonWebToken jwt;
    @Inject PermissionChecker checker;

    @POST
    @RolesAllowed({"FINANCEIRO_GESTOR","FINANCEIRO_OPERADOR"}) // coarse-grained
    public Response criar(ClienteDTO dto) {
        // fine-grained
        checker.require(jwt, "sistema-financeiro:clientes:CREATE");
        // ...
        return Response.created(...).build();
    }
}
```

```java
@ApplicationScoped
public class PermissionChecker {

    @Inject PermissionCacheService cache;

    public void require(JsonWebToken jwt, String permissionCode) {
        long userId = Long.parseLong(jwt.getSubject());
        int tokenPermVersion = jwt.getClaim("perm_version");
        Set<String> perms = cache.getPermissions(userId, tokenPermVersion);
        if (!perms.contains(permissionCode)) {
            throw new ForbiddenException("Permissão negada: " + permissionCode);
        }
    }
}
```

A partir do Quarkus 3.x existe também `@PermissionsAllowed("clientes:CREATE")` que se integra a um `PermissionAugmentor` customizado — solução elegante para evitar checagem manual.

---

# 11. Estratégia de Invalidação e Atualização de Permissões

Cenário: admin altera as roles do João. Ele ainda tem JWT válido.

1. IAM **incrementa `User.permVersion`** (campo novo) e publica evento `PERMISSIONS_UPDATED user_id=1042`.
2. Backends ouvem o evento → invalidam cache local desse user.
3. Próxima request do João: backend compara `jwt.perm_version` (antigo) vs `cache.perm_version` (novo). Se divergir:
   - **Opção A (recomendada)**: backend re-busca permissões atuais via `/iam/users/1042/permissions?app=sistema-financeiro` e usa as novas — JWT antigo continua válido mas com perms atualizadas.
   - **Opção B (mais estrita)**: backend força refresh do token (responde 401 com header `X-Token-Refresh-Required`).

Para revogação total imediata (ex.: usuário demitido):
- Marca `User.status=INACTIVE`, revoga todas as sessões, incrementa `credentialVersion`.
- Publica evento. Em segundos o usuário está fora de todos os sistemas.

---

# 12. Índices Recomendados

| Tabela | Índice | Razão |
|---|---|---|
| `iam_user` | `(organization_id, username)` UNIQUE | login |
| `iam_user` | `(organization_id, email)` UNIQUE | login alt. + reset |
| `iam_user_credential` | `user_id` UNIQUE | join 1:1 |
| `iam_permission` | `(client_app_id, resource_id, action_id)` UNIQUE | integridade |
| `iam_permission` | `permission_code` UNIQUE | lookup por código |
| `iam_role_permission` | `(role_id, permission_id)` UNIQUE | integridade |
| `iam_user_group` | `(user_id, group_id)` UNIQUE | integridade |
| `iam_user_group` | `user_id` | resolução de perms |
| `iam_user_session` | `(revoked, expires_at)` | limpeza + validação |
| `iam_refresh_token` | `token_hash` UNIQUE | lookup no refresh |
| `iam_refresh_token` | `session_id` | revogação cascata |
| `iam_revoked_token` | `expires_at` | job de limpeza |
| `iam_auth_event_log` | `(user_id, occurred_at)` | auditoria por user |
| `iam_auth_event_log` | `event_type` | relatórios |

---

# 13. Boas Práticas de Segurança

1. **Hash de senha**: Argon2id (preferencial) ou bcrypt cost ≥ 12. **Nunca SHA-x puro.**
2. **Refresh token armazenado em hash** SHA-256, nunca em claro.
3. **JWT assinado com RS256/ES256**, chaves rotacionáveis (kid claim), JWKS endpoint.
4. **TTL curto do access token** (5–15 min).
5. **Rotação obrigatória** de refresh token + detecção de reuso.
6. **Rate limiting** por IP e por user em login/refresh/reset.
7. **Lockout** após N falhas (`UserCredential.failedAttempts`, `lockedUntil`).
8. **CSRF**: refresh token preferencialmente em **cookie HttpOnly + Secure + SameSite=Strict** quando consumido por browser. Access token em memória do front (não em localStorage).
9. **Audit log imutável** — considere tabela append-only, sem UPDATE/DELETE para o app.
10. **Validação de `aud`** no backend: cada backend só aceita tokens cujo `aud` é o seu `client_id`.
11. **TLS obrigatório** em todos os endpoints do IAM.
12. **Não logar** senhas, tokens, hashes — apenas IDs e metadados.
13. **Limpeza periódica**: job para remover refresh tokens expirados, sessões antigas, revoked_token expirado.
14. **Princípio do menor privilégio** + revisão periódica de roles/permissions.
15. **Separar IAM em base de dados própria** (mesmo schema ou DB), facilitando backup/auditoria.

---

# 14. Respostas Diretas às Perguntas

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Grupos, perfis, roles ou permissões diretas? | **Híbrido**: Permissões granulares (átomos) + Roles por app (agrupam permissões) + Groups organizacionais (recebem roles). Direct assignment apenas como exceção. |
| 2 | Como evitar explosão de roles? | Roles **escopadas por aplicação** (não globais), nomeadas por função de negócio, não por permissão. Use templates/herança de roles somente se necessário. Composição via Groups → múltiplas Roles. |
| 3 | JWT carrega todas as permissões? | **Não.** Carrega roles + `perm_version`. Permissões resolvidas no backend a partir de cache. |
| 4 | Revogar JWT antes da expiração? | **3 mecanismos combinados**: `sid` (sessão revogada), `jti` (denylist), `cv` (credential_version). Cache local sincronizado por pub/sub. |
| 5 | Validar sem consultar IAM a cada request? | Validação local da assinatura via JWKS cacheado + cache local de denylist sincronizado por eventos. |
| 6 | Atualizar permissões com token ativo? | Backend re-resolve via cache quando `perm_version` do JWT < `perm_version` atual, ou força refresh. |
| 7 | Permissões por aplicação sem misturar globais? | `Permission` carrega `client_app_id` obrigatório. Não existem permissões globais — apenas administrativas dentro de uma "app IAM-admin". |
| 8 | Perfis diferentes por app? | Natural: `Role` pertence a `ClientApp`. Atribuir roles distintas em apps distintas. |
| 9 | CRUD vs ações de negócio? | Catálogo `Action` extensível: `CREATE`, `READ`, `UPDATE`, `DELETE` + `APPROVE`, `EXPORT`, `EXECUTE`, etc. Mesma estrutura, sem distinção formal. |
| 10 | Multi-tenant futuro? | Já preparado: `Organization` em `User`, `Group`, `ClientApp`. Claim `org` no JWT. Filtros por tenant em todas as queries (filtro Hibernate `@Filter` ou interceptor). |

---

# 15. Extensões Futuras Recomendadas

| Extensão | Como encaixa no modelo |
|---|---|
| **MFA (TOTP/WebAuthn)** | Nova entidade `UserMfaFactor` (tipo, secret, ativo). Claim `amr` no JWT. |
| **Login social** | `UserFederatedIdentity` (provider, externalId, accessToken). Suporte a `iss` externo. |
| **SSO entre apps** | Já contemplado — JWT do IAM funciona em todas as apps `aud`-compatíveis. |
| **ABAC** | Nova entidade `Policy` (DSL ou JSON), avaliada por engine (Cedar, OPA) após RBAC. Atributos: `user.department`, `resource.owner`, `env.time`. |
| **Política de senha** | Entidade `PasswordPolicy` por `Organization`: min length, complexidade, histórico (`PasswordHistory`), idade máx. |
| **Consentimento (OIDC)** | `UserConsent(user, clientApp, scopes, grantedAt)`. |
| **Service accounts / API keys** | `ApiKey(clientApp, scopes, hash, expiresAt)`. |
| **Delegação / impersonation** | `ImpersonationGrant(actorUser, targetUser, validUntil)`, claim `act` no JWT. |
| **Risk-based auth** | Score por IP/UA/horário; trigger de MFA ou bloqueio. |

---

# 16. Conclusão — Recomendação Final de Arquitetura

**Arquitetura recomendada**:

1. **Módulo Quarkus separado** (`iam-service`) com seu próprio banco/schema, expondo APIs REST: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/users/{id}/permissions`, `/revocations?since=`, `/.well-known/jwks.json`.
2. **Modelo RBAC granular híbrido**: Permission atômica `(app:resource:action)` → Role (por app) → Group → User. Direct grants permitidos como exceção com vigência.
3. **JWT RS256 curto + Refresh Token opaco rotacionável** persistido como hash. Sessão como entidade central (`UserSession`).
4. **Revogação em camadas**: `sid` + `jti` + `credential_version` + `perm_version`. Cache local nos backends, sincronizado por pub/sub.
5. **JWT minimalista**: identidade, roles por app, versões — não permissões inteiras.
6. **Backends validam local** (JWKS cache + denylist cache) e usam `@RolesAllowed` + `PermissionChecker` para granularidade.
7. **Multi-tenant preparado** com `Organization` desde o dia 1.
8. **Auditoria forte** em `iam_auth_event_log` + opcional `iam_authz_decision_log`.
9. **Tabelas associativas como entidades** sempre que houver vigência, `grantedBy`, status — princípio aplicado a `RolePermission`, `UserGroupMembership`, `GroupRole`, `UserRoleAssignment`, `UserDirectPermission`, `UserAppAccess`.
10. **Caminho evolutivo claro** para MFA, ABAC, SSO federado, login social, sem refactor estrutural.

Essa arquitetura entrega autenticação centralizada, autorização altamente granular por aplicação, revogação efetiva e desempenho — mantendo a base de código manutenível e idiomática para Quarkus 3 + Java 25.

### Sugestões de próximos passos práticos

Posso aprofundar qualquer um destes pontos com código pronto para o projeto. Quer que eu siga com algum?

- (a) Esqueleto do módulo `iam-service` (estrutura Maven/Gradle Quarkus + migrações Flyway).
- (b) Implementação do `AuthService` (login + emissão JWT/RT + rotação).
- (c) Implementação do `PermissionResolver` + cache Caffeine + pub/sub Redis.
- (d) `SecurityIdentityAugmentor` + `@PermissionsAllowed` ponta a ponta.
- (e) Scripts SQL DDL completos com índices.
- (f) ADR formal seguindo `backend-quarkus/doc/adr/` (formato Nygard, em português).

---

# Apêndice — Prompt Original

Esta seção preserva, na íntegra, o prompt utilizado para gerar a proposta de
arquitetura e modelagem documentada acima. O conteúdo é mantido sem
modificações para fins de rastreabilidade e auditoria da decisão.

````text
Você é um arquiteto de software especialista em Java, Quarkus, JPA/Hibernate, IAM, OAuth2, OpenID Connect, JWT, RBAC, ABAC e modelagem de dados corporativa.

Preciso que você proponha uma modelagem de entidades JPA para um módulo de autenticação e autorização, semelhante conceitualmente ao Keycloak (https://www.keycloak.org/), mas implementado dentro da minha própria aplicação.

## Contexto geral

O módulo será um IAM — Identity and Access Management — responsável por centralizar a autenticação de usuários e controlar a autorização de acesso a múltiplas aplicações cadastradas.

Esse módulo deverá:

1. Autenticar usuários de forma centralizada.
2. Gerar tokens JWT para uso pelo frontend e backend.
3. Permitir que o mesmo usuário autenticado acesse múltiplas aplicações cadastradas sem precisar autenticar novamente enquanto o token estiver ativo.
4. Permitir revogação de tokens a qualquer momento.
5. Controlar autorização de forma independente por aplicação.
6. Permitir controle de permissões altamente granular.
7. Associar permissões a usuários por meio de grupos, perfis, papéis ou estruturas equivalentes.
8. Permitir que cada aplicação tenha suas próprias funcionalidades e suas próprias permissões.

## Requisitos funcionais

### Autenticação

O módulo deve permitir autenticação unificada de usuários.

Após autenticação bem-sucedida, o sistema deve gerar um JWT contendo as informações necessárias para que o frontend e os backends das aplicações consigam identificar o usuário e validar seu acesso.

O usuário autenticado poderá acessar qualquer aplicação cadastrada no IAM, desde que tenha autorização para essa aplicação e funcionalidades específicas.

Enquanto o token estiver ativo, o usuário não deverá precisar autenticar novamente.

O token de um usuário deve poder ser revogado a qualquer momento.

Considere também a necessidade de refresh token, access token, expiração, revogação, sessões ativas e auditoria de login/logout.

### Aplicações

O IAM deverá permitir o cadastro de várias aplicações clientes, por exemplo:

* Sistema Financeiro
* Sistema de RH
* Sistema de Estoque
* Sistema Administrativo

Cada aplicação deverá ter seus próprios módulos, funcionalidades, ações e permissões.

### Autorização

O controle de autorização deve ser feito por aplicação.

Cada aplicação poderá ter funcionalidades, como por exemplo:

* Cadastro de usuários
* Cadastro de clientes
* Emissão de relatórios
* Gestão financeira
* Aprovação de solicitações
* Envio de notificações

Cada funcionalidade poderá ter ações granulares, como:

* Criar
* Visualizar
* Editar
* Salvar
* Excluir
* Imprimir
* Exportar
* Importar
* Enviar
* Aprovar
* Reprovar
* Cancelar
* Executar

As permissões devem ser atribuídas a grupos, perfis, papéis ou estruturas equivalentes, e os usuários devem receber essas permissões por associação a esses agrupadores.

Avalie qual abordagem é mais adequada: grupos, perfis, papéis, roles, policies, scopes, authorities ou combinação entre elas.

O modelo deve permitir que um usuário tenha diferentes permissões em diferentes aplicações.

Por exemplo:

* O usuário João pode ser Administrador no Sistema Financeiro.
* O mesmo usuário João pode ser apenas Consulta no Sistema de RH.
* O mesmo usuário João pode não ter acesso ao Sistema de Estoque.

## O que eu quero que você entregue

Proponha uma modelagem completa de entidades JPA para esse módulo IAM.

A resposta deve conter:

1. Uma visão geral da arquitetura da modelagem.
2. Uma proposta de entidades principais.
3. O relacionamento entre as entidades.
4. A cardinalidade entre as entidades.
5. Sugestão de nomes de tabelas.
6. Sugestão de campos principais para cada entidade.
7. Sugestão de chaves primárias e estrangeiras.
8. Sugestão de índices importantes.
9. Estratégia para geração e revogação de tokens JWT.
10. Estratégia para refresh tokens.
11. Estratégia para sessões de usuário.
12. Estratégia para auditoria de autenticação e autorização.
13. Estratégia para autorização granular por aplicação, funcionalidade e ação.
14. Sugestão de claims que devem existir no JWT.
15. Sugestão de como validar permissões no backend.
16. Sugestão de como o frontend poderia consumir essas permissões.
17. Cuidados de segurança importantes.
18. Possíveis melhorias futuras, como MFA, login social, SSO, tenant, organização, política de senha e ABAC.

## Entidades esperadas

Considere, no mínimo, entidades relacionadas a:

* Usuário
* Credenciais do usuário
* Aplicação cliente
* Sessão de usuário
* Access token
* Refresh token
* Token revogado
* Grupo
* Perfil
* Papel/Role
* Permissão
* Funcionalidade/Recurso
* Ação
* Associação de usuário com grupos/perfis
* Associação de aplicação com funcionalidades
* Associação de permissões com grupos/perfis/roles
* Auditoria de login
* Auditoria de autorização
* Organização ou tenant, caso faça sentido

Você tem total liberdade para utilizar nomes melhores para essas entidades caso considere mais adequado, e modelar da melhor forma que julgar.

## Requisitos técnicos

Use Java com JPA/Hibernate.

Quero que a resposta traga exemplos de classes Java com anotações JPA, como:

* @Entity
* @Table
* @Id
* @GeneratedValue
* @Column
* @ManyToOne
* @OneToMany
* @ManyToMany
* @JoinColumn
* @JoinTable
* @Enumerated
* @Embedded
* @PrePersist
* @PreUpdate

Quando fizer sentido, prefira modelar tabelas associativas como entidades próprias em vez de usar apenas @ManyToMany direto, principalmente quando houver necessidade de metadados como data de criação, quem concedeu o acesso, status, validade da permissão, escopo da aplicação etc.

## Pontos importantes para a modelagem

A autorização deve ser altamente granular.

Evite um modelo simplista baseado apenas em roles globais.

O ideal é que a autorização considere:

* Aplicação
* Módulo, se aplicável
* Funcionalidade ou recurso
* Ação permitida
* Grupo, perfil ou role
* Usuário
* Status ativo/inativo
* Vigência da permissão
* Escopo da permissão, se aplicável

Exemplo conceitual de permissão:

O grupo “Financeiro Gestor” da aplicação “Sistema Financeiro” possui permissão para:

* clientes:criar
* clientes:editar
* clientes:excluir
* relatorios:visualizar
* relatorios:imprimir
* pagamentos:aprovar

Já o grupo “Financeiro Consulta” possui apenas:

* clientes:visualizar
* relatorios:visualizar

## Perguntas que quero que você responda

Além da modelagem, responda também:

1. É melhor usar grupos, perfis, roles ou permissões diretas?
2. Como evitar explosão de roles?
3. O JWT deve carregar todas as permissões ou apenas claims resumidas?
4. Como lidar com revogação de token JWT antes da expiração?
5. Como permitir que uma aplicação valide permissões sem consultar o IAM a cada requisição?
6. Como atualizar permissões de um usuário enquanto ele ainda possui token ativo?
7. Como modelar permissões por aplicação sem misturar permissões globais?
8. Como permitir que um usuário tenha perfis diferentes em aplicações diferentes?
9. Como representar ações CRUD e ações específicas de negócio?
10. Como preparar essa modelagem para multi-tenant no futuro?

## Formato da resposta desejado

Organize a resposta da seguinte forma:

1. Resumo da solução proposta
2. Diagrama textual das entidades e relacionamentos
3. Lista de entidades com responsabilidade de cada uma
4. Modelo relacional sugerido
5. Classes JPA principais em Java
6. Estratégia de autorização granular
7. Estratégia de JWT, refresh token, sessão e revogação
8. Claims sugeridas para o JWT
9. Fluxo de autenticação
10. Fluxo de autorização
11. Estratégia de invalidação e atualização de permissões
12. Índices recomendados
13. Boas práticas de segurança
14. Possíveis extensões futuras
15. Conclusão com recomendação final de arquitetura

Não entregue apenas uma explicação conceitual. Quero uma proposta prática, detalhada e aplicável em um projeto Quarkus.
````
