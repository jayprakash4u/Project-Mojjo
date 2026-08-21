/**
 * Normalises Next's `searchParams` object into a `URLSearchParams`, so the
 * same query parser can run on the server and in client components.
 */
export function searchParamsToUrlSearchParams(
  input: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value)) params.set(key, value.join(","));
  }

  return params;
}
