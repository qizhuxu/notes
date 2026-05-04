/**
 * API Response Utility
 *
 * Standardized response format for all NoteVault API routes.
 *
 * Success:   { code: 0, message: "success", data: { ... } }
 * Error:     { code: 1, message: "...", data: null }
 * Paginated: { code: 0, message: "success", data: { items: [...], pagination: { page, limit, total, totalPages } } }
 */

/** Return a successful JSON response */
export function success(data: unknown, message = 'success') {
  return Response.json({ code: 0, message, data });
}

/** Return an error JSON response */
export function error(message: string, code = 1, status = 400) {
  return Response.json({ code, message, data: null }, { status });
}

/** Return a paginated JSON response */
export function paginated(
  items: unknown[],
  page: number,
  limit: number,
  total: number,
) {
  return Response.json({
    code: 0,
    message: 'success',
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

/**
 * Helper to extract and parse JSON body from a request.
 * Returns null if parsing fails, letting the caller handle the error.
 */
export async function parseBody<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Extract pagination params (page, limit) from a URL,
 * applying sensible defaults and clamping to safe ranges.
 */
export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
  return { page, limit };
}
