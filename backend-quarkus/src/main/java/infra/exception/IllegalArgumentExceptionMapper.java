package infra.exception;

import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Mapeia {@link IllegalArgumentException} para uma resposta RFC 7807 com
 * status {@code 400 Bad Request}.
 *
 * <p>Usado principalmente por validações de query params que não cabem em
 * Bean Validation, como o parser de {@code sort} ({@code common.SortParser})
 * e a checagem de whitelist de campos sortáveis/filtráveis no
 * {@code common.BaseService}. A mensagem da exception é repassada ao cliente
 * porque é construída intencionalmente para ser humana e segura (sem dados
 * sensíveis).</p>
 */
@Provider
public class IllegalArgumentExceptionMapper implements ExceptionMapper<IllegalArgumentException> {

    @Override
    public Response toResponse(IllegalArgumentException exception) {

        int status = Response.Status.BAD_REQUEST.getStatusCode();

        ProblemDetails problem = ProblemDetails.of(status, "Requisição inválida", exception.getMessage());

        return Response.status(status)
                .entity(problem)
                .header(HttpHeaders.CONTENT_TYPE, ProblemDetails.MEDIA_TYPE)
                .type(MediaType.valueOf(ProblemDetails.MEDIA_TYPE))
                .build();
    }

}
