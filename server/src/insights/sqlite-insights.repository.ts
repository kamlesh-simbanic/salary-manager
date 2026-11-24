import type { Db } from '../db/index.js';
import { buildWhere } from '../employees/employee-filters.js';
import type { EmployeeFilter } from '../employees/employee.types.js';
import type { InsightsReader } from './insights.repository.js';
import type { BucketCount, Dimension, Earner, EarnerOrder, GroupPayStats, PayStats } from './insights.types.js';

/** Whitelist of GROUP BY columns: the dimension never comes from user text directly. */
const DIMENSION_COLUMNS: Record<Dimension, string> = {
  country: 'country',
  department: 'department',
  jobTitle: 'job_title',
};

const USD = 'CAST(ROUND(salary_minor * usd_per_unit) AS INTEGER)';

const EMPTY: PayStats = { count: 0, minUsdMinor: 0, medianUsdMinor: 0, meanUsdMinor: 0, maxUsdMinor: 0, totalUsdMinor: 0 };

/**
 * All aggregation happens in SQL so the API never loads 10k rows into memory.
 * Median uses window functions: pick the middle row (or average the two middle rows).
 * Employees whose currency has no FX rate are excluded by the inner join.
 */
export class SqliteInsightsRepository implements InsightsReader {
  constructor(private readonly db: Db) {}

  summary(filter: EmployeeFilter): PayStats {
    const [row] = this.groupStats("'all'", filter);
    if (!row) return { ...EMPTY };
    const { key: _key, ...stats } = row;
    return stats;
  }

  statsBy(dimension: Dimension, filter: EmployeeFilter): GroupPayStats[] {
    return this.groupStats(DIMENSION_COLUMNS[dimension], filter);
  }

  distribution(filter: EmployeeFilter, bucketSizeUsdMinor: number): BucketCount[] {
    const { where, params } = buildWhere(filter);
    return this.db
      .prepare(
        `SELECT usd / CAST(@bucket AS INTEGER) AS "index", COUNT(*) AS count
         FROM (SELECT ${USD} AS usd FROM employees JOIN fx_rates USING (currency) ${where})
         GROUP BY "index" ORDER BY "index"`,
      )
      .all({ ...params, bucket: bucketSizeUsdMinor }) as BucketCount[];
  }

  earners(filter: EmployeeFilter, order: EarnerOrder, limit: number): Earner[] {
    const { where, params } = buildWhere(filter);
    return this.db
      .prepare(
        `SELECT id, first_name AS firstName, last_name AS lastName, job_title AS jobTitle, department, country,
                currency, salary_minor AS salaryMinor, ${USD} AS salaryUsdMinor
         FROM employees JOIN fx_rates USING (currency) ${where}
         ORDER BY salaryUsdMinor ${order === 'top' ? 'DESC' : 'ASC'}, id ASC LIMIT @limit`,
      )
      .all({ ...params, limit }) as Earner[];
  }

  private groupStats(groupExpr: string, filter: EmployeeFilter): GroupPayStats[] {
    const { where, params } = buildWhere(filter);
    return this.db
      .prepare(
        `WITH priced AS (
           SELECT ${groupExpr} AS grp, ${USD} AS usd
           FROM employees JOIN fx_rates USING (currency) ${where}
         ), ranked AS (
           SELECT grp, usd,
                  ROW_NUMBER() OVER (PARTITION BY grp ORDER BY usd) AS rn,
                  COUNT(*)     OVER (PARTITION BY grp)              AS cnt
           FROM priced
         )
         SELECT grp AS key,
                COUNT(*) AS count,
                MIN(usd) AS minUsdMinor,
                MAX(usd) AS maxUsdMinor,
                CAST(ROUND(AVG(usd)) AS INTEGER) AS meanUsdMinor,
                CAST(ROUND(AVG(CASE WHEN rn IN ((cnt + 1) / 2, (cnt + 2) / 2) THEN usd END)) AS INTEGER) AS medianUsdMinor,
                SUM(usd) AS totalUsdMinor
         FROM ranked GROUP BY grp
         ORDER BY medianUsdMinor DESC, grp ASC`,
      )
      .all(params) as GroupPayStats[];
  }
}
