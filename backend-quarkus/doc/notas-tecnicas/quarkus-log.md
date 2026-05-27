# Exemplos de Uso de Log no Quarkus

O Quarkus utiliza o JBoss Logging como sua API de logging padrão, que atua como uma fachada sobre outros frameworks (como JUL, Log4j2, SLF4j). A forma recomendada de obter um logger é usando `org.jboss.logging.Logger`.

## Exemplo 1: Log em um Recurso JAX-RS (Resource)

```java
package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jboss.logging.Logger;
import org.acme.service.LoggingExampleService; // Supondo que exista um serviço

@Path("/log-example")
public class LoggingExampleResource {

    // Injeta o Logger. O Quarkus infere a categoria automaticamente (org.acme.resource.LoggingExampleResource)
    private static final Logger LOG = Logger.getLogger(LoggingExampleResource.class);

    @Inject
    LoggingExampleService service;

    @GET
    @Path("/hello/{name}")
    @Produces(MediaType.TEXT_PLAIN)
    public String hello(@PathParam("name") String name) {
        // Log em nível INFO (geralmente habilitado por padrão)
        LOG.infof("Recebida requisição GET /hello/%s", name);

        // Log em nível DEBUG (geralmente desabilitado por padrão, útil para desenvolvimento)
        LOG.debugf("Detalhes da requisição: nome=%s", name);
        // Alternativa sem formatação:
        // LOG.debug("Detalhes da requisição: nome=" + name);

        String result;
        try {
            result = service.processHello(name);
            LOG.infof("Processamento para '%s' concluído com sucesso.", name);
        } catch (IllegalArgumentException e) {
            // Log em nível WARN (para situações inesperadas, mas não erros fatais)
            LOG.warnf(e, "Nome inválido recebido: %s", name);
            result = "Nome inválido!";
        } catch (Exception e) {
            // Log em nível ERROR (para erros que impedem o processamento normal)
            // O primeiro argumento pode ser a exceção para incluir o stack trace no log
            LOG.errorf(e, "Erro inesperado ao processar /hello/%s", name);
            result = "Erro interno.";
        }

        // Log em nível TRACE (muito detalhado, raramente habilitado)
        LOG.tracef("Retornando resultado: %s", result);

        return result;
    }
}
```

## Exemplo 2: Log em um Serviço CDI (Service)

```java
package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

@ApplicationScoped
public class LoggingExampleService {

    // Obtém o logger para esta classe
    private static final Logger LOG = Logger.getLogger(LoggingExampleService.class);

    public String processHello(String name) {
        LOG.infof("Serviço processando nome: %s", name);

        if (name == null || name.trim().isEmpty() || name.equalsIgnoreCase("invalid")) {
            LOG.warnf("Tentativa de processar nome inválido ou vazio: '%s'", name);
            throw new IllegalArgumentException("Nome não pode ser vazio ou 'invalid'");
        }

        // Simula alguma lógica de negócio
        LOG.debugf("Realizando lógica de negócio para %s...", name);
        String processedName = name.toUpperCase();
        LOG.debugf("Nome processado: %s", processedName);

        return "Olá, " + processedName + "!";
    }
}
```

## Configuração de Níveis de Log (`application.properties`)

Você pode controlar quais níveis de log são exibidos para diferentes partes da sua aplicação.

```properties
# --- Configuração de Logging --- 

# Nível de log padrão para o console (pode ser TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
quarkus.log.console.level=INFO

# Nível de log para uma categoria específica (pacote ou classe)
# Ex: Habilitar DEBUG para todos os nossos recursos
quarkus.log.category."org.acme.resource".level=DEBUG

# Ex: Habilitar TRACE apenas para o nosso serviço específico
quarkus.log.category."org.acme.service.LoggingExampleService".level=TRACE

# Ex: Silenciar logs de uma biblioteca específica (ex: Hibernate)
# quarkus.log.category."org.hibernate".level=WARN

# --- (Opcional) Configuração de Log em Arquivo --- 

# Habilita o log em arquivo
# quarkus.log.file.enable=true

# Caminho do arquivo de log
# quarkus.log.file.path=/var/log/quarkus-app.log

# Nível de log para o arquivo (pode ser diferente do console)
# quarkus.log.file.level=DEBUG

# Formato do log no arquivo (exemplo)
# quarkus.log.file.format=%d{yyyy-MM-dd HH:mm:ss,SSS} %-5p [%c{1.}] (%t) %s%e%n
```

**Níveis de Log (do mais detalhado para o menos detalhado):**

1.  **TRACE:** Informações muito finas, geralmente para diagnóstico de baixo nível.
2.  **DEBUG:** Informações úteis para depuração durante o desenvolvimento.
3.  **INFO:** Mensagens informativas sobre o progresso normal da aplicação (requisições recebidas, inicialização, etc.). **Este é geralmente o nível padrão.**
4.  **WARN:** Indica situações potencialmente problemáticas ou inesperadas, mas que não impedem o funcionamento normal.
5.  **ERROR:** Erros que impediram uma operação específica de ser concluída.
6.  **FATAL:** Erros muito graves que provavelmente causarão o término da aplicação (raramente usado diretamente).

Lembre-se de ajustar os níveis de log conforme a necessidade do ambiente (desenvolvimento vs. produção).
