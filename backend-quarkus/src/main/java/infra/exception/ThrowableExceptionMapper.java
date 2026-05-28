package infra.exception;

import io.quarkus.logging.Log;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Mapper catch-all para qualquer {@link Throwable} não tratado pelos mappers
 * específicos. Responde com status 500 e payload RFC 7807, ocultando detalhes
 * internos do cliente.
 *
 * <p>A causa real é logada no servidor com nível {@code error}; o cliente recebe
 * apenas o título genérico {@code "Erro interno"}. Isso evita vazamento de
 * stack traces, classes JPA e estrutura interna pela resposta HTTP.</p>
 *
 * <p>JAX-RS sempre prefere mappers de tipo mais específico, então este mapper
 * só é acionado quando nenhum outro casa com a exception lançada.</p>
 */
@Provider
public class ThrowableExceptionMapper implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {

        Log.error("Erro não tratado na API", exception);

        int status = Response.Status.INTERNAL_SERVER_ERROR.getStatusCode();

        ProblemDetails problem = ProblemDetails.of(
                status,
                "Erro interno",
                "Ocorreu um erro inesperado ao processar a requisição."
        );

        return Response.status(status)
                .entity(problem)
                .header(HttpHeaders.CONTENT_TYPE, ProblemDetails.MEDIA_TYPE)
                .type(MediaType.valueOf(ProblemDetails.MEDIA_TYPE))
                .build();
    }

}
