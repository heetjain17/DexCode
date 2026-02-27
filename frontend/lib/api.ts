const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: unknown[];
}

// ─── Refresh token state ───────────────────────────────────────────────────

let isRefreshing = false;
type QueueItem = { resolve: () => void; reject: (err: unknown) => void };
let refreshQueue: QueueItem[] = [];

function processQueue(error: unknown): void {
  for (const item of refreshQueue) {
    if (error) item.reject(error);
    else item.resolve();
  }
  refreshQueue = [];
}

async function attemptRefresh(): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Refresh failed");
}

// Paths that must never trigger a refresh-and-retry loop
const NO_REFRESH_PATHS = ["/auth/refresh", "/auth/login", "/auth/register"];

function shouldRetry(path: string): boolean {
  return !NO_REFRESH_PATHS.some((p) => path.startsWith(p));
}

// ─── Core fetch helper ─────────────────────────────────────────────────────

function doFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });
}

// ─── Public API function ───────────────────────────────────────────────────

async function api<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await doFetch(path, init);

  // Not a 401 or an auth endpoint — handle normally
  if (res.status !== 401 || !shouldRetry(path)) {
    const body = await res.json();
    if (!res.ok) throw body as ApiError;
    return body as ApiResponse<T>;
  }

  // ── 401 on a retryable endpoint: attempt token refresh ──

  if (!isRefreshing) {
    isRefreshing = true;
    try {
      await attemptRefresh();
      processQueue(null);
    } catch (err) {
      processQueue(err);
      isRefreshing = false;
      // Propagate original 401 body
      const body = await res.json().catch(() => ({ statusCode: 401, message: "Unauthorized" }));
      throw body as ApiError;
    }
    isRefreshing = false;
  } else {
    // Another refresh is already in flight — wait for it
    await new Promise<void>((resolve, reject) =>
      refreshQueue.push({ resolve, reject })
    );
  }

  // Retry original request with the new cookies
  const retryRes = await doFetch(path, init);
  const retryBody = await retryRes.json();
  if (!retryRes.ok) throw retryBody as ApiError;
  return retryBody as ApiResponse<T>;
}

export default api;
