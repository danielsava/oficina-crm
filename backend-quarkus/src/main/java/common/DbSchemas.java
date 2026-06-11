package common;

public final class DbSchemas {

    /** Schema técnico transversal: flyway_schema_history, global_id_seq. */
    public static final String CORE = "core";

    /** Módulo IAM (Identity & Access Management). */
    public static final String IAM = "iam";

    /** Módulo CRM. */
    public static final String CRM = "crm";

    /** Módulo Estoque. */
    public static final String ESTOQUE = "estoque";

    private DbSchemas() { }

}
