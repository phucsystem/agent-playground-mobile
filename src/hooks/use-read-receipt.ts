import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationRead } from "../api/conversations-api";
import { queryKeys } from "../types/api-types";
import { useRef } from "react";

export function useReadReceipt(conversationId: string) {
  const queryClient = useQueryClient();
  const lastCallRef = useRef(0);

  return useMutation({
    mutationFn: async () => {
      const now = Date.now();
      if (now - lastCallRef.current < 5000) return;
      lastCallRef.current = now;
      await markConversationRead(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
}
