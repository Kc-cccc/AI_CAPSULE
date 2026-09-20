import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

function prepareDirectory(filename) {
  if (filename === ':memory:') return;
  fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
}

function toIntegerFlag(value) {
  return value === true || value === 1 || value === '1' ? 1 : 0;
}

function normaliseRow(row) {
  if (!row) return null;
  return {
    ...row,
    reviewed: Boolean(row.reviewed),
    improved: Boolean(row.improved)
  };
}

export function createDatabase(filename) {
  prepareDirectory(filename);
  const db = new DatabaseSync(filename);

  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS capsules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      prompt_title TEXT NOT NULL,
      prompt_version TEXT,
      prompt_text TEXT NOT NULL,
      response_summary TEXT,
      category TEXT,
      usefulness TEXT,
      reviewed INTEGER NOT NULL DEFAULT 0 CHECK (reviewed IN (0, 1)),
      improved INTEGER NOT NULL DEFAULT 0 CHECK (improved IN (0, 1)),
      screenshot_url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_capsules_user_created
      ON capsules(user_id, created_at DESC);

    PRAGMA optimize;
  `);

  const statements = {
    list: db.prepare(`
      SELECT * FROM capsules
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC, id DESC
    `),
    get: db.prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?'),
    create: db.prepare(`
      INSERT INTO capsules (
        user_id, project_name, prompt_title, prompt_version, prompt_text,
        response_summary, category, usefulness, reviewed, improved,
        screenshot_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    update: db.prepare(`
      UPDATE capsules SET
        project_name = ?, prompt_title = ?, prompt_version = ?, prompt_text = ?,
        response_summary = ?, category = ?, usefulness = ?, reviewed = ?,
        improved = ?, screenshot_url = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `),
    remove: db.prepare('DELETE FROM capsules WHERE id = ? AND user_id = ?')
  };

  return {
    list(userId) {
      return statements.list.all(userId).map(normaliseRow);
    },
    get(id, userId) {
      return normaliseRow(statements.get.get(id, userId));
    },
    create(userId, capsule) {
      const result = statements.create.run(
        userId,
        capsule.project_name,
        capsule.prompt_title,
        capsule.prompt_version,
        capsule.prompt_text,
        capsule.response_summary,
        capsule.category,
        capsule.usefulness,
        toIntegerFlag(capsule.reviewed),
        toIntegerFlag(capsule.improved),
        capsule.screenshot_url,
        capsule.notes
      );
      return this.get(Number(result.lastInsertRowid), userId);
    },
    update(id, userId, capsule) {
      const result = statements.update.run(
        capsule.project_name,
        capsule.prompt_title,
        capsule.prompt_version,
        capsule.prompt_text,
        capsule.response_summary,
        capsule.category,
        capsule.usefulness,
        toIntegerFlag(capsule.reviewed),
        toIntegerFlag(capsule.improved),
        capsule.screenshot_url,
        capsule.notes,
        id,
        userId
      );
      return Number(result.changes) === 0 ? null : this.get(id, userId);
    },
    remove(id, userId) {
      return Number(statements.remove.run(id, userId).changes) > 0;
    },
    close() {
      db.close();
    }
  };
}
