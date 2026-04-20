CREATE SEQUENCE global_id_seq
    START WITH 1
    INCREMENT BY 1
    CACHE 20;

CREATE TABLE tb_usuario (
    id BIGINT PRIMARY KEY DEFAULT nextval('global_id_seq'),
    uuid UUID NOT NULL, -- DEFAULT gen_random_uuid()
    status VARCHAR(255) NOT NULL,
    version BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    nome VARCHAR(150) NOT NULL,
    login VARCHAR(50) NOT NULL,
    senha_hash VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    avatar VARCHAR(255)
);

CREATE UNIQUE INDEX unique_tb_usuario_uuid ON tb_usuario (uuid);
CREATE UNIQUE INDEX unique_tb_usuario_login ON tb_usuario (login);
CREATE UNIQUE INDEX unique_tb_usuario_email ON tb_usuario (email);
