import { API_BASE_URL } from '../config';
import { authStorage } from './authStorage';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await authStorage.getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type');
  const isJson = Boolean(contentType && contentType.includes('application/json'));
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMsg =
      (typeof data === 'object' && data && ('error' in data || 'message' in data)
        ? (data as { error?: string; message?: string }).error ||
          (data as { error?: string; message?: string }).message
        : null) || `HTTP ${res.status}: Request failed`;
    throw new ApiError(errorMsg, res.status, data);
  }

  return data as T;
}
