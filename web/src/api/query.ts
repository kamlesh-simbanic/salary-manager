/** Builds a query string, dropping empty values so the URL only carries active filters. */
export function buildQuery(params: object): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== undefined && value !== null) query.set(key, String(value))
  }
  return query.toString()
}
