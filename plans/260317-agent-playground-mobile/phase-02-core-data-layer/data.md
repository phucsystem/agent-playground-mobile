# Phase 02 — Core Data Layer: Data

## Overview

- **Priority:** P1
- **Status:** Completed
- **Effort:** 4h
- **Description:** Build Supabase API layer and TanStack Query hooks for authentication, conversations, and messages. This is the data foundation for all Phase 1 screens (S-01, S-02, S-03).

## Requirements

| FR | Feature | Data Concern |
|----|---------|-------------|
| FR-01 | Token Login | POST `/rpc/login_with_token`, store JWT |
| FR-02 | Session Persistence | Restore JWT from SecureStore on app launch |
| FR-03 | Conversation List | GET conversations with last message + member info |
| FR-04 | Unread Badges | Calculate unread from `last_read_at` vs `last_message_created_at` |
| FR-05 | Direct Messaging | GET/POST messages for a conversation |
| FR-06 | Real-time Messages | Supabase Realtime postgres_changes subscription |
| FR-09 | Message Pagination | Cursor-based pagination (created_at) |

## Related Code Files

### Files to CREATE

```
src/
├── api/
│   ├── auth-api.ts                  # login_with_token RPC call
│   ├── conversations-api.ts         # fetch conversations, members
│   └── messages-api.ts              # fetch/send messages
├── hooks/
│   ├── use-login.ts                 # mutation: login with token
│   ├── use-session-restore.ts       # query: restore session on launch
│   ├── use-conversations.ts         # query: conversation list
│   ├── use-messages.ts              # infinite query: paginated messages
│   ├── use-send-message.ts          # mutation: send message (optimistic)
│   └── use-realtime-messages.ts     # subscription: new messages
├── types/
│   └── api-types.ts                 # Response shapes, query key factories
```

## Implementation Steps

### Step 1: Query key factory (`src/types/api-types.ts`)

Centralize all TanStack Query keys to avoid key collisions:

```typescript
export const queryKeys = {
  conversations: {
    all: ["conversations"] as const,
    list: () => [...queryKeys.conversations.all, "list"] as const,
  },
  messages: {
    all: ["messages"] as const,
    byConversation: (conversationId: string) =>
      [...queryKeys.messages.all, conversationId] as const,
  },
  members: {
    byConversation: (conversationId: string) =>
      ["members", conversationId] as const,
  },
  users: {
    current: ["users", "current"] as const,
  },
} as const;
```

Also define response types that extend the base DB types with joined data:

```typescript
import type { Conversation, Message, User, ConversationMember } from "./database";

export interface ConversationWithDetails extends Conversation {
  conversation_members: Pick<ConversationMember, "user_id" | "last_read_at">[];
  messages: Pick<Message, "id" | "content" | "content_type" | "user_id" | "created_at">[];
  unread_count?: number;
  other_member?: Pick<User, "id" | "username" | "avatar_url" | "role">;
}

export interface MessageWithSender extends Message {
  users: Pick<User, "id" | "username" | "avatar_url" | "role">;
  reactions: { id: string; emoji: string; user_id: string }[];
  attachments: { id: string; file_name: string; file_size: number; file_type: string; storage_path: string }[];
}
```

### Step 2: Auth API (`src/api/auth-api.ts`)

```typescript
import { supabase } from "../lib/supabase";

interface LoginResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string | null;
    role: string;
    avatar_url: string | null;
  };
}

export async function loginWithToken(token: string): Promise<LoginResponse> {
  const { data, error } = await supabase.rpc("login_with_token", {
    p_token: token,
  });
  if (error) throw error;
  return data as LoginResponse;
}

export async function getCurrentUser(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, role, avatar_url, is_mock")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
```

### Step 3: Conversations API (`src/api/conversations-api.ts`)

```typescript
import { supabase } from "../lib/supabase";

export async function fetchConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      conversation_members!inner(user_id, last_read_at),
      messages(id, content, content_type, user_id, created_at)
    `)
    .eq("conversation_members.user_id", userId)
    .is("conversation_members.deleted_at", null)
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" })
    .order("last_message_created_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function fetchConversationMembers(conversationId: string) {
  const { data, error } = await supabase
    .from("conversation_members")
    .select("*, users(id, username, avatar_url, role)")
    .eq("conversation_id", conversationId)
    .is("deleted_at", null);

  if (error) throw error;
  return data;
}
```

### Step 4: Messages API (`src/api/messages-api.ts`)

```typescript
import { supabase } from "../lib/supabase";

export async function fetchMessages(
  conversationId: string,
  cursor?: string,
  limit = 30
) {
  let query = supabase
    .from("messages")
    .select(`
      *,
      users!messages_user_id_fkey(id, username, avatar_url, role),
      reactions(id, emoji, user_id),
      attachments(id, file_name, file_size, file_type, storage_path)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function sendMessage(params: {
  conversation_id: string;
  user_id: string;
  content: string;
  content_type?: string;
  metadata?: Record<string, unknown> | null;
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversation_id,
      user_id: params.user_id,
      content: params.content,
      content_type: params.content_type ?? "text",
      metadata: params.metadata ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Step 5: Login hook (`src/hooks/use-login.ts`)

```typescript
import { useMutation } from "@tanstack/react-query";
import { loginWithToken } from "../api/auth-api";
import { useAuthStore } from "../stores/auth-store";
import * as SecureStore from "expo-secure-store";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (token: string) => loginWithToken(token),
    onSuccess: async (data) => {
      await SecureStore.setItemAsync("access_token", data.access_token);
      await SecureStore.setItemAsync("user_id", data.user_id);
      setSession(data.user as any, data.access_token);
    },
  });
}
```

### Step 6: Session restore hook (`src/hooks/use-session-restore.ts`)

```typescript
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../stores/auth-store";
import { getCurrentUser } from "../api/auth-api";
import { supabase } from "../lib/supabase";

export function useSessionRestore() {
  const [isLoading, setIsLoading] = useState(true);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    async function restore() {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        const userId = await SecureStore.getItemAsync("user_id");
        if (!token || !userId) {
          clearSession();
          return;
        }
        // Set auth header for supabase
        // Validate by fetching current user
        const user = await getCurrentUser(userId);
        setSession(user as any, token);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, []);

  return { isLoading };
}
```

### Step 7: Conversations query hook (`src/hooks/use-conversations.ts`)

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchConversations } from "../api/conversations-api";
import { useAuthStore } from "../stores/auth-store";
import { queryKeys } from "../types/api-types";

export function useConversations() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: () => fetchConversations(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
```

### Step 8: Messages infinite query hook (`src/hooks/use-messages.ts`)

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMessages } from "../api/messages-api";
import { queryKeys } from "../types/api-types";

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.messages.byConversation(conversationId),
    queryFn: ({ pageParam }) => fetchMessages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 30) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
  });
}
```

### Step 9: Send message mutation (`src/hooks/use-send-message.ts`)

Optimistic update — message appears instantly, rolls back on failure:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "../api/messages-api";
import { useAuthStore } from "../stores/auth-store";
import { queryKeys } from "../types/api-types";
import { randomUUID } from "expo-crypto";

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
        content_type: "text",
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
        (old: any) => {
          if (!old) return { pages: [[optimisticMessage]], pageParams: [undefined] };
          const newPages = [...old.pages];
          newPages[0] = [optimisticMessage, ...newPages[0]];
          return { ...old, pages: newPages };
        }
      );

      return { optimisticMessage };
    },
    onError: (_error, _content, context) => {
      // Roll back optimistic update
      queryClient.setQueryData(
        queryKeys.messages.byConversation(conversationId),
        (old: any) => {
          if (!old) return old;
          const newPages = old.pages.map((page: any[]) =>
            page.filter((msg: any) => msg.id !== context?.optimisticMessage.id)
          );
          return { ...old, pages: newPages };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
}
```

### Step 10: Realtime messages hook (`src/hooks/use-realtime-messages.ts`)

```typescript
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
          const newMessage = payload.new as any;

          // Skip own messages (already handled by optimistic update)
          if (newMessage.user_id === currentUserId) return;

          // Fetch sender info
          const { data: sender } = await supabase
            .from("users")
            .select("id, username, avatar_url, role")
            .eq("id", newMessage.user_id)
            .single();

          const enrichedMessage = {
            ...newMessage,
            users: sender,
            reactions: [],
            attachments: [],
          };

          // Prepend to first page
          queryClient.setQueryData(
            queryKeys.messages.byConversation(conversationId),
            (old: any) => {
              if (!old) return old;
              const newPages = [...old.pages];
              newPages[0] = [enrichedMessage, ...newPages[0]];
              return { ...old, pages: newPages };
            }
          );

          // Also invalidate conversation list for updated preview
          queryClient.invalidateQueries({
            queryKey: queryKeys.conversations.list(),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);
}
```

## Todo List

- [x] Create query key factory in `src/types/api-types.ts`
- [x] Define response types (ConversationWithDetails, MessageWithSender)
- [x] Implement `src/api/auth-api.ts` (loginWithToken, getCurrentUser)
- [x] Implement `src/api/conversations-api.ts` (fetchConversations, fetchMembers)
- [x] Implement `src/api/messages-api.ts` (fetchMessages, sendMessage)
- [x] Implement `src/hooks/use-login.ts` mutation
- [x] Implement `src/hooks/use-session-restore.ts`
- [x] Implement `src/hooks/use-conversations.ts` query
- [x] Implement `src/hooks/use-messages.ts` infinite query
- [x] Implement `src/hooks/use-send-message.ts` with optimistic updates
- [x] Implement `src/hooks/use-realtime-messages.ts` subscription
- [x] Verify all API calls work against Supabase (real data, no mocks)

## Success Criteria

- `useLogin` exchanges token for JWT and persists to SecureStore
- `useSessionRestore` restores session on app restart
- `useConversations` returns list sorted by recent, with last message
- `useMessages` paginates correctly (30 per page, cursor-based)
- `useSendMessage` shows optimistic message, rolls back on failure
- `useRealtimeMessages` receives new messages within <500ms
- 401 responses trigger auto-logout

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Supabase Realtime disconnects on mobile background | Reconnect in AppState foreground listener (Phase 2 presence) |
| JWT expiry mid-session | Global 401 interceptor clears session -> login screen |
| Optimistic ID collision | Use expo-crypto randomUUID for temp IDs |
