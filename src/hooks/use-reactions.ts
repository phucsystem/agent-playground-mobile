import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addReaction, removeReaction } from "../api/reactions-api";
import { useAuthStore } from "../stores/auth-store";
import { queryKeys } from "../types/api-types";

export function useToggleReaction(conversationId: string) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      existingReactionId,
    }: {
      messageId: string;
      existingReactionId?: string;
    }) => {
      if (existingReactionId) {
        await removeReaction(existingReactionId);
        return { action: "removed" as const };
      }
      const reaction = await addReaction(messageId, user!.id, "❤️");
      return { action: "added" as const, reaction };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      });
    },
  });
}
