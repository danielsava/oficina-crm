# Architecture Decision Records (ADRs)

Este diretório registra as **decisões arquiteturais** do backend.

## Propósito

- **`AGENTS.md`** descreve *o que* deve ser feito (regras operacionais).
- **ADRs** descrevem *por que* foi decidido daquela forma (contexto, alternativas, trade-offs, consequências).

Quando uma regra do `AGENTS.md` mudar, o ADR correspondente registra o porquê da mudança.

## Quando criar um ADR

Crie um ADR sempre que uma decisão:

- Afetar a estrutura, padrões ou convenções do projeto (e não apenas implementação local).
- Tiver alternativas viáveis que foram avaliadas.
- For relevante para entender o sistema meses depois.

Não vale a pena ADR para: escolhas triviais, formatação, bugs simples, refatorações locais.

## Decisões cross-cutting

Decisões que afetam **backend e frontend simultaneamente** (ex.: contrato de API, identificador público, formato de erros) podem residir em qualquer um dos dois diretórios `doc/adr/`. Quando isso acontecer, o ADR no diretório "espelho" deve ser **referenciado** (linkado), não duplicado, para evitar divergência.

## Convenções

- Formato: **Nygard clássico** (Status, Context, Decision, Consequences, opcionalmente Alternatives).
- Idioma: **português**.
- Nome do arquivo: `NNNN-titulo-em-kebab-case.md`, numeração sequencial começando em `0001`.
- ADRs **não são editados** depois de aceitos. Se a decisão muda, cria-se um novo ADR com `Status: Accepted` e `Supersedes: ADR-XXXX`. O ADR antigo passa para `Status: Superseded by ADR-YYYY`.
- O template está em [`template.md`](./template.md).

## Status possíveis

- **Proposed**: em discussão.
- **Accepted**: decisão vigente.
- **Deprecated**: não se aplica mais, mas não foi substituída por outra.
- **Superseded by ADR-XXXX**: substituída por outra decisão.

## Índice

| #    | Título                                                                                                          | Status   |
|------|-----------------------------------------------------------------------------------------------------------------|----------|
| 0001 | [Padrão de nomenclatura `*Rest` para classes JAX-RS](./0001-padrao-nomenclatura-rest.md)                        | Accepted |
| 0002 | [UUID como identificador público em URLs e DTOs](./0002-uuid-como-identificador-publico.md)                     | Accepted |
| 0003 | [`EditDTO` como DTO único de formulário (entrada e leitura para edição)](./0003-editdto-como-dto-unico-de-formulario.md) | Accepted |
| 0004 | [RFC 7807 (Problem Details) como contrato único de erro HTTP](./0004-rfc-7807-problem-details-para-erros-http.md)       | Accepted |
| 0005 | [Remoção do hard delete (`DELETE /{uuid}`) do `BaseRest`](./0005-remocao-do-hard-delete-no-baserest.md)                  | Accepted |
| 0006 | [OpenAPI/Swagger em dev e prod, sem versionamento de APIs internas de CRUD](./0006-openapi-swagger-e-nao-versionamento-de-apis-internas.md) | Accepted |
| 0007 | [Media types explícitos no `BaseRest` para não depender dos defaults do Quarkus](./0007-media-types-explicitos-no-baserest.md) | Accepted |
| 0008 | [Indice parcial em `status = 'ATIVO'` avaliado caso a caso](./0008-indice-parcial-status-ativo-caso-a-caso.md) | Accepted |
