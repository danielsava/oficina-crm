package common;

/**
 * Catálogo central dos schemas PostgreSQL utilizados pela aplicação.
 *
 * <p>Toda entidade JPA DEVE referenciar uma destas constantes em
 * {@code @Table(schema = ...)} em vez de repetir o literal do schema.
 * O mesmo vale para {@code @SequenceGenerator(schema = ...)} e demais
 * anotações JPA que aceitam um nome de schema.</p>
 *
 * <p>As constantes são {@code public static final String} com literal
 * direto, pois {@code @Table#schema} (e anotações análogas) exigem um
 * <em>compile-time constant</em>.</p>
 *
 * <p>O schema {@link #CORE} é técnico/transversal (Flyway, sequence
 * global) e NÃO deve ser referenciado por entidades de negócio.</p>
 */
public final class DbSchemas {

    /** Schema técnico transversal: flyway_schema_history, global_id_seq. */
    public static final String CORE = "core";

    /** Módulo IAM (Identity & Access Management). */
    public static final String IAM = "iam";

    /** Módulo CRM. */
    public static final String CRM = "crm";

    /** Módulo Estoque. */
    public static final String ESTOQUE = "estoque";

    private DbSchemas() {
        // utility class — não instanciável
    }
}
