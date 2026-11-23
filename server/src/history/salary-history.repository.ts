export interface SalaryHistoryEntry {
  id: number;
  employeeId: number;
  oldSalaryMinor: number | null;
  newSalaryMinor: number;
  changedAt: string;
  reason: string | null;
}

export type NewSalaryHistoryEntry = Omit<SalaryHistoryEntry, 'id'>;

export interface SalaryHistoryRepository {
  record(entry: NewSalaryHistoryEntry): void;
  listFor(employeeId: number): SalaryHistoryEntry[];
}
