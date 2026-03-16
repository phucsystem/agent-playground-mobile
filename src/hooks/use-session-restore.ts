import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../stores/auth-store";
import { getCurrentUser } from "../api/auth-api";
import type { User } from "../types/database";

export function useSessionRestore() {
  const [isLoading, setIsLoading] = useState(true);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    async function restore() {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        const userId = await SecureStore.getItemAsync("user_id");
        if (!token || !userId) {
          clearSession();
          return;
        }

        const userData = await getCurrentUser(userId);
        setSession(userData as User, token);
      } catch {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("user_id");
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, []);

  return { isLoading };
}
