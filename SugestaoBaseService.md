# Sugestão de Generalização de Service (BaseService)

Para evitar a repetição de código (boilerplate) em operações básicas de CRUD em todos os serviços do seu projeto Quarkus, podemos extrair os métodos comuns para uma classe abstrata genérica `BaseService`. 

Uma excelente abordagem é **injetar o repositório via construtor**. Isso deixa o código mais limpo e facilita testes unitários.

> **Nota sobre o Escopo no Quarkus (CDI):**
> Como a injeção é via construtor e a variável `repository` é `final`, a melhor abordagem é utilizar o escopo `@Singleton` em vez de `@ApplicationScoped`. 
> 
> **O motivo:** A anotação `@ApplicationScoped` exige a criação de um *Client Proxy* pelo Quarkus, o que obriga a classe (e sua superclasse) a ter um construtor sem argumentos (`no-args constructor`). Como nossa superclasse exige o repositório no construtor e o define como `final`, não temos um construtor vazio. A anotação `@Singleton` resolve isso elegantemente, pois não utiliza proxies e garante uma única instância do serviço por aplicação (o que é ideal e seguro para Services sem estado/stateless).
>
> **Injeção em Controllers/Resources:** Um serviço anotado com `@Singleton` pode ser perfeitamente injetado em classes JAX-RS (como o `UsuarioController`). O Quarkus gerenciará a instância única do seu serviço e a disponibilizará corretamente para a requisição, suportando injeção via `@Inject` no campo (Field Injection) ou via construtor.

## 1. Criação do `BaseService` com injeção via construtor

Primeiro, crie uma classe base que conterá a lógica genérica de `inserir`, `listar`, `buscar` e `excluir`. Ela será tipada para receber a **Entidade** (`T`), o tipo de **ID** (`ID`) e o **Repositório** (`R`).

```java
package modules.core.service;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.transaction.Transactional;

import java.util.List;

/**
 * Classe base para serviços genéricos de CRUD.
 *
 * @param <T>  O tipo da Entidade (ex: Usuario)
 * @param <ID> O tipo da chave primária (ex: Long)
 * @param <R>  O tipo do Repository (ex: UsuarioRepository)
 */
public abstract class BaseService<T, ID, R extends PanacheRepositoryBase<T, ID>> {

    protected final R repository;

    // O repositório é recebido no construtor da classe base
    protected BaseService(R repository) {
        this.repository = repository;
    }

    public List<T> listar() {
        return repository.listAll();
    }

    public T buscarPorId(ID id) {
        return repository.findById(id);
    }

    @Transactional
    public T inserir(T entity) {
        repository.persist(entity);
        return entity;
    }

    @Transactional
    public T atualizar(ID id, T entityAtualizado) {
        T entity = repository.findById(id);
        
        if (entity != null) {
            copiarDados(entity, entityAtualizado);
        }
        
        return entity;
    }

    @Transactional
    public boolean excluir(ID id) {
        return repository.deleteById(id);
    }

    /**
     * O método de atualização necessita transferir os dados da entidade nova para a entidade 
     * gerenciada (managed) do Hibernate. Sendo assim, a classe filha define quais campos
     * são atualizáveis.
     */
    protected abstract void copiarDados(T entityAtual, T entityNova);
}
```

## 2. Refatorando o `UsuarioService`

Agora, o `UsuarioService` estende essa classe base e passa a injeção do seu repositório específico via `super()`. Utilizamos `@Singleton` para permitir a injeção limpa via construtor sem a necessidade de construtores vazios para proxies.

```java
package modules.iam.usuario;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import modules.core.service.BaseService;

@Singleton
public class UsuarioService extends BaseService<Usuario, Long, UsuarioRepository> {

    // O CDI do Quarkus injeta o repositório aqui, e nós passamos para a classe base
    @Inject
    public UsuarioService(UsuarioRepository usuarioRepository) {
        super(usuarioRepository);
    }

    @Override
    protected void copiarDados(Usuario usuario, Usuario usuarioAtualizado) {
        // Regra de atualização das propriedades da entidade Usuario
        usuario.nome = usuarioAtualizado.nome;
        usuario.login = usuarioAtualizado.login;
        usuario.email = usuarioAtualizado.email;
        usuario.avatar = usuarioAtualizado.avatar;
    }
    
    // Outras regras de negócio específicas (ex: buscarPorEmail, trocarSenha)
    // podem ser implementadas normalmente acessando 'this.repository'.
}
```

## 3. Utilização no `UsuarioController` (JAX-RS Resource)

O `UsuarioController` pode continuar utilizando a injeção via `@Inject` ou, seguindo a mesma boa prática de injeção via construtor, pode ser refatorado dessa forma:

```java
package modules.iam.usuario;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import java.util.List;

@Path("/usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    // A injeção via construtor também é suportada e recomendada aqui
    @Inject
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GET
    public List<Usuario> listar() {
        return usuarioService.listar();
    }
    
    // ... restante dos métodos do seu Controller continuam inalterados
}
```

## Resumo dos Benefícios:

1. **Reuso de Código (DRY)**: Você não precisa reescrever o CRUD para cada nova entidade. Quando você criar um `ProdutoService`, ele nascerá completo apenas ao estender `BaseService`.
2. **Injeção via Construtor e @Singleton**: Evita o uso excessivo de `@Inject` em campos da classe (Field Injection). Torna a classe imutável em relação às suas dependências (`final R repository`) e elimina a necessidade de criar construtores vazios fictícios apenas para satisfazer o proxy do CDI.
3. **Segurança no Update**: A função de `copiarDados` obriga cada service a ser explícito sobre quais campos podem ser modificados numa ação de atualização (impedindo que IDs ou dados sensíveis sejam sobreescritos acidentalmente).