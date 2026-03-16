import { create } from "zustand";
import type { User } from "../types/database";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setSession: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),
  clearSession: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));
