import sqlite3 from 'sqlite3';
import { faker } from '@faker-js/faker';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

export async function init() {
  await new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL
    )`, (err) => (err ? reject(err) : resolve()));
  });

  const row = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as c FROM users', (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
  if (row.c === 0) {
    const roles = ['user', 'admin', 'editor'];
    const rows = Array.from({ length: 50 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      role: roles[Math.floor(Math.random() * roles.length)]
    }));
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)');
        for (const r of rows) {
          stmt.run(r.name, r.email, r.role);
        }
        stmt.finalize((err) => (err ? reject(err) : resolve()));
      });
    });
    console.log('🧪 BDD vide → génération de 50 utilisateurs aléatoires…');
    console.log('✅ Génération terminée !');
  }
}

export async function getUsers(limit = 20, offset = 0) {
  const rows = await new Promise((resolve, reject) => {
    db.all('SELECT id, name, email, role FROM users ORDER BY id LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
  const countRow = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as c FROM users', (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
  return { rows, total: countRow.c };
}

export async function getUserById(id) {
  const user = await new Promise((resolve, reject) => {
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
  return user;
}

// Initialisation immédiate (async/await non permis en toplvl ici, donc old-style promise)
init().catch(console.error);
