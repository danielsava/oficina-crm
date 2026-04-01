# Comparação: Active Record vs. Repository Pattern no Quarkus Panache

O Quarkus, através da extensão Panache, oferece duas abordagens principais para trabalhar com persistência de dados usando Hibernate ORM: o padrão Active Record e o padrão Repository. Ambos visam simplificar o desenvolvimento, mas possuem características distintas.

## Padrão Active Record

**Conceito:** Neste padrão, a própria classe da entidade encapsula tanto os dados (atributos) quanto a lógica de persistência (operações de banco de dados como buscar, salvar, deletar).

**Implementação:**
- A entidade estende `io.quarkus.hibernate.orm.panache.PanacheEntity` (que já fornece um campo `id` do tipo `Long` e métodos de persistência) ou `io.quarkus.hibernate.orm.panache.PanacheEntityBase` (onde você define seu próprio ID e herda os métodos).
- Os atributos da entidade são geralmente declarados como `public`. O Panache gera os getters e setters correspondentes em bytecode durante a compilação, mantendo o encapsulamento.
- As operações de persistência são chamadas diretamente na classe da entidade (métodos estáticos como `Person.findById(id)`, `Person.listAll()`) ou em instâncias da entidade (métodos como `person.persist()`, `person.delete()`).

**Vantagens:**
- **Simplicidade Inicial:** Especialmente para operações CRUD básicas, requer menos código inicial, pois não há necessidade de criar classes de repositório separadas.
- **Conveniência:** O acesso aos métodos de persistência é direto na entidade.
- **Orientação a Objetos (Conceitual):** Alguns argumentam que se aproxima mais do conceito de OO, onde o objeto é responsável por seu próprio estado e comportamento (incluindo persistência).

**Desvantagens:**
- **Violação do Princípio da Responsabilidade Única (SRP):** A classe da entidade acumula múltiplas responsabilidades (representação de dados e lógica de acesso a dados).
- **Acoplamento:** Cria um acoplamento mais forte entre a lógica de domínio/negócio e a lógica de persistência.
- **Testabilidade:** Dificulta o teste unitário da lógica de negócio isoladamente. Como os métodos de persistência estão na própria entidade (muitos estáticos), é necessário usar mocks específicos como `PanacheMock` para isolar a camada de persistência nos testes.
- **Manutenção:** Em aplicações complexas, a lógica de persistência pode ficar espalhada por várias entidades, dificultando a manutenção e a visão geral.

## Padrão Repository

**Conceito:** Este padrão separa claramente a lógica de acesso a dados em classes dedicadas, chamadas Repositórios. As entidades são objetos mais simples (POJOs), focados em representar os dados.

**Implementação:**
- Cria-se uma interface (ou classe) que estende `io.quarkus.hibernate.orm.panache.PanacheRepository<EntityType>` ou `io.quarkus.hibernate.orm.panache.PanacheRepositoryBase<EntityType, IdType>`.
- Esta interface herda automaticamente os métodos CRUD e de consulta comuns.
- A entidade geralmente é um POJO mais simples (pode estender `PanacheEntityBase` apenas para ter o ID, mas sem usar seus métodos de persistência diretamente na lógica de negócio).
- O repositório é injetado (`@Inject`) nas classes que precisam acessar os dados (geralmente Services ou Resources).

**Vantagens:**
- **Separação de Responsabilidades (SRP):** A lógica de persistência fica isolada no repositório, enquanto a entidade foca na representação dos dados.
- **Melhor Testabilidade:** Facilita muito os testes unitários. A lógica de negócio (em Services, por exemplo) pode ser testada mockando a interface do repositório, sem depender de `PanacheMock` ou de acesso real ao banco.
- **Desacoplamento:** Reduz o acoplamento entre o domínio e a camada de persistência.
- **Organização:** Centraliza as operações de persistência relacionadas a uma entidade em um único local (o repositório), melhorando a organização e manutenção.
- **Alinhamento com Arquitetura em Camadas:** Encaixa-se mais naturalmente em arquiteturas em camadas tradicionais.

**Desvantagens:**
- **Mais Código Inicial:** Requer a criação de uma interface/classe de repositório para cada entidade, o que pode parecer um pouco mais verboso no início.

## Resumo da Comparação

| Característica        | Active Record                     | Repository Pattern                |
| --------------------- | --------------------------------- | --------------------------------- |
| **Implementação**   | Entidade estende `PanacheEntity`  | Repositório estende `PanacheRepository` |
| **Lógica Persist.** | Na própria entidade               | Em classe/interface separada      |
| **SRP**               | Violado                           | Respeitado                        |
| **Acoplamento**       | Maior                             | Menor                             |
| **Testabilidade**     | Mais difícil (requer PanacheMock) | Mais fácil (mock de interface)    |
| **Código Inicial**    | Menor                             | Maior                             |
| **Organização**       | Lógica pode espalhar              | Lógica centralizada no repo       |
| **Ideal para**        | Projetos simples, CRUD básico     | Projetos médios/complexos, TDD    |

