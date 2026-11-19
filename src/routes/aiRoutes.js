const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  generateResponse,
  getHistory,
  clearHistory
} = require('../controllers/aiController');

const allowedExtensions = new Set([
  '.pdf', '.txt', '.csv', '.json', '.py', '.js', '.html', '.css', '.md'
]);

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (!allowedExtensions.has(extension)) {
      return callback(new Error('Formato não permitido. Envie PDF, TXT, CSV, JSON, PY, JS, HTML, CSS ou MD.'));
    }
    callback(null, true);
  }
});

function handleSingleUpload(req, res, next) {
  upload.single('pdf')(req, res, error => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, error: 'O arquivo ultrapassa o limite de 10 MB.' });
    }
    return res.status(400).json({
      success: false,
      error: error.message || 'Não foi possível receber o arquivo.'
    });
  });
}

router.post('/generate', handleSingleUpload, generateResponse);
router.get('/history/:sessionId', getHistory);
router.delete('/history/:sessionId', clearHistory);

module.exports = router;
