export function cleanPropertyUtil<T = any>(value?: T, ownValue?: T): Nullable<T> {
  if (typeof value === 'string') {
    return value.trim() !== '' ? value : ownValue !== undefined ? ownValue : null;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value : ownValue !== undefined ? ownValue : null;
  }

  if (value instanceof Date) {
    return value.getTime() > 0 ? value : ownValue !== undefined ? ownValue : null;
  }

  return value !== undefined && value !== null ? value : ownValue !== undefined ? ownValue : null;
}
