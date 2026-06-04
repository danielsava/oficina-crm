-- Sequence global da aplicação (compartilhada por todos os módulos/schemas).
-- Reside no schema técnico `core`, juntamente com a `flyway_schema_history`.
CREATE SEQUENCE core.global_id_seq
    START WITH 1
    INCREMENT BY 1
    CACHE 20;


-- Tabela do módulo IAM
CREATE TABLE iam.tb_usuario (
    id BIGINT PRIMARY KEY DEFAULT nextval('core.global_id_seq'),
    uuid UUID NOT NULL, -- DEFAULT gen_random_uuid()
    status VARCHAR(40) NOT NULL,
    version BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    nome VARCHAR(150) NOT NULL,
    login VARCHAR(50) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL,
    avatar VARCHAR(255)
);

CREATE UNIQUE INDEX unique_tb_usuario_uuid  ON iam.tb_usuario (uuid);
CREATE UNIQUE INDEX unique_tb_usuario_login ON iam.tb_usuario (login);
CREATE UNIQUE INDEX unique_tb_usuario_email ON iam.tb_usuario (email);
