-- Active: 1764609861484@@127.0.0.1@5432@safigames
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
    id_inimigo INTEGER,
    FOREIGN KEY (id_inimigo)
        REFERENCES inimigo (id),
    id_comerciante INTEGER,
    FOREIGN KEY (id_comerciante)
        REFERENCES comerciante (id),
    id_episodio INTEGER NOT NULL,
    FOREIGN KEY (id_episodio)
        REFERENCES episodio (id),

    CONSTRAINT pk_cena PRIMARY KEY (id)
);

DROP TABLE IF EXISTS arma CASCADE;

CREATE TABLE arma (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    dano INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    stamina INTEGER NOT NULL,

    CONSTRAINT pk_arma PRIMARY KEY (id)
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
    armadura TEXT,
    dinheiro INTEGER,
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_usuario)
        REFERENCES usuario (id),
    id_cena INTEGER NOT NULL,
    FOREIGN KEY (id_cena)
        REFERENCES cena (id),
    id_arma INTEGER NOT NULL,
    FOREIGN KEY (id_arma)
        REFERENCES arma (id),

    CONSTRAINT pk_personagem PRIMARY KEY (id)
);

DROP TABLE IF EXISTS item CASCADE;

CREATE TABLE item(
    id bigint GENERATED ALWAYS AS IDENTITY,
    descricao TEXT NOT NULL,
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

INSERT INTO usuario (login, email, senha, role) VALUES
-- senha efelantinho
('vit_dev', 'vit@gmail.com', '$2a$12$f2c.uHGHS4drfaz6HR870OLamkarD57kI.gkr4//Vbbp0vN9IrFfG', 'admin');

INSERT INTO inimigo(nome, vida, dano, descricao, fator_xp, fator_dinheiro)
VALUES('Carlinhos de LP', 670, 180, 'Gordinho bem pedofilo bem bizarro bem nooooojento', 200, 12);

INSERT INTO comerciante(nome, descricao)
VALUES('Stefany da empadinha bem safadinha', 'Ela vende empadas que regeneram sua vida (e é bem safadinha)');

INSERT INTO episodio(titulo)
VALUES('Episódio 1: A RATIFICAÇÃO');

INSERT INTO cena(npc, dialogo, tipo, id_episodio)
VALUES('Vini do soep', 'Vini: OI! Você: Oi! Como vai? Vini: Vou bem.', 'Diálogo', 1);

INSERT INTO personagem(nome, vida, stamina, classe, arma, id_usuario, id_cena)
VALUES('Jâo, o garoto de programa', 90, 3, 'Mago', 'Cajado', 1, 1);

INSERT INTO item(descricao, tipo, fator_vida, preco)
VALUES('Deliciosa empadinha de queijo que te dá mais vontade de viver', 'Cura', 50, 5);

INSERT INTO inventario(id_item, id_personagem)
VALUES(1, 1);

INSERT INTO catalogo(id_item, id_comerciante)
VALUES(1, 1);

