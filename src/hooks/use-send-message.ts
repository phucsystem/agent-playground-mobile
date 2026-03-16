import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { sendMessage } from "../api/messages-api";
import { useAuthStore } from "../stores/auth-store";
import { queryKeys } from "../types/api-types";

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (content: string) =>
      sendMessage({
        conversation_id: conversationId,
        user_id: user!.id,
        content,
      }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      });

      const optimisticMessage = {
        id: randomUUID(),
        conversation_id: conversationId,
        user_id: user!.id,
        content,
        content_type: "text" as const,
        metadata: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        users: {
          id: user!.id,
          username: user!.username,
          avatar_url: user!.avatar_url,
          role: user!.role,
        },
        reactions: [],
        attachments: [],
        _optimistic: true,
      };

      queryClient.setQueryData(
        queryKeys.messages.byConversation(conversationId),
        (old: unknown) => {
          const existing = old as { pages: unknown[][]; pageParams: unknown[] } | undefined;
          if (!existing) return { pages: [[optimisticMessage]], pageParams: [undefined] };
          const newPages = [...existing.pages];
          newPages[0] = [optimisticMessage, ...(newPages[0] as unknown[])];
          return { ...existing, pages: newPages };
        }
      );

      return { optimisticMessage };
    },
    onError: (_error, _content, context) => {
      if (!context) return;
      queryClient.setQueryData(
        queryKeys.messages.byConversation(conversationId),
        (old: unknown) => {
          const existing = old as { pages: unknown[][]; pageParams: unknown[] } | undefined;
          if (!existing) return existing;
          const newPages = existing.pages.map((page) =>
            (page as Array<{ id: string }>).filter(
              (msg) => msg.id !== context.optimisticMessage.id
            )
          );
          return { ...existing, pages: newPages };
        }
      );
    },
    onSuccess: (serverMessage, _content, context) => {
      if (!context) return;
      queryClient.setQueryData(
        queryKeys.messages.byConversation(conversationId),
        (old: unknown) => {
          const existing = old as { pages: unknown[][]; pageParams: unknown[] } | undefined;
          if (!existing) return existing;
          const newPages = existing.pages.map((page) =>
            (page as Array<{ id: string }>).map((msg) =>
              msg.id === context.optimisticMessage.id
                ? { ...context.optimisticMessage, ...serverMessage, _optimistic: false }
                : msg
            )
          );
          return { ...existing, pages: newPages };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      });
    },
  });
}
