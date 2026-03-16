import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications } from "../lib/notifications";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

export function usePushNotifications() {
  const user = useAuthStore((state) => state.user);
  const subscriptionRef = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    if (!user) return;

    registerForPushNotifications().then(async (pushToken) => {
      if (pushToken) {
        await supabase
          .from("users")
          .update({ push_token: pushToken } as Record<string, unknown>)
          .eq("id", user.id);
      }
    });

    subscriptionRef.current =
      Notifications.addNotificationResponseReceivedListener((_response) => {
        // Deep linking handled by expo-notifications navigation integration
      });

    return () => {
      subscriptionRef.current?.remove();
    };
  }, [user?.id]);
}
