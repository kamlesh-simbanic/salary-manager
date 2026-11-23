import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createDb } from '../db/index.js';
import { seedDatabase } from './seed.js';

const dbPath = process.env.DB_PATH ?? 'data/salary.db';
mkdirSync(dirname(dbPath), { recursive: true });

const db = createDb(dbPath);
const start = performance.now();
seedDatabase(db, Number(process.env.SEED_COUNT ?? 10_000));
const { n } = db.prepare('SELECT COUNT(*) AS n FROM employees').get() as { n: number };
console.log(`Seeded ${n} employees into ${dbPath} in ${Math.round(performance.now() - start)} ms`);
