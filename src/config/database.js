const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, '../../database.sqlite'),
      driver: sqlite3.Database
    });

    // 1. Cria a tabela caso ela não exista
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        guest_id TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Garante que a coluna guest_id exista em bancos antigos (migração automática segura)
    try {
      await dbInstance.exec(`ALTER TABLE messages ADD COLUMN guest_id TEXT`);
    } catch (e) {
      // A coluna já existe, ignora o erro e segue o fluxo
    }
  }
  return dbInstance;
}

module.exports = getDb;