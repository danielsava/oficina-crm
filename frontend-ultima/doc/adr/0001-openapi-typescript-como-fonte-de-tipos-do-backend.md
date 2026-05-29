# ADR-0001: `openapi-typescript` como fonte canônica de tipos do backend

- **Status**: Accepted
- **Data**: 2026-05-28
- **Autores**: Equipe Oficina CRM

## Contexto

O backend (`backend-quarkus`) publica um contrato OpenAPI 3 em `/q/openapi` e Swagger UI em `/q/swagger-ui` (ver backend [ADR-0006](../../../backend-quarkus/doc/adr/0006-openapi-swagger-e-nao-versionamento-de-apis-internas.md)). Um dos motivos centrais para adotar OpenAPI mesmo em API interna foi habilitar a **geração automática de tipos TypeScript** no frontend, eliminando a duplicação manual de DTOs entre o backend Java e o frontend Angular.

Hoje, o `frontend-ultima` não possui qualquer pipeline de geração de tipos. O `AGENTS.md` já estabelece duas regras:

1. DTOs do backend NÃO devem ser duplicados manualmente como prática de longo prazo.
2. Quando a primeira `*-form.component.ts` for implementada contra um DTO real do backend, o pipeline de geração MUST ser avaliado e (se aprovado) introduzido na mesma entrega.

Como o gatilho está prestes a ser disparado (próximas telas de manutenção de `Usuario` e demais entidades em IAM, CRM e estoque), é o momento de formalizar a escolha da ferramenta para que a primeira aplicação prática já encontre o caminho desenhado.

Alternativas avaliadas:

- **`openapi-typescript`**: gera apenas tipos (`.d.ts`) a partir do contrato OpenAPI. Zero runtime, zero opinião sobre cliente HTTP. Acompanha o `openapi-fetch` como cliente opcional, mas é desacoplado dele.
- **`@hey-api/openapi-ts`** (ex-`openapi-ts`): gera tipos + cliente HTTP completo, com suporte a múltiplos templates (fetch, axios, etc.). Mais ambicioso, mais opinativo.
- **`orval`**: gera tipos + cliente + integração com `@tanstack/query`, MSW e outros. Foco em React Query/Svelte/Vue Query; suporte Angular existe via tanstack-query, mas o ecossistema natural não é Angular.
- **`openapi-generator`** (OpenAPI Tools): gerador multi-linguagem em Java. Geração robusta, mas pesada (precisa de JDK ou Docker), produz clientes Angular completos com `HttpClient`, RxJS, models e services. Ambiente CI/CD mais complexo.

Restrições e preferências relevantes:

- **Cliente HTTP**: o Angular tem `HttpClient` próprio, integrado com interceptors, signals, RxJS. Substituí-lo por `fetch`-based (`openapi-fetch`) ou `axios` significaria reescrever a camada de interceptação (autenticação, RFC 7807, retry) e perder o ecossistema do framework. **A geração de cliente HTTP NÃO é prioridade** neste momento — o `HttpClient` continua sendo a base.
- **Toolchain**: o projeto é Node + Angular CLI. Adicionar dependência Java (OpenAPI Generator) ou Docker no pipeline de geração introduz complexidade desproporcional.
- **Reversibilidade**: a escolha deve ser fácil de revisitar. Se no futuro houver demanda por cliente HTTP gerado, migrar do `openapi-typescript` (tipos puros) para uma ferramenta mais completa é trivial — basta substituir o passo de geração.
- **Custo de início**: precisamos começar agora, na primeira tela. Quanto menor a curva de aprendizado, melhor.

## Decisão

Adotamos **`openapi-typescript`** como ferramenta canônica de geração de tipos TypeScript a partir do contrato OpenAPI publicado pelo `backend-quarkus`. As decisões correlatas:

### 1. Escopo da geração: somente tipos

Geramos apenas o arquivo de tipos (`.d.ts`). Não geramos clientes HTTP, services nem models de domínio. O cliente HTTP continua sendo o `HttpClient` nativo do Angular, e a camada de domínio (`*.service.ts`, `*.model.ts`) é escrita à mão, consumindo os tipos gerados.

### 2. Localização do artefato gerado

O arquivo gerado vive em `src/app/core/api/generated/backend-api.d.ts`. O diretório `src/app/core/api/generated/` é dedicado a artefatos gerados e:

- NÃO é editado à mão (nenhuma circunstância).
- É commitado no repositório (não é `.gitignore`) para garantir builds reprodutíveis e revisão de mudanças no contrato via diff.
- Contém um `README.md` curto avisando que o conteúdo é gerado.

### 3. Origem do contrato

A geração consome o contrato direto da URL `/q/openapi` do backend rodando em dev (`http://localhost:8080/q/openapi`). Não consumimos arquivo intermediário comitado no monorepo, para evitar três fontes de verdade (código backend, arquivo comitado, tipos gerados). A URL é parametrizável via variável de ambiente para suportar pipelines de CI futuros.

### 4. Comando de geração e integração no `package.json`

Adicionamos os scripts:

```json
{
  "scripts": {
    "api:generate": "openapi-typescript ${BACKEND_OPENAPI_URL:-http://localhost:8080/q/openapi} -o src/app/core/api/generated/backend-api.d.ts",
    "api:check": "openapi-typescript ${BACKEND_OPENAPI_URL:-http://localhost:8080/q/openapi} -o /tmp/backend-api.d.ts && diff /tmp/backend-api.d.ts src/app/core/api/generated/backend-api.d.ts"
  },
  "devDependencies": {
    "openapi-typescript": "^7"
  }
}
```

- `npm run api:generate` regenera os tipos a partir do backend em execução.
- `npm run api:check` verifica que os tipos comitados estão alinhados com o backend (útil em CI).

A regeneração é **manual e disparada pelo desenvolvedor** sempre que mudar um DTO no backend. Não é executada automaticamente no `npm start` para não acoplar dev frontend ao backend rodando.

### 5. Padrão de consumo nos services Angular

Os `*.service.ts` por domínio importam os tipos gerados via alias do schema:

```ts
import type { components } from '@core/api/generated/backend-api';

type UsuarioEditDTO = components['schemas']['UsuarioEditDTO'];
type UsuarioListDTO = components['schemas']['UsuarioListDTO'];

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  listar(): Observable<UsuarioListDTO[]> { ... }
  buscarPorUUID(uuid: string): Observable<UsuarioEditDTO> { ... }
}
```

Tipos derivados (view models específicos da tela, shape do formulário reativo) vivem no `*.model.ts` do domínio e podem **estender, restringir ou compor** os tipos gerados — mas não duplicá-los.

### 6. Política de atualização do contrato

- Sempre que um DTO mudar no backend, o desenvolvedor responsável pela mudança regenera os tipos no frontend (`npm run api:generate`) e comita o `.d.ts` atualizado junto com as mudanças do backend, idealmente **no mesmo commit ou na mesma entrega**.
- Em CI, `npm run api:check` (ou equivalente) falha se o contrato comitado divergir do backend, evitando merges com contrato desatualizado.

## Consequências

### Positivas

- **Fim da duplicação manual de DTOs**: o frontend sempre compila contra a forma exata dos DTOs do backend.
- **Detecção precoce de breaking changes**: quando o backend muda um campo, o `tsc` do frontend acusa em tempo de build — não em runtime.
- **Zero runtime overhead**: o `openapi-typescript` produz só tipos, que somem após compilação.
- **Custo de adoção mínimo**: uma dependência de dev, dois scripts no `package.json`, nenhuma reescrita da camada de HTTP existente.
- **Reversibilidade**: trocar a ferramenta no futuro (por `@hey-api/openapi-ts` ou `orval`, se houver demanda por cliente HTTP gerado) é uma migração isolada no script de geração e nos imports.
- **Diff legível do contrato**: como o `.d.ts` é comitado, mudanças no contrato HTTP aparecem como diff TS revisável em PR.

### Negativas

- **Cliente HTTP continua manual**: cada `*.service.ts` precisa escrever os métodos (`http.get`, `http.post`, etc.) à mão, referenciando os tipos. É repetitivo, mas previsível e alinhado com o `HttpClient` do Angular.
- **Disciplina exigida**: regenerar e comitar os tipos depende do desenvolvedor lembrar (mitigado pelo `npm run api:check` em CI).
- **Acoplamento dev ↔ backend em execução**: para regenerar tipos, o backend precisa estar rodando (ou ter um arquivo de schema acessível). Aceitável no fluxo de monorepo.

### Neutras

- O `openapi-typescript` gera um único arquivo `.d.ts` por contrato. Para o porte atual do CRM (uma única API backend), está adequado. Se um dia houver múltiplos backends, basta repetir a configuração.

## Alternativas consideradas

### A) `@hey-api/openapi-ts`

Gera tipos + cliente HTTP completo. Descartada como ponto de partida porque:
- Substituiria o `HttpClient` do Angular por uma camada própria, exigindo reescrita de interceptors (autenticação futura, tratamento RFC 7807).
- Adiciona opinião sobre estilo de cliente (fetch/axios) que não é necessária agora.
- Pode ser revisitada se, no futuro, a duplicação dos métodos de service nos `*.service.ts` se tornar pesada o suficiente para justificar geração de cliente.

### B) `orval`

Foco principal em integrações com React Query / Svelte Query / Vue Query. O suporte Angular existe via tanstack-query, mas o ecossistema natural não é Angular. Descartada por desalinhamento com o stack do projeto.

### C) `openapi-generator` (OpenAPI Tools, Angular template)

Gera client Angular completo (services + models + RxJS). Tecnicamente capaz, mas:
- Exige JDK ou Docker no toolchain de geração — complexidade desproporcional para um monorepo Node + Angular.
- Templates Angular são opinativos e historicamente menos atualizados que os de outras linguagens.
- Cliente gerado tende a ficar verboso e a "engessar" a camada de service.
- Descartada para uso geral; pode ser considerada pontualmente se houver demanda por geração paralela de SDK em outra linguagem (ex.: app mobile em Kotlin/Swift).

### D) Manter duplicação manual de DTOs (status quo)

Descartada explicitamente em conformidade com o `AGENTS.md` do frontend e com o backend ADR-0006. Duplicação manual produz drift silencioso entre frontend e backend, detectado apenas em runtime, e degrada com o crescimento do projeto.

### E) Geração automática no `npm start` (pre-hook)

Avaliada e descartada como padrão. Acoplaria o dev do frontend ao backend rodando, quebrando o fluxo de quem trabalha só no frontend (refatoração de UI, ajustes de estilo, etc.). A regeneração fica como **passo explícito**, disparado quando o contrato muda.

## Referências

- Backend: [ADR-0006 — OpenAPI/Swagger e não versionamento de APIs internas](../../../backend-quarkus/doc/adr/0006-openapi-swagger-e-nao-versionamento-de-apis-internas.md).
- `AGENTS.md` (frontend), seção "Backend Contract Consumption (OpenAPI)".
- Documentação: [openapi-typescript](https://openapi-ts.dev/), [Quarkus — OpenAPI and Swagger UI](https://quarkus.io/guides/openapi-swaggerui).
