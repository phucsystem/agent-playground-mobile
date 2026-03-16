# Phase 02 — Core Data Layer: Core (Business Logic)

## Overview

- **Priority:** P1
- **Status:** Completed
- **Effort:** 4h
- **Description:** Utility functions, formatters, auth interceptor, and shared business logic used across all core screens. Handles timestamp formatting, unread calculation, avatar generation, markdown config, and global error handling.

## Requirements

| FR | Feature | Core Concern |
|----|---------|-------------|
| FR-02 | Session Persistence | Auto-logout on 401, token expiry check |
| FR-04 | Unread Badges | Unread count calculation from last_read_at |
| FR-07 | Markdown Rendering | Markdown style configuration for RN |

## Related Code Files

### Files to CREATE

```
src/
├── utils/
│   ├── format-time.ts               # Timestamp formatting (5m ago, 3:45 PM, Mar 16)
│   ├── avatar.ts                    # Initials + hash-based color generation
│   ├── unread.ts                    # Unread count calculation
│   └── markdown-styles.ts           # Markdown display style config
├── lib/
│   └── api-interceptor.ts           # Global 401 handler, retry logic
├── constants/
│   └── app.ts                       # App-wide constants (page size, debounce, etc)
```

## Implementation Steps

### Step 1: App constants (`src/constants/app.ts`)

```typescript
export const PAGE_SIZE = 30;
export const TYPING_DEBOUNCE_MS = 3000;
export const TYPING_TIMEOUT_MS = 3000;
export const AGENT_THINKING_TIMEOUT_MS = 30000;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const IMAGE_COMPRESS_THRESHOLD_BYTES = 2 * 1024 * 1024; // 2MB
export const IMAGE_MAX_DIMENSION = 1920;
export const IMAGE_QUALITY = 0.8;
export const MAX_INPUT_LINES = 4;
export const SIGNED_URL_CACHE_MINUTES = 50;
export const SESSION_TTL_HOURS = 24;
export const MENTION_MAX_VISIBLE = 4;
```

### Step 2: Timestamp formatter (`src/utils/format-time.ts`)

```typescript
import { formatDistanceToNowStrict, format, isToday, isYesterday } from "date-fns";

export function formatConversationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d");
}

export function formatMessageTime(dateString: string): string {
  return format(new Date(dateString), "h:mm a");
}

export function formatDateSeparator(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export function isSameDay(dateA: string, dateB: string): boolean {
  const dayA = new Date(dateA).toDateString();
  const dayB = new Date(dateB).toDateString();
  return dayA === dayB;
}
```

### Step 3: Avatar utilities (`src/utils/avatar.ts`)

Hash-based background color for initials fallback, matching UI_SPEC avatar pattern:

```typescript
const AVATAR_COLORS = [
  "#F87171", "#FB923C", "#FBBF24", "#34D399",
  "#60A5FA", "#A78BFA", "#F472B6", "#38BDF8",
];

function hashString(str: string): number {
  let hash = 0;
  for (let charIndex = 0; charIndex < str.length; charIndex++) {
    hash = str.charCodeAt(charIndex) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getAvatarColor(name: string): string {
  return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
```

### Step 4: Unread calculation (`src/utils/unread.ts`)

```typescript
export function calculateUnreadCount(
  lastMessageCreatedAt: string | null,
  lastReadAt: string | null
): number {
  if (!lastMessageCreatedAt) return 0;
  if (!lastReadAt) return 1; // never read = at least 1 unread
  return new Date(lastMessageCreatedAt) > new Date(lastReadAt) ? 1 : 0;
}
```

Note: Exact unread count requires server-side count. Client approximates with timestamp comparison — the conversation list query from API_SPEC includes last message, so we compare timestamps. For exact count, a server RPC would be needed (out of scope for MVP; the web app does the same approximation).

### Step 5: Markdown styles (`src/utils/markdown-styles.ts`)

Configure `@ronradtke/react-native-markdown-display` styles matching UI_SPEC design tokens:

```typescript
import { StyleSheet, Platform } from "react-native";

export const markdownStyles = StyleSheet.create({
  body: {
    color: "#1A1A1A",
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: "#F0F0F0",
    color: "#1A1A1A",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: "#1E1E1E",
    color: "#D4D4D4",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 13,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  th: {
    padding: 8,
    fontWeight: "600",
    backgroundColor: "#F7F7F8",
  },
  td: {
    padding: 8,
  },
  link: {
    color: "#0084FF",
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#E5E7EB",
    paddingLeft: 12,
    marginLeft: 0,
    color: "#6B7280",
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  image: {
    borderRadius: 8,
  },
  strong: {
    fontWeight: "700",
  },
  em: {
    fontStyle: "italic",
  },
});
```

### Step 6: API interceptor (`src/lib/api-interceptor.ts`)

Global error handling for Supabase responses. Wraps the supabase client to handle 401 auto-logout:

```typescript
import { useAuthStore } from "../stores/auth-store";
import * as SecureStore from "expo-secure-store";

export async function handleApiError(error: any): Promise<never> {
  // Auto-logout on 401
  if (error?.status === 401 || error?.message?.includes("JWT expired")) {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("user_id");
    useAuthStore.getState().clearSession();
  }
  throw error;
}

export function setupGlobalErrorHandler() {
  // TanStack Query global error handler
  return {
    onError: (error: any) => {
      if (error?.status === 401) {
        handleApiError(error);
      }
    },
  };
}
```

### Step 7: Message grouping utility

Helper to determine if messages need date separators or sender grouping:

```typescript
// Add to src/utils/format-time.ts or new file src/utils/message-grouping.ts

import type { MessageWithSender } from "../types/api-types";

export interface GroupedMessage extends MessageWithSender {
  showDateSeparator: boolean;
  showSenderInfo: boolean;
  dateSeparatorLabel?: string;
}

export function groupMessages(
  messages: MessageWithSender[],
  currentUserId: string
): GroupedMessage[] {
  return messages.map((message, index) => {
    const previousMessage = messages[index + 1]; // inverted list: index+1 = older
    const showDateSeparator =
      !previousMessage || !isSameDay(message.created_at, previousMessage.created_at);

    const showSenderInfo =
      message.user_id !== currentUserId &&
      (!previousMessage ||
        previousMessage.user_id !== message.user_id ||
        showDateSeparator);

    return {
      ...message,
      showDateSeparator,
      showSenderInfo,
      dateSeparatorLabel: showDateSeparator
        ? formatDateSeparator(message.created_at)
        : undefined,
    };
  });
}
```

## Todo List

- [x] Create `src/constants/app.ts` with all app-wide constants
- [x] Implement `src/utils/format-time.ts` (conversation time, message time, date separators)
- [x] Implement `src/utils/avatar.ts` (hash color, initials)
- [x] Implement `src/utils/unread.ts` (unread count from timestamps)
- [x] Implement `src/utils/markdown-styles.ts` (full markdown theme matching design system)
- [x] Implement `src/lib/api-interceptor.ts` (401 handler, auto-logout)
- [x] Implement message grouping utility (date separators, sender grouping)
- [x] Verify markdown styles render correctly with code blocks, tables, lists

## Success Criteria

- Timestamps display correctly: "5m ago", "3:45 PM", "Yesterday", "Mar 16"
- Avatar initials + colors are deterministic (same name = same color)
- Markdown renders with proper code block styling (dark bg, mono font)
- 401 error triggers session clear and redirect to login
- Date separators appear between messages from different days
- Sender info groups consecutive messages from same user

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Markdown table rendering on small screens | Wrap table in horizontal ScrollView |
| date-fns bundle size | Import only needed functions (tree-shakeable) |
