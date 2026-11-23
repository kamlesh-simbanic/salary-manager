export const SCHEMA = `
CREATE TABLE IF NOT EXISTS employees (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  job_title    TEXT NOT NULL,
  department   TEXT NOT NULL,
  country      TEXT NOT NULL,
  currency     TEXT NOT NULL,
  salary_minor INTEGER NOT NULL CHECK (salary_minor >= 0),
  hire_date    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))
);
CREATE INDEX IF NOT EXISTS idx_employees_country    ON employees(country);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_job_title  ON employees(job_title);
CREATE INDEX IF NOT EXISTS idx_employees_last_name  ON employees(last_name);

CREATE TABLE IF NOT EXISTS salary_history (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id      INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  old_salary_minor INTEGER,
  new_salary_minor INTEGER NOT NULL,
  changed_at       TEXT NOT NULL,
  reason           TEXT
);
CREATE INDEX IF NOT EXISTS idx_history_employee ON salary_history(employee_id);

CREATE TABLE IF NOT EXISTS fx_rates (
  currency     TEXT PRIMARY KEY,
  usd_per_unit REAL NOT NULL
);
`;
