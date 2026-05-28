package infra.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.List;

/**
 * Mapeia {@link ConstraintViolationException} (Bean Validation) para uma resposta
 * RFC 7807 com status 400 e a extensão {@code errors} contendo um item por campo
 * violado.
 *
 * <p>Disparada quando um DTO anotado com {@code @Valid} (no Rest ou no Service)
 * recebe payload inválido, ou quando parâmetros de método anotados com
 * restrições Bean Validation são violados.</p>
 */
@Provider
public class ConstraintViolationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException exception) {

        int status = Response.Status.BAD_REQUEST.getStatusCode();

        List<ProblemDetails.FieldError> errors = exception.getConstraintViolations().stream()
                .map(this::toFieldError)
                .toList();

        ProblemDetails problem = ProblemDetails.ofValidation(
                status,
                "Erro de validação",
                "Um ou mais campos do payload são inválidos.",
                errors
        );

        return Response.status(status)
                .entity(problem)
                .header(HttpHeaders.CONTENT_TYPE, ProblemDetails.MEDIA_TYPE)
                .type(MediaType.valueOf(ProblemDetails.MEDIA_TYPE))
                .build();
    }

    /**
     * Converte uma {@link ConstraintViolation} em {@link ProblemDetails.FieldError},
     * extraindo apenas o último segmento do {@code propertyPath} (nome do campo) e
     * descartando o prefixo do método/parâmetro adicionado pelo Bean Validation.
     */
    private ProblemDetails.FieldError toFieldError(ConstraintViolation<?> violation) {

        String field = null;

        for (Path.Node node : violation.getPropertyPath())
            field = node.getName();

        return new ProblemDetails.FieldError(field, violation.getMessage());
    }

}
