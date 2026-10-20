export type ApiResult<T> = { data: T; error?: null } | { data: null; error: string };

export async function api<T = any>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.error || body?.message || message;
    } catch {
      // ignore
    }
    const err = new Error(message) as any;
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as any;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}
