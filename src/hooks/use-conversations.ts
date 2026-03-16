import { useQuery } from "@tanstack/react-query";
import { fetchConversations } from "../api/conversations-api";
import { useAuthStore } from "../stores/auth-store";
import { queryKeys } from "../types/api-types";

export function useConversations() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: () => fetchConversations(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
