import type { FastifyInstance } from 'fastify';
import {
  dimensionParamSchema,
  distributionQuerySchema,
  earnersQuerySchema,
  insightsFilterSchema,
} from './insights.schema.js';
import type { InsightsService } from './insights.service.js';

export function registerInsightsRoutes(app: FastifyInstance, service: InsightsService): void {
  app.get('/api/insights/summary', async (req) => service.summary(insightsFilterSchema.parse(req.query)));

  app.get('/api/insights/by/:dimension', async (req) => {
    const { dimension } = dimensionParamSchema.parse(req.params);
    return service.by(dimension, insightsFilterSchema.parse(req.query));
  });

  app.get('/api/insights/distribution', async (req) => {
    const { bucketUsd, ...filter } = distributionQuerySchema.parse(req.query);
    return service.distribution(filter, bucketUsd);
  });

  app.get('/api/insights/earners', async (req) => {
    const { order, limit, ...filter } = earnersQuerySchema.parse(req.query);
    return service.earners(filter, order, limit);
  });
}
