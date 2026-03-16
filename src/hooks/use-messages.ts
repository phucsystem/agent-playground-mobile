import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMessages } from "../api/messages-api";
import { queryKeys } from "../types/api-types";
import { PAGE_SIZE } from "../constants/app";

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.messages.byConversation(conversationId),
    queryFn: ({ pageParam }) => fetchMessages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
  });
}
