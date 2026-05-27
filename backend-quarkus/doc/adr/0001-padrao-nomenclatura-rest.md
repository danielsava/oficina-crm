# ADR-0001: Padrão de nomenclatura `*Rest` para classes JAX-RS

- **Status**: Accepted
- **Data**: 2026-05-26

## Contexto

O backend usa Quarkus + JAX-RS. A camada que expõe endpoints HTTP precisa de um nome padronizado, aplicado a todas as entidades do CRUD genérico (`BaseRest<Entity, EditDTO, ListDTO>` e as classes concretas por módulo).

Duas convenções estavam em uso simultaneamente, o que gerava inconsistência:

- O `AGENTS.md` falava em `Controller` / `BaseController`.
- O código já implementado usava `Rest` / `BaseRest` (ex.: `UsuarioRest`, `AuthRest`).

Era necessário escolher uma e padronizar.

## Decisão

Adotamos **`*Rest`** como sufixo das classes JAX-RS e **`BaseRest`** como nome da classe base genérica.

Exemplos:

- `UsuarioRest extends BaseRest<Usuario, UsuarioEditDTO, UsuarioListDTO>`
- `AuthRest`

O `AGENTS.md` foi ajustado para refletir essa convenção em todas as seções (estrutura do módulo, padrão de camadas, base components, naming conventions, coding standards).

## Consequências

### Positivas

- **Aderência ao idioma do framework**: JAX-RS chama suas classes de "resources" / "REST endpoints". `Rest` é mais próximo desse vocabulário do que `Controller` (que vem do mundo MVC tradicional, Spring/Struts).
- **Aderência à comunidade Quarkus**: a maior parte do material e dos exemplos oficiais usa `*Resource` ou `*Rest`. `Controller` é raro nesse ecossistema.
- **Sem retrabalho de código**: o código já estava nesse padrão; apenas o `AGENTS.md` divergia.

### Negativas

- **Diverge do hábito Spring/MVC**: desenvolvedores vindos de Spring Boot esperam `*Controller`. Ônus mínimo de adaptação.
- **Não é `*Resource`** (que seria o nome mais literal da especificação JAX-RS). Optamos por `*Rest` porque é o nome curto já em uso no projeto, e `Resource` em PT-BR também é palavra reservada em outros contextos do domínio (ex.: recursos da oficina).

### Neutras

- Decisão puramente de nomenclatura: não afeta runtime, performance ou contratos HTTP.

## Alternativas consideradas

- **`*Controller` / `BaseController`**: padrão Spring/MVC. Descartado por ser estranho ao Quarkus/JAX-RS e exigir renomear todo o código existente sem ganho técnico.
- **`*Resource` / `BaseResource`**: nome canônico da especificação JAX-RS. Descartado para evitar conflito semântico com "recursos" do domínio de oficina mecânica (peças, ferramentas, etc.) e porque `*Rest` já era o padrão adotado.

## Referências

- `backend-quarkus/AGENTS.md` — seções *Architecture and Structure*, *Common Base Components*, *Coding Standards*, *Naming Conventions*.
