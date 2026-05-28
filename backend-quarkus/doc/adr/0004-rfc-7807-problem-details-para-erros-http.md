# ADR-0004: RFC 7807 (Problem Details) como contrato único de erro HTTP

- **Status**: Accepted
- **Data**: 2026-05-27

## Contexto

O `AGENTS.md` do backend já declarava como regra que **todas** as respostas de erro da API devem seguir a RFC 7807 (Problem Details for HTTP APIs). Antes desta decisão, porém, não havia implementação correspondente:

- `NotFoundException` lançada no `BaseRest` produzia resposta `text/plain` com apenas a mensagem.
- `ValidationException` lançada nos services (regras de negócio imperativas) vazava o handler default do Quarkus, sem payload estruturado.
- `ConstraintViolationException` (Bean Validation) caía no formato default do `quarkus-rest`, fora do contrato.
- Qualquer outra exception não tratada (`Throwable`) resultava em um stack trace ou em uma resposta HTML inesperada, vazando estrutura interna.

A consequência é um contrato inconsistente: o frontend (Angular/PrimeNG) precisaria de N parsers diferentes, e a observabilidade fica prejudicada (logs heterogêneos, dificuldade de correlação).

Esta decisão precisa ser tomada **antes** de replicar o CRUD para outras entidades, para que o padrão de erro nasça uniforme.

## Decisão

Adotamos a **RFC 7807** como contrato único e obrigatório de resposta de erro HTTP, com a seguinte estrutura.

### Localização

- Pacote: **`infra.exception`** (espelha `infra.event`, mantendo infraestrutura técnica fora de `common` e de `modules`).
- Record canônico: `infra.exception.ProblemDetails`.
- Um `ExceptionMapper` por tipo de exception, todos no mesmo pacote.

### Payload

```java
public record ProblemDetails(
        URI type,
        String title,
        int status,
        String detail,
        URI instance,
        List<FieldError> errors
)
```

- Serializado como **`application/problem+json`** (constante `ProblemDetails.MEDIA_TYPE`).
- Campos `null` são omitidos (`@JsonInclude(NON_NULL)`).
- `type` usa `about:blank` (default da RFC) enquanto não publicarmos a documentação de erros. A migração para URIs reais (`https://api.oficinacrm.com.br/problems/...`) será aditiva e não-breaking.
- `errors` é uma extensão da RFC para erros de Bean Validation; cada item é um `FieldError(field, message)`. Presente **apenas** em respostas de `ConstraintViolationException`.
- `instance` permanece `null` por enquanto (pode ser preenchido futuramente com a URI da requisição via filtro JAX-RS).

### Mappers iniciais

| Exception                              | Status | Mapper                                |
|----------------------------------------|--------|---------------------------------------|
| `NotFoundException`                    | 404    | `NotFoundExceptionMapper`             |
| `ConstraintViolationException`         | 400    | `ConstraintViolationExceptionMapper`  |
| `ValidationException`                  | 400    | `ValidationExceptionMapper`           |
| `WebApplicationException` (e subtipos) | status da exception | `WebApplicationExceptionMapper` |
| `Throwable` (catch-all)                | 500    | `ThrowableExceptionMapper`            |

- O JAX-RS escolhe sempre o mapper de tipo mais específico, de modo que `NotFoundException` (subtipo de `WebApplicationException`) é capturada pelo seu mapper dedicado e não pelo fallback.
- `io.quarkus.security.UnauthorizedException` é subtipo de `WebApplicationException` e cai naturalmente no `WebApplicationExceptionMapper` (status 401 vindo da própria exception).
- O `ThrowableExceptionMapper` loga a causa raiz com nível `error` e responde com mensagem genérica, evitando vazamento de stack trace ou estrutura JPA.

### Lançamento manual no `BaseRest`

O `BaseRest` continua lançando `NotFoundException` manualmente quando o service retorna `null` ou `false`. Esta decisão é deliberada: o lançamento ocorre na borda REST (consistência semântica do ponto de vista do controller), e o mapper apenas cuida da serialização.

## Consequências

### Positivas

- **Contrato único**: o frontend implementa um único parser de erro.
- **Observabilidade**: logs e respostas seguem o mesmo formato; correlação é trivial.
- **Sem vazamento de detalhes internos**: o catch-all final padroniza 500 sem stack trace na resposta.
- **Pronto para validação de payload**: o mapper de `ConstraintViolationException` já carrega `errors` por campo, destravando o uso de `@Valid` no `BaseRest` (item 13 do plano de padronização).
- **Aditivo no `type`**: introduzir URIs reais no futuro é mudança de conteúdo, não de contrato.

### Negativas

- **Cinco classes novas** apenas para padronizar erros. Justificável pela superfície estável e pelo benefício de DX.
- **`type = about:blank`** transmite menos informação do que URIs específicas. Compromisso aceito: melhor `about:blank` correto agora do que URIs reais inventadas que ainda não documentam nada.
- **`instance` sempre `null`** por ora. Quando houver demanda de tracing por requisição, será adicionado via filtro JAX-RS (mudança aditiva).

### Neutras

- O `quarkus-rest-jackson` serializa o record nativamente; nenhuma dependência nova foi adicionada ao `pom.xml`.
- O Content-Type da resposta de erro passa a ser `application/problem+json` (anteriormente `text/plain` ou default do Quarkus). Clientes que filtram por `Accept: application/json` continuam funcionando porque `problem+json` é um subtipo JSON.
- A extensão `errors` (lista por campo) não é parte do mínimo RFC 7807, mas é explicitamente permitida pela seção 3.2 (membros estendidos).

## Alternativas consideradas

- **Pacote `common.exception`**: descartado porque `common.*` é reservado para tipos base reaproveitáveis pelos módulos de domínio. Mappers são infraestrutura transversal, alinhados ao `infra.event` já existente.
- **URIs reais em `type` desde já** (ex.: `https://api.oficinacrm.com.br/problems/not-found`): descartado porque ainda não há documentação publicada; URIs sem destino confundem mais do que ajudam. `about:blank` é o default explícito da RFC para este cenário.
- **Um único mapper `Throwable` resolvendo tudo via `instanceof`**: descartado por agredir o modelo JAX-RS (que prefere despacho por tipo). Um mapper por exception é mais legível, mais testável e permite Bean Validation já carregar `errors` sem condicionais.
- **Wrapper sobre `Response.serverError().entity(...)` no `BaseRest`**: descartado porque concentra responsabilidade na camada REST e perderia exceções lançadas em services, filtros e providers.

## Referências

- [RFC 7807 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc7807)
- `infra.exception.ProblemDetails` — record canônico do payload.
- `infra.exception.*ExceptionMapper` — implementação dos mappers.
- Plano de padronização do CRUD, item 5 (`doc/planos/0001-padronizacao-crud-backend.md`).
- ADR-0002 — `uuid` como identificador público (define o tipo de erro 404 mais comum: UUID não encontrado).
