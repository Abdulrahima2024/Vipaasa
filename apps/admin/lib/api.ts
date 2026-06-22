const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function fetchAPI<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  let url = `${API_URL}${endpoint}`;
  
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("vipaasa_admin_token") : null;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("vipaasa_admin_token");
      window.location.href = "/login";
    }
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
    throw new Error(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
  }

  return response.json();
}
