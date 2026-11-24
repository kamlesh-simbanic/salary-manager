export class ApiError extends Error {
  readonly status: number
  readonly details?: { path: string; message: string }[]

  constructor(message: string, status: number, details?: { path: string; message: string }[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/** Thin fetch wrapper: JSON in/out and a typed error carrying the server's message. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const hasBody = init.body !== undefined
  const response = await fetch(path, {
    method: init.method ?? 'GET',
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(init.body) : undefined,
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string; details?: ApiError['details'] }
    throw new ApiError(payload.error ?? response.statusText, response.status, payload.details)
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}
