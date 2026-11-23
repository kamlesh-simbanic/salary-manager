import Database from 'better-sqlite3';
import { SCHEMA } from './schema.js';

export type Db = Database.Database;

/** Opens a SQLite DB (use ':memory:' in tests) and ensures the schema exists. */
export function createDb(path = ':memory:'): Db {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}
