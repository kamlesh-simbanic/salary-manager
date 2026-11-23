import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildApp } from './app.js';
import { createDb } from './db/index.js';

const dbPath = process.env.DB_PATH ?? 'data/salary.db';
mkdirSync(dirname(dbPath), { recursive: true });

const app = buildApp(createDb(dbPath));
app.log.level = 'info';
await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
