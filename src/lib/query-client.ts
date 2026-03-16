import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { handleApiError } from "./api-interceptor";

function onGlobalError(error: unknown) {
  const apiError = error as { status?: number; message?: string };
  if (apiError?.status === 401 || apiError?.message?.includes("JWT expired")) {
    handleApiError(error).catch(() => {});
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onGlobalError }),
  mutationCache: new MutationCache({ onError: onGlobalError }),
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});
