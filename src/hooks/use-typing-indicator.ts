import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";
import { useTypingStore } from "../stores/typing-store";
import { TYPING_DEBOUNCE_MS, TYPING_TIMEOUT_MS } from "../constants/app";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useTypingIndicator(conversationId: string) {
  const user = useAuthStore((state) => state.user);
  const setTyping = useTypingStore((state) => state.setTyping);
  const clearTyping = useTypingStore((state) => state.clearTyping);
  const lastSentRef = useRef(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id: typingUserId, username } = payload.payload as {
          user_id: string;
          username: string;
        };
        if (typingUserId === user?.id) return;
        setTyping(conversationId, typingUserId, username);

        setTimeout(() => {
          clearTyping(conversationId, typingUserId);
        }, TYPING_TIMEOUT_MS);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, setTyping, clearTyping]);

  const sendTypingEvent = useCallback(() => {
    const now = Date.now();
    if (now - lastSentRef.current < TYPING_DEBOUNCE_MS) return;
    lastSentRef.current = now;

    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user?.id, username: user?.username },
    });
  }, [user]);

  return { sendTypingEvent };
}
