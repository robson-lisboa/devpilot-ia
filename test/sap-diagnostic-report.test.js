const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSapDiagnosticReport } = require('../src/utils/sapDiagnosticReport');

test('gera relatório com fatos, hipóteses e verificações separados', () => {
  const report = buildSapDiagnosticReport({
    symptom: 'IDoc não processado',
    facts: ['IDoc 000123456789 com status 51'],
    hypotheses: ['Erro de dado mestre ou configuração'],
    checks: ['Consultar mensagem de status no monitor autorizado'],
    unknowns: ['Sistema emissor não informado'],
    safeNextSteps: ['Preservar o log original e coletar horário'],
    confidence: 'baixa'
  });

  assert.match(report, /Fatos e evidências observadas/);
  assert.match(report, /Hipóteses a investigar \(não confirmadas\)/);
  assert.match(report, /Como confirmar ou descartar/);
  assert.match(report, /IDoc 000123456789/);
  assert.match(report, /baixa/);
  assert.match(report, /Não confirma causa raiz/);
});

test('usa conteúdo padrão quando faltam dados e rejeita confiança inválida', () => {
  const report = buildSapDiagnosticReport({ confidence: 'certeza' });
  assert.match(report, /Não informado/);
  assert.match(report, /Ainda não há hipótese/);
  assert.match(report, /não avaliada/);
});

test('limita campos e listas para manter relatório controlado', () => {
  const report = buildSapDiagnosticReport({
    symptom: 'x'.repeat(5000),
    facts: Array.from({ length: 20 }, (_, i) => 'Fato ' + i)
  });
  assert.ok(report.length < 10000);
  assert.match(report, /Fato 5/);
  assert.doesNotMatch(report, /Fato 6/);
  assert.doesNotMatch(report, /Fato 19/);
});
