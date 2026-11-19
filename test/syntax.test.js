const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const filesToCheck = [
  'index.js',
  'src/controllers/aiController.js',
  'src/routes/aiRoutes.js',
  'src/public/script.js'
];

for (const relativePath of filesToCheck) {
  test(`sintaxe JavaScript: ${relativePath}`, () => {
    const filePath = path.join(projectRoot, relativePath);
    const result = spawnSync(process.execPath, ['--check', filePath], {
      encoding: 'utf8'
    });

    assert.equal(
      result.status,
      0,
      result.stderr || result.stdout || `Falha ao validar ${relativePath}`
    );
  });
}
