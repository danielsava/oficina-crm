# ADR-0007: Media types explicitos no BaseRest para nao depender dos defaults do Quarkus

- **Status**: Accepted
- **Data**: 2026-06-04
- **Autores**: Equipe Oficina CRM

## Contexto

O plano de padronizacao do CRUD (`doc/planos/0001-padronizacao-crud-backend.md`, pendencia #18) identificou que os endpoints herdados de `BaseRest` nao declaravam `@Produces` nem `@Consumes`, apoiando-se no comportamento default do Quarkus quando uma extensao JSON esta instalada.

Esse comportamento atual funciona, mas deixa o contrato HTTP dependente de uma convencao do framework, e nao de uma decisao explicita do sistema. Isso cria duas fragilidades:

- o contrato fica menos legivel no codigo e no OpenAPI gerado;
- uma mudanca futura no comportamento default do Quarkus, em extensoes JSON ou em configuracoes globais, poderia alterar o comportamento esperado sem nenhuma mudanca nos recursos REST do projeto.

Ao mesmo tempo, o sistema ja possui uma decisao explicita para erros HTTP: respostas de excecao usam RFC 7807 com `application/problem+json`, definido pelos `ExceptionMapper`s (ADR-0004). Portanto, a decisao sobre media type dos recursos de sucesso deve ficar separada do media type das respostas de erro.

## Decisao

Padronizamos a declaracao explicita dos media types no `BaseRest`:

- `@Produces(MediaType.APPLICATION_JSON)` no nivel da classe base, valendo para todos os endpoints do CRUD generico;
- `@Consumes(MediaType.APPLICATION_JSON)` somente nos metodos que recebem payload (`POST` e `PUT`);
- `GET` e `DELETE` nao declaram `@Consumes`, para manter o contrato semanticamente preciso;
- respostas de erro continuam fora dessa anotacao e seguem `application/problem+json` via `ExceptionMapper`.

Com isso, o contrato HTTP do CRUD interno passa a ser definido pelo proprio codigo da aplicacao, e nao por defaults do Quarkus.

## Consequencias

### Positivas

- O contrato REST fica explicito, legivel e consistente no codigo-fonte.
- O OpenAPI refletira de forma mais previsivel os media types de sucesso dos endpoints.
- O sistema deixa de depender do comportamento default atual do Quarkus para JSON.
- Uma eventual mudanca futura nesses defaults nao afetara o contrato do CRUD interno.
- O tratamento de erro permanece corretamente separado, com `application/problem+json` apenas nos fluxos de excecao.

### Negativas

- Adicionamos algumas anotacoes extras na classe base e nos metodos de escrita.
- Se algum endpoint especifico precisar consumir ou produzir outro media type no futuro, ele devera sobrescrever explicitamente a regra herdada.

### Neutras

- Nao ha mudanca de payload, path, semantica de negocio ou serializacao efetiva no estado atual do projeto; a decisao formaliza o contrato que ja era praticado por default.

## Alternativas consideradas

### A) Continuar sem `@Produces` e sem `@Consumes`

Descartada porque mantem o sistema acoplado ao comportamento default do Quarkus. Funciona hoje, mas o contrato fica implicito e mais fragil a mudancas futuras de framework ou configuracao.

### B) Declarar `@Produces` e `@Consumes` na classe inteira

Descartada porque aplicaria `@Consumes(application/json)` tambem a `GET` e `DELETE`, o que nao representa com precisao a semantica dos endpoints sem corpo.

### C) Declarar as anotacoes em cada `*Rest` concreto

Descartada porque duplicaria uma regra transversal do CRUD generico e aumentaria o risco de divergencia entre entidades.

## Referencias

- Plano: [`doc/planos/0001-padronizacao-crud-backend.md`](../planos/0001-padronizacao-crud-backend.md), pendencia #18.
- ADR relacionado: [ADR-0004](./0004-rfc-7807-problem-details-para-erros-http.md).
- Documentacao: [Quarkus REST](https://quarkus.io/guides/rest), secao de `@Produces` e `@Consumes`.
