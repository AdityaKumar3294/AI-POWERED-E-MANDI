import { useAuthStore } from '@/stores/auth';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Resolves a raw image filename stored in the backend to a fully qualified URL.
 */
export function uploadUrl(filename?: string | null): string {
  if (!filename) return '/placeholder-produce.svg';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `${API_URL}/uploads/${encodeURIComponent(filename)}`;
}

/**
 * Core type-safe API client with automatic JWT token injection,
 * error normalization, and 401 unauthenticated session handling.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Only set Content-Type to application/json if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = (typeof data === 'object' && data?.message) ? data.message : response.statusText;
    throw new ApiError(message || 'Network request failed', response.status, data);
  }

  return data as T;
}

/**
 * Authenticated blob fetch to securely download the official Certificate PDF.
 */
export async function downloadCertificatePdf(
  id: string,
  certificateId: string
): Promise<void> {
  const token = useAuthStore.getState().token;
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}/api/certificates/${id}/pdf`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new ApiError('Failed to download certificate PDF', response.status);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `certificate-${certificateId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

