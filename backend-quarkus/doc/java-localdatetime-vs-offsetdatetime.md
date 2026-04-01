### Comparativo entre `OffsetDateTime` e `LocalDateTime` (Java 17+)

| **Característica**          | **`LocalDateTime`**                          | **`OffsetDateTime`**                              |
|-----------------------------|---------------------------------------------|--------------------------------------------------|
| **Definição**               | Representa data e hora **sem fuso horário** ou offset (ex: `2025-05-30T10:15:30`). | Representa data e hora **com offset UTC** (ex: `2025-05-30T10:15:30+02:00`). |
| **Contexto temporal**       | **Ambíguo**: Não está vinculado a um momento absoluto na linha do tempo. | **Não ambíguo**: Vincula-se a um instante específico na linha do tempo (via offset). |
| **Componentes**             | - Ano<br>- Mês<br>- Dia<br>- Hora<br>- Minuto<br>- Segundo<br>- Nanossegundo | Todos os componentes de `LocalDateTime` **+ offset** (ex: `+03:00`, `-05:00`). |
| **Tratamento de DST**       | Não considera fusos horários ou horário de verão. | Considera **apenas o offset fixo** (não ajusta automaticamente para DST). |
| **Uso recomendado**         | - Eventos futuros sem local definido (ex: "Reunião em 25/12 às 20:00").<br>- Horários genéricos (ex: horário comercial). | - Registro de eventos passados (ex: logs, transações).<br>- Comunicação entre sistemas com diferentes fusos.<br>- Armazenamento em banco de dados. |
| **Conversões**              | Requer **fuso horário** (`ZoneId`) para converter em instantes absolutos (ex: `atZone(ZoneId)`). | Pode ser convertido diretamente em `Instant` (sem necessidade de `ZoneId`). |
| **Serialização/ISO-8601**   | Formato: `yyyy-MM-dd'T'HH:mm:ss.SSS` (sem offset). | Formato: `yyyy-MM-dd'T'HH:mm:ss.SSS±HH:mm` (com offset). |

---

### **Recomendação Atual (Java 17+):**
Prefira **`OffsetDateTime`** para a maioria dos casos, especialmente quando:
1. **Precisão temporal é essencial** (ex: registros de auditoria, transações).
2. **Sistemas distribuídos** (garante consistência entre diferentes fusos horários).
3. **Armazenamento de dados** (evita ambiguidade em bancos de dados).

#### Por quê?
- **`OffsetDateTime`** resolve a ambiguidade do `LocalDateTime` ao vincular explicitamente a data/hora a um **offset UTC**, permitindo representar **instantes absolutos** na linha do tempo.
- É a escolha mais segura para APIs que lidam com dados temporais críticos (ex: sistemas financeiros, logs distribuídos).

#### Exceções (use `LocalDateTime`):
- Horários **genéricos** (ex: "Loja abre às 09:00").
- Eventos futuros **sem local definido** (ex: "Natal começa à 00:00 em 25/12").

---

### Exemplo Prático:
```java
// Evento registrado no sistema (momento exato)
OffsetDateTime timestampExato = OffsetDateTime.now(ZoneOffset.UTC); // 2025-05-30T12:00:00Z

// Horário de abertura de uma loja (genérico)
LocalDateTime horarioAbertura = LocalDateTime.parse("2025-05-30T09:00"); 
```

> **Nota sobre `ZonedDateTime`**:  
> Se precisar de **fusos horários com regras de DST** (ex: `America/Sao_Paulo`), use `ZonedDateTime`. O `OffsetDateTime` é ideal para offsets fixos (ex: UTC+2), mas não ajusta automaticamente para horário de verão.

---

### Serialização 

### ✅ Suporte para `OffsetDateTime` em APIs REST com Quarkus 3.22.x
O Quarkus 3.22.x mantém suporte robusto à serialização/desserialização de `OffsetDateTime` em APIs REST, mas requer configurações específicas conforme o mecanismo de serialização (Jackson ou JSON-B). Abaixo os detalhes técnicos atualizados:

---

### 🔧 1. **Configuração para Jackson** (`quarkus-rest-jackson`)
#### ✔️ **Registro do Módulo Java Time**
- **Não é necessário registrar manualmente**: Desde o Quarkus 3.x, o `JavaTimeModule` é registrado **automaticamente** se `quarkus-rest-jackson` estiver no classpath .
- **Formato ISO-8601 padrão**: Serializa `OffsetDateTime` como strings (ex: `"2025-05-30T14:30:00-03:00"`).

#### ⚙️ **Customizações recomendadas**:
```java
import io.quarkus.jackson.ObjectMapperCustomizer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class JacksonConfig implements ObjectMapperCustomizer {
    @Override
    public void customize(ObjectMapper mapper) {
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // Força ISO-8601
        // Formato customizado (opcional):
        mapper.setDateFormat(new StdDateFormat().withColonInTimeZone(true));
    }
}
```

#### 🎯 **Anotações para campos específicos**:
```java
public class EventoResponse {
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss XXX")
    private OffsetDateTime timestamp;
}
// Saída: {"timestamp": "30/05/2025 14:30:00 -03:00"}
```

---

### 🔧 2. **Configuração para JSON-B** (`quarkus-rest-jsonb`)
#### ⚠️ **Problemas conhecidos**:
- Desserialização falha se o formato não incluir o **offset** (ex: `DateTimeParseException`) .
- Exceções comuns:
  ```plaintext
  JsonbException: Unable to deserialize property 'timestamp' - unparsed text found at index 19
  ```

#### ✅ **Soluções**:
- Use `@JsonbDateFormat` com padrão explícito e ative o fallback para valores incompletos:
  ```java
  public class Evento {
      @JsonbDateFormat(value = "yyyy-MM-dd'T'HH:mm:ssXXX", locale = "en_US")
      private OffsetDateTime timestamp;
  }
  ```
- Configure o `YassonConfig` no `application.properties`:
  ```properties
  quarkus.jsonb.zero-time-defaulting=true # Habilita fallback para campos ausentes 
  ```

---

### ⚠️ 3. **Problemas Comuns e Soluções**
| **Cenário**                           | **Causa**                                                                 | **Solução**                                                                 |
|---------------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| Desserialização falha com JSON-B      | Formato incompatível ou offset ausente                        | Use `@JsonbDateFormat` com padrão `"yyyy-MM-dd'T'HH:mm:ssXXX"`              |
| Erro `InvalidDefinitionException`     | Módulo `jackson-datatype-jsr310` não registrado (raro no 3.22.x)  | Verifique dependências; o Quarkus 3.x registra automaticamente              |
| Parâmetros de query (`@QueryParam`)   | Falta de `ParamConverterProvider` para `OffsetDateTime`       | Implemente um conversor customizado  ou use strings + parsing manual |

#### 💡 Exemplo de conversor para `@QueryParam`:
```java
@Provider
public class OffsetDateTimeConverter implements ParamConverter<OffsetDateTime> {
    @Override
    public OffsetDateTime fromString(String value) {
        return OffsetDateTime.parse(value, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
    @Override
    public String toString(OffsetDateTime value) {
        return value.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
}
```

---

### 🚫 4. **Restrições Importantes**
- **Não misture Jackson e JSON-B**: Evite incluir `quarkus-rest-jackson` e `quarkus-rest-jsonb` no mesmo projeto para prevenir conflitos .
- **Atualize dependências**: No Quarkus ≥ 3.0, `jackson-datatype-jsr310` é gerenciado automaticamente. Não o declare manualmente no `pom.xml` para evitar conflitos de versão .

---

### 💎 5. **Recomendações Práticas**
1. **Prefira Jackson**:
    - Mais flexível e menos propenso a erros de desserialização que JSON-B .
    - Customização via `ObjectMapper` é mais intuitiva.
2. **Use `OffsetDateTime` para precisão temporal**:
    - Ideal para logs, transações e sistemas distribuídos devido ao **offset explícito** .
    - Evite `LocalDateTime` em APIs críticas: seu uso pode gerar ambiguidade temporal .
3. **Banco de dados**:
    - Hibernate ORM mapeia `OffsetDateTime` para `TIMESTAMP WITH TIME ZONE` (PostgreSQL) sem necessidade de configuração adicional .

---

### 🔄 6. **Exemplo Funcional (Quarkus 3.22.x + Jackson)**
```java
@Path("/eventos")
public class EventoResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getEvento() {
        EventoResponse response = new EventoResponse(
            OffsetDateTime.now(ZoneOffset.UTC)
        );
        return Response.ok(response).build();
    }

    public static class EventoResponse {
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss XXX")
        public OffsetDateTime timestamp;

        public EventoResponse(OffsetDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
```
**Saída JSON**:
```json
{"timestamp": "30/05/2025 14:30:00 Z"}
```

---

### ✅ **Conclusão**
O Quarkus **3.22.x suporta plenamente `OffsetDateTime`** em APIs REST, mas:
- **Jackson**: Configuração mínima (funciona out-of-the-box com ISO-8601).
- **JSON-B**: Exige anotações explícitas (`@JsonbDateFormat`) e ajustes no `application.properties`.
- **Recomendação final**:
    - Use **Jackson** com `quarkus-rest-jackson`.
    - Adote `OffsetDateTime` para dados temporais precisos.
    - Implemente `ParamConverterProvider` se usar `@QueryParam` .

Para detalhes adicionais, consulte o [Guia Oficial de JSON do Quarkus](https://quarkus.io/guides/rest-json) .


