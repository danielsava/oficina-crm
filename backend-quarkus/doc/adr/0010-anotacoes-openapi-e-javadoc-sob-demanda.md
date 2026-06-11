# ADR-0010: Anotações OpenAPI e Javadoc adicionados apenas sob demanda

- **Status**: Accepted
- **Data**: 2026-06-11
- **Autores**: Equipe Oficina CRM
- **Supersedes**: ponto 3 da [ADR-0006](./0006-openapi-swagger-e-nao-versionamento-de-apis-internas.md) ("Anotação `@Schema` adotada como padrão nos DTOs"). As demais decisões da ADR-0006 (publicação do OpenAPI/Swagger UI, ausência de versionamento em CRUD interno, modelo das APIs de integração futuras) permanecem em vigor.

## Contexto

A ADR-0006 estabeleceu, entre outras decisões, que **todos os DTOs receberiam `@Schema` como padrão**, com descrição, `example`, `maxLength` etc. O `AGENTS.md` do backend foi além e também passou a exigir `@Tag` em todo `*Rest`, com `@Operation` e `@APIResponse` herdados via `BaseRest`. O argumento original (registrado no item 5 da ADR-0006) foi que o custo da anotação seria baixo e o ganho de DX no Swagger UI e na geração de tipos no `frontend-ultima` seria alto.

Após algumas iterações de implementação (CRUD do `Usuario`, plano 0002 inicial e plano 0003 da busca avançada), observou-se na prática:

- **Ruído no código**: cada DTO recebia `@Schema` no record + um `@Schema` por campo (descrição, exemplo, tamanhos). Records de 4-5 campos viravam blocos de 20+ linhas, empurrando a estrutura real do tipo para fora da primeira tela.
- **Redundância informacional**: a maior parte das descrições reformulava o nome do campo (`@Schema(description = "Nome completo do usuário")` em cima de `String nome`). O `example` raramente acrescentava algo que o frontend não soubesse pela tela em que o campo é exibido. `maxLength` já está em `@Size` (Bean Validation) e o SmallRye OpenAPI consome essa anotação automaticamente.
- **`@Tag`, `@Operation`, `@APIResponse` no `BaseRest`**: o Javadoc de operação era duplicado entre o `BaseRest` e o `*Rest` concreto via `@Tag`, sem ganho proporcional. O contrato de erros (400/404/409/500 em `application/problem+json`) já está garantido em runtime pelos `ExceptionMapper` do pacote `infra/exception/*`; declarar isso de novo em anotações é cerimônia.
- **Javadoc extenso nas bases (`BaseService`, `BaseRest`, `FiltroAvancadoQueryBuilder`, mappers de exceção)**: a documentação acumulada (motivação, contratos, regras, exemplos) repetia o que o `AGENTS.md`, as ADRs e o próprio código (via nomes claros e estrutura óbvia) já transmitiam. O custo de leitura no arquivo passou a ser maior que o ganho informacional.
- **Geração de tipos no frontend continua funcionando sem `@Schema`**: o SmallRye OpenAPI gera o contrato a partir das anotações JAX-RS, dos tipos de retorno, dos componentes do record DTO e do Bean Validation. O contrato gerado é suficiente para o `openapi-typescript` produzir interfaces TypeScript fiéis. O ganho marginal de `@Schema` decorativo (description/example) não justifica o custo no código Java.

A motivação original da ADR-0006 (item 5 da análise crítica) — geração automática de tipos no frontend — **continua válida** e segue sendo a justificativa de manter o `quarkus-smallrye-openapi` ligado e o Swagger UI publicado. O que muda é o **custo aceito no código Java** para sustentar essa documentação.

## Decisão

Adotamos as duas políticas abaixo, registradas formalmente no `backend-quarkus/AGENTS.md` (seção "OpenAPI / Swagger UI" e nova subseção "Code Documentation Policy" em "Coding Standards").

### 1. Anotações OpenAPI de documentação ficam **OFF por padrão**

Anotações **NÃO** devem ser adicionadas como prática de rotina em classes REST, métodos ou records DTO:

- `@Tag` em classes `*Rest`.
- `@Operation`, `@APIResponse` em métodos.
- `@Parameter` em parâmetros de método.
- `@Schema` em records DTO (no tipo e nos componentes).

Essas anotações **SOMENTE** podem ser adicionadas:

- Quando explicitamente solicitado pelo usuário, e apenas na classe/método/campo específico para o qual a solicitação se aplica.
- Em endpoints novos cuja semântica difere significativamente do CRUD genérico (ex.: endpoint de integração futura), quando o usuário pedir a documentação rica como parte do escopo.

O agente de IA **não deve** retrofitar essas anotações em código existente nem "melhorar a documentação" em endpoints adjacentes sem pedido explícito.

O contrato HTTP continua sendo publicado em `/q/openapi` e o Swagger UI em `/q/swagger-ui`. O SmallRye OpenAPI gera o contrato a partir das anotações JAX-RS, dos tipos de retorno e dos componentes dos records DTO — esse baseline é o que sustentamos. Códigos de erro (400/404/409/500) seguem documentados implicitamente pelo comportamento dos mappers em `infra/exception/*`, retornando `application/problem+json` (ver ADR-0004).

### 2. Javadoc e comentários narrativos em código Java seguem a mesma política de mínima

Não adicionar Javadoc, blocos `/* ... */` ou comentários inline narrativos como prática de rotina. Aplica-se a classes, records, enums, interfaces, métodos e campos sob `src/main/java/**`.

Quando um comentário é genuinamente necessário (decisão não-óbvia que o leitor poderia silenciosamente quebrar; trade-off consciente; dívida técnica), preferir um **comentário inline curto** (uma ou duas linhas) no exato ponto de decisão, em vez de Javadoc em bloco no topo da classe ou do método.

Refatorações em código existente DEVEM remover Javadoc/comentários que não atendam ao critério acima — não preservar documentação só porque ela estava lá.

Testes (`src/test/java/**`) podem usar `@DisplayName` para descrever cenários, mas seguem a mesma restrição para comentários narrativos.

## Consequências

### Positivas

- **Leitura objetiva do código**: a estrutura de tipos e a lógica voltam a aparecer logo no topo do arquivo, sem Javadoc empurrando-as para a segunda ou terceira tela.
- **Menos drift documental**: documentação que repete o nome do método/campo é a primeira a ficar desatualizada quando o código muda; remover essa camada reduz a quantidade de "documentação que mente".
- **Custo do desenvolvedor cai**: cada record DTO encolhe de 20+ linhas para 6-10 linhas; cada `*Rest` concreto fica reduzido ao essencial (path, injeção, override do `service()`).
- **Política simples**: "anotações OpenAPI e Javadoc só sob demanda" é mais fácil de ensinar e revisar do que "Javadoc obrigatório em A, B, C mas dispensado em D, E sob certas condições".
- **Contrato OpenAPI permanece útil**: o baseline gerado pelo SmallRye continua suficiente para o `openapi-typescript` produzir tipos no `frontend-ultima` (validado na prática no plano 0003).

### Negativas

- **Swagger UI fica menos descritivo**: descrições de endpoint, exemplos por campo e mensagens de resposta deixam de aparecer no `/q/swagger-ui` por padrão. Aceitável: o `frontend-ultima` é o único consumidor (ver ADR-0006), e a tela própria contextualiza o uso. Quando um endpoint específico justificar documentação rica (ex.: endpoint de integração futura), o pedido explícito reabilita as anotações para aquele endpoint.
- **Generators que dependem de `example`**: ferramentas como Postman ou alguns geradores de SDK podem produzir mocks menos úteis. Aceitável pelo mesmo motivo: o cenário "consumidor externo querendo SDK" cai na ADR-0006 (será endpoint de integração dedicado, com sua própria documentação).
- **`maxLength` e `required` deixam de aparecer no `@Schema` redundante**, mas continuam expressos pelas anotações Bean Validation (`@Size`, `@NotBlank`, `@Email`) que o SmallRye OpenAPI consome para popular `maxLength`, `pattern` e `required` no contrato gerado. Sem perda real de informação no `/q/openapi`.

### Neutras

- A dependência `quarkus-smallrye-openapi` permanece. A configuração `quarkus.swagger-ui.always-include=true` permanece. O Swagger UI continua publicado em todos os perfis (a ressalva de auth registrada na ADR-0006 segue válida).
- O `frontend-ultima` continua consumindo `/q/openapi` como fonte canônica de tipos (ver ADR-0006).

## Alternativas consideradas

- **Manter `@Schema` obrigatório nos DTOs e remover só `@Operation`/`@APIResponse`**: descartada porque o problema observado (ruído no código, redundância) é mais agudo justamente nos records DTO — são os arquivos pequenos onde a anotação dobra ou triplica o tamanho do código.
- **`@Schema` obrigatório apenas no tipo (nível de record), opcional nos componentes**: considerada. Descartada por inconsistência prática: na maior parte dos casos a descrição no nível do tipo só reformula o nome do record (`UsuarioListDTO` → "DTO de listagem de Usuário"). Sem ganho.
- **`@Tag` obrigatório, `@Operation`/`@APIResponse` opcional**: descartada. `@Tag` agrupa endpoints no Swagger UI, mas o agrupamento natural pelo path (`/usuario/*`) já é claro. Tag adicional cria duplicação semântica.
- **Adicionar `@Schema(example = ...)` automaticamente em campos onde Bean Validation já restringe**: descartada. Os exemplos no Swagger UI ajudavam pouco e ficavam errados rapidamente (`example = "9b1b1d3c-..."` vira mentira no momento que o desenvolvedor copia para outro DTO sem ajustar).
- **Política de "Javadoc obrigatório em bases (`Base*`) e opcional em concretos"**: descartada. As bases são justamente onde o Javadoc mais acumulou ruído ao longo das iterações (várias seções, listas de regras, exemplos). O `AGENTS.md` e as ADRs já cumprem o papel de manual; o código não precisa duplicar.

## Referências

- [ADR-0006](./0006-openapi-swagger-e-nao-versionamento-de-apis-internas.md) — decisão original; pontos 1, 2, 4, 5 e a análise crítica permanecem em vigor; ponto 3 (`@Schema` adotada como padrão) é superseded por esta ADR.
- [ADR-0004](./0004-rfc-7807-problem-details-para-erros-http.md) — contrato de erros, garantido em runtime pelos `ExceptionMapper`.
- `backend-quarkus/AGENTS.md` — seção "OpenAPI / Swagger UI" e subseção "Code Documentation Policy" em "Coding Standards".
- Documentação: [SmallRye OpenAPI — schema inference](https://smallrye.io/docs/smallrye-open-api/2.4.x/), [Quarkus — OpenAPI and Swagger UI](https://quarkus.io/guides/openapi-swaggerui).
