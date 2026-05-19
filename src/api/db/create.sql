
DROP TABLE IF EXISTS usuario CASCADE;

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

DROP TABLE IF EXISTS inimigo CASCADE;

CREATE TABLE inimigo (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    vida INTEGER NOT NULL,
    defesa INTEGER,
    dano INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    fator_xp INTEGER NOT NULL,
    fator_dinheiro INTEGER NOT NULL,

    CONSTRAINT pk_inimigo PRIMARY KEY (id)
);

DROP TABLE IF EXISTS comerciante CASCADE; 
CREATE TABLE comerciante (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,

    CONSTRAINT pk_comerciante PRIMARY KEY (id)
);

DROP TABLE IF EXISTS episodio CASCADE;

CREATE TABLE episodio(
    id bigint GENERATED ALWAYS AS IDENTITY,
    titulo TEXT NOT NULL,

    CONSTRAINT pk_episodio PRIMARY KEY (id)
);


DROP TABLE IF EXISTS cena CASCADE;

CREATE TABLE cena (
    id bigint GENERATED ALWAYS AS IDENTITY,
    npc TEXT,
    dialogo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    id_inimigo INTEGER NOT NULL,
    FOREIGN KEY (id_inimigo)
        REFERENCES inimigo (id),
    id_comerciante INTEGER NOT NULL,
    FOREIGN KEY (id_comerciante)
        REFERENCES comerciante (id),
    id_episodio INTEGER NOT NULL,
    FOREIGN KEY (id_episodio)
        REFERENCES episodio (id),

    CONSTRAINT pk_cena PRIMARY KEY (id)
);

DROP TABLE IF EXISTS personagem CASCADE;

CREATE TABLE personagem (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome text NOT NULL,
    vida INTEGER NOT NULL,
    defesa INTEGER,
    xp INTEGER,
    stamina INTEGER NOT NULL,
    classe TEXT NOT NULL,
    arma TEXT NOT NULL,
    armadura TEXT,
    dinheiro INTEGER,
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_usuario)
        REFERENCES usuario (id),
    id_cena INTEGER NOT NULL,
    FOREIGN KEY (id_cena)
        REFERENCES cena (id),

    CONSTRAINT pk_personagem PRIMARY KEY (id)
);

DROP TABLE IF EXISTS item CASCADE;

CREATE TABLE item(
    id bigint GENERATED ALWAYS AS IDENTITY,
    desricao TEXT NOT NULL,
    tipo TEXT NOT NULL,
    fator_vida INTEGER,
    fator_dano INTEGER,
    fator_defesa INTEGER,
    preco INTEGER,

    CONSTRAINT pk_item PRIMARY KEY (id)
);

DROP TABLE IF EXISTS inventario CASCADE;

CREATE TABLE inventario(
    id bigint GENERATED ALWAYS AS IDENTITY,
    id_item INTEGER NOT NULL,
    FOREIGN KEY (id_item)
        REFERENCES item (id),
    id_personagem INTEGER NOT NULL,
    FOREIGN KEY (id_personagem)
        REFERENCES personagem (id),

    CONSTRAINT pk_inventario PRIMARY KEY (id)
);

DROP TABLE IF EXISTS catalogo CASCADE;

CREATE TABLE catalogo(
    id bigint GENERATED ALWAYS AS IDENTITY,
    id_item INTEGER NOT NULL,
    FOREIGN KEY (id_item)
        REFERENCES item (id),
    id_comerciante INTEGER NOT NULL,
    FOREIGN KEY (id_comerciante)
        REFERENCES comerciante (id),

    CONSTRAINT pk_catalogo PRIMARY KEY (id)
);
