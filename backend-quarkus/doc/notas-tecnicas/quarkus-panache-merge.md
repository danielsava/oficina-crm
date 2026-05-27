# Equivalente ao `merge` da JPA no Padrão Repository do Quarkus Panache

No padrão Repository do Quarkus Panache (`PanacheRepository` ou `PanacheRepositoryBase`), **não existe um método direto chamado `merge()`** que seja um equivalente exato ao `EntityManager.merge()` da JPA para lidar com entidades destacadas (detached entities).

O Panache foca em simplificar as operações mais comuns, e o `merge` é uma operação com semântica mais complexa, frequentemente necessária quando se trabalha com objetos que vêm de fora do contexto de persistência atual (como dados de um formulário web mapeados para um DTO e depois para uma entidade).

## Como Realizar a Operação de Merge

A forma correta e recomendada de realizar uma operação de `merge` ao usar o padrão Repository no Quarkus é utilizar diretamente o `EntityManager` da JPA, que pode ser injetado onde for necessário (geralmente na camada de Serviço).

**Passos:**

1.  **Injete o `EntityManager`:** Na sua classe de serviço (ou onde a lógica de atualização reside), injete o `EntityManager`:
    ```java
    import jakarta.enterprise.context.ApplicationScoped;
    import jakarta.inject.Inject;
    import jakarta.persistence.EntityManager;
    import jakarta.transaction.Transactional;
    
    @ApplicationScoped
    public class MeuServico {
    
        @Inject
        EntityManager entityManager;
    
        @Inject
        MinhaEntidadeRepository meuRepositorio; // Opcional, pode ser usado para buscar
    
        @Transactional
        public MinhaEntidade atualizarEntidade(MinhaEntidade entidadeDestacada) {
            // A mágica acontece aqui:
            MinhaEntidade entidadeGerenciada = entityManager.merge(entidadeDestacada);
            // IMPORTANTE: Use a 'entidadeGerenciada' retornada pelo merge para operações futuras
            // dentro da mesma transação, pois ela é a instância que está no contexto de persistência.
            return entidadeGerenciada;
        }
        
        // Exemplo alternativo comum (Fetch-and-Update):
        @Transactional
        public MinhaEntidade atualizarViaBusca(Long id, DadosParaAtualizarDTO dto) {
            MinhaEntidade entidadeExistente = meuRepositorio.findById(id);
            if (entidadeExistente != null) {
                // Atualiza os campos da entidadeExistente com base no DTO
                entidadeExistente.setCampo1(dto.getValor1());
                entidadeExistente.setCampo2(dto.getValor2());
                // Não precisa chamar persist() ou merge() aqui, pois a entidade está gerenciada.
                // O Hibernate detectará as mudanças no fim da transação.
                return entidadeExistente;
            } else {
                // Tratar caso de entidade não encontrada
                return null;
            }
        }
    }
    ```

## Explicação e Boas Práticas

*   **Por que não está no PanacheRepository?** O Panache simplifica o CRUD comum. O `merge` lida com o estado complexo de entidades destacadas. Manter o acesso via `EntityManager` preserva a semântica padrão da JPA para essa operação específica.
*   **`persist()` vs `merge()`:** O método `persist()` do Panache (ou do EntityManager) é usado para salvar entidades *novas* (que nunca tiveram um ID persistido) ou para *re-anexar* entidades que foram explicitamente destacadas *dentro da mesma sessão* (uso menos comum). Tentar usar `persist()` em uma entidade que já existe no banco mas está destacada (veio de fora da transação atual) geralmente resulta em erro (`PersistenceException: detached entity passed to persist`). O `merge()` é a ferramenta correta para atualizar o banco com base no estado de uma entidade destacada.
*   **Retorno do `merge()`:** O método `entityManager.merge(entidadeDestacada)` retorna uma **nova instância gerenciada** que representa o estado atualizado no contexto de persistência. É crucial usar essa instância retornada para quaisquer operações subsequentes dentro da mesma transação, e não a instância destacada original.
*   **Alternativa Fetch-and-Update:** Muitas vezes, em vez de usar `merge`, uma abordagem mais clara e segura (especialmente em aplicações web) é buscar a entidade existente pelo ID (`findById`), copiar as alterações desejadas do objeto destacado (ou DTO) para a entidade gerenciada e deixar o Hibernate sincronizar as mudanças no final da transação. Isso evita problemas de sobrescrever dados não intencionais que podem ocorrer com `merge` se o objeto destacado não estiver completo.

Em resumo: para replicar a funcionalidade do `merge` da JPA com Panache Repository, injete e use o `EntityManager` padrão da JPA.
