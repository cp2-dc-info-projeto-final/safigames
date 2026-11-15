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
    dialogo TEXT,
    tipo TEXT NOT NULL,
    id_inimigo INTEGER,
    FOREIGN KEY (id_inimigo)
        REFERENCES inimigo (id),
    id_comerciante INTEGER,
    FOREIGN KEY (id_comerciante)
        REFERENCES comerciante (id),
    id_episodio INTEGER NOT NULL,
    FOREIGN KEY (id_episodio)
        REFERENCES episodio (id)
        ON DELETE CASCADE,

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
    id_arma INTEGER NOT NULL,
    FOREIGN KEY (id_arma)
        REFERENCES arma (id),
    id_cena INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (id_cena)
        REFERENCES cena (id)
        ON DELETE SET DEFAULT,
    id_episodio INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (id_episodio)
        REFERENCES episodio (id)
        ON DELETE SET DEFAULT,

    CONSTRAINT pk_personagem PRIMARY KEY (id)
);

DROP TABLE IF EXISTS item CASCADE;

CREATE TABLE item(
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL,
    stamina INTEGER NOT NULL,
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
        REFERENCES item (id)
        ON DELETE CASCADE,
    id_personagem INTEGER NOT NULL,
    FOREIGN KEY (id_personagem)
        REFERENCES personagem (id)
        ON DELETE CASCADE,

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
        REFERENCES comerciante (id)
        ON DELETE CASCADE,

    CONSTRAINT pk_catalogo PRIMARY KEY (id)
);

INSERT INTO usuario (login, email, senha, role) VALUES
-- senha efelantinho
('vit_dev', 'vit@gmail.com', '$2a$12$f2c.uHGHS4drfaz6HR870OLamkarD57kI.gkr4//Vbbp0vN9IrFfG', 'admin'),
('jao', 'jao@gmail.com', '$2a$12$AuHwdJEcFAggJX4Hi5DGquFShw2w7Z5a6TUqki12GprmU/9G/5ZWq', 'jogador');

INSERT INTO inimigo(nome, vida, dano, descricao, fator_xp, fator_dinheiro)
VALUES('Rato de Óculos e Barbicha', 30, 6, 'Esse rato fala, diferente de todos os outros. Além disso ele tem uma aparência um tanto quanto familiar...', 6, 12),
('Barata de Iphone', 40, 8, 'Não se deixe enganar pelo tamanho, essa barata consegue causar sérios danos (psicológicos). O fato dela ter um Iphone te deixa intrigado...', 2, 30);

INSERT INTO comerciante(nome, descricao)
VALUES('Stefany da empadinha', 'Ela vende empadas que regeneram sua vida.');

INSERT INTO episodio(titulo)
VALUES('Episódio 1: A RATIFICAÇÃO'),
('Episódio 2: A INVESTIGAÇÃO');

INSERT INTO cena(npc, dialogo, tipo, id_episodio, id_inimigo, id_comerciante)
VALUES('Narrador', 'Narrador: Você é a amizade mais confiável de Daniel, ele está desaparecido e sua missão é encontrá-lo. Há boatos que ele foi visto pela última vez entrando em um bueiro na frente do Colégio Pedro II - Campus Duque de Caxias. Você inicia sua jornada numa rede de esgotos, desconfiando se ele está lá mesmo. 

Você: (Cara... Que fedor. Não é possível que ele se enfiou aqui, mas vamo lá, eu só tenho essa pista mesmo.)

Narrador: Você vê um túnel escuro, com as paredes de tijolos caindo aos pedaços, sujos e fétidos, e um córrego onde corre um fluído de cor suspeita e odor insuportável. Você reúne toda sua coragem e amor pelo Daniel, tampa o nariz e segue em frente, até que encontra...
', 'Diálogo', 1, NULL, NULL),

('Rato de óculos e barbicha', 'Rato de óculos e barbicha: Entrosa não mano!

Você: O RATO TA FALANDO?!!?!?!

Narrador: O rato se prepara e pula em você.', 'Diálogo', 1, NULL, NULL),

('', '', 'Combate', 1, 1, NULL),

('Rato de óculos e barbicha, Narrador', 'Você: (É a primeira vez que eu luto contra um rato falante... Eu sou a primeira pessoa da minha árvore genealógica a fazer isso)

Rato de óculos e barbicha: Mano, a pessoa invade o meu espaço pessoal e ainda me bate!

Você: Foi você que avançou em mim doidão! Mas ai, na moral agora, você por acaso viu um menino branco, loiro, com cara de nerd por aí?

Rato de óculos e barbicha: Menino? Nunca vi gente aqui. Eu vou é meter minha pata, tu é um doido falando com um rato.

Narrador: O rato entra em um dos buracos na parede, perto do chão e você segue em frente pelos dutos escuros, fedidos e ecoantes.', 'Diálogo', 1, NULL, NULL),

('', 'Você: Pera aí... Eu te conheço!

Stefany: Depois de sair do Pedro II, precisei expandir meus horizontes! Pior que aqui nem tem muita clientela...

Você: Ainda tem empadinha? Lembro de ouvir dizer que eram bem safa-

Stefany: TENHO EMPADA DE TODOS OS SABORES!!!! Na verdade, são só três mesmo, e só tenho uma de cada', 'comercio', 1, NULL, 1),

('Stefany, Barata de Iphone, Narrador', 'Stefany: Foi bom te ver! Agora vou sair desse esgoto esquisito e procurar outro lugar para minhas vendas.

Você: Antes de ir, deixa eu te perguntar uma coisa, você viu o Daniel por aí?

Stefany: O namorado da Fernanda? Não vi não... Por que ele estaria aqui???

Você: Por que qualquer um estaria aqui nesse lugar fedido??? De qualquer forma, obrigado pela ajuda, e boas vendas!

Narrador: Você segue seu caminho e ouve alguém falar, mas não vê ninguém.

???: EI! AQUI EMBAIXO!

Narrador: Você olha para baixo muito confuso e vê uma barata segurando um Iphone, o que te deixa mais confuso ainda.

Barata de Iphone: QUEM É VOCÊ?? 

Você: UMA BARATA QUE FALA????? SEGURANDO UM IPHONE?? 

Narrador: Você odeia baratas. E essa em particular te irrita mais ainda. Sua voz te causa danos. Você se prepara para atacar.', 'Diálogo', 1, NULL, NULL),

('', '', 'Combate', 1, 2, NULL),

('Barata de Iphone, Narrador', 'Barata de Iphone: NÃOOOO, VOCÊ DERRUBOU MEU IPHONE!!! VOCÊ TEM NOÇÃO DE QUANTO É PRA TROCAR ESSA TELA?? MEU IPHONE COMPRA SUA CASA, POBRE!

Você: SEI! Eu sou DS!

Barata de Iphone: AH, ENTÃO POR ISSO VOCÊ TÁ NO ESGOTO NÉ? TA FAMILIARIZADO COM ESSE FUTUM, SEU NOJENTO!

Você: Eu acabei de ser chamado de nojento por uma BARATA! Inclusive, todos os animais aqui dentro falam?? Pelo amor de Deus...

Barata de Iphone: ÓBVIO NÉ! TODOS OS ANIMAIS DAQUI VIERAM PRA CÁ PORQUE- PERA, EU NÃO DEVIA TA TE FALANDO ISSO, VOCÊ É DS.

Você: (Cara, que irritante...)

Narrador: Você vai embora e deixa ela falando sozinha.

Barata de Iphone: EI, VOLTA AQUI!! MAL-EDUCADO!

Você: (Calma, como assim "óbvio"?)

FIM DO EPISÓDIO', 'Diálogo', 1, NULL, NULL),

('Narrador', 'Narrador: Você chega ao final do túnel e só há um caminho: a esquerda. Você vira e se depara com uma cena um tanto quanto peculiar...

Você: (Meu Deus, o que é isso??? Onde eu fui me meter?? O que eu faço com essa visão???)

Narrador: O que você vê é surreal, há um rato gordo, uma barata alta e uma outra barata que se parece com um rato, reunidos ao redor de uma pedra, o que parece ser um jantar em família (?)

Você: (Bizarro... Mas acho que dessa vez vou tentar pergutar antes de bater. Eles parecem pacíficos.)', 'Diálogo', 2, NULL, NULL);


INSERT INTO arma(nome, dano, descricao, stamina)
VALUES('Inteligência', 15, 'Bom, no hino do CP2 diz "O livro é nosso escudo e a arma a inteligência".', 2),
('PFV', 5, 'Única saída de quem ficou com a média baixa', 1);

INSERT INTO personagem(nome, vida, stamina, classe, id_usuario, id_cena, id_episodio, id_arma)
VALUES('Jâo, o garoto de programa', 50, 3, 'Soldado da Ciência', 1, 2, 1, 1),
('Safizigoto', 50, 3, 'Soldado da Ciência', 2, 1, 1, 1);

INSERT INTO item(nome, descricao, tipo, fator_vida, preco, stamina, fator_dano)
VALUES('Empadinha de queijo', 'Deliciosa empadinha de queijo que te dá mais vontade de viver', 'Cura', 10, 5, 2, 0),
('Empadinha de frango com requeijão', 'Deliciosa empadinha de frango com requeijão que te dá mais vontade de viver', 'Cura', 15, 5, 2, 0),
('Empadinha de leite condensado', 'Deliciosa empadinha de leite condensado que te dá MUITA vontade de viver', 'Cura', 20, 5, 2, 0),
('Refresco de 1 real do panasco', 'Suco de sabor (???) com gosto de óleo velho. Ao tocar a arma, ela se torna fatal', 'Dano', 0, 1, 1, 5);


INSERT INTO inventario(id_item, id_personagem)
VALUES(1, 1),
(4, 2);

INSERT INTO catalogo(id_item, id_comerciante)
VALUES(1, 1),
(2, 1),
(3, 1);