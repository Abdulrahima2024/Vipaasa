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
    cache: "no-store",
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Try to refresh the token
      const refreshed = await useAuthStore.getState().refreshSession();
      if (refreshed) {
        // Retry the original request with the new token
        const newToken = useAuthStore.getState().token;
        if (newToken) {
          (headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
            cache: "no-store",
          });
          if (retryResponse.ok) {
            return retryResponse.json() as Promise<T>;
          }
        }
      } else {
        useAuthStore.getState().logout();
      }
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === "string" 
      ? errorData.error 
      : errorData.message 
      ? errorData.message 
      : (errorData.error && typeof errorData.error.message === "string")
      ? errorData.error.message
      : `HTTP error! status: ${response.status}`;
      
    // Use a plain object to avoid aggressive Next.js dev overlays for handled API errors
    return Promise.reject({ 
      isApiError: true, 
      message: errorMessage, 
      status: response.status 
    });
  }
  
  return response.json() as Promise<T>;
}
