package common;


/**
 * Combinador lógico aplicado a {@b todos} os critérios de uma
 * {@link FiltroDTO} (estrutura plana; sem aninhamento).
 *
 * <p>Quando ausente ou {@code null}, o {@link common.BaseService} aplica
 * {@link #AND} por padrão.</p>
 */
public enum OperadorLogico {

    AND,
    OR

}
