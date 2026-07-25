const express = require('express');
const router = express.Router();
const { 
  generateResponse, 
  getHistory, 
  clearHistory 
} = require('../controllers/aiController');

// Mapeia para /api/ai/generate
router.post('/generate', generateResponse);

// Mapeia para /api/ai/history/:sessionId (Busca o histórico da sessão)
router.get('/history/:sessionId', getHistory);

// Mapeia para /api/ai/history/:sessionId (Apaga o histórico da sessão)
router.delete('/history/:sessionId', clearHistory);

module.exports = router;