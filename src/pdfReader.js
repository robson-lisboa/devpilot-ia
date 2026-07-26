const fs = require('fs');
const pdf = require('pdf-parse');

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text.trim();
  } catch (error) {
    console.error("Erro ao ler o arquivo PDF:", error);
    throw new Error("Não foi possível processar o PDF.");
  }
}

module.exports = { extractTextFromPDF };