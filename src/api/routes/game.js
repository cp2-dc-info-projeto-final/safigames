var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

function sendSuccess(res, status, message, data) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (typeof data !== 'undefined') payload.data = data;
  return res.status(status).json(payload);
}

function sendError(res, status, message, errors = []) {
  return res.status(status).json({
    success: false,
    message,
    errors
  });
}

// Busca personagem pelo id do usuario
router.get('/personagem', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM personagem WHERE id_usuario = $1 ORDER BY id', [req.user?.id]);
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// Busca personagens por id
router.get('/personagem/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM personagem WHERE id = $1 ORDER BY id', [id]);
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// Busca todos os personagens
router.get('/personagemsemid', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM personagem');
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.post('/personagem', verifyToken, async function(req, res) {
  try {
    const { nome, classe } = req.body;
    const id_user  = req.user?.id;
    let personagem = {};

    // Validação básica
    if (!nome || !classe) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' });
      if (!classe) errors.push({ field: 'classe', message: 'Classe é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Nome e classe são obrigatórios', errors);
    };

    if (classe == 'Guerreiro'){
     personagem = { nome, vida : 80, defesa : 20, xp : 0, stamina : 3, classe, armadura : 'Armadura de Netherite', dinheiro : 1, id_arma : 1, id_cena : 1, id_user}
    }
    else if (classe == 'Assassino'){
      personagem = { nome, vida : 70, defesa : 0, xp : 0, stamina : 5, classe, armadura : 'Sem armadura', dinheiro : 42, id_arma : 2, id_cena : 1, id_user}
    }
    const result = await pool.query(
      'INSERT INTO personagem (nome, vida, defesa, xp, stamina, classe, armadura, dinheiro, id_arma, id_cena, id_usuario) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING nome, vida, defesa, xp, stamina, classe, armadura, dinheiro, id_arma, id_cena',
      [personagem.nome, personagem.vida, personagem.defesa, personagem.xp, personagem.stamina, personagem.classe, personagem.armadura, personagem.dinheiro, personagem.id_arma, personagem.id_cena, personagem.id_user]
    );
    return sendSuccess(res, 201, 'Personagem criado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* DELETE - Remover personagem */
router.delete('/personagem/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const personagemExists = await pool.query('SELECT id FROM personagem WHERE id = $1', [id]);
    if (personagemExists.rows.length === 0) {
      return sendError(res, 404, 'Personagem não encontrado');
    }
    
    await pool.query('DELETE FROM personagem WHERE id = $1', [id]);
    
    return sendSuccess(res, 200, 'Personagem deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar personagem:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* PUT - Editar nome do personagem */
router.put('/personagem/:id', verifyToken, async function(req, res) {
  try {
    const { id }  = req.params;
    const { nome }  = req.body;
    
    // Validação básica
    if (!nome) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Nome é obrigatório', errors);
    }
    
    // Verificar se o personagem existe
    const personagemExists = await pool.query('SELECT id FROM personagem WHERE id = $1', [id]);
    if (personagemExists.rows.length === 0) {
      return sendError(res, 404, 'Personagem não encontrado');
    }
    let query, params;
    query = 'UPDATE personagem SET nome = $1 WHERE id = $2 RETURNING id, nome';
    params = [nome, id];
    
    
    const result = await pool.query(query, params);
    
    return sendSuccess(res, 200, 'Nome editado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao editar nome:', error);
    // Verificar se é erro de constraint
    if (error.code === '23514') {
      return sendError(res, 400, 'Dados inválidos. Verifique os campos e tente novamente.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.post('/episodio', verifyToken, async function(req, res) {
  try {
    const { titulo } = req.body;

    // Validação básica
    if (!titulo) {
      const errors = [];
      if (!titulo) errors.push({ field: 'titulo', message: 'Título é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Título é obrigatório', errors);
    };

    const result = await pool.query(
      'INSERT INTO episodio (titulo) VALUES ($1) RETURNING titulo',
      [titulo]
    );
    return sendSuccess(res, 201, 'Episódio criado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar episódio:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* Busca todos os episodios */
router.get('/episodio', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM episodio');
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar episodios:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* DELETE - Remover episodio */
router.delete('/episodio/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;

    if (id == 1){
      return sendError(res, 400, 'Não é possível deletar o episódio inicial');
    }

    // Verificar se o episódio existe
    const episodioExists = await pool.query('SELECT id FROM episodio WHERE id = $1', [id]);
    if (episodioExists.rows.length === 0) {
      return sendError(res, 404, 'Episódio não encontrado');
    }
    
    await pool.query('DELETE FROM episodio WHERE id = $1', [id]);
    
    return sendSuccess(res, 200, 'Episódio deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar episodio:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }

});

/* PUT - Editar título do episódio*/
router.put('/episodio/:id', verifyToken, async function(req, res) {
  try {
    const { id }  = req.params;
    const { titulo }  = req.body;
    
    // Validação básica
    if (!titulo) {
      const errors = [];
      if (!titulo) errors.push({ field: 'titulo', message: 'Título é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Título é obrigatório', errors);
    }
    
    // Verificar se o episodio existe
    const episodioExists = await pool.query('SELECT id FROM episodio WHERE id = $1', [id]);
    if (episodioExists.rows.length === 0) {
      return sendError(res, 404, 'Episódio não encontrado');
    }
    let query, params;
    query = 'UPDATE episodio SET titulo = $1 WHERE id = $2 RETURNING id, titulo';
    params = [titulo, id];
    
    
    const result = await pool.query(query, params);
    
    return sendSuccess(res, 200, 'Título editado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao editar título:', error);
    // Verificar se é erro de constraint
    if (error.code === '23514') {
      return sendError(res, 400, 'Dados inválidos. Verifique os campos e tente novamente.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// *GET busca todos os comerciantes
router.get('/comerciante', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM comerciante');
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar comerciantes:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// *POST criar comerciante
router.post('/comerciante', verifyToken, async function(req, res) {
  try {
    const { nome, descricao } = req.body;

    // Validação básica
    if (!nome || !descricao ) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' });
      if (!descricao) errors.push({ field: 'descricao', message: 'Descrição é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Nome e descrição são obrigatórios', errors);
    };

    const result = await pool.query(
      'INSERT INTO comerciante (nome, descricao) VALUES ($1, $2) RETURNING nome, descricao',
      [nome, descricao]
    );
    return sendSuccess(res, 201, 'Comerciante criado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar comerciante:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// *DELETE excluir comerciante
router.delete('/comerciante/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;

    // Verificar se o comerciante existe
    const comercianteExists = await pool.query('SELECT id FROM comerciante WHERE id = $1', [id]);
    if (comercianteExists.rows.length === 0) {
      return sendError(res, 404, 'Comerciante não encontrado');
    }
    
    await pool.query('DELETE FROM comerciante WHERE id = $1', [id]);
    
    return sendSuccess(res, 200, 'Comerciante deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar comerciante:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// *PUT editar comerciante
router.put('/comerciante/:id', verifyToken, async function(req, res) {
  try {
    const { id }  = req.params;
    const { nome, descricao }  = req.body;
    
    // Validação básica
    if (!nome || !descricao) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' });
      if (!descricao) errors.push({ field: 'descricao', message: 'Descrição é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Nome e descrição são obrigatórios', errors);
    }
    
    // Verificar se o comerciante existe
    const comercianteExists = await pool.query('SELECT id FROM comerciante WHERE id = $1', [id]);
    if (comercianteExists.rows.length === 0) {
      return sendError(res, 404, 'Comerciante não encontrado');
    }
    let query, params;
    query = 'UPDATE comerciante SET nome = $1, descricao = $2 WHERE id = $3 RETURNING id, nome, descricao';
    params = [nome, descricao, id];
    
    const result = await pool.query(query, params);
    
    return sendSuccess(res, 200, 'Nome e descrição editados com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao editar nome e descrição:', error);
    // Verificar se é erro de constraint
    if (error.code === '23514') {
      return sendError(res, 400, 'Dados inválidos. Verifique os campos e tente novamente.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// *GET busca todos os itens
router.get('/item', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM item');
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// *POST criar item
router.post('/item', verifyToken, async function(req, res) {
  try {
    const { nome, descricao, tipo, fator_vida, fator_dano, fator_defesa, preco } = req.body;

    // Validação básica
    if (!nome || !descricao || !tipo && !fator_vida && !fator_dano && !fator_defesa) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' });
      if (!descricao) errors.push({ field: 'descricao', message: 'Descrição é obrigatório', code: 'REQUIRED' });
      if (!tipo) errors.push({ field: 'descricao', message: 'Tipo é obrigatório', code: 'REQUIRED' });
      if (!fator_vida) errors.push({ field: 'descricao', message: 'Fator de vida é obrigatório', code: 'REQUIRED' });
      if (!fator_dano) errors.push({ field: 'descricao', message: 'Fator de dano é obrigatório', code: 'REQUIRED' });
      if (!fator_defesa) errors.push({ field: 'descricao', message: 'Fator de defesa é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Nome, descrição, tipo e pelo menos um dos fatores são obrigatórios', errors);
    };

    const result = await pool.query(
      'INSERT INTO item (nome, descricao, tipo, fator_vida, fator_dano, fator_defesa, preco) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING nome, descricao, tipo, fator_vida, fator_dano, fator_defesa, preco',
      [nome, descricao, tipo, fator_vida, fator_dano, fator_defesa, preco]
    );
    return sendSuccess(res, 201, 'Item criado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar item:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// *DELETE excluir item
router.delete('/item/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;

    // Verificar se o item existe
    const itemExists = await pool.query('SELECT id FROM item WHERE id = $1', [id]);
    if (itemExists.rows.length === 0) {
      return sendError(res, 404, 'Item não encontrado');
    }
    
    await pool.query('DELETE FROM item WHERE id = $1', [id]);
    
    return sendSuccess(res, 200, 'Item deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// *PUT editar item
router.put('/item/:id', verifyToken, async function(req, res) {
  try {
    const { id }  = req.params;
    const { nome, descricao, tipo, fator_vida, fator_dano, fator_defesa, preco } = req.body;

    // Validação básica
    if (!nome || !descricao || !tipo && !fator_vida && !fator_dano && !fator_defesa || !preco) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' });
      if (!descricao) errors.push({ field: 'descricao', message: 'Descrição é obrigatório', code: 'REQUIRED' });
      if (!tipo) errors.push({ field: 'tipo', message: 'Tipo é obrigatório', code: 'REQUIRED' });
      if (!fator_vida) errors.push({ field: 'fator_vida', message: 'Fator de vida é obrigatório', code: 'REQUIRED' });
      if (!fator_dano) errors.push({ field: 'fator_dano', message: 'Fator de dano é obrigatório', code: 'REQUIRED' });
      if (!fator_defesa) errors.push({ field: 'fator_defesa', message: 'Fator de defesa é obrigatório', code: 'REQUIRED' });
      if (!preco) errors.push({ field: 'preco', message: 'Preço é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Nome, descrição, tipo, preço e pelo menos um dos fatores são obrigatórios', errors);
    };

    // Verificar se o item existe
    const itemExists = await pool.query('SELECT id FROM item WHERE id = $1', [id]);
    if (itemExists.rows.length === 0) {
      return sendError(res, 404, 'Comerciante não encontrado');
    }
    const result = await pool.query(
      'UPDATE item SET nome = $1, descricao = $2, tipo = $3, fator_vida = $4, fator_dano = $5, fator_defesa = $6, preco = $7 WHERE id = $8 RETURNING nome, descricao, tipo, fator_vida, fator_dano, fator_defesa, preco',
      [nome, descricao, tipo, fator_vida, fator_dano, fator_defesa, preco, id]
    );
    return sendSuccess(res, 201, 'Item editado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao editar item:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// Unificar CRUD de episodio com cena e for para dar insert em cenas
// Unificar CRUD de comerciante e catálogo na mesma tela com select


module.exports = router;