import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import type { Db } from './db/index.js';
import { registerEmployeeRoutes } from './employees/employee.routes.js';
import { EmployeeService } from './employees/employee.service.js';
import { SqliteEmployeeRepository } from './employees/sqlite-employee.repository.js';
import { registerInsightsRoutes } from './insights/insights.routes.js';
import { InsightsService } from './insights/insights.service.js';
import { SqliteInsightsRepository } from './insights/sqlite-insights.repository.js';
import { SqliteSalaryHistoryRepository } from './history/sqlite-salary-history.repository.js';
import { AppError } from './shared/errors.js';
import { SqliteTransactionRunner } from './shared/transaction.js';

/** Composition root: the only place that knows which concrete classes are wired together. */
export function buildApp(db: Db): FastifyInstance {
  const app = Fastify();
  void app.register(cors);

  const employees = new SqliteEmployeeRepository(db);
  const history = new SqliteSalaryHistoryRepository(db);
  const service = new EmployeeService(employees, employees, history, new SqliteTransactionRunner(db));

  const insights = new InsightsService(new SqliteInsightsRepository(db));

  app.get('/api/health', async () => ({ status: 'ok' }));
  registerEmployeeRoutes(app, service);
  registerInsightsRoutes(app, insights);

  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    if (error instanceof AppError) return reply.code(error.statusCode).send({ error: error.message });
    app.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  });

  return app;
}
