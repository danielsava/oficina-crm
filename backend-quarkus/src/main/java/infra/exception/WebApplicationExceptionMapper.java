package infra.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Mapeia {@link WebApplicationException} (e subtipos não cobertos por mappers
 * específicos) para uma resposta RFC 7807, preservando o status HTTP definido
 * na exception.
 *
 * <p>Atende casos como {@link jakarta.ws.rs.BadRequestException},
 * {@link jakarta.ws.rs.ForbiddenException}, {@link jakarta.ws.rs.NotAllowedException},
 * {@code io.quarkus.security.UnauthorizedException} (subtipo de
 * {@code WebApplicationException}), entre outros.</p>
 *
 * <p>{@link jakarta.ws.rs.NotFoundException} tem mapper próprio
 * ({@link NotFoundExceptionMapper}) e não cai aqui, pois o JAX-RS escolhe sempre
 * o mapper de tipo mais específico.</p>
 */
@Provider
public class WebApplicationExceptionMapper implements ExceptionMapper<WebApplicationException> {

    @Override
    public Response toResponse(WebApplicationException exception) {

        int status = exception.getResponse().getStatus();

        String title = Response.Status.fromStatusCode(status) != null
                ? Response.Status.fromStatusCode(status).getReasonPhrase()
                : "Erro HTTP";

        ProblemDetails problem = ProblemDetails.of(status, title, exception.getMessage());

        return Response.status(status)
                .entity(problem)
                .header(HttpHeaders.CONTENT_TYPE, ProblemDetails.MEDIA_TYPE)
                .type(MediaType.valueOf(ProblemDetails.MEDIA_TYPE))
                .build();
    }

}
