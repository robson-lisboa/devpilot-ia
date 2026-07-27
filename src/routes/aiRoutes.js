const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  generateResponse, 
  getHistory, 
  clearHistory 
} = require('../controllers/aiController');

// Configuração do Multer para salvar temporariamente o arquivo na pasta uploads/
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

// Mapeia para /api/ai/generate com suporte ao upload do arquivo PDF ('pdf')
router.post('/generate', upload.single('pdf'), generateResponse);

// Mapeia para /api/ai/history/:sessionId (Busca o histórico da sessão)
router.get('/history/:sessionId', getHistory);

// Mapeia para /api/ai/history/:sessionId (Apaga o histórico da sessão)
router.delete('/history/:sessionId', clearHistory);

module.exports = router;