export interface Summary {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function summarize(values: number[]): Summary {
  if (values.length === 0) return { count: 0, min: 0, max: 0, mean: 0, median: 0 };
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    mean: sum / values.length,
    median: median(values),
  };
}
