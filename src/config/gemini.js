require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

if (!process.env.GEMINI_API_KEY) {
  console.error('ERRO: GEMINI_API_KEY não foi encontrada no arquivo .env!');
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

module.exports = ai;