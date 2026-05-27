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

| #    | Título                                                                                                  | Status   |
|------|---------------------------------------------------------------------------------------------------------|----------|
| 0001 | [Padrão de nomenclatura `*Rest` para classes JAX-RS](./0001-padrao-nomenclatura-rest.md)                | Accepted |
| 0002 | [UUID como identificador público em URLs e DTOs](./0002-uuid-como-identificador-publico.md)             | Accepted |
