import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";
import { usePresenceStore } from "../stores/presence-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function usePresence() {
  const user = useAuthStore((state) => state.user);
  const setOnlineUsers = usePresenceStore((state) => state.setOnlineUsers);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("presence:global")
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const userIds = Object.values(state)
          .flat()
          .map((entry) => (entry as unknown as { user_id: string }).user_id)
          .filter(Boolean);
        setOnlineUsers(userIds);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "active") {
        await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
      } else {
        await channel.untrack();
      }
    });

    return () => {
      subscription.remove();
      supabase.removeChannel(channel);
    };
  }, [user?.id, setOnlineUsers]);
}
