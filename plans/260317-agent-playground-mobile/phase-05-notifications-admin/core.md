# Phase 05 — Notifications & Admin: Core

## Overview

- **Priority:** P3
- **Status:** Completed
- **Effort:** 3h
- **Description:** Data layer for push notifications, agent thinking indicator, and admin features (user management, webhook logs). Covers FR-18 through FR-22.

## Requirements

| FR | Feature | Core Concern |
|----|---------|-------------|
| FR-18 | Push Notifications | Register device token, handle incoming push |
| FR-19 | Agent Thinking Indicator | Check webhook pending status, 30s timeout |
| FR-20 | Admin User List | Fetch all users, search |
| FR-21 | Admin Create User | Create user with auto-generated token |
| FR-22 | Admin Webhook Logs | Fetch logs with filters |

## Related Code Files

### Files to CREATE

```
src/
├── api/
│   ├── admin-users-api.ts           # CRUD users (admin)
│   └── webhook-logs-api.ts          # Fetch webhook logs (admin)
├── hooks/
│   ├── use-push-notifications.ts    # Register token, handle tap
│   ├── use-agent-thinking.ts        # Webhook pending status check
│   ├── use-admin-users.ts           # Query: user list, search
│   ├── use-create-user.ts           # Mutation: create user
│   └── use-webhook-logs.ts          # Query: webhook logs with filters
├── lib/
│   └── notifications.ts             # Push notification setup
```

## Implementation Steps

### Step 1: Install notification packages

```bash
npx expo install expo-notifications expo-device expo-constants
```

### Step 2: Push notification setup (`src/lib/notifications.ts`)

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}
```

### Step 3: Push notification hook (`src/hooks/use-push-notifications.ts`)

```typescript
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { registerForPushNotifications } from "../lib/notifications";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

export function usePushNotifications() {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation<any>();
  const notificationResponseListener = useRef<any>();

  useEffect(() => {
    if (!user) return;

    // Register device token
    registerForPushNotifications().then(async (pushToken) => {
      if (pushToken) {
        // Store push token server-side (via user metadata or dedicated table)
        await supabase
          .from("users")
          .update({ push_token: pushToken } as any)
          .eq("id", user.id);
      }
    });

    // Handle notification tap -> navigate to conversation
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.conversationId) {
          navigation.navigate("ChatStack", {
            screen: "DMChat",
            params: { conversationId: data.conversationId },
          });
        }
      });

    return () => {
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(
          notificationResponseListener.current
        );
      }
    };
  }, [user?.id]);
}
```

### Step 4: Agent thinking indicator (`src/hooks/use-agent-thinking.ts`)

```typescript
import { useState, useEffect, useRef } from "react";
import { AGENT_THINKING_TIMEOUT_MS } from "../constants/app";

export function useAgentThinking(conversationId: string) {
  const [isThinking, setIsThinking] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  function startThinking() {
    setIsThinking(true);
    setTimedOut(false);

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, AGENT_THINKING_TIMEOUT_MS);
  }

  function stopThinking() {
    setIsThinking(false);
    setTimedOut(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isThinking, timedOut, startThinking, stopThinking };
}
```

Usage in chat screen: call `startThinking()` when user sends a message to a conversation with an agent. Call `stopThinking()` when agent message arrives via realtime.

### Step 5: Admin users API (`src/api/admin-users-api.ts`)

```typescript
import { supabase } from "../lib/supabase";

export async function fetchUsers(searchQuery?: string) {
  let query = supabase
    .from("users")
    .select("id, username, email, role, avatar_url, is_mock, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchQuery) {
    query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createUser(params: {
  username: string;
  email?: string;
  role: string;
}) {
  const { data, error } = await supabase
    .from("users")
    .insert(params)
    .select("id, username, email, role, token, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(userId: string, params: {
  username?: string;
  role?: string;
}) {
  const { data, error } = await supabase
    .from("users")
    .update(params)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Step 6: Webhook logs API (`src/api/webhook-logs-api.ts`)

```typescript
import { supabase } from "../lib/supabase";

interface WebhookLogFilters {
  agentId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchWebhookLogs(filters: WebhookLogFilters = {}) {
  let query = supabase
    .from("webhook_delivery_logs")
    .select(`
      *,
      users!webhook_delivery_logs_agent_id_fkey(id, username, avatar_url),
      conversations(id, name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (filters.agentId) query = query.eq("agent_id", filters.agentId);
  if (filters.status) query = query.eq("delivery_status", filters.status);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

### Step 7: Admin query hooks

**use-admin-users.ts:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/admin-users-api";

export function useAdminUsers(searchQuery?: string) {
  return useQuery({
    queryKey: ["admin-users", searchQuery ?? ""],
    queryFn: () => fetchUsers(searchQuery),
    staleTime: 30_000,
  });
}
```

**use-create-user.ts:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/admin-users-api";

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
```

**use-webhook-logs.ts:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchWebhookLogs } from "../api/webhook-logs-api";

export function useWebhookLogs(filters: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: ["webhook-logs", filters],
    queryFn: () => fetchWebhookLogs(filters),
    staleTime: 15_000,
  });
}
```

## Todo List

- [x] Install `expo-notifications`, `expo-device`, `expo-constants`
- [x] Implement `src/lib/notifications.ts` (register, Android channel)
- [x] Implement `src/hooks/use-push-notifications.ts` (register + tap handler)
- [x] Implement `src/hooks/use-agent-thinking.ts` (30s timeout logic)
- [x] Implement `src/api/admin-users-api.ts` (fetch, create, update)
- [x] Implement `src/api/webhook-logs-api.ts` (fetch with filters)
- [x] Implement `src/hooks/use-admin-users.ts` query
- [x] Implement `src/hooks/use-create-user.ts` mutation
- [x] Implement `src/hooks/use-webhook-logs.ts` query with filters
- [x] Test push notification registration on physical device
- [x] Test admin APIs with admin-role JWT

## Success Criteria

- Push notification tap opens correct conversation
- Agent thinking indicator shows dots, switches to "Agent may be offline" after 30s
- Admin user list loads with search filtering
- Create user returns auto-generated token for clipboard copy
- Webhook logs load with agent/status/date filters working
