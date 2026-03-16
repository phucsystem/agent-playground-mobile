import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { loginWithToken } from "../api/auth-api";
import { useAuthStore } from "../stores/auth-store";
import type { User } from "../types/database";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (token: string) => loginWithToken(token.trim()),
    onSuccess: async (data) => {
      await SecureStore.setItemAsync("access_token", data.access_token);
      await SecureStore.setItemAsync("user_id", data.user_id);

      const user: User = {
        id: data.user_id,
        auth_id: "",
        email: data.user.email,
        username: data.user.username,
        role: data.user.role as User["role"],
        token: "",
        avatar_url: data.user.avatar_url,
        is_mock: false,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      setSession(user, data.access_token);
    },
  });
}
