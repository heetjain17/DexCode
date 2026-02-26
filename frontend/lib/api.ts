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

async function api<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const body = await res.json();

  if (!res.ok) {
    throw body as ApiError;
  }

  return body as ApiResponse<T>;
}

export default api;
