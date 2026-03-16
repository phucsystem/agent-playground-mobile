# Code Review: Agent Playground Mobile (Full src/ Review)

**Date:** 2026-03-17
**Reviewer:** code-reviewer
**Scope:** /src/ (78 files, ~3,700 LOC)
**Focus:** TypeScript correctness, hook patterns, Supabase realtime cleanup, optimistic updates, auth flow, navigation

---

## Overall Assessment

Solid foundation for an Expo + Supabase chat app. Clean separation of concerns across API, hooks, stores, and navigation layers. However, there are several **high-severity** issues around type safety abuse, a race condition in realtime message deduplication, missing error handling in the auth flow, and a wasted hook call in `DMChatScreen`. No security vulnerabilities found beyond minor token-handling observations.

---

## Critical Issues

### C1. `DMChatScreen` calls `useSendMessage` twice -- wasted subscription + stale reference

**File:** `src/screens/chat/dm-chat-screen.tsx`, lines 33-35

```typescript
useSendMessage(conversationId);           // line 33 -- result thrown away
useRealtimeMessages(conversationId);      // line 34
const sendMessage = useSendMessage(conversationId); // line 35 -- used
```

Two separate mutation hooks are created for the same conversation. The first is never used but still exists as an active mutation observer. More importantly, this is clearly a copy-paste oversight. The dangling call wastes memory and could cause unexpected double-invalidation side effects on `onSettled`.

**Fix:** Remove line 33.

---

### C2. Realtime messages can duplicate the optimistic message on race

**File:** `src/hooks/use-realtime-messages.ts`, lines 23-25

```typescript
if (newMessage.user_id === currentUserId) return;
```

This skips all messages from the current user, relying on the fact that `useSendMessage` already inserted an optimistic message. However, `onSettled` in `useSendMessage` only invalidates `conversations.list()` -- it never invalidates or refetches `messages.byConversation`. This means:

1. The optimistic message (with a client-generated UUID) stays in the cache forever.
2. The server-assigned message (with the real UUID) is filtered out by the `user_id === currentUserId` check in realtime.
3. If the user navigates away and back, the infinite query refetches and returns the real message -- now the optimistic message is gone but the real one appears. No duplication in that case, but the message ID in the cache is wrong until refetch.

**Impact:** If another part of the app references message IDs from the cache (reactions, deep links, read receipts), the stale optimistic UUID will cause 404s or mismatches.

**Fix:** In `useSendMessage.onSettled`, also invalidate the messages query:

```typescript
onSettled: () => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.messages.byConversation(conversationId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.conversations.list(),
  });
},
```

Or better: in `onSuccess`, replace the optimistic message in cache with the real server response:

```typescript
onSuccess: (serverMessage, _content, context) => {
  if (!context) return;
  queryClient.setQueryData(
    queryKeys.messages.byConversation(conversationId),
    (old) => {
      // replace optimistic with real
      const existing = old as { pages: unknown[][]; pageParams: unknown[] } | undefined;
      if (!existing) return existing;
      const newPages = existing.pages.map((page) =>
        (page as Array<{ id: string }>).map((msg) =>
          msg.id === context.optimisticMessage.id ? serverMessage : msg
        )
      );
      return { ...existing, pages: newPages };
    }
  );
},
```

---

### C3. `createGlobalErrorHandler` swallows the rejected promise from `handleApiError`

**File:** `src/lib/api-interceptor.ts`, lines 14-23

```typescript
export function createGlobalErrorHandler() {
  return {
    onError: (error: unknown) => {
      const apiError = error as { status?: number };
      if (apiError?.status === 401) {
        handleApiError(error); // async function -- returned promise is not awaited or caught
      }
    },
  };
}
```

`handleApiError` is `async` and always throws at the end. The returned promise is never awaited, producing an **unhandled promise rejection** on every 401 error that flows through this handler.

**Fix:** Either `void handleApiError(error).catch(() => {})` or restructure to not re-throw inside the global handler path.

**Additionally:** `createGlobalErrorHandler()` is defined but never wired into the `QueryClient` default options in `query-client.ts`. This means 401 auto-logout only works if individual API calls explicitly call `handleApiError` -- which none of them do. The entire 401-auto-logout mechanism is currently **dead code**.

---

## High Priority

### H1. Pervasive `as unknown` / `as Record<string, unknown>` type coercions defeat TypeScript

**Files:** `conversation-list-screen.tsx` (lines 41, 58, 93-103), `use-send-message.ts` (lines 45-46, 60-64), `use-realtime-messages.ts` (lines 42-43)

The infinite query cache manipulation uses `old: unknown` and then casts to `{ pages: unknown[][]; pageParams: unknown[] }`. This pattern is repeated 4 times. `conversation-list-screen.tsx` casts everything to `Record<string, unknown>` and then re-casts individual properties back.

**Impact:** No compile-time protection against shape mismatches. If the API response shape changes, these casts will silently produce runtime errors instead of compile-time errors.

**Fix:** Define typed helpers:

```typescript
type MessagePages = { pages: MessageListItem[][]; pageParams: (string | undefined)[] };

// Then in cache manipulation:
queryClient.setQueryData<InfiniteData<MessageListItem[]>>(
  queryKeys.messages.byConversation(conversationId),
  (old) => { ... }
);
```

TanStack Query v5's `setQueryData` accepts a generic type parameter -- use it.

### H2. `useSessionRestore` has missing dependency warnings and no token validation

**File:** `src/hooks/use-session-restore.ts`, line 33

```typescript
useEffect(() => {
  restore();
}, []); // setSession and clearSession are stable (zustand), but ESLint will flag
```

More importantly, `getCurrentUser(userId)` is called with the stored `userId` and stored `token`, but the token is never passed to the Supabase client for this request. Supabase uses the anon key by default. If RLS policies require an authenticated session, this call may fail or return unauthorized data.

**Impact:** Session restore may silently fail if RLS is enforced, leaving users stuck on a loading screen (finally block sets `isLoading = false`, but `clearSession` in the catch block routes to login, so this is partially mitigated).

### H3. `useReadReceipt` throttle is inside `mutationFn` -- TanStack Query still tracks each call

**File:** `src/hooks/use-read-receipt.ts`, lines 11-14

The throttle via `lastCallRef` is inside `mutationFn`, so TanStack Query still creates a mutation entry for every `mutate()` call. If throttled, `mutationFn` returns `undefined` (implicit), which triggers `onSuccess` and invalidates `conversations.list()` unnecessarily.

**Fix:** Move throttle check before `mutate()` in the calling component, or return early with a distinguishing value and check it in `onSuccess`.

### H4. `user!` non-null assertions throughout hooks -- crash if auth state is stale

**Files:** `use-send-message.ts:13,26,33-36`, `use-upload-file.ts:39`, `use-reactions.ts:22`, `conversation-list-screen.tsx:96`

All mutation hooks use `user!.id` without null guards. If the auth store is cleared (e.g., by 401 handler) while a mutation is in-flight, these will throw a runtime TypeError.

**Fix:** Guard with early return or throw a descriptive error:

```typescript
if (!user) throw new Error("Cannot send message: not authenticated");
```

---

## Medium Priority

### M1. `DMChatScreen` missing features that `GroupChatScreen` has

`DMChatScreen` does not use:
- `useTypingIndicator` (no typing events sent/received)
- `useReadReceipt` (read receipts not marked)
- `useConversationMembers`

This appears intentional for DMs but is inconsistent. DM recipients won't see typing indicators or read status.

### M2. `supabase.ts` SecureStore adapter does not return promises from `setItem`/`removeItem`

**File:** `src/lib/supabase.ts`, lines 9-14

```typescript
setItem: (key: string, value: string) => {
  SecureStore.setItemAsync(key, value); // promise not returned
},
removeItem: (key: string) => {
  SecureStore.deleteItemAsync(key); // promise not returned
},
```

Supabase's storage adapter interface expects these to be `void | Promise<void>`. Not returning the promise means Supabase cannot await completion. On slow devices, a `getItem` immediately after `setItem` could return stale data.

**Fix:** Return the promise:

```typescript
setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
removeItem: (key: string) => SecureStore.deleteItemAsync(key),
```

### M3. `calculateUnreadCount` always returns 0 or 1 -- not the actual count

**File:** `src/utils/unread.ts`

This function only checks if the last message is newer than `lastReadAt`. For conversations with many unread messages, it will still show "1". Either rename to `hasUnread` (returning boolean) or query the actual count.

### M4. Typing indicator `setTimeout` leak in `useTypingIndicator`

**File:** `src/hooks/use-typing-indicator.ts`, line 26-28

```typescript
setTimeout(() => {
  clearTyping(conversationId, typingUserId);
}, TYPING_TIMEOUT_MS);
```

Each broadcast event creates a new timeout but old timeouts are never cleared. If the same user sends multiple typing events, stale timeouts accumulate and fire out of order. This can cause the typing indicator to flash on/off.

**Fix:** Track timeouts per user in a `Map<string, ReturnType<typeof setTimeout>>` ref and clear the previous timeout before setting a new one.

### M5. `ItemSeparatorComponent` in `ConversationListScreen` creates a new function component on every render

**File:** `src/screens/chat/conversation-list-screen.tsx`, line 118

```typescript
ItemSeparatorComponent={() => (
  <View className="h-px bg-border ml-[76px]" />
)}
```

This creates a new component reference every render, causing FlashList to remount separators. Extract to a named component.

---

## Low Priority

### L1. `LoginScreen.checkClipboard` is a function declaration inside a component, not wrapped in `useCallback`

Not a bug since it is only called in `useEffect`, but inconsistent with the rest of the component which uses `useCallback`. Minor readability issue.

### L2. `usePresence` dependency array uses `user?.id` but also references `user.id` inside the effect

If `user` becomes null mid-effect, the `channel.track({ user_id: user.id })` in the AppState listener will throw. The cleanup function removes the listener, but there is a brief window where the AppState callback can fire after `user` becomes null but before the effect cleanup runs.

### L3. `LoginResponse.refresh_token` and `expires_in` are defined in `api-types.ts` but never used

Dead fields in the type. The refresh token is not stored or used anywhere, which means token refresh is not implemented. Sessions will expire after `SESSION_TTL_HOURS` (24h) with no refresh mechanism.

---

## Positive Observations

1. **Clean hook composition** -- each hook has a single responsibility (messages, presence, typing, read receipts)
2. **Good use of Zustand** -- minimal, focused stores with no over-engineering
3. **FlashList** used correctly with `estimatedItemSize` and `inverted` for chat
4. **Supabase channel cleanup** in `useEffect` return is correct across all realtime hooks
5. **Haptic feedback** on login error -- good UX detail
6. **SecureStore** for token storage instead of AsyncStorage -- correct security choice
7. **Pagination** with infinite query and cursor-based approach is well-implemented
8. **Message grouping** logic correctly handles inverted list direction

---

## Recommended Actions (Priority Order)

1. **[Critical]** Remove duplicate `useSendMessage` call in `DMChatScreen`
2. **[Critical]** Fix optimistic message lifecycle: replace optimistic message with server response in `onSuccess`, or invalidate messages query in `onSettled`
3. **[Critical]** Wire `createGlobalErrorHandler` into `QueryClient` or remove it; fix the unhandled promise rejection
4. **[High]** Replace `as unknown` cache casts with TanStack Query's generic `setQueryData<T>`
5. **[High]** Add null guards for `user!` assertions in mutation hooks
6. **[Medium]** Return promises from SecureStore adapter in `supabase.ts`
7. **[Medium]** Fix typing indicator timeout accumulation
8. **[Medium]** Add typing + read receipts to `DMChatScreen` or document why they are excluded

---

## Metrics

| Metric | Value |
|--------|-------|
| Files reviewed | 78 |
| Lines of code | ~3,700 |
| Critical issues | 3 |
| High issues | 4 |
| Medium issues | 5 |
| Low issues | 3 |
| Type safety | Moderate -- heavy `as unknown` usage undermines TS benefits |
| Test coverage | 0% (no test files present) |

---

## Unresolved Questions

1. Is the 401 auto-logout intended to work via `createGlobalErrorHandler` wired into QueryClient, or is each API function supposed to call `handleApiError` individually? Currently neither path is active.
2. Is the absence of typing indicators in DMs intentional or a TODO?
3. Token refresh (`refresh_token` in `LoginResponse`) -- is this planned, or are 24h sessions acceptable?
