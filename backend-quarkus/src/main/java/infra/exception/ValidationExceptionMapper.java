package infra.exception;

import jakarta.validation.ValidationException;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Mapeia {@link ValidationException} (validações de regra de negócio lançadas
 * manualmente nos services) para uma resposta RFC 7807 com status 400.
 *
 * <p>Diferente de {@link jakarta.validation.ConstraintViolationException}, que
 * representa violação de Bean Validation em um payload, {@link ValidationException}
 * é o tipo usado por validações imperativas (ex.: regra de unicidade, força de
 * senha, dependências entre campos).</p>
 */
@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ValidationException> {

    @Override
    public Response toResponse(ValidationException exception) {

        int status = Response.Status.BAD_REQUEST.getStatusCode();

        ProblemDetails problem = ProblemDetails.of(status, "Erro de validação", exception.getMessage());

        return Response.status(status)
                .entity(problem)
                .header(HttpHeaders.CONTENT_TYPE, ProblemDetails.MEDIA_TYPE)
                .type(MediaType.valueOf(ProblemDetails.MEDIA_TYPE))
                .build();
    }

}
