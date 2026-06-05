package common;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Combinador lógico aplicado a {@b todos} os critérios de uma
 * {@link FiltroDTO} (estrutura plana; sem aninhamento).
 *
 * <p>Quando ausente ou {@code null}, o {@link common.BaseService} aplica
 * {@link #AND} por padrão.</p>
 */
@Schema(description = "Combinador lógico aplicado a todos os critérios da requisição (estrutura plana, sem aninhamento).")
public enum OperadorLogico {

    AND,
    OR

}
