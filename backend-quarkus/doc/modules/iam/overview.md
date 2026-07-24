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
- **Autorização escopada por Aplicação (`AplicacaoCliente`)** — cada aplicação cliente possui seu próprio catálogo de Recursos × Ações.
- **Permissões atribuídas a Grupos/Roles**, nunca diretamente ao usuário (regra geral; exceções via concessão direta com vigência).
- **Tokens JWT curtos (5–15 min) + Refresh Tokens longos (horas/dias) persistidos** para permitir revogação real.
- **Revogação via tabela de denylist + versão de credenciais** (sem precisar consultar IAM a cada request).
- **JWT carrega claims resumidas** (sub, roles por app, permission version), não a árvore inteira de permissões. Backend resolve permissões granulares via cache local sincronizado.
- **`Organizacao` mantida desde a v1 como contêiner estrutural** para evolução futura do modelo.
- **Tabelas associativas como entidades próprias** quando carregam metadados (vigência, quem concedeu, status).

---

# 2. Diagrama Textual das Entidades

> **Schema único**: todas as entidades abaixo residem no schema PostgreSQL
> `iam` (constante `DbSchemas.IAM`). Nenhuma entidade do módulo IAM mora em
> `core`, `crm`, `estoque` ou qualquer outro schema.

```
Organizacao
   │
   ├──< Usuario >──── UsuarioCredencial (1:1)
   │      │
   │      ├──< UsuarioGrupo >── Grupo
   │      ├──< UsuarioPapel >── Papel ──< AplicacaoCliente
   │      ├──< UsuarioPermissao >── Permissao
   │      ├──< SessaoUsuario (1:N) ──< RefreshToken
   │      └──< AuditoriaAutenticacao
   │
   └──< AplicacaoCliente >── Modulo ──< Recurso ──< Permissao >── Acao
              │                                          │
              │                                          └──< PapelPermissao >── Papel
              │
              └──< Papel
              └──< UsuarioAplicacao (vínculo usuário ↔ aplicação)

TokenRevogado (denylist global por jti)
AuditoriaAutorizacao (auditoria fina)
```

---

# 3. Lista de Entidades e Responsabilidades

| Entidade Java | Tabela (schema `iam`) | Responsabilidade |
|---|---|---|
| `Organizacao` | `tb_organizacao` | Contêiner estrutural do IAM. Na v1 o sistema opera com uma única organização default. |
| `Usuario` | `tb_usuario` | Identidade do usuário (dados de perfil). **Já existe** em `modules.iam.usuario`. |
| `UsuarioCredencial` | `tb_usuario_credencial` | Hash de senha, algoritmo, versão, `senhaAlteradaEm`, `credentialVersion`. |
| `AplicacaoCliente` | `tb_aplicacao_cliente` | Aplicação cliente do IAM (Financeiro, RH, Estoque…). |
| `Modulo` | `tb_modulo` | Agrupamento lógico dentro de uma `AplicacaoCliente` (opcional). |
| `Recurso` | `tb_recurso` | Funcionalidade/recurso de uma aplicação (`clientes`, `relatorios`). |
| `Acao` | `tb_acao` | Ação granular (`CREATE`, `READ`, `APPROVE`…). Catálogo. |
| `Permissao` | `tb_permissao` | Tripla `(Recurso, Acao, AplicacaoCliente)` — unidade atômica de autorização. |
| `Papel` | `tb_papel` | Conjunto nomeado de permissões dentro de uma `AplicacaoCliente` (ex.: "Financeiro Gestor"). |
| `Grupo` | `tb_grupo` | Agrupador organizacional de usuários. **Já existe** em `modules.iam.grupo`. |
| `PapelPermissao` | `tb_papel_permissao` | Associativa Papel↔Permissao com metadados. |
| `GrupoPapel` | `tb_grupo_papel` | Associativa Grupo↔Papel. |
| `UsuarioGrupo` | `tb_usuario_grupo` | Usuario↔Grupo com vigência, quem concedeu. |
| `UsuarioPapel` | `tb_usuario_papel` | Usuario↔Papel direto (exceção), com vigência. |
| `UsuarioPermissao` | `tb_usuario_permissao` | Usuario↔Permissao (exceção pontual, com vigência). |
| `UsuarioAplicacao` | `tb_usuario_aplicacao` | Usuario↔AplicacaoCliente — habilita acesso ao app. |
| `SessaoUsuario` | `tb_sessao_usuario` | Sessão lógica (login ativo) — base para refresh tokens. |
| `RefreshToken` | `tb_refresh_token` | Refresh token persistido (rotacionável, revogável). |
| `TokenRevogado` | `tb_token_revogado` | Denylist de `jti` de access tokens revogados antes de expirar. |
| `AuditoriaAutenticacao` | `tb_auditoria_autenticacao` | Auditoria de login, logout, falha, troca de senha, refresh. |
| `AuditoriaAutorizacao` | `tb_auditoria_autorizacao` | Auditoria opcional de decisões PERMIT/DENY. |
| `ResetSenhaToken` | `tb_reset_senha_token` | Token único para fluxo "esqueci minha senha". |

---

# 4. Modelo Relacional Sugerido

> **Schema único**: todas as tabelas deste módulo residem no schema `iam`
> (referenciado em código por `DbSchemas.IAM`). Não há tabelas do IAM em
> `core` nem em qualquer outro schema funcional. Em migrações Flyway as
> tabelas são sempre qualificadas (`iam.tb_usuario`, etc.).
>
> **Convenção de nomes**: prefixo `tb_` para tabelas e padrão `snake_case`
> (alinhado ao já adotado em `iam.tb_usuario`). O prefixo `iam_` no nome da
> tabela foi removido — o schema já cumpre esse papel.

| Schema | Tabela | PK | FKs principais | Notas |
|---|---|---|---|---|
| `iam` | `tb_organizacao` | `id` BIGINT | — | Entidade estrutural. Na v1 o sistema opera com uma única organização default. `codigo` UNIQUE. |
| `iam` | `tb_usuario` | `id` BIGINT | `organizacao_id` | `username` UNIQUE por org, `email` UNIQUE por org (entidade já existente no projeto) |
| `iam` | `tb_usuario_credencial` | `id` BIGINT | `usuario_id` (UNIQUE) | hash argon2id/bcrypt, `credential_version` INT |
| `iam` | `tb_aplicacao_cliente` | `id` BIGINT | `organizacao_id` | `client_id` UNIQUE, `client_secret_hash` |
| `iam` | `tb_modulo` | `id` BIGINT | `aplicacao_cliente_id` | `codigo` UNIQUE por app |
| `iam` | `tb_recurso` | `id` BIGINT | `aplicacao_cliente_id`, `modulo_id` | `codigo` UNIQUE por app |
| `iam` | `tb_acao` | `id` BIGINT | — | catálogo global (`CREATE`, `READ`…) |
| `iam` | `tb_permissao` | `id` BIGINT | `aplicacao_cliente_id`, `recurso_id`, `acao_id` | UNIQUE (`aplicacao_cliente_id`, `recurso_id`, `acao_id`) |
| `iam` | `tb_papel` | `id` BIGINT | `aplicacao_cliente_id` | `codigo` UNIQUE por app |
| `iam` | `tb_papel_permissao` | `id` BIGINT | `papel_id`, `permissao_id` | UNIQUE (papel_id, permissao_id) |
| `iam` | `tb_grupo` | `id` BIGINT | `organizacao_id` | `codigo` UNIQUE por org (entidade já existente no projeto) |
| `iam` | `tb_grupo_papel` | `id` BIGINT | `grupo_id`, `papel_id` | vigência |
| `iam` | `tb_usuario_grupo` | `id` BIGINT | `usuario_id`, `grupo_id` | vigência, `concedido_por` |
| `iam` | `tb_usuario_papel` | `id` BIGINT | `usuario_id`, `papel_id` | vigência (exceção) |
| `iam` | `tb_usuario_permissao` | `id` BIGINT | `usuario_id`, `permissao_id` | vigência (exceção) |
| `iam` | `tb_usuario_aplicacao` | `id` BIGINT | `usuario_id`, `aplicacao_cliente_id` | flag de acesso à app |
| `iam` | `tb_sessao_usuario` | `id` BIGINT (+ `uuid`) | `usuario_id`, `aplicacao_cliente_id` | `revogada` bool |
| `iam` | `tb_refresh_token` | `id` BIGINT (+ `uuid`) | `sessao_usuario_id`, `usuario_id` | `token_hash`, `expira_em`, `revogada` |
| `iam` | `tb_token_revogado` | `id` BIGINT | `usuario_id` | `jti` UNIQUE, TTL = expiração do JWT |
| `iam` | `tb_auditoria_autenticacao` | `id` BIGINT | `usuario_id`, `aplicacao_cliente_id` | tipo, IP, UA, timestamp |
| `iam` | `tb_auditoria_autorizacao` | `id` BIGINT | `usuario_id`, `permissao_id` | resultado, timestamp |
| `iam` | `tb_reset_senha_token` | `id` BIGINT (+ `uuid`) | `usuario_id` | hash, expira_em, usado |

> **PK**: todas as tabelas usam `id BIGINT` proveniente de `core.global_id_seq`
> (via `BaseEntity` — ver convenção do projeto). O `uuid` é o identificador
> público (URLs e DTOs). Onde antes propus PK `UUID` nativa (sessão, refresh
> token, reset token) o modelo é trazido para a convenção: PK numérica +
> coluna `uuid` única do `BaseEntity` + colunas técnicas internas
> específicas (ex.: `jti` em `tb_token_revogado`).

---

# 5. Classes JPA Principais

> **Convenções do projeto aplicadas** (ver `backend-quarkus/AGENTS.md`):
> - Todas as entidades **estendem `common.base.BaseEntity`** — herdam `id` (BIGINT
>   gerado por `core.global_id_seq`), `uuid` (identificador público), `status`
>   (`EnumStatusEntity`), `version`, `createdAt`, `updatedAt` e callbacks
>   `@PrePersist`/`@PreUpdate`. **Não** redeclarar esses campos nas entidades
>   filhas, nem criar um `AuditableEntity` paralelo.
> - Toda `@Table` declara `schema = DbSchemas.IAM` — schema único do módulo.
> - Pacotes ficam em `modules.iam.<sub_area>` (ex.: `modules.iam.papel`).
> - Enums JPA sempre com `@Enumerated(EnumType.STRING)`.
> - DTOs (não exibidos aqui) seguem o padrão `EditDTO`/`ListDTO` como
>   `record`, com REST estendendo `BaseRest`.

> Os exemplos abaixo mostram apenas os campos próprios de cada entidade
> (omitidos os campos herdados de `BaseEntity`).

### 5.1 Organizacao

> **Status da revisão desta entidade**: analisada.
>
> `Organizacao` é uma entidade estrutural do modelo. Na v1, o sistema opera
> com uma única organização default, resolvida implicitamente pelo backend.
> Portanto, ela não representa uma variação funcional exposta ao usuário final
> nem exige seleção no login.

```java
package modules.iam.organizacao;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;

@Entity
@Table(
        name = "tb_organizacao",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(name = "uk_organizacao_codigo", columnNames = "codigo")
)
public class Organizacao extends BaseEntity {

    @Column(name = "codigo", nullable = false, length = 50)
    private String codigo;

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    // getters/setters
}
```

### 5.2 Usuario e UsuarioCredencial

> `Usuario` já existe em `modules.iam.usuario` (`tb_usuario`). A proposta
> acrescenta o vínculo com `Organizacao` e a credencial separada. O status
> de ativo/inativo continua sendo o `EnumStatusEntity` do `BaseEntity`;
> estados específicos de identidade (LOCKED, PENDING_EMAIL_VERIFICATION)
> vão para um campo próprio.

```java
package modules.iam.usuario;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.organizacao.Organizacao;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tb_usuario",
        schema = DbSchemas.IAM,
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_usuario_org_username", columnNames = {"organizacao_id", "username"}),
                @UniqueConstraint(name = "uk_usuario_org_email", columnNames = {"organizacao_id", "email"})
        },
        indexes = {
                @Index(name = "ix_usuario_email", columnList = "email"),
                @Index(name = "ix_usuario_org", columnList = "organizacao_id")
        }
)
public class Usuario extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_usuario_organizacao"))
    private Organizacao organizacao;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "email", nullable = false, length = 200)
    private String email;

    @Column(name = "nome_completo", length = 200)
    private String nomeCompleto;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_identidade", nullable = false, length = 30)
    private EstadoIdentidade estadoIdentidade = EstadoIdentidade.ATIVA;

    @Column(name = "email_verificado", nullable = false)
    private boolean emailVerificado;

    @Column(name = "ultimo_login_em")
    private LocalDateTime ultimoLoginEm;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.LAZY)
    private UsuarioCredencial credencial;

    public enum EstadoIdentidade {ATIVA, BLOQUEADA, PENDENTE_VERIFICACAO_EMAIL}

    // getters/setters
}
```

```java
package modules.iam.usuario;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tb_usuario_credencial",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(name = "uk_credencial_usuario", columnNames = "usuario_id")
)
public class UsuarioCredencial extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_credencial_usuario"))
    private Usuario usuario;

    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash; // argon2id ou bcrypt

    @Column(name = "algoritmo_hash", nullable = false, length = 30)
    private String algoritmoHash; // "argon2id"

    @Column(name = "senha_alterada_em", nullable = false)
    private LocalDateTime senhaAlteradaEm;

    // Incrementado a cada troca de senha / revogação global do usuário.
    // Embutido como claim "cv" no JWT — invalida todos os tokens anteriores.
    @Column(name = "credential_version", nullable = false)
    private int credentialVersion = 1;

    @Column(name = "tentativas_falhas", nullable = false)
    private int tentativasFalhas;

    @Column(name = "bloqueado_ate")
    private LocalDateTime bloqueadoAte;

    // getters/setters
}
```

### 5.3 AplicacaoCliente, Modulo, Recurso, Acao, Permissao

```java
package modules.iam.aplicacaocliente;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.organizacao.Organizacao;

@Entity
@Table(
        name = "tb_aplicacao_cliente",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(name = "uk_aplicacao_client_id", columnNames = "client_id")
)
public class AplicacaoCliente extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    @Column(name = "client_id", nullable = false, length = 100)
    private String clientId; // ex.: "sistema-financeiro"

    @Column(name = "client_secret_hash", length = 255)
    private String clientSecretHash; // apenas para confidential clients

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    @Column(name = "access_token_ttl_segundos", nullable = false)
    private int accessTokenTtlSegundos = 900;     // 15 min

    @Column(name = "refresh_token_ttl_segundos", nullable = false)
    private int refreshTokenTtlSegundos = 28800;  // 8 h

    // getters/setters
}
```

```java
package modules.iam.recurso;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.aplicacaocliente.AplicacaoCliente;
import modules.iam.modulo.Modulo;

@Entity
@Table(
        name = "tb_recurso",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(
                name = "uk_recurso_app_codigo",
                columnNames = {"aplicacao_cliente_id", "codigo"}
        )
)
public class Recurso extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aplicacao_cliente_id", nullable = false)
    private AplicacaoCliente aplicacaoCliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_id")
    private Modulo modulo;

    @Column(name = "codigo", nullable = false, length = 80)
    private String codigo; // ex.: "clientes", "relatorios"

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    // getters/setters
}
```

```java
package modules.iam.acao;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;

@Entity
@Table(
        name = "tb_acao",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(name = "uk_acao_codigo", columnNames = "codigo")
)
public class Acao extends BaseEntity {

    @Column(name = "codigo", nullable = false, length = 50)
    private String codigo; // CREATE, READ, UPDATE, DELETE, APPROVE, EXPORT...

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    // getters/setters
}
```

```java
package modules.iam.permissao;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.acao.Acao;
import modules.iam.aplicacaocliente.AplicacaoCliente;
import modules.iam.recurso.Recurso;

@Entity
@Table(
        name = "tb_permissao",
        schema = DbSchemas.IAM,
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_permissao_app_recurso_acao",
                        columnNames = {"aplicacao_cliente_id", "recurso_id", "acao_id"}
                ),
                @UniqueConstraint(name = "uk_permissao_codigo", columnNames = "codigo_permissao")
        },
        indexes = @Index(name = "ix_permissao_app", columnList = "aplicacao_cliente_id")
)
public class Permissao extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aplicacao_cliente_id", nullable = false)
    private AplicacaoCliente aplicacaoCliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recurso_id", nullable = false)
    private Recurso recurso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "acao_id", nullable = false)
    private Acao acao;

    // Forma canônica usada em JWT/cache: "<app>:<recurso>:<acao>"
    @Column(name = "codigo_permissao", nullable = false, length = 200)
    private String codigoPermissao;

    @PrePersist
    @PreUpdate
    void montarCodigo() {
        this.codigoPermissao =
                aplicacaoCliente.getClientId() + ":" + recurso.getCodigo() + ":" + acao.getCodigo();
    }

    // getters/setters
}
```

### 5.4 Papel, Grupo e associativas com metadados

> O termo **Papel** substitui *Role* (alinhado ao idioma do projeto). O
> termo **Grupo** já existe em `modules.iam.grupo`.

```java
package modules.iam.papel;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.aplicacaocliente.AplicacaoCliente;

@Entity
@Table(
        name = "tb_papel",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(
                name = "uk_papel_app_codigo",
                columnNames = {"aplicacao_cliente_id", "codigo"}
        )
)
public class Papel extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aplicacao_cliente_id", nullable = false)
    private AplicacaoCliente aplicacaoCliente;

    @Column(name = "codigo", nullable = false, length = 80)
    private String codigo; // ex.: "FINANCEIRO_GESTOR"

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    // getters/setters
}
```

```java
package modules.iam.papelpermissao;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.papel.Papel;
import modules.iam.permissao.Permissao;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tb_papel_permissao",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(
                name = "uk_papel_permissao",
                columnNames = {"papel_id", "permissao_id"}
        )
)
public class PapelPermissao extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "papel_id", nullable = false)
    private Papel papel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "permissao_id", nullable = false)
    private Permissao permissao;

    @Column(name = "concedido_por", length = 100)
    private String concedidoPor;

    @Column(name = "valido_de")
    private LocalDateTime validoDe;

    @Column(name = "valido_ate")
    private LocalDateTime validoAte;

    // getters/setters
}
```

```java
package modules.iam.grupo;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.organizacao.Organizacao;

@Entity
@Table(
        name = "tb_grupo",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(
                name = "uk_grupo_org_codigo",
                columnNames = {"organizacao_id", "codigo"}
        )
)
public class Grupo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    @Column(name = "codigo", nullable = false, length = 80)
    private String codigo;

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    // Hierarquia opcional de grupos
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_pai_id")
    private Grupo grupoPai;

    // getters/setters
}
```

```java
package modules.iam.usuariogrupo;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.grupo.Grupo;
import modules.iam.usuario.Usuario;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tb_usuario_grupo",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(
                name = "uk_usuario_grupo",
                columnNames = {"usuario_id", "grupo_id"}
        ),
        indexes = @Index(name = "ix_usuario_grupo_usuario", columnList = "usuario_id")
)
public class UsuarioGrupo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @Column(name = "concedido_por", length = 100)
    private String concedidoPor;

    @Column(name = "valido_de")
    private LocalDateTime validoDe;

    @Column(name = "valido_ate")
    private LocalDateTime validoAte;

    // getters/setters
}
```

> Análogas (mesma estrutura: FKs + `valido_de`/`valido_ate` + `concedido_por`,
> todas estendendo `BaseEntity` no schema `iam`):
> - `GrupoPapel` (`tb_grupo_papel`)
> - `UsuarioPapel` (`tb_usuario_papel`) — concessão direta de papel
> - `UsuarioPermissao` (`tb_usuario_permissao`) — concessão direta de permissão
> - `UsuarioAplicacao` (`tb_usuario_aplicacao`) — habilita acesso à aplicação

### 5.5 Sessão, Refresh Token e Revogação

> Estas entidades **também estendem `BaseEntity`** — PK numérica de
> `core.global_id_seq` + `uuid` público. O `uuid` herdado é usado como o
> identificador `sid` referenciado no JWT (sessão) e como handle externo do
> refresh token. O `jti` do access token revogado vive em uma coluna
> própria com `UNIQUE`.

```java
package modules.iam.sessao;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.aplicacaocliente.AplicacaoCliente;
import modules.iam.usuario.Usuario;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tb_sessao_usuario",
        schema = DbSchemas.IAM,
        indexes = {
                @Index(name = "ix_sessao_usuario", columnList = "usuario_id"),
                @Index(name = "ix_sessao_ativa_exp", columnList = "revogada,expira_em")
        }
)
public class SessaoUsuario extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aplicacao_cliente_id")
    private AplicacaoCliente aplicacaoCliente;

    @Column(name = "ip", length = 60)
    private String ip;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "ultima_atividade_em", nullable = false)
    private LocalDateTime ultimaAtividadeEm;

    @Column(name = "expira_em", nullable = false)
    private LocalDateTime expiraEm;

    @Column(name = "revogada", nullable = false)
    private boolean revogada;

    @Column(name = "revogada_em")
    private LocalDateTime revogadaEm;

    // getters/setters
}
```

```java
package modules.iam.refreshtoken;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.sessao.SessaoUsuario;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "tb_refresh_token",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(name = "uk_refresh_token_hash", columnNames = "token_hash"),
        indexes = @Index(name = "ix_refresh_token_sessao", columnList = "sessao_usuario_id")
)
public class RefreshToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sessao_usuario_id", nullable = false)
    private SessaoUsuario sessao;

    // SHA-256 do refresh token entregue ao cliente — nunca armazenar em claro.
    @Column(name = "token_hash", nullable = false, length = 100)
    private String tokenHash;

    @Column(name = "expira_em", nullable = false)
    private LocalDateTime expiraEm;

    @Column(name = "revogada", nullable = false)
    private boolean revogada;

    @Column(name = "revogada_em")
    private LocalDateTime revogadaEm;

    // Para detecção de reuso pós-rotação: aponta para o uuid do RT que substituiu este.
    @Column(name = "substituido_por_uuid")
    private UUID substituidoPorUuid;

    // getters/setters
}
```

```java
package modules.iam.tokenrevogado;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.usuario.Usuario;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tb_token_revogado",
        schema = DbSchemas.IAM,
        uniqueConstraints = @UniqueConstraint(name = "uk_token_revogado_jti", columnNames = "jti"),
        indexes = @Index(name = "ix_token_revogado_expira", columnList = "expira_em")
)
public class TokenRevogado extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // jti do access token revogado
    @Column(name = "jti", nullable = false, length = 64)
    private String jti;

    // Quando o TTL passa, registro pode ser excluído por job de limpeza.
    @Column(name = "expira_em", nullable = false)
    private LocalDateTime expiraEm;

    @Column(name = "motivo", length = 100)
    private String motivo;

    // getters/setters
}
```

### 5.6 Auditoria

> A auditoria também estende `BaseEntity`. Mantemos `usuario_id` como FK
> nullable (login falho em usuário inexistente). A tentativa textual de
> username é preservada para investigação.

```java
package modules.iam.auditoria;

import common.base.BaseEntity;
import infra.persistence.DbSchemas;
import jakarta.persistence.*;
import modules.iam.aplicacaocliente.AplicacaoCliente;
import modules.iam.usuario.Usuario;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tb_auditoria_autenticacao",
        schema = DbSchemas.IAM,
        indexes = {
                @Index(name = "ix_auditoria_autn_usuario_data", columnList = "usuario_id,ocorrido_em"),
                @Index(name = "ix_auditoria_autn_tipo", columnList = "tipo_evento")
        }
)
public class AuditoriaAutenticacao extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // nullable: tentativa em usuário inexistente

    @Column(name = "username_tentativa", length = 200)
    private String usernameTentativa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aplicacao_cliente_id")
    private AplicacaoCliente aplicacaoCliente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false, length = 40)
    private TipoEventoAutenticacao tipoEvento;

    @Column(name = "ip", length = 60)
    private String ip;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "detalhes", length = 500)
    private String detalhes;

    @Column(name = "ocorrido_em", nullable = false)
    private LocalDateTime ocorridoEm;

    public enum TipoEventoAutenticacao {
        LOGIN_SUCESSO, LOGIN_FALHA, LOGOUT,
        TOKEN_REFRESH, TOKEN_REVOGADO,
        SENHA_ALTERADA, RESET_SENHA_SOLICITADO, RESET_SENHA_CONCLUIDO,
        CONTA_BLOQUEADA, CONTA_DESBLOQUEADA
    }

    // getters/setters
}
```

---

# 6. Estratégia de Autorização Granular

**Modelo: RBAC com Permissões + opcional Direct Grants (híbrido).**

1. **Unidade atômica** = `Permissao` = `(AplicacaoCliente, Recurso, Acao)`. Forma canônica: `sistema-financeiro:clientes:CREATE`.
2. **Distribuição preferencial**:
   - `Usuario` → `Grupo` (via `UsuarioGrupo`)
   - `Grupo` → `Papel` (via `GrupoPapel`)
   - `Papel` → `Permissao` (via `PapelPermissao`)
3. **Exceções controladas**:
   - `UsuarioPapel` para vincular papel diretamente ao usuário (com vigência).
   - `UsuarioPermissao` para conceder/negar permissão pontual com `valido_de`/`valido_ate`.
4. **Resolução efetiva** (algoritmo `PermissionResolver`):
   ```
   efetivas(usuario) =
       ⋃ permissoes(papeis(grupos(usuario)))
     ∪ ⋃ permissoes(papeisDiretos(usuario))
     ∪ permissoesDiretas(usuario)
       — filtrado por vigência (valido_de <= agora <= valido_ate) e status=ATIVO
       — filtrado por AplicacaoCliente ativa e UsuarioAplicacao habilitado
   ```
5. **Perfis diferentes por aplicação**: como `Papel` pertence a uma `AplicacaoCliente`, basta atribuir papéis distintos para o mesmo usuário em apps distintas. Naturalmente resolvido pelo modelo.

---

# 7. Estratégia de JWT, Refresh Token, Sessão e Revogação

### 7.1 Tokens

- **Access Token (JWT)** assinado com **RS256** (chave privada do IAM; chave pública distribuída via JWKS endpoint `/iam/.well-known/jwks.json`).
- **TTL curto**: 5–15 min (configurável por `AplicacaoCliente`).
- **Refresh Token**: string opaca (não-JWT), 256 bits aleatórios. Persistido como **hash SHA-256** em `iam.tb_refresh_token`. TTL longo (4h–24h).

### 7.2 Sessão

- Login cria `SessaoUsuario` + 1 `RefreshToken` inicial.
- O JWT carrega `sid = sessaoUsuario.uuid` como claim (o `uuid` herdado de `BaseEntity` é o identificador público).
- Logout = `sessaoUsuario.revogada = true` (cascata lógica em todos os RTs).

### 7.3 Rotação de Refresh Token

- A cada `/refresh`: invalida o RT atual (`revogada=true`, `substituido_por_uuid=novoUuid`), emite novo RT + novo access token.
- **Detecção de reuso**: se um RT já revogado for usado, **revoga toda a sessão** (sinal de roubo de token).

### 7.4 Revogação de JWT antes da expiração

Combinação de três mecanismos (defesa em profundidade):

1. **`sid` na denylist de sessão** (Redis ou flag `SessaoUsuario.revogada`) — chamada `revogarSessao(sid)`.
2. **`jti` na denylist `iam.tb_token_revogado`** — para revogar um access token específico.
3. **`cv` (credential_version)** no JWT — comparado com `UsuarioCredencial.credentialVersion` ao validar; trocas de senha ou "revogar tudo" incrementam o valor e invalidam todos os tokens anteriores.

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
  "sid": "f1b2c3d4-...",                      // SessaoUsuario.uuid
  "cv":  7,                                   // credential_version
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
                                                                       ├─ checa UsuarioAplicacao para client_id
                                                                       ├─ cria SessaoUsuario
                                                                       ├─ gera Access Token (JWT) + Refresh Token
                                                                       ├─ persiste hash(RT) em iam.tb_refresh_token
                                                                       └─ grava AuditoriaAutenticacao(LOGIN_SUCESSO)
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
  → AuditoriaAutenticacao(TOKEN_REFRESH)
```

### Logout
```
POST /iam/auth/logout (Bearer)
  → sessao.revogada = true, todos RTs da sessão revogada = true
  → opcional: adiciona jti em iam.tb_token_revogado
  → AuditoriaAutenticacao(LOGOUT)
```

---

# 10. Fluxo de Autorização (no Backend da Aplicação)

```
Request → JWT extraído pelo SmallRye JWT
       → SecurityIdentityAugmentor injeta permissões resolvidas localmente
       → @PermissionsAllowed("clientes:CREATE") OU verificação programática
       → PermitAll/Deny/Decision logada (opcional) em iam.tb_auditoria_autorizacao
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

> Todas as tabelas residem no schema `iam`. A coluna omitida no nome da
> tabela está implícita (`iam.tb_usuario`, etc.).

| Tabela | Índice | Razão |
|---|---|---|
| `tb_usuario` | `(organizacao_id, username)` UNIQUE | login |
| `tb_usuario` | `(organizacao_id, email)` UNIQUE | login alt. + reset |
| `tb_usuario_credencial` | `usuario_id` UNIQUE | join 1:1 |
| `tb_permissao` | `(aplicacao_cliente_id, recurso_id, acao_id)` UNIQUE | integridade |
| `tb_permissao` | `codigo_permissao` UNIQUE | lookup por código |
| `tb_papel_permissao` | `(papel_id, permissao_id)` UNIQUE | integridade |
| `tb_usuario_grupo` | `(usuario_id, grupo_id)` UNIQUE | integridade |
| `tb_usuario_grupo` | `usuario_id` | resolução de permissões |
| `tb_sessao_usuario` | `(revogada, expira_em)` | limpeza + validação |
| `tb_refresh_token` | `token_hash` UNIQUE | lookup no refresh |
| `tb_refresh_token` | `sessao_usuario_id` | revogação em cascata |
| `tb_token_revogado` | `jti` UNIQUE | lookup na validação |
| `tb_token_revogado` | `expira_em` | job de limpeza |
| `tb_auditoria_autenticacao` | `(usuario_id, ocorrido_em)` | auditoria por usuário |
| `tb_auditoria_autenticacao` | `tipo_evento` | relatórios |

> **Atenção**: por orientação do projeto, **NÃO** criar índice parcial padrão
> sobre `status = 'ATIVO'`. Esse tipo de índice é avaliado caso a caso, apenas
> em tabelas com gargalo diagnosticado via `EXPLAIN` — ver
> [`ADR-0008`](../../adr/0008-indice-parcial-status-ativo-caso-a-caso.md).

---

# 13. Boas Práticas de Segurança

1. **Hash de senha**: Argon2id (preferencial) ou bcrypt cost ≥ 12. **Nunca SHA-x puro.**
2. **Refresh token armazenado em hash** SHA-256, nunca em claro.
3. **JWT assinado com RS256/ES256**, chaves rotacionáveis (kid claim), JWKS endpoint.
4. **TTL curto do access token** (5–15 min).
5. **Rotação obrigatória** de refresh token + detecção de reuso.
6. **Rate limiting** por IP e por user em login/refresh/reset.
7. **Lockout** após N falhas (`UsuarioCredencial.tentativasFalhas`, `bloqueadoAte`).
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
| 8 | Perfis diferentes por app? | Natural: `Papel` pertence a `AplicacaoCliente`. Atribuir papéis distintos em apps distintas. |
| 9 | CRUD vs ações de negócio? | Catálogo `Action` extensível: `CREATE`, `READ`, `UPDATE`, `DELETE` + `APPROVE`, `EXPORT`, `EXECUTE`, etc. Mesma estrutura, sem distinção formal. |
| 10 | Multi-tenant futuro? | Sim. O modelo já nasce com `Organizacao` como contêiner estrutural. Na v1, porém, o sistema opera com uma única organização default, sem seleção no login. |

---

# 15. Extensões Futuras Recomendadas

| Extensão | Como encaixa no modelo |
|---|---|
| **MFA (TOTP/WebAuthn)** | Nova entidade `UserMfaFactor` (tipo, secret, ativo). Claim `amr` no JWT. |
| **Login social** | `UserFederatedIdentity` (provider, externalId, accessToken). Suporte a `iss` externo. |
| **SSO entre apps** | Já contemplado — JWT do IAM funciona em todas as apps `aud`-compatíveis. |
| **ABAC** | Nova entidade `Policy` (DSL ou JSON), avaliada por engine (Cedar, OPA) após RBAC. Atributos: `user.department`, `resource.owner`, `env.time`. |
| **Política de senha** | Entidade `PoliticaSenha` por `Organizacao`: min length, complexidade, histórico (`HistoricoSenha`), idade máx. |
| **Consentimento (OIDC)** | `UserConsent(user, clientApp, scopes, grantedAt)`. |
| **Service accounts / API keys** | `ApiKey(clientApp, scopes, hash, expiresAt)`. |
| **Delegação / impersonation** | `ImpersonationGrant(actorUser, targetUser, validUntil)`, claim `act` no JWT. |
| **Risk-based auth** | Score por IP/UA/horário; trigger de MFA ou bloqueio. |

---

# 16. Conclusão — Recomendação Final de Arquitetura

**Arquitetura recomendada v1**:

1. **Módulo Quarkus separado** (`iam-service`) com seu próprio banco/schema, expondo APIs REST: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/users/{id}/permissions`, `/revocations?since=`, `/.well-known/jwks.json`.
2. **Modelo RBAC granular híbrido**: Permission atômica `(app:resource:action)` → Role (por app) → Group → User. Direct grants permitidos como exceção com vigência.
3. **JWT RS256 curto + Refresh Token opaco rotacionável** persistido como hash. Sessão como entidade central (`UserSession`).
4. **Revogação em camadas**: `sid` + `jti` + `credential_version` + `perm_version`. Cache local nos backends, sincronizado por pub/sub.
5. **JWT minimalista**: identidade, roles por app, versões — não permissões inteiras.
6. **Backends validam local** (JWKS cache + denylist cache) e usam `@RolesAllowed` + `PermissionChecker` para granularidade.
7. **`Organization` mantida desde a v1 como contêiner estrutural** para
   evolução futura do modelo.
8. **Auditoria forte** em `iam_auth_event_log` + opcional `iam_authz_decision_log`.
9. **Tabelas associativas como entidades** sempre que houver vigência, `grantedBy`, status — princípio aplicado a `RolePermission`, `UserGroupMembership`, `GroupRole`, `UserRoleAssignment`, `UserDirectPermission`, `UserAppAccess`.
10. **Caminho evolutivo claro** para MFA, ABAC, SSO federado, login social, sem refactor estrutural.

Essa arquitetura entrega autenticação centralizada, autorização altamente granular por aplicação, revogação efetiva e desempenho — mantendo a base de código manutenível e idiomática para Quarkus 3 + Java 25.

**Arquitetura recomendada v2** (alinhada à estrutura do `backend-quarkus`):

1. **Módulo IAM embarcado no próprio backend Quarkus**, sob `modules.iam.*`
   (já é a estrutura atual — `modules.iam.usuario`, `modules.iam.grupo`,
   `modules.iam.auth`). Não há serviço separado. Todas as tabelas no schema
   **único** `iam` (`DbSchemas.IAM`), seguindo o padrão `tb_*`.
2. **Endpoints REST do IAM** em `modules.iam.auth` (já parcialmente
   existente): `/iam/auth/login`, `/iam/auth/refresh`, `/iam/auth/logout`,
   `/iam/usuarios/{uuid}/permissoes`, `/iam/revogacoes?desde=`,
   `/iam/.well-known/jwks.json`. Endpoints CRUD de administração
   (papéis, permissões, grupos, aplicações) estendem `BaseRest`/`BaseService`
   com `EditDTO`/`ListDTO` como `record`, sem prefixo de versão (regra de
   API interna — ver [`ADR-0006`](../../adr/0006-openapi-swagger-e-nao-versionamento-de-apis-internas.md)).
3. **Modelo RBAC granular híbrido**: `Permissao` atômica
   `(app:recurso:acao)` → `Papel` (por app) → `Grupo` → `Usuario`. Concessões
   diretas permitidas como exceção, sempre com vigência.
4. **JWT RS256 curto + Refresh Token opaco rotacionável** persistido como
   hash. Sessão como entidade central (`SessaoUsuario`), com `uuid` do
   `BaseEntity` servindo como claim `sid`.
5. **Revogação em camadas**: `sid` + `jti` + `credential_version` +
   `perm_version`. Cache local nos backends, sincronizado por pub/sub.
6. **JWT minimalista**: identidade, papéis por app, versões — **não** a
   árvore inteira de permissões.
7. **Backends validam localmente** (JWKS cache + denylist cache) e usam
   `@RolesAllowed` + `PermissionChecker` programático para granularidade.
8. **`Organizacao` mantida desde a v1 como contêiner estrutural** para
   evolução futura do modelo.
9. **Auditoria forte** em `iam.tb_auditoria_autenticacao` + opcional
   `iam.tb_auditoria_autorizacao`.
10. **Tabelas associativas como entidades** sempre que houver vigência,
    `concedido_por`, status — princípio aplicado a `PapelPermissao`,
    `UsuarioGrupo`, `GrupoPapel`, `UsuarioPapel`, `UsuarioPermissao`,
    `UsuarioAplicacao`. Todas estendem `BaseEntity`.
11. **Migrações Flyway** em `src/main/resources/db/migration` — enquanto
    durar a fase inicial, ajustar diretamente `V1__init.sql` para adicionar
    as novas tabelas do IAM (regra temporária do `backend-quarkus/AGENTS.md`).
    Após a primeira execução em ambiente compartilhado, novas migrações
    `V2__ddl_*.sql` passam a ser criadas. Todos os DDL **devem qualificar
    o schema** explicitamente (`iam.tb_usuario`, `iam.tb_permissao` …).
12. **PK e identidade** seguem o padrão único do projeto: `BaseEntity`
    fornece `id` BIGINT (de `core.global_id_seq`, `allocationSize=20`) e
    `uuid` público. Não usar `GenerationType.IDENTITY` nem PKs UUID nativas.
13. **DTOs e mappers**: `EditDTO`/`ListDTO` como Java `record`, conversão
    via MapStruct (`componentModel = "cdi"`), nunca expor entidades nos REST.
14. **Caminho evolutivo claro** para MFA, ABAC, SSO federado, login social,
    sem refactor estrutural — basta adicionar novas entidades sob
    `modules.iam.*` no mesmo schema `iam`.

Essa arquitetura entrega autenticação centralizada, autorização altamente
granular por aplicação, revogação efetiva e desempenho — mantendo a base de
código manutenível e idiomática para Quarkus 3 + Java 25, e totalmente
aderente às convenções do `backend-quarkus`.

### ADRs a registrar antes da implementação

A implementação deste módulo é uma decisão arquitetural não-trivial e por
isso depende de ADRs formais em `backend-quarkus/doc/adr/`
(formato Nygard, português, numerados em sequência). Sugestões:

- **ADR-IAM-A**: Adoção de IAM próprio embarcado (vs Keycloak / IdP externo).
- **ADR-IAM-B**: Modelo RBAC híbrido com `Permissao` atômica + `Papel` por
  aplicação + `Grupo` organizacional.
- **ADR-IAM-C**: JWT RS256 curto + Refresh Token opaco rotacionável; sessão
  como entidade.
- **ADR-IAM-D**: Estratégia de revogação em camadas (`sid` + `jti` +
  `credential_version` + `perm_version`) com cache + pub/sub.
- **ADR-IAM-E**: Multi-tenant via `Organizacao` desde o dia 1 (mesmo com
  uma única organização default em produção inicial).

### Sugestões de próximos passos práticos

Posso aprofundar qualquer um destes pontos com código pronto para o projeto. Quer que eu siga com algum?

- (a) Atualização de `V1__init.sql` (Flyway) com os DDL das novas tabelas IAM no schema `iam`.
- (b) Esqueleto das entidades JPA sob `modules.iam.*` (`Organizacao`, `AplicacaoCliente`, `Papel`, `Permissao`, …) com Repository/Service/Rest/Mapper aderentes ao `BaseEntity`/`BaseRepository`/`BaseService`/`BaseRest`.
- (c) Implementação do `AuthService` (login + emissão JWT/RT + rotação + auditoria).
- (d) Implementação do `PermissionResolver` + cache Caffeine + propagação de revogações.
- (e) `SecurityIdentityAugmentor` do Quarkus + `@PermissionsAllowed` ponta a ponta.
- (f) Redação dos ADRs listados acima em `backend-quarkus/doc/adr/`.

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
