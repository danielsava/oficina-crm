# ADR-0005: Remoção do hard delete (`DELETE /{uuid}`) do `BaseRest`

- **Status**: Accepted
- **Data**: 2026-05-28

## Contexto

O `common.base.BaseRest` originalmente expunha **dois** endpoints de exclusão para qualquer entidade que herdasse do CRUD genérico:

- `DELETE /{uuid}` — **hard delete**: removia fisicamente o registro do banco via `BaseService.excluirPorUUID(...)`.
- `DELETE /inativar/{uuid}` — **soft delete**: marcava `status = INATIVO` via `BaseService.inativarPorUUID(...)`.

Em um sistema corporativo com auditoria, FKs futuras (cliente, veículo, ordem de serviço, estoque, financeiro) e exigências de rastreabilidade, expor hard delete como **padrão genérico** em **toda** entidade tem custos relevantes:

- Quebra de referências históricas (linhas que apontavam para o registro deixam de fazer sentido).
- Perda de auditoria: o que foi excluído fisicamente não pode mais ser inspecionado em logs de dados.
- Risco operacional: um cliente que acidentalmente chama `DELETE /entidade/{uuid}` perde o registro de forma irreversível.
- Conflito com a política de soft delete já adotada (`EnumStatusEntity.INATIVO` + filtro `status = ATIVO` em `BaseService.listarDTO()`).

Como o projeto ainda está na fase inicial (nenhuma FK foi criada) e nenhum `*Rest` específico depende do hard delete genérico, esta é a janela ideal para padronizar o comportamento antes da multiplicação de entidades.

## Decisão

**Removemos** o endpoint `DELETE /{uuid}` (hard delete) do `common.base.BaseRest`.

O CRUD genérico passa a expor **apenas soft delete** via `DELETE /inativar/{uuid}`, que continua atendendo o caso de uso padrão de "desativar registro".

### Regras complementares

- O método `BaseService.excluirPorUUID(...)` **permanece** disponível como API interna do service, para os raros casos em que um `*Rest` específico precisar de hard delete (ex.: limpeza administrativa controlada). Nesses casos, o endpoint deve ser declarado **explicitamente** no `*Rest` da entidade, com path próprio e, quando aplicável, restrição por papel (`@RolesAllowed("admin")`).
- Hard delete **nunca** deve ser exposto novamente como comportamento padrão herdado.
- Quando FKs forem introduzidas, o soft delete continua sendo a operação segura padrão; políticas de `CASCADE`/`RESTRICT` ficam a cargo de cada relacionamento e não pertencem a esta decisão.

## Consequências

### Positivas

- **Segurança operacional**: nenhuma entidade nova ganha hard delete acidentalmente só por herdar do CRUD genérico.
- **Consistência de auditoria**: o caminho padrão de "remover" preserva o registro com `status = INATIVO`, mantendo rastreabilidade.
- **Compatibilidade futura com FKs**: ao adicionar relacionamentos, o soft delete não quebra integridade referencial.
- **Contrato HTTP mais simples**: a base do CRUD expõe uma única semântica de "delete" (soft), sem ambiguidade.

### Negativas

- **Quem realmente precisar de hard delete** terá de declarar o endpoint manualmente no `*Rest` específico — pequeno custo de boilerplate, justificado pela criticidade da operação.

### Neutras

- O método `excluirPorUUID` continua existindo no service, sem uso atual pelo `BaseRest`. Não é dead code: é API interna documentada para uso pontual.
- Nenhuma migração de dados necessária; nenhum endpoint público estava sendo consumido pelo frontend.

## Alternativas consideradas

- **Manter `DELETE /{uuid}` e restringir por papel (`@RolesAllowed("admin")`)**: descartado. Adiciona dependência (`quarkus-security`) e configuração de papéis antes de termos um modelo de autenticação definido, apenas para reabilitar uma operação que não temos demanda real para expor de forma genérica.
- **Manter `DELETE /{uuid}` e anotar como `@Deprecated`**: descartado. Endpoint deprecado continua acessível e ainda pode ser chamado por engano; remover é mais barato e mais seguro nesta fase do projeto.
- **Remover também `excluirPorUUID` do service**: descartado. Mantém-se como ferramenta interna para casos pontuais (limpeza, scripts administrativos), sem custo de exposição pública.

## Referências

- `common.base.BaseRest` — passa a expor apenas `DELETE /inativar/{uuid}`.
- `common.base.BaseService#excluirPorUUID` — API interna preservada.
- `common.base.EnumStatusEntity` — `ATIVO`/`INATIVO` como base do soft delete.
- Plano de padronização do CRUD, item 6 (`doc/planos/0001-padronizacao-crud-backend.md`).
