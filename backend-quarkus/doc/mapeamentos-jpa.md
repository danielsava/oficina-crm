### 📚 Exemplos de Mapeamento JPA com `@Table` e Boas Práticas

#### 🔑 Boas Práticas com `@Table`:
1. **Nomes explícitos**: Sempre nomear tabelas explicitamente
2. **Esquemas organizacionais**: Usar `schema` para ambientes complexos
3. **Índices para campos frequentemente consultados**
4. **Constraints de unicidade diretamente na tabela**

---

### 1. Entidade `Pessoa` com `@OneToOne`
```java
@Entity
@Table(
    name = "pessoas",
    schema = "cadastro",
    indexes = @Index(name = "idx_pessoa_nome", columnList = "nome"),
    uniqueConstraints = @UniqueConstraint(name = "uk_pessoa_cpf", columnNames = "cpf")
)
public class Pessoa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false, length = 100)
    private String nome;

    @Column(unique = true, length = 11)
    private String cpf;

    @OneToOne(
        mappedBy = "pessoa", 
        cascade = {CascadeType.PERSIST, CascadeType.REMOVE},
        orphanRemoval = true
    )
    private Endereco endereco;

    // Método helper
    public void setEndereco(Endereco endereco) {
        if (endereco == null) {
            if (this.endereco != null) this.endereco.setPessoa(null);
        } else {
            endereco.setPessoa(this);
        }
        this.endereco = endereco;
    }
}
```

---

### 2. Entidade `Endereco` com `@OneToOne`
```java
@Entity
@Table(
    name = "enderecos",
    indexes = {
        @Index(name = "idx_endereco_cep", columnList = "cep"),
        @Index(name = "idx_endereco_cidade", columnList = "cidade")
    }
)
public class Endereco {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String logradouro;

    @Column(nullable = false, length = 10)
    private String cep;

    @Column(nullable = false, length = 50)
    private String cidade;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "pessoa_id", 
        referencedColumnName = "id",
        foreignKey = @ForeignKey(name = "fk_endereco_pessoa")
    )
    private Pessoa pessoa;
}
```

---

### 3. Entidade `Pedido` com `@OneToMany`
```java
@Entity
@Table(
    name = "pedidos",
    indexes = @Index(name = "idx_pedido_data", columnList = "data_criacao")
)
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @OneToMany(
        mappedBy = "pedido",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<ItemPedido> itens = new ArrayList<>();

    // Helper methods
    public void addItem(ItemPedido item) {
        itens.add(item);
        item.setPedido(this);
        calcularTotal();
    }

    private void calcularTotal() {
        this.total = itens.stream()
            .map(ItemPedido::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

---

### 4. Entidade `ItemPedido` com `@ManyToOne`
```java
@Entity
@Table(
    name = "itens_pedido",
    indexes = {
        @Index(name = "idx_item_pedido", columnList = "pedido_id"),
        @Index(name = "idx_item_produto", columnList = "produto_id")
    }
)
public class ItemPedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Transient
    public BigDecimal getSubtotal() {
        return precoUnitario.multiply(BigDecimal.valueOf(quantidade));
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "pedido_id", 
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_item_pedido")
    )
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "produto_id", 
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_item_produto")
    )
    private Produto produto;
}
```

---

### 5. Entidades `Produto` e `Categoria` com `@ManyToMany`
```java
@Entity
@Table(
    name = "produtos",
    indexes = @Index(name = "idx_produto_nome", columnList = "nome"),
    uniqueConstraints = @UniqueConstraint(name = "uk_produto_codigo", columnNames = "codigo")
)
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nome;

    @ManyToMany
    @JoinTable(
        name = "produto_categoria",
        schema = "catalogo",
        joinColumns = @JoinColumn(
            name = "produto_id", 
            foreignKey = @ForeignKey(name = "fk_produto_categoria_produto")
        ),
        inverseJoinColumns = @JoinColumn(
            name = "categoria_id",
            foreignKey = @ForeignKey(name = "fk_produto_categoria_categoria")
        ),
        indexes = {
            @Index(name = "idx_produto_categoria_produto", columnList = "produto_id"),
            @Index(name = "idx_produto_categoria_categoria", columnList = "categoria_id")
        }
    )
    private Set<Categoria> categorias = new HashSet<>();

    // Helper method
    public void adicionarCategoria(Categoria categoria) {
        categorias.add(categoria);
        categoria.getProdutos().add(this);
    }
}

@Entity
@Table(
    name = "categorias",
    schema = "catalogo",
    indexes = @Index(name = "idx_categoria_nome", columnList = "nome")
)
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nome;

    @ManyToMany(mappedBy = "categorias")
    private Set<Produto> produtos = new HashSet<>();
}
```

---

### ⚙️ Boas Práticas Avançadas com `@Table`:

1. **Estratégia de Naming Conventions**:
```java
@Table(name = "orders") // Evitar pluralização inconsistente
@Entity
public class Order { ... }
```

2. **Particionamento com Esquemas**:
```java
@Table(name = "clientes", schema = "vendas")
@Entity
public class Cliente { ... }
```

3. **Índices Compostos**:
```java
@Table(
    name = "transacoes",
    indexes = @Index(
        name = "idx_transacao_status_data", 
        columnList = "status, data_criacao"
    )
)
```

4. **Tabelas de Herança**:
```java
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "pessoas")
@Entity
public class Pessoa { ... }

@Table(name = "funcionarios")
@Entity
public class Funcionario extends Pessoa { ... }
```

5. **Tabelas Temporais**:
```java
@Table(name = "auditoria")
@Entity
@Audited(withModifiedFlag = true)
public class Auditoria { ... }
```

---

### 🔍 Considerações Importantes:

1. **Performance em `@ManyToMany`**:
    - Sempre use `Set` em vez de `List` para evitar duplicatas
    - Considere usar entidade associativa para atributos adicionais

2. **Bidirecionalidade**:
    - Mantenha ambos os lados sincronizados com métodos helpers
    - Prefira operações em cascata apenas quando fizer sentido no domínio

3. **Imutabilidade**:
```java
@Table(name = "configuracoes")
@Entity
public class Configuracao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(updatable = false, nullable = false)
    private String chave;
}
```

4. **Validação Direta no Banco**:
```java
@Table(
    name = "produtos",
    checkConstraints = @CheckConstraint(
        name = "ck_produto_preco_positivo", 
        value = "preco >= 0"
    )
)
```

Estes exemplos seguem as melhores práticas de design de entidades JPA, utilizando `@Table` para controle preciso do mapeamento relacional, garantindo performance, consistência e manutenibilidade.