const winston = require('winston');

// Configuração do Winston para formatar os logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // Exibe logs coloridos no console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level}]: ${message}`;
        })
      )
    }),
    // Salva erros em um arquivo físico separado
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Salva todos os logs gerais
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});

module.exports = logger;