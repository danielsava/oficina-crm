CREATE SEQUENCE global_id_seq
    START WITH 1
    INCREMENT BY 1
    CACHE 20;

CREATE TABLE usuario (
    id BIGINT PRIMARY KEY DEFAULT nextval('global_id_seq'),
    uuid VARCHAR(60) NOT NULL,
    version BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    nome VARCHAR(255),
    login VARCHAR(255),
    email VARCHAR(255),
    avatar VARCHAR(255)
);

CREATE UNIQUE INDEX ux_usuario_uuid ON usuario (uuid);
CREATE UNIQUE INDEX ux_usuario_login ON usuario (login);
