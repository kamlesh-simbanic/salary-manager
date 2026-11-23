import { z } from 'zod';
import { SORT_KEYS } from './employee.types.js';

const text = z.string().trim().min(1).max(100);
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date');

const employeeShape = z.object({
  firstName: text,
  lastName: text,
  email: z.string().trim().toLowerCase().pipe(z.email().max(200)),
  jobTitle: text,
  department: text,
  country: text,
  currency: z.string().regex(/^[A-Z]{3}$/, 'Expected 3-letter ISO currency code'),
  salaryMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  hireDate: isoDate,
  status: z.enum(['active', 'inactive']),
});

/** Boundary validation: everything entering the system is parsed here once. */
export const newEmployeeSchema = employeeShape.extend({ status: employeeShape.shape.status.default('active') });

/**
 * PATCH body: any subset of fields plus an optional reason for a salary change.
 * Built from the shape WITHOUT defaults, otherwise a partial update would silently reset status.
 */
export const updateEmployeeSchema = employeeShape.partial().extend({
  reason: z.string().trim().max(200).optional(),
});

const optionalText = z.string().trim().min(1).max(100).optional();

export const listQuerySchema = z.object({
  search: optionalText,
  country: optionalText,
  department: optionalText,
  jobTitle: optionalText,
  status: z.enum(['active', 'inactive']).optional(),
  sortBy: z.enum(SORT_KEYS).default('lastName'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
