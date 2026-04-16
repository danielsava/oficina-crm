CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255),
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
