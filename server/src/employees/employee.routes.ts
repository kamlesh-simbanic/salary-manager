import type { FastifyInstance } from 'fastify';
import type { EmployeeService } from './employee.service.js';
import { idParamSchema, listQuerySchema, newEmployeeSchema, updateEmployeeSchema } from './employee.schema.js';

/** Thin HTTP adapter: parse -> call service -> return. No business rules here. */
export function registerEmployeeRoutes(app: FastifyInstance, service: EmployeeService): void {
  app.get('/api/employees', async (req) => service.list(listQuerySchema.parse(req.query)));

  // Registered as a static path; Fastify prefers it over the parametric /:id route.
  app.get('/api/employees/facets', async () => service.facets());

  app.post('/api/employees', async (req, reply) => {
    const employee = service.create(newEmployeeSchema.parse(req.body));
    return reply.code(201).send(employee);
  });

  app.get('/api/employees/:id', async (req) => service.get(idParamSchema.parse(req.params).id));

  app.patch('/api/employees/:id', async (req) => {
    const { id } = idParamSchema.parse(req.params);
    const { reason, ...changes } = updateEmployeeSchema.parse(req.body);
    return service.update(id, changes, reason);
  });

  app.delete('/api/employees/:id', async (req, reply) => {
    service.remove(idParamSchema.parse(req.params).id);
    return reply.code(204).send();
  });

  app.get('/api/employees/:id/salary-history', async (req) =>
    service.salaryHistory(idParamSchema.parse(req.params).id),
  );
}
