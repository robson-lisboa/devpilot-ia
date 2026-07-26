require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const aiRoutes = require('./src/routes/aiRoutes');

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

// Serve o HTML/CSS/JS da pasta public
app.use(express.static('src/public'));

// 4. Rotas de API
app.use('/api/ai', aiRoutes);

// 5. Rota de saúde/status da API
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '🤖 Servidor DevPilot IA operando normalmente!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando no endereço: http://localhost:${PORT}`);
});