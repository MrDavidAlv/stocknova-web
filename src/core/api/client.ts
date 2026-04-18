import type { ApiResponse, AuthResponse } from "@/core/types/api";

const API_URL = import.meta.env.VITE_API_URL as string;

export const API_BASE = `${API_URL}/api/v1`;

export const STORAGE_KEYS = {
  accessToken: "sn.accessToken",
  refreshToken: "sn.refreshToken",
  user: "sn.user",
} as const;

// --------------- Fetch wrapper ---------------

type RequestOptions = Omit<RequestInit, "body"> & {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const raw = `${API_BASE}${path}`;
  const url = raw.startsWith("http") ? new URL(raw) : new URL(raw, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// Refresh token coordination
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  pendingQueue.push(cb);
};
const onRefreshed = (token: string | null) => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data: ApiResponse<AuthResponse> = await res.json();
    if (data?.success && data.data) {
      localStorage.setItem(STORAGE_KEYS.accessToken, data.data.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.data.refreshToken);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.data.user));
      return data.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

function hardLogout() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers: extraHeaders, ...init } = options;
  const url = buildUrl(path, params);
  const headers = { ...authHeaders(), ...extraHeaders };

  // Don't send Content-Type for FormData (browser sets multipart boundary)
  if (body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Handle 401 with token refresh (skip for auth endpoints)
  if (res.status === 401 && !path.includes("/auth/")) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(new ApiError(401, "Sesion expirada"));
            return;
          }
          // Retry with new token
          const retryHeaders = { ...headers, Authorization: `Bearer ${token}` };
          fetch(url, { ...init, headers: retryHeaders, body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined })
            .then((r) => r.json())
            .then(resolve)
            .catch(reject);
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    onRefreshed(newToken);

    if (newToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      const retryRes = await fetch(url, {
        ...init,
        headers: retryHeaders,
        body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      });
      return retryRes.json() as Promise<T>;
    }

    hardLogout();
    throw new ApiError(401, "Sesion expirada");
  }

  if (!res.ok) {
    let errorData: ApiResponse<unknown> | undefined;
    try {
      errorData = await res.json();
    } catch { /* ignore parse errors */ }
    const msg = errorData?.errors?.[0] || errorData?.message || `Error ${res.status}`;
    throw new ApiError(res.status, msg, errorData);
  }

  return res.json() as Promise<T>;
}

// --------------- Public API ---------------

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: ApiResponse<unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),

  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
};

/** Extracts a user-friendly error message from any error. */
export function extractApiError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  return err instanceof Error ? err.message : "Error desconocido";
}
