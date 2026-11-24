import { z } from 'zod';
import { DIMENSIONS } from './insights.types.js';

const optionalText = z.string().trim().min(1).max(100).optional();

/** Insights describe current pay, so inactive employees are excluded unless asked for. */
export const insightsFilterSchema = z.object({
  country: optionalText,
  department: optionalText,
  jobTitle: optionalText,
  status: z.enum(['active', 'inactive']).default('active'),
});

export const dimensionParamSchema = z.object({ dimension: z.enum(DIMENSIONS) });

export const distributionQuerySchema = insightsFilterSchema.extend({
  bucketUsd: z.coerce.number().int().min(1000).max(1_000_000).default(20_000),
});

export const earnersQuerySchema = insightsFilterSchema.extend({
  order: z.enum(['top', 'bottom']).default('top'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
