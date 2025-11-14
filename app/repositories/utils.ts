export function nowIsoString() {
  return new Date().toISOString()
}

export function assertEntity<T>(entity: T | undefined, message: string): T {
  if (!entity) {
    throw new Error(message)
  }

  return entity
}
