# ADR-0008: Indice parcial em status ATIVO avaliado caso a caso

- **Status**: Accepted
- **Data**: 2026-06-04
- **Autores**: Equipe Oficina CRM

## Contexto

O CRUD generico do backend filtra registros ativos em leituras usuais, o que levantou a discussao sobre padronizar a criacao de indice parcial para `status = 'ATIVO'` em toda tabela nova.

Embora esse tipo de indice possa melhorar consultas em cenarios especificos, transforma-lo em regra geral de criacao de tabela introduziria custo permanente de manutencao sem garantia de beneficio real:

- muitas tabelas do sistema tendem a permanecer pequenas ou com baixa proporcao de registros inativos;
- todo indice adicional aumenta custo de escrita, espaco e manutencao;
- a utilidade do indice depende de cardinalidade, seletividade, padrao real de consulta e plano de execucao do PostgreSQL;
- criar o indice por padrao, sem diagnostico, incentiva otimizar cedo demais e sem evidencia.

## Decisao

Nao adotamos indice parcial em `status = 'ATIVO'` como padrao de criacao de tabelas do projeto.

Essa otimizacao passa a ser tratada **caso a caso**, e so deve ser implementada quando houver evidencia tecnica de necessidade e de beneficio esperado, por exemplo:

- consulta frequente em tabela grande com filtro recorrente por registros ativos;
- diagnostico via `EXPLAIN`, `EXPLAIN ANALYZE`, metricas ou observacao de degradacao real;
- confirmacao de que o indice parcial ataca o gargalo observado.

Em outras palavras: primeiro diagnosticar, depois indexar.

## Consequencias

### Positivas

- Evitamos proliferacao de indices sem ganho comprovado.
- Mantemos o schema inicial mais simples e barato de manter.
- A decisao de indexacao fica guiada por evidencia de uso real e plano de execucao.
- Reduzimos risco de padronizar uma otimizacao desnecessaria para tabelas pequenas.

### Negativas

- Algumas tabelas grandes podem precisar de analise posterior antes de receber o indice ideal.
- O time precisa lembrar de diagnosticar performance explicitamente, em vez de contar com uma regra automatica.

### Neutras

- O projeto continua livre para criar esse indice quando fizer sentido; a decisao apenas deixa de ser automatica.

## Alternativas consideradas

### A) Criar indice parcial por padrao em toda tabela com `status`

Descartada porque assume ganho universal onde o beneficio depende do comportamento real de dados e consultas. Para tabelas pequenas ou com baixo volume de inativos, o indice tende a ser custo sem retorno relevante.

### B) Criar indice parcial apenas em algumas entidades predefinidas

Descartada neste momento porque ainda nao ha evidencia suficiente para transformar essa excecao em regra estatica de modelagem. Quando um caso concreto aparecer, a decisao deve nascer do diagnostico daquele contexto.

## Referencias

- Plano: [`doc/planos/0001-padronizacao-crud-backend.md`](../planos/0001-padronizacao-crud-backend.md), pendencia #16.
