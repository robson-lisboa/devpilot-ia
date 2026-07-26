require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const aiRoutes = require('./src/routes/aiRoutes');

// --- 🛡️ BLINDAGEM GLOBAL DO SERVIDOR (Impede quedas por exceções inesperadas) ---
process.on('uncaughtException', (error) => {
  console.error('🔥 ERRO CRÍTICO NÃO TRATADO (O servidor continuará rodando):', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 PROMESSA REJEITADA NÃO TRATADA:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Libera acesso para a aplicação Web (Front-end)
app.use(cors());

// 2. Proteção contra excesso de requisições (Rate Limit)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 requisições por minuto
  message: {
    success: false,
    error: 'Muitas requisições criadas. Por favor, aguarde um minuto e tente novamente.'
  }
});
app.use('/api', limiter);

// 3. Middlewares com limite ampliado para suportar histórico extenso e anexos de arquivos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve o HTML/CSS/JS da pasta public (ajustado com path.join para segurança de diretório)
app.use(express.static(path.join(__dirname, 'src/public')));

// 4. Rotas de API
app.use('/api/ai', aiRoutes);

// 5. Rota de saúde/status da API (inclui /health e /ping para compatibilidade total com o UptimeRobot)
app.get(['/health', '/ping'], (req, res) => {
  res.json({ status: 'OK', message: '🤖 Servidor DevPilot IA operando normalmente!' });
});

// 6. Middleware Global de Erros do Express (Captura falhas em rotas e mantém o app ativo)
app.use((err, req, res, next) => {
  console.error('❌ Erro capturado pelo middleware do Express:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Ocorreu um erro interno no servidor, mas a aplicação continua ativa.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando no endereço: http://localhost:${PORT}`);
});