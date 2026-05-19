DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
    id bigint GENERATED ALWAYS AS IDENTITY,
    login text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    role text NOT NULL DEFAULT 'jogador',
    
    -- Constraints
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uk_usuario_login UNIQUE (login), -- unicidade
    CONSTRAINT uk_usuario_email UNIQUE (email), -- unicidade
    CONSTRAINT ck_usuario_login_length CHECK (length(login) >= 3 AND length(login) <= 50), -- comprimento
    CONSTRAINT ck_usuario_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- formato de email com expressão regular
    CONSTRAINT ck_usuario_senha_length CHECK (length(senha) >= 8), -- comprimento mínimo
    CONSTRAINT ck_usuario_role_valid CHECK (role IN ('admin', 'jogador')) -- tipos de usuário
);

INSERT INTO usuario (login, email, senha, role) VALUES
-- senha efelantinho
('vit_dev', 'vit@gmail.com', '$2a$12$f2c.uHGHS4drfaz6HR870OLamkarD57kI.gkr4//Vbbp0vN9IrFfG', 'admin'),
('daniel_betinha', 'danielbeta42@email.com', '$2a$12$f2c.uHGHS4drfaz6HR870OLamkarD57kI.gkr4//Vbbp0vN9IrFfG', 'jogador');
