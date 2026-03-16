import { useAuthStore } from "../stores/auth-store";
import * as SecureStore from "expo-secure-store";

export async function handleApiError(error: unknown): Promise<never> {
  const apiError = error as { status?: number; message?: string };
  if (apiError?.status === 401 || apiError?.message?.includes("JWT expired")) {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("user_id");
    useAuthStore.getState().clearSession();
  }
  throw error;
}

export function createGlobalErrorHandler() {
  return {
    onError: (error: unknown) => {
      const apiError = error as { status?: number };
      if (apiError?.status === 401) {
        handleApiError(error);
      }
    },
  };
}
