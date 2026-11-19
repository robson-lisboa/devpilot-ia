const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { retrieveSapKnowledge, normalize } = require('../src/utils/sapKnowledge');

test('normaliza acentos e pontuação para busca', () => {
  assert.equal(normalize('Produção: movimentação!'), 'producao movimentacao');
});

test('prioriza documentos SAP relacionados à pergunta', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devpilot-sap-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'mm-estoque.md'), 'MIGO movimentação de estoque 311 e 101.');
  fs.writeFileSync(path.join(dir, 'pp-ordens.md'), 'CO01 ordem de produção e confirmação.');
  const result = retrieveSapKnowledge('Como verificar movimentação MIGO de estoque?', {
    knowledgeDir: dir, maxDocs: 2, maxChars: 3000, maxDocChars: 1000
  });
  assert.match(result, /mm-estoque\.md/);
  assert.doesNotMatch(result, /pp-ordens\.md/);
});

test('limita o tamanho do contexto recuperado', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devpilot-sap-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'sap-mm.md'), 'MIGO estoque '.repeat(500));
  const result = retrieveSapKnowledge('MIGO estoque', {
    knowledgeDir: dir, maxDocs: 1, maxChars: 180, maxDocChars: 150
  });
  assert.ok(result.length <= 350);
});

test('retorna vazio quando não há correspondência ou diretório', () => {
  assert.equal(retrieveSapKnowledge('zzzz desconhecido', { knowledgeDir: '/caminho/inexistente' }), '');
});
