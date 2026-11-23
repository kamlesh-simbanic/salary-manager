import type { Db } from '../db/index.js';

/**
 * Unit of Work abstraction: services group several repository calls into one
 * atomic step without knowing which database is underneath.
 */
export interface TransactionRunner {
  run<T>(work: () => T): T;
}

export class SqliteTransactionRunner implements TransactionRunner {
  constructor(private readonly db: Db) {}

  run<T>(work: () => T): T {
    return this.db.transaction(work)();
  }
}
