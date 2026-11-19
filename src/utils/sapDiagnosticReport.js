const MAX_FIELD_CHARS = 1200;
const MAX_LIST_ITEMS = 6;

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, MAX_FIELD_CHARS);
}

function cleanList(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_LIST_ITEMS).map(cleanText).filter(Boolean);
}

function buildSapDiagnosticReport(input = {}) {
  const symptom = cleanText(input.symptom);
  const facts = cleanList(input.facts);
  const hypotheses = cleanList(input.hypotheses);
  const checks = cleanList(input.checks);
  const safeNextSteps = cleanList(input.safeNextSteps);
  const unknowns = cleanList(input.unknowns);
  const confidence = ['baixa', 'moderada', 'alta'].includes(input.confidence)
    ? input.confidence
    : 'não avaliada';

  return [
    '# Relatório preliminar de diagnóstico SAP',
    '',
    '## Sintoma informado',
    symptom || 'Não informado.',
    '',
    '## Fatos e evidências observadas',
    ...(facts.length ? facts.map(item => '- ' + item) : ['- Nenhuma evidência estruturada informada.']),
    '',
    '## Hipóteses a investigar (não confirmadas)',
    ...(hypotheses.length ? hypotheses.map((item, index) => (index + 1) + '. ' + item) : ['- Ainda não há hipótese sustentada pelas evidências disponíveis.']),
    '',
    '## Como confirmar ou descartar',
    ...(checks.length ? checks.map(item => '- ' + item) : ['- Obter mensagem completa, horário, sistema/componente e etapa do processo.']),
    '',
    '## Informações que ainda faltam',
    ...(unknowns.length ? unknowns.map(item => '- ' + item) : ['- Nenhuma lacuna adicional foi especificada.']),
    '',
    '## Próximos passos seguros',
    ...(safeNextSteps.length ? safeNextSteps.map(item => '- ' + item) : ['- Consultar os registros e monitores autorizados antes de qualquer alteração.']),
    '',
    '## Nível de confiança',
    confidence,
    '',
    '> Este relatório organiza informações fornecidas. Não confirma causa raiz nem autoriza mudanças em produção. Validar no ambiente SAP e seguir os procedimentos internos.'
  ].join('\n');
}

module.exports = { buildSapDiagnosticReport };
