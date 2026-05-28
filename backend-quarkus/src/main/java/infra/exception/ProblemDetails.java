package infra.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.net.URI;
import java.util.List;

/**
 * Payload padrão de erro HTTP, conforme RFC 7807 (Problem Details for HTTP APIs).
 *
 * <p>Todos os {@link jakarta.ws.rs.ext.ExceptionMapper} da aplicação respondem com este
 * record, serializado como {@code application/problem+json}.</p>
 *
 * <h2>Campos</h2>
 * <ul>
 *   <li><b>type</b>: URI que identifica o tipo do problema. Usamos {@code about:blank}
 *       (default da RFC) enquanto não existe documentação pública de erros. Quando
 *       publicarmos as URIs reais (ex.: {@code https://api.oficinacrm.com.br/problems/not-found}),
 *       o campo passa a apontar para a documentação correspondente.</li>
 *   <li><b>title</b>: resumo curto e humano do problema. Não varia entre ocorrências
 *       do mesmo {@code type}.</li>
 *   <li><b>status</b>: código HTTP da resposta, replicado no payload por conveniência
 *       do cliente.</li>
 *   <li><b>detail</b>: explicação específica desta ocorrência. Opcional.</li>
 *   <li><b>instance</b>: URI da requisição que causou o erro. Opcional.</li>
 *   <li><b>errors</b>: extensão (fora do mínimo RFC 7807) para erros de validação
 *       por campo. Presente apenas em respostas de Bean Validation
 *       ({@code ConstraintViolationException}).</li>
 * </ul>
 *
 * <p>Campos {@code null} são omitidos da serialização ({@link JsonInclude.Include#NON_NULL}).</p>
 *
 * @see <a href="https://www.rfc-editor.org/rfc/rfc7807">RFC 7807</a>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProblemDetails(
        URI type,
        String title,
        int status,
        String detail,
        URI instance,
        List<FieldError> errors
) {

    /**
     * Content-Type oficial de respostas RFC 7807.
     */
    public static final String MEDIA_TYPE = "application/problem+json";

    /**
     * URI default da RFC quando não há documentação pública do tipo do problema.
     */
    public static final URI TYPE_ABOUT_BLANK = URI.create("about:blank");

    /**
     * Erro de validação associado a um campo específico do payload.
     *
     * @param field   caminho do campo (ex.: {@code "email"}, {@code "endereco.cep"}).
     * @param message mensagem humana da violação (geralmente a mensagem da anotação
     *                Bean Validation).
     */
    public record FieldError(String field, String message) {}

    /**
     * Constrói um {@code ProblemDetails} com {@code type = about:blank} e sem
     * {@code instance} nem {@code errors}.
     */
    public static ProblemDetails of(int status, String title, String detail) {

        return new ProblemDetails(TYPE_ABOUT_BLANK, title, status, detail, null, null);
    }

    /**
     * Constrói um {@code ProblemDetails} com {@code type = about:blank} e a lista
     * de {@code errors} por campo (usado pelo mapper de Bean Validation).
     */
    public static ProblemDetails ofValidation(int status, String title, String detail, List<FieldError> errors) {

        return new ProblemDetails(TYPE_ABOUT_BLANK, title, status, detail, null, errors);
    }

}
