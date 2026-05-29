# ADR-0006: OpenAPI/Swagger habilitado em dev e prod, sem versionamento de APIs internas de CRUD

- **Status**: Accepted
- **Data**: 2026-05-28
- **Autores**: Equipe Oficina CRM

## Contexto

O plano de padronização do CRUD (`doc/planos/0001-padronizacao-crud-backend.md`, pendência #8) prevê expor o contrato OpenAPI 3 da API e publicar o Swagger UI para facilitar o consumo pelo frontend (`frontend-ultima`) e testes manuais. A discussão envolveu três decisões:

1. **Exposição do Swagger UI**: somente em desenvolvimento ou também em produção?
2. **Anotação dos DTOs com `@Schema`**: adotar como padrão ou aceitar os defaults da geração automática?
3. **Versionamento da API no path** (`/api/v1/...`): adotar desde o início ou não?

O Oficina CRM tem hoje as seguintes características relevantes:

- Aplicação **puramente interna**, sem integrações com terceiros no momento.
- O CRUD genérico (`BaseRest`) é o motor de telas de **administração de entidades** consumidas exclusivamente pelo frontend próprio. Quase 100% dos endpoints atuais se encaixam neste perfil.
- Projeto em fase inicial: ainda não há clientes externos consumindo a API; o frontend e o backend são versionados juntos no mesmo monorepo e implantados em conjunto.
- Previsão de uma quantidade razoável de entidades (IAM, CRM, estoque, futuras áreas funcionais), cada uma com seu `*Rest` herdando de `BaseRest`.
- Já existem decisões anteriores que dão forma ao contrato: ADR-0001 (`*Rest`), ADR-0002 (UUID público), ADR-0003 (`EditDTO` único), ADR-0004 (RFC 7807), ADR-0005 (sem hard delete no `BaseRest`).

## Decisão

### 1. Adotamos OpenAPI 3 via `quarkus-smallrye-openapi`

- A extensão `quarkus-smallrye-openapi` é adicionada ao `pom.xml`.
- O contrato OpenAPI é publicado em `/q/openapi` (JSON; `?format=yaml` para YAML).
- O Swagger UI é publicado em `/q/swagger-ui`.
- Caminhos, branding e metadados (title, version, description, contato) são configurados em `application.properties` via `quarkus.smallrye-openapi.*` e `quarkus.swagger-ui.*`.

### 2. Swagger UI exposto em desenvolvimento **e** em produção

- `quarkus.swagger-ui.always-include=true` mantém o Swagger UI publicado em todos os perfis, incluindo `prod`.
- O título do contrato é diferenciado por perfil (`%dev`, `%test`) para evitar confusão visual ao alternar ambientes.
- O **controle de acesso ao Swagger UI em produção** será implementado quando o projeto ganhar autenticação/autorização: a UI ficará disponível somente para usuários internos autenticados com a role apropriada. Até lá, a exposição é aceita como dívida técnica explícita, justificada pelo estado inicial do projeto (não há dados sensíveis em produção e o acesso à rede da aplicação é restrito).

### 3. Anotação `@Schema` adotada como padrão nos DTOs

- Todos os DTOs (`EditDTO`, `ListDTO` e futuros) recebem `@Schema` no record e em cada campo relevante (descrição, `example`, `maxLength`, `required` quando aplicável).
- O custo da anotação é baixo e o ganho de DX no Swagger UI e na geração de clientes/tipos para o frontend é alto.

### 4. **Não adotamos versionamento de API para os endpoints internos de CRUD**

Os endpoints expostos por `BaseRest` (e suas subclasses) **não recebem prefixo de versão** (sem `/v1`, `/v2` no path). Razões:

- A API interna de CRUD é consumida exclusivamente pelo frontend deste mesmo monorepo, implantado em conjunto. Não existe consumidor externo desacoplado para preservar.
- Para uma quantidade razoável de entidades, o custo de manutenção de versões paralelas cresce de forma desproporcional ao benefício. Não faz sentido manter duas implementações de uma mesma tela de manutenção convivendo em produção.
- Quando uma entidade muda de forma incompatível, a tela de manutenção correspondente no frontend é ajustada **na mesma entrega**. Frontend e backend evoluem juntos.
- Toda mudança breaking é tratada como uma alteração coordenada nas duas camadas (backend + frontend), não como uma nova versão do contrato.

### 5. Versionamento será adotado **somente** em APIs futuras de integração com terceiros

Quando o projeto precisar expor APIs para sistemas externos (ERP, NF-e, app mobile do mecânico, portal do cliente, parceiros), essas APIs:

- Serão **endpoints dedicados**, projetados para o caso de uso da integração, **não** as APIs internas de CRUD reaproveitadas (por razões de segurança, de superfície de ataque e de acoplamento).
- Terão **versionamento explícito no path** (`/api/integracao/v1/...`), seguindo um padrão a ser definido em ADR próprio no momento em que a primeira integração for desenhada.
- Terão seu próprio agrupamento no OpenAPI (via `@Tag` e potencialmente `mp.openapi.scan.packages` segmentando documentos).

## Consequências

### Positivas

- Contrato OpenAPI sempre disponível e atualizado, sem esforço manual.
- Swagger UI acelera desenvolvimento e teste manual em dev; em prod serve como referência viva do contrato.
- DTOs autodocumentados via `@Schema` melhoram a leitura do contrato e a geração de clientes/tipos no frontend Angular.
- Sem versionamento de CRUD interno: zero complexidade adicional, zero código duplicado, zero risco de divergência entre versões.
- Modelo simples e honesto com a realidade do projeto (monorepo, consumo único pelo próprio frontend).

### Negativas

- Swagger UI em produção, antes da autenticação estar pronta, é uma janela de exposição do contrato. Mitigação: o ambiente atual não contém dados de produção sensíveis, e o acesso será restringido assim que a camada de auth entrar.
- Toda mudança breaking em um `*Rest` interno exige ajuste sincronizado no frontend correspondente. Esse é um custo aceito conscientemente como contrapartida da simplicidade.
- Se algum dia o projeto precisar abrir a API interna de CRUD para um terceiro, será necessário (a) construir endpoints de integração dedicados — não reaproveitar os internos — ou (b) introduzir versionamento retroativamente. Aceitamos o trade-off porque a probabilidade desse cenário é baixa e a forma correta (endpoints de integração dedicados) já está prescrita nesta ADR.

### Neutras

- Anotações `@Schema` nos DTOs adicionam algumas linhas por record, mas não alteram o comportamento de serialização nem a validação.
- O custo do `quarkus-smallrye-openapi` em startup e tamanho do build é desprezível.

## Alternativas consideradas

### A) Swagger UI somente em dev (`quarkus.swagger-ui.always-include=false`)

Descartada porque, em uma aplicação interna, ter o contrato visível em produção facilita troubleshooting e onboarding de novos desenvolvedores. A janela de exposição é resolvida com auth assim que disponível. Se o perfil de risco mudar (dados sensíveis em prod, exposição externa), revisita-se a decisão em uma nova ADR.

### B) Versionar todas as APIs no path desde o início (`/api/v1/...`)

Descartada. Adicionar `/v1` em todos os `*Rest` custa pouco, mas cria a expectativa de que o versionamento será mantido. Para o perfil interno do CRUD, manter duas versões em paralelo no futuro multiplicaria entidades, DTOs, mappers e telas — custo desproporcional ao ganho. A ausência de prefixo deixa claro que o contrato é interno e evolui em conjunto com o frontend.

### C) Versionamento por header (`Accept: application/vnd.oficina.v1+json`)

Descartada pelos mesmos motivos da alternativa B, somados à pior legibilidade em logs/debug e pior compatibilidade com ferramentas (Swagger UI, gateways).

### D) Anotações `@Schema` opcionais (somente em casos com `example` útil)

Descartada por inconsistência: parte dos DTOs documentados e parte não. Padronizar é mais barato e produz um contrato mais útil para o frontend.

## Análise crítica da decisão

> Registro consolidado dos pontos fundamentais que sustentam **duas decisões correlatas mas distintas**: (a) **não versionar** as APIs internas de CRUD; (b) **adotar OpenAPI/Swagger** mesmo sendo API interna. Serve como referência para revisões futuras e para evitar que qualquer das duas seja revertida sem entender os trade-offs avaliados.

### 1. Versionamento existe para proteger consumidores independentes

A função do versionamento de API é proteger **consumidores que o produtor não controla** de mudanças breaking. Quando o consumidor é o próprio frontend do mesmo monorepo, com mesmo ciclo de deploy, esse problema **não existe** — não há ninguém para proteger. Versionar nesse cenário é cerimônia sem função, não engenharia defensiva.

A regra de design amplamente aceita ("API Design Patterns", JJ Geewax; e congêneres) é: *versione APIs que têm consumidores independentes*. APIs internas de administração não se qualificam.

### 2. Backend versionado + frontend único = assimetria artificial

Versionar o backend sem versionar o frontend correspondente cria uma assimetria sem propósito: `UsuarioRestV1` e `UsuarioRestV2` no backend, mas uma única tela de manutenção de usuário no Angular. Para qual versão ela aponta? Se aponta para v2, v1 nasce como código morto. Se aponta para ambas, multiplica a complexidade do frontend para resolver um problema que não existe.

Versionamento só se sustenta quando há **descasamento real entre os ciclos de vida do produtor e do consumidor**. No CRUD interno deste projeto, o ciclo é o mesmo — versionar é forçar uma assimetria que o negócio não pediu.

### 3. Custo é linear na quantidade de entidades — e isso já é proibitivo

O custo de versionamento é uma constante (subpacotes `v1/`/`v2/`, DTOs duplicados, mappers duplicados, adapters de service, testes duplicados) multiplicada pelo número de entidades versionadas. Para o perfil deste CRM (dezenas de entidades em IAM, CRM, estoque e áreas futuras), o débito acumulado domina a produtividade do time. A alternativa "versionar só algumas entidades" abre brecha para inconsistência arquitetural — perde-se o padrão sem ganhar simplicidade.

### 4. Integração com terceiros NÃO reaproveita o CRUD interno

Este é o ponto mais sensível da decisão, e o anti-padrão que ela previne é clássico: *reutilizar APIs internas como APIs públicas para terceiros*. Esse atalho produz três problemas estruturais:

- **Segurança**: o CRUD interno expõe campos e operações que terceiros não deveriam acessar; filtrar caso a caso é frágil e propenso a vazamentos.
- **Acoplamento**: qualquer evolução do modelo interno propaga para o contrato externo, transformando o CRUD em refém das integrações.
- **Granularidade incorreta**: integrações precisam de endpoints **orientados a caso de uso** ("registrar cliente vindo do ERP", "sincronizar estoque"), com transacionalidade e idempotência próprias — não de CRUDs genéricos por entidade.

A separação prescrita por esta ADR — **APIs internas de CRUD vs. APIs de integração dedicadas**, cada uma com seu próprio modelo de versionamento — é a forma correta de tratar os dois casos. Quando a primeira integração com terceiro surgir, ela MUST ser implementada como endpoints novos, com seu próprio contrato versionado, e NUNCA como exposição direta dos `*Rest` internos.

### 5. Por que adotamos OpenAPI/Swagger sendo a API interna?

A pergunta é legítima e merece resposta explícita: se o argumento contra versionamento é *"a API é interna, dispensa cerimônia"*, por que o mesmo argumento não dispensa o Swagger? A resposta é que **os dois casos parecem simétricos, mas não são** — os critérios de avaliação diferem em pontos materiais:

| Critério                          | Versionamento                                              | OpenAPI/Swagger                                                       |
|-----------------------------------|------------------------------------------------------------|-----------------------------------------------------------------------|
| Motivação principal               | Proteger consumidor externo de breaking changes            | Expor contrato existente para consumo (humano e ferramental)          |
| Cria código novo?                 | **Sim** (duplicação por versão e por entidade)             | **Não** (gera contrato a partir do código existente)                  |
| Custo de manutenção               | Alto, contínuo, multiplicado por entidades × versões vivas | Baixo, pontual (uma dependência + anotações `@Schema` opcionais)      |
| Beneficiário em projeto interno   | Inexistente (não há consumidor independente a proteger)    | Real (próprio time + tooling do frontend, ver pontos abaixo)          |
| Reversível?                       | Não (uma vez publicada, `v1` tem clientes)                 | Sim (remover dependência + propriedades é trivial)                    |

**Versionamento de API interna é cerimônia sem público.** **OpenAPI de API interna é ferramenta de produtividade com público real**, mesmo sem consumidor externo. Os ganhos concretos que justificam a adoção:

- **Geração automática de tipos TypeScript no frontend** — ferramentas como `openapi-typescript`, `openapi-generator` ou `orval` consomem `/q/openapi` e geram interfaces TS e/ou clientes HTTP tipados para o Angular. Isso **elimina a duplicação manual** de DTOs entre backend Java e frontend TypeScript, garantindo que o frontend sempre compile contra o contrato real do backend. Este é o **principal ganho prático esperado** desta decisão para a evolução do `frontend-ultima` e DEVE ser exercitado na primeira oportunidade prática (assim que a primeira tela de manutenção for refatorada para consumir tipos gerados).
- **Troubleshooting em produção e em desenvolvimento** — testar um endpoint com payload exato direto pelo Swagger UI, sem precisar abrir Postman, escrever curl ou rodar o frontend inteiro.
- **Onboarding de novos desenvolvedores** — ver o conjunto de endpoints disponíveis, com tipos e exemplos, sem precisar ler o código Java primeiro. Reduz significativamente o tempo de rampa.
- **Auditoria e revisão de contrato** — um único artefato (`openapi.json` exportado de `/q/openapi`) versionado no Git produz um diff legível das mudanças no contrato HTTP a cada release. Bem mais útil do que diff de código Java espalhado por vários arquivos.
- **Memória externa de longo prazo** — daqui a 6, 12, 24 meses, o contrato fica autodescrito sem depender de leitura do código.

Nenhum desses ganhos exige consumidor externo. Todos beneficiam o time interno e o próprio tooling do monorepo.

### 6. Ponto de atenção — "puramente interna até o momento"

A única fragilidade do raciocínio é o "até o momento". A regra do item 4 acima é o que neutraliza essa fragilidade: quando o cenário externo chegar, a resposta arquitetural já está definida (endpoints dedicados, não reaproveitamento). Isso precisa ser **defendido ativamente** em revisões de código e desenho futuras — o atalho de "expor /usuario para o parceiro só pra começar" é o tipo de decisão que destrói arquitetura silenciosamente.

### 7. Swagger UI em produção é dívida explícita, com baixa cobertura

Manter o Swagger UI publicado em produção antes da autenticação estar pronta é uma janela de exposição do contrato (não dos dados). É aceitável **enquanto** não houver dados sensíveis em produção e o acesso de rede for restrito. A remoção dessa dívida é parte do escopo da pendência futura de autenticação/autorização e MUST ser tratada como item explícito naquele plano, não como detalhe secundário.

### Nota sobre imutabilidade

A seção "Análise crítica da decisão" foi consolidada no mesmo dia da aceitação da ADR, em duas etapas: (a) registro dos argumentos sobre versionamento (itens 1-4, 6, 7); (b) registro do contraste com o OpenAPI e do caso de geração de tipos no frontend (item 5). Ambas as etapas formalizam o racional discutido durante a tomada da decisão; não alteram "Contexto", "Decisão", "Consequências" nem "Alternativas consideradas". Mudanças efetivas na decisão exigem nova ADR de superseding, conforme o `README.md` deste diretório.

## Referências

- Plano: [`doc/planos/0001-padronizacao-crud-backend.md`](../planos/0001-padronizacao-crud-backend.md), pendência #8.
- ADRs relacionados:
  - [ADR-0001](./0001-padrao-nomenclatura-rest.md): `*Rest` como nome canônico dos recursos JAX-RS.
  - [ADR-0002](./0002-uuid-como-identificador-publico.md): UUID como identificador público.
  - [ADR-0003](./0003-editdto-como-dto-unico-de-formulario.md): `EditDTO` único de formulário.
  - [ADR-0004](./0004-rfc-7807-problem-details-para-erros-http.md): RFC 7807 para erros HTTP.
  - [ADR-0005](./0005-remocao-do-hard-delete-no-baserest.md): remoção do hard delete no `BaseRest`.
- Documentação: [Quarkus — OpenAPI and Swagger UI](https://quarkus.io/guides/openapi-swaggerui), [Eclipse MicroProfile OpenAPI](https://download.eclipse.org/microprofile/microprofile-open-api-3.1/microprofile-openapi-spec-3.1.html).
