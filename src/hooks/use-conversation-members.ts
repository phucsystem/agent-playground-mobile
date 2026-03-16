import { useQuery } from "@tanstack/react-query";
import { fetchConversationMembers } from "../api/conversations-api";
import { queryKeys } from "../types/api-types";

export function useConversationMembers(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.members.byConversation(conversationId),
    queryFn: () => fetchConversationMembers(conversationId),
    staleTime: 60_000,
  });
}
