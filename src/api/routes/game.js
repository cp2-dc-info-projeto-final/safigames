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

router.get('/personagem', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM personagem WHERE id_usuario = $1 ORDER BY id', [req.user?.id]);
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

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

router.get('/personagemsemid', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM personagem');
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
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
    console.log(id, nome);
    
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

module.exports = router;