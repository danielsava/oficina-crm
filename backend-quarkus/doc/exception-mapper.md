# Exemplos de Implementações do ExceptionMapper no Quarkus

Este documento apresenta exemplos práticos de implementações do `ExceptionMapper` para tratamento centralizado de exceções em aplicações Quarkus, baseados na documentação oficial e em projetos de desenvolvedores reconhecidos.

## 1. ExceptionMapper Básico para Exceções Específicas

Este exemplo demonstra como criar um mapper para uma exceção específica, como `EntityNotFoundException`:

```java
package org.acme.exception;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.acme.exception.model.ErrorResponse;
import org.jboss.logging.Logger;

@Provider
public class EntityNotFoundExceptionMapper implements ExceptionMapper<EntityNotFoundException> {
    
    private static final Logger LOG = Logger.getLogger(EntityNotFoundExceptionMapper.class);
    
    @Override
    public Response toResponse(EntityNotFoundException exception) {
        LOG.debug("Tratando EntityNotFoundException", exception);
        
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setStatus(Response.Status.NOT_FOUND.getStatusCode());
        errorResponse.setTitle("Recurso não encontrado");
        errorResponse.setDetail(exception.getMessage());
        
        return Response
                .status(Response.Status.NOT_FOUND)
                .entity(errorResponse)
                .build();
    }
}
```

Classe de modelo para resposta de erro:

```java
package org.acme.exception.model;

public class ErrorResponse {
    private int status;
    private String title;
    private String detail;
    
    // Getters e setters
    public int getStatus() {
        return status;
    }
    
    public void setStatus(int status) {
        this.status = status;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDetail() {
        return detail;
    }
    
    public void setDetail(String detail) {
        this.detail = detail;
    }
}
```

## 2. ExceptionMapper Global para Todas as Exceções

Este exemplo implementa um mapper global que trata qualquer tipo de exceção não capturada, com diferentes formatos de resposta baseados no cabeçalho `Accept`:

```java
package org.acme.exception;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.jboss.logging.Logger;
import org.jboss.resteasy.util.MediaTypeHelper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import io.quarkus.qute.Template;
import io.vertx.core.http.HttpServerRequest;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

    private static final List<MediaType> ERROR_MEDIA_TYPES = List.of(
            MediaType.TEXT_PLAIN_TYPE,
            MediaType.TEXT_HTML_TYPE,
            MediaType.APPLICATION_JSON_TYPE
    );
    
    @Inject
    ObjectMapper objectMapper;
    
    @Inject
    Template error; // Template Qute para respostas HTML
    
    @Inject
    Logger logger;
    
    @Inject
    javax.inject.Provider<HttpServerRequest> requestProvider;
    
    @Override
    public Response toResponse(Exception exception) {
        // Mapeia a exceção para uma resposta HTTP apropriada
        Response errorResponse = mapExceptionToResponse(exception);
        
        // Determina o tipo de mídia baseado no cabeçalho Accept
        MediaType acceptableMediaType = determineMediaType();
        
        // Cria o conteúdo da resposta no formato apropriado
        String errorContent = createErrorContent(
                acceptableMediaType, 
                errorResponse.getStatusInfo(), 
                errorResponse.getEntity().toString()
        );
        
        return Response.fromResponse(errorResponse)
                .type(acceptableMediaType)
                .entity(errorContent)
                .build();
    }
    
    private Response mapExceptionToResponse(Exception exception) {
        // Usa a resposta de WebApplicationException como está
        if (exception instanceof WebApplicationException) {
            Response originalResponse = ((WebApplicationException) exception).getResponse();
            return Response.fromResponse(originalResponse)
                    .entity(exception.getMessage())
                    .build();
        }
        // Mapeamentos específicos para exceções conhecidas
        else if (exception instanceof IllegalArgumentException) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(exception.getMessage())
                    .build();
        }
        // Usa 500 (Internal Server Error) para todas as outras exceções
        else {
            // Log detalhado para erros de servidor
            logger.error("Erro interno ao processar requisição", exception);
            
            // Resposta genérica para o cliente (sem expor detalhes internos)
            return Response.serverError()
                    .entity("Erro interno do servidor")
                    .build();
        }
    }
    
    private MediaType determineMediaType() {
        // Implementação simplificada - na prática, extrairia do cabeçalho Accept
        // Usando MediaTypeHelper do RESTEasy para encontrar o melhor match
        List<MediaType> acceptableTypes = new ArrayList<>();
        acceptableTypes.add(MediaType.APPLICATION_JSON_TYPE); // Exemplo simplificado
        
        return MediaTypeHelper.getBestMatch(
                new ArrayList<>(ERROR_MEDIA_TYPES), 
                acceptableTypes
        );
    }
    
    private String createErrorContent(MediaType mediaType, Response.StatusType status, String details) {
        if (mediaType.equals(MediaType.APPLICATION_JSON_TYPE)) {
            return createJsonErrorContent(status, details);
        }
        else if (mediaType.equals(MediaType.TEXT_HTML_TYPE)) {
            return createHtmlErrorContent(status, details);
        }
        else {
            return createTextErrorContent(status, details);
        }
    }
    
    private String createJsonErrorContent(Response.StatusType status, String details) {
        ObjectNode errorNode = objectMapper.createObjectNode();
        errorNode.put("status", status.getStatusCode());
        errorNode.put("title", status.getReasonPhrase());
        
        if (details != null) {
            errorNode.put("detail", details);
        }
        
        ArrayNode errorsArray = objectMapper.createArrayNode().add(errorNode);
        
        try {
            return objectMapper.writeValueAsString(errorsArray);
        } catch (Exception e) {
            // Fallback para caso de erro na serialização
            return "{\"status\":" + status.getStatusCode() + 
                   ",\"title\":\"" + status.getReasonPhrase() + "\"}";
        }
    }
    
    private String createHtmlErrorContent(Response.StatusType status, String details) {
        // Usando template Qute (precisa ser definido em src/main/resources/templates)
        return error.data("errorStatus", status.getStatusCode())
                .data("errorTitle", status.getReasonPhrase())
                .data("errorDetails", details)
                .render();
    }
    
    private String createTextErrorContent(Response.StatusType status, String details) {
        StringBuilder text = new StringBuilder();
        text.append("Erro ")
            .append(status.getStatusCode())
            .append(" (")
            .append(status.getReasonPhrase())
            .append(")");
            
        if (details != null) {
            text.append("\n\n").append(details);
        }
        
        return text.toString();
    }
}
```

## 3. ExceptionMapper para Validações (Bean Validation)

Este exemplo trata especificamente as exceções de validação (ConstraintViolationException):

```java
package org.acme.exception;

import java.util.List;
import java.util.stream.Collectors;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.acme.exception.model.ValidationErrorResponse;
import org.acme.exception.model.ViolationError;

@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException exception) {
        List<ViolationError> errors = exception.getConstraintViolations()
                .stream()
                .map(this::mapViolation)
                .collect(Collectors.toList());
                
        ValidationErrorResponse errorResponse = new ValidationErrorResponse();
        errorResponse.setStatus(Response.Status.BAD_REQUEST.getStatusCode());
        errorResponse.setTitle("Erro de validação");
        errorResponse.setViolations(errors);
        
        return Response
                .status(Response.Status.BAD_REQUEST)
                .entity(errorResponse)
                .build();
    }
    
    private ViolationError mapViolation(ConstraintViolation<?> violation) {
        ViolationError error = new ViolationError();
        
        // Extrai o nome do campo da propriedade path
        String propertyPath = violation.getPropertyPath().toString();
        // Para métodos, remove o prefixo do método
        String field = propertyPath.contains(".") 
                ? propertyPath.substring(propertyPath.lastIndexOf('.') + 1) 
                : propertyPath;
                
        error.setField(field);
        error.setMessage(violation.getMessage());
        
        return error;
    }
}
```

Classes de modelo para resposta de erro de validação:

```java
package org.acme.exception.model;

import java.util.List;

public class ValidationErrorResponse {
    private int status;
    private String title;
    private List<ViolationError> violations;
    
    // Getters e setters
    public int getStatus() {
        return status;
    }
    
    public void setStatus(int status) {
        this.status = status;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public List<ViolationError> getViolations() {
        return violations;
    }
    
    public void setViolations(List<ViolationError> violations) {
        this.violations = violations;
    }
}

package org.acme.exception.model;

public class ViolationError {
    private String field;
    private String message;
    
    // Getters e setters
    public String getField() {
        return field;
    }
    
    public void setField(String field) {
        this.field = field;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
```

## 4. ExceptionMapper para Exceções de Negócio

Este exemplo demonstra como tratar exceções de negócio personalizadas:

```java
package org.acme.exception;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.acme.exception.model.ErrorResponse;

@Provider
public class BusinessExceptionMapper implements ExceptionMapper<BusinessException> {

    @Override
    public Response toResponse(BusinessException exception) {
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setStatus(Response.Status.CONFLICT.getStatusCode());
        errorResponse.setTitle("Erro de negócio");
        errorResponse.setDetail(exception.getMessage());
        errorResponse.setErrorCode(exception.getErrorCode());
        
        return Response
                .status(Response.Status.CONFLICT)
                .entity(errorResponse)
                .build();
    }
}

// Classe de exceção de negócio
package org.acme.exception;

public class BusinessException extends RuntimeException {
    
    private final String errorCode;
    
    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
```

Classe de modelo estendida para incluir código de erro:

```java
package org.acme.exception.model;

public class ErrorResponse {
    private int status;
    private String title;
    private String detail;
    private String errorCode;
    
    // Getters e setters básicos (omitidos)
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
}
```

## 5. Boas Práticas para ExceptionMapper no Quarkus

### 5.1. Estrutura de Resposta de Erro

Siga um padrão consistente para respostas de erro, como o [RFC 7807 (Problem Details for HTTP APIs)](https://tools.ietf.org/html/rfc7807):

```java
package org.acme.exception.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class ProblemDetail {
    private String type;
    private String title;
    private int status;
    private String detail;
    private String instance;
    private LocalDateTime timestamp;
    private List<ValidationError> errors;
    
    // Construtor para erros simples
    public ProblemDetail(int status, String title, String detail) {
        this.status = status;
        this.title = title;
        this.detail = detail;
        this.timestamp = LocalDateTime.now();
    }
    
    // Método para adicionar erros de validação
    public void addValidationError(String field, String message) {
        if (errors == null) {
            errors = new ArrayList<>();
        }
        errors.add(new ValidationError(field, message));
    }
    
    // Getters e setters
    
    // Classe interna para erros de validação
    public static class ValidationError {
        private String field;
        private String message;
        
        public ValidationError(String field, String message) {
            this.field = field;
            this.message = message;
        }
        
        // Getters e setters
    }
}
```

### 5.2. Hierarquia de Exceções

Crie uma hierarquia de exceções bem definida:

```java
package org.acme.exception;

// Exceção base para todas as exceções de aplicação
public abstract class ApplicationException extends RuntimeException {
    
    private final String errorCode;
    
    protected ApplicationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}

// Exceções específicas
public class ResourceNotFoundException extends ApplicationException {
    public ResourceNotFoundException(String resource, String id) {
        super(String.format("Recurso %s com ID %s não encontrado", resource, id), "RESOURCE_NOT_FOUND");
    }
}

public class BusinessRuleViolationException extends ApplicationException {
    public BusinessRuleViolationException(String message, String errorCode) {
        super(message, errorCode);
    }
}

public class SecurityViolationException extends ApplicationException {
    public SecurityViolationException(String message) {
        super(message, "SECURITY_VIOLATION");
    }
}
```

### 5.3. ExceptionMapper Unificado

Crie um mapper unificado que trate a hierarquia de exceções:

```java
package org.acme.exception;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.acme.exception.model.ProblemDetail;
import org.jboss.logging.Logger;

@Provider
public class ApplicationExceptionMapper implements ExceptionMapper<ApplicationException> {

    private static final Logger LOG = Logger.getLogger(ApplicationExceptionMapper.class);
    
    @Context
    UriInfo uriInfo;
    
    @Override
    public Response toResponse(ApplicationException exception) {
        Response.Status status = determineStatus(exception);
        
        ProblemDetail problem = new ProblemDetail(
                status.getStatusCode(),
                status.getReasonPhrase(),
                exception.getMessage()
        );
        
        problem.setType("https://api.example.org/errors/" + exception.getErrorCode());
        problem.setInstance(uriInfo.getPath());
        
        // Log baseado na severidade
        if (status.getFamily() == Response.Status.Family.SERVER_ERROR) {
            LOG.error("Erro interno do servidor", exception);
        } else {
            LOG.debug("Erro de cliente", exception);
        }
        
        return Response
                .status(status)
                .entity(problem)
                .header("Content-Type", "application/problem+json")
                .build();
    }
    
    private Response.Status determineStatus(ApplicationException exception) {
        if (exception instanceof ResourceNotFoundException) {
            return Response.Status.NOT_FOUND;
        } else if (exception instanceof BusinessRuleViolationException) {
            return Response.Status.CONFLICT;
        } else if (exception instanceof SecurityViolationException) {
            return Response.Status.FORBIDDEN;
        }
        
        // Fallback
        return Response.Status.INTERNAL_SERVER_ERROR;
    }
}
```

## 6. Considerações de Segurança

Ao implementar ExceptionMappers, considere estas práticas de segurança:

1. **Não exponha detalhes internos**: Em ambientes de produção, nunca inclua stack traces ou detalhes técnicos nas respostas.

2. **Log apropriado**: Registre exceções com nível de log apropriado (ERROR para erros de servidor, DEBUG/INFO para erros de cliente).

3. **Mensagens genéricas**: Use mensagens genéricas para erros inesperados, revelando detalhes apenas para exceções de negócio esperadas.

Exemplo de configuração para ambientes diferentes:

```java
@Provider
public class SecureExceptionMapper implements ExceptionMapper<Exception> {

    @Inject
    Logger logger;
    
    @ConfigProperty(name = "quarkus.profile")
    String profile;
    
    @Override
    public Response toResponse(Exception exception) {
        // Log completo para qualquer ambiente
        logger.error("Erro ao processar requisição", exception);
        
        // Resposta diferente baseada no ambiente
        if ("dev".equals(profile) || "test".equals(profile)) {
            // Ambiente de desenvolvimento - mais detalhes
            return Response
                    .serverError()
                    .entity(new DetailedErrorResponse(exception))
                    .build();
        } else {
            // Ambiente de produção - mensagem genérica
            return Response
                    .serverError()
                    .entity(new ErrorResponse(500, "Erro interno do servidor", null))
                    .build();
        }
    }
}
```

## 7. Conclusão

Implementar ExceptionMappers no Quarkus permite um tratamento centralizado e consistente de exceções em APIs REST. As melhores práticas incluem:

1. Criar uma hierarquia de exceções bem definida
2. Usar formatos de resposta padronizados (como RFC 7807)
3. Tratar exceções específicas com mappers dedicados
4. Implementar um mapper global para exceções não tratadas
5. Considerar aspectos de segurança e não expor detalhes internos
6. Usar logging apropriado para facilitar o diagnóstico de problemas
7. Adaptar as respostas ao tipo de mídia solicitado pelo cliente

Seguindo estas práticas, você criará APIs mais robustas, seguras e fáceis de consumir.
