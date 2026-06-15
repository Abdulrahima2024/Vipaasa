import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dateOfBirth?: string | Date;
}

interface User {
  id: string;
  email: string;
  role: string;
  phoneNumber?: string;
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  login: (email: string, password_raw: string) => Promise<boolean>;
  register: (
    email: string,
    password_raw: string,
    fullName: string,
    phoneNumber?: string
  ) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({
              error: data.error || "Login failed. Please check credentials.",
              isLoading: false,
            });
            return false;
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (err) {
          console.error("AuthStore login error:", err);
          set({
            error: "Cannot connect to the authentication server.",
            isLoading: false,
          });
          return false;
        }
      },

      register: async (email, password, fullName, phoneNumber) => {
        set({ isLoading: true, error: null });
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, fullName, phoneNumber }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({
              error: data.error || "Registration failed.",
              isLoading: false,
            });
            return false;
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (err) {
          console.error("AuthStore register error:", err);
          set({
            error: "Cannot connect to the authentication server.",
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (user) => {
        set({ user });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: "vipaasa-auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Always clear transient UI state when store rehydrates from localStorage
        if (state) {
          state.error = null;
          state.isLoading = false;
          state.setHasHydrated(true);
        }
      },
    }
  )
);

