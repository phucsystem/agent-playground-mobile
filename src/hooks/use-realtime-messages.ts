import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryKeys } from "../types/api-types";
import { useAuthStore } from "../stores/auth-store";

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Record<string, unknown>;

          if (newMessage.user_id === currentUserId) return;

          const { data: sender } = await supabase
            .from("users")
            .select("id, username, avatar_url, role")
            .eq("id", newMessage.user_id as string)
            .single();

          const enrichedMessage = {
            ...newMessage,
            users: sender,
            reactions: [],
            attachments: [],
          };

          queryClient.setQueryData(
            queryKeys.messages.byConversation(conversationId),
            (old: unknown) => {
              const existing = old as { pages: unknown[][]; pageParams: unknown[] } | undefined;
              if (!existing) return existing;
              const newPages = [...existing.pages];
              newPages[0] = [enrichedMessage, ...(newPages[0] as unknown[])];
              return { ...existing, pages: newPages };
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.conversations.list(),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, queryClient]);
}
