const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeSapEvidence, formatSapEvidenceContext } = require('../src/utils/sapEvidence');

test('extrai evidências de erro e identificadores de IDoc sem afirmar causa raiz', () => {
  const result = analyzeSapEvidence([
    '2026-11-19 10:22:31 ERROR IDoc 000000123456 status: 51',
    'Falha na integração - M7 021',
    'Processamento interrompido por timeout'
  ].join('\n'));

  assert.deepEqual(result.timestamps, ['2026-11-19 10:22:31']);
  assert.deepEqual(result.severities, ['ERROR']);
  assert.ok(result.idocs.includes('000000123456'));
  assert.ok(result.idocs.includes('status 51'));
  assert.ok(result.messageCodes.includes('M7 021'));
  assert.equal(result.evidenceLines.length, 3);
});

test('ignora entrada vazia e limita tamanho e quantidade de linhas', () => {
  const empty = analyzeSapEvidence('  ');
  assert.equal(empty.analyzed, false);

  const huge = analyzeSapEvidence(('linha sem sinal\n').repeat(600) + 'ERROR falha');
  assert.equal(huge.lineCount, 500);
  assert.equal(huge.truncated, true);
});

test('não inventa resumo quando não encontra sinais relevantes', () => {
  assert.equal(formatSapEvidenceContext('texto comum sem erro'), '');
});

test('formata o resumo como extração heurística', () => {
  const summary = formatSapEvidenceContext('ERROR: falha ao processar IDoc 12345678 status: 51');
  assert.match(summary, /EXTRAÇÃO HEURÍSTICA/);
  assert.match(summary, /12345678/);
  assert.match(summary, /status 51/);
});
