package infra.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.net.URI;
import java.util.List;

/** Payload padrão de erro HTTP, conforme RFC 7807 (Problem Details for HTTP APIs). */
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
