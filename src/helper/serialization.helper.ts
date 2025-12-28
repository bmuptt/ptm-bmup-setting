
/**
 * Helper to serialize data containing BigInts for JSON response
 * Converts BigInt to Number (assuming values fit in MAX_SAFE_INTEGER)
 * or String if needed.
 */
export const serializeData = (data: unknown): unknown => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'bigint') {
    return Number(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }

  if (typeof data === 'object') {
    // Handle Date objects (let them stay as Date, JSON.stringify handles them)
    if (data instanceof Date) {
      return data;
    }

    const out: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        out[key] = serializeData((data as Record<string, unknown>)[key]);
      }
    }
    return out;
  }

  return data;
};
