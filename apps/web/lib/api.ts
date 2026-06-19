import { useAuthStore } from "../store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Ensure we are in a client environment before accessing localStorage via Zustand store
  const token = typeof window !== "undefined" ? useAuthStore.getState().token : null;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  
  // Clean endpoint path to ensure it starts with /
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error?.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json() as Promise<T>;
}
