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

router.post('/personagem', verifyToken, async function(req, res) {
  try {
    const { nome, classe, id_user } = req.body;
    let personagem = {};

    // Validação básica
    if (!nome || !classe) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' });
      if (!classe) errors.push({ field: 'classe', message: 'Classe é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Nome e classe são obrigatórios', errors);
    };

    if (classe == 'guerreiro'){
     personagem = { nome, vida : 80, defesa : 20, xp, stamina : 3, armadura : 'Armadura de Netherite', dinheiro : 1, id_arma, id_cena : 1, id_user: {id_user}}
    }
    else if (classe == 'assassino'){
      personagem = { nome, vida : 70, defesa, xp, stamina : 6, armadura, dinheiro : 42, id_arma, id_cena : 1, id_user : {id_user}}
    }
    const result = await pool.query(
      'INSERT INTO personagem (nome, vida, defesa, xp, stamina, armadura, dinheiro, id_arma, id_cena, id_usuario) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING nome, vida, defesa, xp, stamina, armadura, dinheiro, id_arma, id_cena',
      [personagem.nome, personagem.vida, personagem.defesa, personagem.xp, personagem.stamina, personagem.armadura, personagem.dinheiro, personagem.id_arma, personagem.id_cena, personagem.id_user]
    );
    return sendSuccess(res, 201, 'Personagem criado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;