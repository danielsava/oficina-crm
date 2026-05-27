# ADR-0003: `EditDTO` como DTO único de formulário (entrada e leitura para edição)

- **Status**: Accepted
- **Data**: 2026-05-26

## Contexto

O CRUD padrão precisa retornar, no `GET /{uuid}`, uma representação do registro adequada para alimentar o formulário de edição no frontend. Antes desta decisão, o endpoint devolvia a entidade JPA (`Usuario`), o que violava a regra de não expor entidades em REST e expunha campos sensíveis como `senhaHash`.

A questão central era: qual DTO usar como retorno do `GET /{uuid}`?

Alternativas avaliadas:

- **Reusar `ListDTO`** — DTO já existente, pensado para listagem.
- **Criar `DetailDTO`** — DTO dedicado para o detalhe.
- **Reusar `EditDTO`** — DTO de entrada, com os mesmos campos do formulário.

A observação determinante veio do uso real no frontend: nesta aplicação, **o formulário de cadastro e o formulário de edição são o mesmo formulário**, mudando apenas se o envio dispara `POST` ou `PUT`. Os campos exibidos e editáveis são idênticos.

## Decisão

Adotamos **`EditDTO` como DTO único de formulário**:

- `POST /` recebe `EditDTO` (criação).
- `PUT /{uuid}` recebe `EditDTO` (atualização).
- `GET /{uuid}` **retorna `EditDTO`** populado com os dados do registro (leitura para edição).
- `GET /` continua retornando `List<ListDTO>` (listagem permanece com DTO próprio, otimizado).

O `BaseService` ganha o método `buscarEditDTOporUUID(uuid)`, implementado por projeção Panache (`repository.find("uuid", ...).project(editDTO()).firstResult()`), seguindo o mesmo padrão do `listarDTO()`. O método abstrato `editDTO()` foi adicionado à base e cada `*Service` concreto declara `Class<*EditDTO> editDTO()`.

Campos sensíveis ou write-only (senhas, tokens, etc.) **não** vivem no `EditDTO`. Eles são tratados por endpoints/formulários dedicados a serem definidos por entidade.

Metadados (`status`, `createdAt`, `updatedAt`, `version`) **não** vivem no `EditDTO` neste momento. Se o formulário de edição precisar exibi-los no futuro, serão adicionados como campos opcionais.

O `uuid` **não** vive no `EditDTO`: o frontend o obtém da URL atual.

## Consequências

### Positivas

- **Simetria com o frontend**: a forma do payload espelha exatamente a forma do formulário, eliminando mapeamento manual no cliente.
- **Menos boilerplate**: um único DTO de formulário por entidade, em vez de `EditDTO` + `DetailDTO`.
- **Coerência**: criar, ler-para-editar e atualizar usam o mesmo contrato.
- **Performance**: projeção Panache evita carregar a entidade quando o EditDTO basta.

### Negativas

- **Acopla criação e edição**: se algum dia os formulários de criação e edição divergirem (campos diferentes, validações distintas), será necessário separar em dois DTOs ou usar grupos de validação. Aceitamos esse risco porque hoje não há divergência prevista.
- **Limita o detalhe ao que cabe no formulário**: a tela de "ver detalhes" (read-only, com mais campos) precisará, no futuro, de um DTO próprio (`DetailDTO`). A decisão atual atende apenas ao formulário de edição.
- **Campos sensíveis exigem endpoint paralelo**: senha (e similares) precisará de fluxo dedicado, aumentando ligeiramente a superfície da API.

### Neutras

- A base `BaseRest<Entity, EditDTO, ListDTO>` mantém 3 type parameters (não foi necessário um 4º para `DetailDTO`).
- O método interno `BaseService.buscarPorUUID(uuid)` (que retorna a entidade) permanece disponível para uso interno; o REST passa a usar `buscarEditDTOporUUID`.

## Dívida técnica registrada

**Senha temporária fixa no cadastro de Usuario.**

Como o campo `senha` foi removido do `UsuarioEditDTO` e o fluxo dedicado de definição/alteração de senha ainda não existe, `UsuarioService.inserir` define temporariamente a senha hash a partir da constante `"123456"` (`SENHA_TEMPORARIA_PADRAO`).

Esta é uma solução **explicitamente temporária**, registrada aqui para não ser esquecida. O destino é:

1. Criar endpoint dedicado para criação/alteração de senha (formulário próprio).
2. Substituir a senha fixa por uma senha aleatória criptograficamente forte gerada no cadastro.
3. Obrigar troca de senha no primeiro login (flag `senha_temporaria` ou `precisa_trocar_senha` em `Usuario`).
4. Reintegrar `PasswordValidatorUtil` (validação de força) no fluxo de definição/alteração de senha.

Enquanto essa dívida existir:
- **Nenhum ambiente compartilhado** (homologação, produção) deve usar este código sem antes resolver a dívida.
- Usuários criados neste estado **devem trocar a senha imediatamente** no primeiro acesso.

Esta dívida será fechada por um ADR futuro que descreve o fluxo definitivo de senha.

## Alternativas consideradas

- **`DetailDTO` dedicado**: separação clara entre listagem, detalhe e edição. Descartado porque o frontend usa o mesmo formulário para criar e editar — um `DetailDTO` separado seria, na prática, um clone do `EditDTO`. Pode ser reintroduzido no futuro se a tela de "ver detalhes" (read-only) for criada.
- **Reusar `ListDTO`**: descartado porque `ListDTO` é otimizado para listagem (poucos campos) e tende a divergir de um detalhe à medida que a entidade cresce.

## Referências

- `common.BaseService.buscarEditDTOporUUID` — implementação por projeção Panache.
- `common.BaseRest.buscarPorUUID` — endpoint `GET /{uuid}` retornando `EditDTO`.
- `modules.iam.usuario.UsuarioService.SENHA_TEMPORARIA_PADRAO` — dívida técnica da senha fixa.
- ADR-0002 — `uuid` como identificador público (motiva a forma do path `/{uuid}`).
