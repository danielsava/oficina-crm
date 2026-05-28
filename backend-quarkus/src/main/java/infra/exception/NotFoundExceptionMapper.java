package infra.exception;

import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Mapeia {@link NotFoundException} (recurso REST não encontrado ou rota inexistente)
 * para uma resposta RFC 7807 com status 404.
 *
 * <p>Lançada tipicamente pelo {@code BaseRest} quando a entidade requisitada não
 * existe, e pelo próprio JAX-RS quando a rota não bate com nenhum endpoint.</p>
 */
@Provider
public class NotFoundExceptionMapper implements ExceptionMapper<NotFoundException> {

    @Override
    public Response toResponse(NotFoundException exception) {

        int status = Response.Status.NOT_FOUND.getStatusCode();

        ProblemDetails problem = ProblemDetails.of(status, "Recurso não encontrado", exception.getMessage());

        return Response.status(status)
                .entity(problem)
                .header(jakarta.ws.rs.core.HttpHeaders.CONTENT_TYPE, ProblemDetails.MEDIA_TYPE)
                .type(MediaType.valueOf(ProblemDetails.MEDIA_TYPE))
                .build();
    }

}
