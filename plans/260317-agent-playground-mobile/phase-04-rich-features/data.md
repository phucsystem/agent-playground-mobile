# Phase 04 — Rich Features: Data

## Overview

- **Priority:** P2
- **Status:** Completed
- **Effort:** 4h
- **Description:** API layer and hooks for group chat, @mentions, file uploads, typing indicators, reactions, presence, and read receipts (FR-10 through FR-17).

## Requirements

| FR | Feature | Data Concern |
|----|---------|-------------|
| FR-10 | Group Chat | Reuse conversations/messages API (type='group') |
| FR-11 | @Mention Autocomplete | Fetch conversation members |
| FR-12 | File Attachments | Upload to Supabase Storage, create message |
| FR-13 | Image Sharing | Image picker, compress, upload, create message |
| FR-14 | Typing Indicators | Realtime broadcast channel |
| FR-15 | Emoji Reactions | POST/DELETE reactions |
| FR-16 | Online Presence | Realtime presence channel |
| FR-17 | Read Receipts | POST /rpc/mark_conversation_read |

## Related Code Files

### Files to CREATE

```
src/
├── api/
│   ├── storage-api.ts               # Upload file, get signed URL
│   ├── reactions-api.ts             # Add/remove reactions
│   └── read-receipts-api.ts         # Mark conversation read
├── hooks/
│   ├── use-upload-file.ts           # Mutation: upload with progress
│   ├── use-reactions.ts             # Mutation: add/remove reaction
│   ├── use-read-receipt.ts          # Mutation: mark conversation read
│   ├── use-typing-indicator.ts      # Realtime: send/receive typing events
│   ├── use-presence.ts              # Realtime: track online/offline
│   └── use-conversation-members.ts  # Query: members for @mention
├── stores/
│   ├── typing-store.ts              # Zustand: who is typing per conversation
│   └── presence-store.ts            # Zustand: online user IDs
```

## Implementation Steps

### Step 1: Storage API (`src/api/storage-api.ts`)

```typescript
import { supabase } from "../lib/supabase";

export async function uploadFile(
  path: string,
  file: Blob | ArrayBuffer,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Use XMLHttpRequest for progress tracking
  // supabase-js upload doesn't support progress natively
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/attachments/${path}`;
  const token = useAuthStore.getState().accessToken;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(path);
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("attachments")
    .createSignedUrl(path, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}
```

### Step 2: Reactions API (`src/api/reactions-api.ts`)

```typescript
import { supabase } from "../lib/supabase";

export async function addReaction(messageId: string, userId: string, emoji: string) {
  const { data, error } = await supabase
    .from("reactions")
    .insert({ message_id: messageId, user_id: userId, emoji })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeReaction(reactionId: string) {
  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("id", reactionId);
  if (error) throw error;
}
```

### Step 3: Read receipts API (`src/api/read-receipts-api.ts`)

```typescript
import { supabase } from "../lib/supabase";

export async function markConversationRead(conversationId: string) {
  const { error } = await supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId,
  });
  if (error) throw error;
}
```

### Step 4: Upload file hook (`src/hooks/use-upload-file.ts`)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile, getSignedUrl } from "../api/storage-api";
import { sendMessage } from "../api/messages-api";
import { useAuthStore } from "../stores/auth-store";
import { randomUUID } from "expo-crypto";
import { queryKeys } from "../types/api-types";
import { MAX_FILE_SIZE_BYTES } from "../constants/app";

interface UploadParams {
  conversationId: string;
  file: { uri: string; name: string; size: number; type: string };
  onProgress?: (progress: number) => void;
}

export function useUploadFile() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, file, onProgress }: UploadParams) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("File exceeds 10MB limit");
      }

      const messageId = randomUUID();
      const storagePath = `${conversationId}/${messageId}/${file.name}`;

      // Read file as blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to storage
      await uploadFile(storagePath, blob, file.type, onProgress);

      // Determine content type
      const isImage = file.type.startsWith("image/");
      const contentType = isImage ? "image" : "file";
      const content = isImage ? "Shared an image" : `Shared a file: ${file.name}`;

      // Create message
      const message = await sendMessage({
        conversation_id: conversationId,
        user_id: user!.id,
        content,
        content_type: contentType,
        metadata: isImage
          ? { image_url: `attachments/${storagePath}` }
          : { file_name: file.name, file_size: file.size, file_type: file.type },
      });

      return message;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(variables.conversationId),
      });
    },
  });
}
```

### Step 5: Reactions hook (`src/hooks/use-reactions.ts`)

```typescript
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
      const reaction = await addReaction(messageId, user!.id, "heart");
      return { action: "added" as const, reaction };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      });
    },
  });
}
```

### Step 6: Read receipt hook (`src/hooks/use-read-receipt.ts`)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationRead } from "../api/read-receipts-api";
import { queryKeys } from "../types/api-types";
import { useRef } from "react";

export function useReadReceipt(conversationId: string) {
  const queryClient = useQueryClient();
  const lastCallRef = useRef(0);

  return useMutation({
    mutationFn: async () => {
      // Debounce: max once per 5 seconds
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
```

### Step 7: Typing indicator hook (`src/hooks/use-typing-indicator.ts`)

```typescript
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";
import { useTypingStore } from "../stores/typing-store";
import { TYPING_DEBOUNCE_MS, TYPING_TIMEOUT_MS } from "../constants/app";

export function useTypingIndicator(conversationId: string) {
  const user = useAuthStore((state) => state.user);
  const setTyping = useTypingStore((state) => state.setTyping);
  const clearTyping = useTypingStore((state) => state.clearTyping);
  const lastSentRef = useRef(0);
  const channelRef = useRef<any>(null);

  // Subscribe to typing events from others
  useEffect(() => {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id, username } = payload.payload;
        if (user_id === user?.id) return;
        setTyping(conversationId, user_id, username);

        // Auto-clear after timeout
        setTimeout(() => {
          clearTyping(conversationId, user_id);
        }, TYPING_TIMEOUT_MS);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  // Send typing event (debounced)
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
```

### Step 8: Typing store (`src/stores/typing-store.ts`)

```typescript
import { create } from "zustand";

interface TypingState {
  typingUsers: Record<string, { userId: string; username: string }[]>;
  setTyping: (conversationId: string, userId: string, username: string) => void;
  clearTyping: (conversationId: string, userId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingUsers: {},
  setTyping: (conversationId, userId, username) =>
    set((state) => {
      const current = state.typingUsers[conversationId] ?? [];
      const exists = current.some((entry) => entry.userId === userId);
      if (exists) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, { userId, username }],
        },
      };
    }),
  clearTyping: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] ?? [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter((entry) => entry.userId !== userId),
        },
      };
    }),
}));
```

### Step 9: Presence hook and store (`src/hooks/use-presence.ts`, `src/stores/presence-store.ts`)

**Presence store:**

```typescript
import { create } from "zustand";

interface PresenceState {
  onlineUserIds: Set<string>;
  setOnlineUsers: (userIds: string[]) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUserIds: new Set(),
  setOnlineUsers: (userIds) => set({ onlineUserIds: new Set(userIds) }),
}));
```

**Presence hook:**

```typescript
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";
import { usePresenceStore } from "../stores/presence-store";

export function usePresence() {
  const user = useAuthStore((state) => state.user);
  const setOnlineUsers = usePresenceStore((state) => state.setOnlineUsers);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("presence:global")
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const userIds = Object.values(state)
          .flat()
          .map((entry: any) => entry.user_id)
          .filter(Boolean);
        setOnlineUsers(userIds);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    // Track foreground/background
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
  }, [user?.id]);
}
```

### Step 10: Conversation members hook (`src/hooks/use-conversation-members.ts`)

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchConversationMembers } from "../api/conversations-api";
import { queryKeys } from "../types/api-types";

export function useConversationMembers(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.members.byConversation(conversationId),
    queryFn: () => fetchConversationMembers(conversationId),
    staleTime: 60_000,
  });
}
```

## Todo List

- [x] Implement `src/api/storage-api.ts` (upload with progress, signed URLs)
- [x] Implement `src/api/reactions-api.ts` (add/remove)
- [x] Implement `src/api/read-receipts-api.ts` (mark_conversation_read RPC)
- [x] Implement `src/hooks/use-upload-file.ts` with progress tracking
- [x] Implement `src/hooks/use-reactions.ts` (toggle add/remove)
- [x] Implement `src/hooks/use-read-receipt.ts` with 5s debounce
- [x] Implement `src/hooks/use-typing-indicator.ts` (send/receive, 3s debounce)
- [x] Implement `src/stores/typing-store.ts`
- [x] Implement `src/hooks/use-presence.ts` with AppState tracking
- [x] Implement `src/stores/presence-store.ts`
- [x] Implement `src/hooks/use-conversation-members.ts`
- [x] Test file upload against real Supabase Storage
- [x] Test presence tracking across foreground/background

## Success Criteria

- File upload shows progress bar, creates message on completion
- Image upload auto-compresses files >2MB
- Reactions toggle (add/remove) with optimistic update
- Read receipts clear unread badges
- Typing indicator shows within 500ms of partner typing
- Presence updates when app goes to foreground/background
- Members query returns full list for @mention autocomplete
