# Codebase Summary

**Project:** Agent Playground Mobile
**Stack:** React Native (Expo SDK 55) + TypeScript + Supabase
**Version:** 1.0.0
**Last Updated:** 2026-03-17
**Total Files:** 83 source files
**Total Tokens (src/):** ~50,000 tokens

---

## 1. Architecture Overview

This is a React Native mobile app (iOS/Android via Expo) that serves as a companion to the Agent Playground web platform. The app enables real-time chat with AI agents using a **shared Supabase backend** (PostgreSQL + Realtime + Auth + Storage + Edge Functions).

### Core Design Principles
- **No new backend** — Reuses existing Supabase instance
- **Real-time first** — Supabase Realtime for messages, typing, presence
- **Token-based auth** — 64-char pre-provisioned tokens exchanged for JWT
- **Modular components** — Reusable UI components via NativeWind + React Native
- **State management** — Zustand for global state (auth, typing, presence)
- **Data fetching** — TanStack Query v5 for API calls and caching

---

## 2. Directory Structure

```
agent-playground-mobile/
├── src/
│   ├── app.tsx                    # Entry point
│   ├── types/
│   │   ├── api-types.ts          # API request/response types
│   │   ├── database.ts           # Database entity types (Supabase schema)
│   │   └── navigation.ts         # React Navigation types
│   ├── constants/
│   │   └── app.ts               # App-wide constants (timeout, limits, etc)
│   ├── api/
│   │   ├── auth-api.ts          # Login, token exchange
│   │   ├── messages-api.ts      # Message CRUD + pagination
│   │   ├── conversations-api.ts # Conversation list, members
│   │   ├── reactions-api.ts     # Emoji reactions
│   │   ├── storage-api.ts       # File/image upload to Storage
│   │   ├── admin-users-api.ts   # Admin: user management
│   │   └── webhook-logs-api.ts  # Admin: webhook logs
│   ├── providers/
│   │   └── app-providers.tsx    # TanStack Query + Zustand setup
│   ├── stores/
│   │   ├── auth-store.ts        # JWT, user info, logout
│   │   ├── typing-store.ts      # Typing indicators state
│   │   └── presence-store.ts    # Online presence state
│   ├── navigation/
│   │   ├── root-navigator.tsx   # App-wide auth check & tab routing
│   │   ├── auth-stack.tsx       # S-01 Login
│   │   ├── chat-stack.tsx       # S-02, S-03, S-04, S-07, S-08
│   │   └── admin-stack.tsx      # S-05, S-06 (admin-only)
│   ├── screens/
│   │   ├── auth/
│   │   │   └── login-screen.tsx               # S-01: Token login
│   │   ├── chat/
│   │   │   ├── conversation-list-screen.tsx  # S-02: List all conversations
│   │   │   ├── dm-chat-screen.tsx            # S-03: 1-on-1 chat
│   │   │   ├── group-chat-screen.tsx         # S-04: Multi-user chat
│   │   │   ├── image-viewer-screen.tsx       # S-07: Fullscreen image
│   │   │   └── conversation-info-screen.tsx  # S-08: Members + leave
│   │   └── admin/
│   │       ├── admin-users-screen.tsx        # S-05: User management
│   │       └── webhook-logs-screen.tsx       # S-06: Webhook logs
│   ├── components/
│   │   ├── ui/
│   │   │   ├── avatar.tsx          # User/agent avatar with initials fallback
│   │   │   ├── badge.tsx           # Role/status badges
│   │   │   ├── presence-dot.tsx    # Online/offline indicator
│   │   │   ├── loading-spinner.tsx # Activity indicator
│   │   │   └── empty-state.tsx     # Empty list placeholder
│   │   ├── chat/
│   │   │   ├── message-list.tsx           # FlashList for message rendering
│   │   │   ├── human-message-bubble.tsx   # User message (blue, right)
│   │   │   ├── agent-message-bubble.tsx   # Agent message (gray, left, markdown)
│   │   │   ├── agent-thinking-bubble.tsx  # Pending webhook indicator
│   │   │   ├── message-input-bar.tsx      # Text input + attachment button
│   │   │   ├── typing-indicator.tsx       # "Name is typing..." animation
│   │   │   ├── mention-autocomplete.tsx   # @mention dropdown
│   │   │   ├── file-preview.tsx           # File attachment preview
│   │   │   ├── image-preview.tsx          # Inline image + tap-to-enlarge
│   │   │   ├── reaction-badge.tsx         # Emoji reaction count
│   │   │   ├── upload-progress-bar.tsx    # File upload progress
│   │   │   └── date-separator.tsx         # Date divider between messages
│   │   ├── conversation/
│   │   │   ├── conversation-item.tsx  # Conversation list row
│   │   │   └── member-list-item.tsx   # Member in conversation info
│   │   └── admin/
│   │       ├── role-badge.tsx            # Admin/User/Agent badge
│   │       ├── user-list-item.tsx        # User row (searchable)
│   │       ├── create-user-modal.tsx     # Create user form
│   │       ├── webhook-filter-bar.tsx    # Filter webhook logs
│   │       └── webhook-log-item.tsx      # Webhook log row
│   └── utils/
│       ├── message-grouping.ts      # Group messages by sender for compact display
│       ├── file-helpers.ts          # File type checking, size validation
│       ├── image-compressor.ts      # Compress images before upload
│       ├── mention-parser.ts        # Parse @mentions from message text
│       ├── avatar.ts                # Generate avatar colors by hash
│       ├── format-time.ts           # Format timestamps (Today, Yesterday, etc)
│       ├── unread.ts                # Calculate unread badges
│       └── markdown-styles.ts       # Custom Markdown component styling
├── tailwind.config.js              # NativeWind Tailwind config (colors, fonts, spacing)
├── nativewind/
│   └── input.css                   # Global NativeWind styles
├── app.json                        # Expo config (app name, version, icon)
├── package.json                    # Dependencies (Expo, React Native, TanStack Query, etc)
├── tsconfig.json                   # TypeScript config
├── docs/
│   ├── SRD.md                      # System Requirement Definition (22 FRs, 8 screens)
│   ├── UI_SPEC.md                  # Design system + screen mockups
│   ├── API_SPEC.md                 # Supabase API endpoints + Realtime channels
│   └── DB_DESIGN.md                # Database schema (9 entities, shared with web)
├── prototypes/
│   ├── *.html                      # HTML mockups for each screen (S-01 to S-08)
│   ├── components.css              # Shared CSS for prototypes
│   └── interactions.js             # Prototype interaction logic
└── plans/
    └── 260317-agent-playground-mobile/
        ├── plan.md                 # Overview
        ├── phase-01-project-setup/
        ├── phase-02-core-data-layer/
        ├── phase-03-core-ui/
        ├── phase-04-rich-features/
        ├── phase-05-notifications-admin/
        └── COMPLETION-REPORT.md
```

---

## 3. Key Components

### 3.1 API Layer (`src/api/`)

All API interactions go through modular files that handle Supabase REST/RPC calls:

| File | Exports | Endpoints |
|------|---------|-----------|
| `auth-api.ts` | `loginWithToken()` | `POST /rpc/login_with_token` |
| `messages-api.ts` | `sendMessage()`, `fetchMessages()`, `subscribeToMessages()` | `POST/GET /rest/v1/messages` |
| `conversations-api.ts` | `fetchConversations()`, `getConversationMembers()` | `GET /rest/v1/conversations`, `GET /rest/v1/conversation_members` |
| `reactions-api.ts` | `addReaction()`, `removeReaction()` | `POST/DELETE /rest/v1/reactions` |
| `storage-api.ts` | `uploadFile()`, `uploadImage()`, `getSignedUrl()` | `POST/GET /storage/v1/object/*` |
| `admin-users-api.ts` | `fetchUsers()`, `createUser()`, `updateUser()` | `GET/POST/PATCH /rest/v1/users` |
| `webhook-logs-api.ts` | `fetchWebhookLogs()` | `GET /rest/v1/webhook_delivery_logs` |

All use **TanStack Query v5** for caching and background refetch.

### 3.2 State Management (`src/stores/`)

**Zustand** stores for client-side state:

| Store | Purpose | Key State |
|-------|---------|-----------|
| `auth-store.ts` | JWT + user info | `jwt`, `userId`, `user`, `isAuthenticated`, `logout()` |
| `typing-store.ts` | Typing indicators | `typingUsers` (map by conversationId), `setTyping()`, `clearTyping()` |
| `presence-store.ts` | Online presence | `onlineUsers` (set of user IDs), `addPresence()`, `removePresence()` |

### 3.3 Navigation (`src/navigation/`)

Hierarchical React Navigation structure:

```
RootNavigator
├─ AuthStack (when !isAuthenticated)
│  └─ LoginScreen (S-01)
└─ MainTabs (when isAuthenticated)
   ├─ ChatStack (visible to all)
   │  ├─ ConversationListScreen (S-02)
   │  ├─ DMChatScreen (S-03)
   │  ├─ GroupChatScreen (S-04)
   │  ├─ ImageViewerScreen (S-07)
   │  └─ ConversationInfoScreen (S-08)
   └─ AdminStack (visible to admins only)
      ├─ AdminUsersScreen (S-05)
      └─ WebhookLogsScreen (S-06)
```

### 3.4 Realtime Subscriptions

Three types of Supabase Realtime channels:

1. **postgres_changes** — New messages inserted: `messages:conversation_id=eq.{id}`
2. **presence** — Online/offline status: `presence:{conversationId}`
3. **broadcast** — Typing indicators: `typing:{conversationId}`

Each screen sets up listeners in `useEffect()` and cleans up on unmount.

### 3.5 Component Patterns

#### Message Bubbles
- **User message** (`human-message-bubble.tsx`) — Right-aligned, blue background, white text
- **Agent message** (`agent-message-bubble.tsx`) — Left-aligned, gray background, markdown content
- **System message** — Centered, gray text (no bubble)
- **Thinking indicator** (`agent-thinking-bubble.tsx`) — Animated dots while webhook pending

#### Input Bar (`message-input-bar.tsx`)
- Auto-growing textarea (1-4 lines)
- Attachment button (document picker)
- Send button (disabled when empty)
- Keyboard-aware scrolling via `react-native-screens`

#### Lists
- **Conversation list** — `FlashList` for fast scrolling, pull-to-refresh
- **Message list** — `FlashList` with pagination, infinite scroll up
- **User list** — Searchable with role badges

---

## 4. Type System (`src/types/`)

### database.ts
TypeScript interfaces matching Supabase schema (9 entities):

```typescript
User
ConversationMember
Conversation
Message
Reaction
MessageReaction (join table)
WebhookDeliveryLog
(+ 2 others from shared schema)
```

### api-types.ts
Request/response shapes for Supabase APIs:

```typescript
LoginResponse { user_id, access_token, refresh_token, expires_in, user }
MessageWithAuthor { id, content, created_at, sender, is_agent, ... }
ConversationWithMeta { id, name, last_message_preview, unread_count, ... }
```

### navigation.ts
React Navigation types for type-safe routing:

```typescript
type RootStackParamList = {
  AuthStack: undefined,
  MainTabs: undefined,
  ChatStack: { initialRoute: string },
  ...
}
```

---

## 5. Styling & Design Tokens

### Tailwind Config (`tailwind.config.js`)

Custom color palette (extracted from ChatGPT + Claude design):

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#0084FF` | Links, send button, user messages |
| `surface` | `#F7F7F8` | Conversation items, input bar |
| `agent-bubble` | `#F0F0F0` | Agent message background |
| `user-bubble` | `#0084FF` | User message background |
| `text-primary` | `#1A1A1A` | Main text |
| `success` | `#10B981` | Online presence |
| `error` | `#EF4444` | Failed status, destructive actions |

### Font System
- **Sans:** Inter (for UI text)
- **Mono:** JetBrains Mono (for code blocks)

### Spacing Scale
- `xs: 4px`, `sm: 8px`, `md: 12px`, `lg: 16px`, `xl: 24px`, `2xl: 32px`

### Border Radius
- `bubble: 18px` (message bubbles)
- `full: 9999px` (avatars, badges)

---

## 6. Data Flow

### Authentication Flow
1. **User enters token** on S-01 Login
2. **POST /rpc/login_with_token** → Get JWT + user info
3. **Store JWT** in `expo-secure-store` (encrypted, platform-specific)
4. **Set auth-store.jwt** → Triggers nav to MainTabs
5. **Auto-logout** on 24h expiry or invalid token

### Message Flow (Real-time)
1. **User types message** in S-03/S-04
2. **POST /rest/v1/messages** → Insert to Supabase
3. **Realtime listener** receives `postgres_changes` INSERT event
4. **Update TanStack Query cache** → Message appears in list
5. **Auto-scroll** to bottom if user near bottom

### Presence Flow
1. **App foreground** → Subscribe to `presence:{conversationId}` channel
2. **Send presence event** (user joins)
3. **Receive presence sync** → `onlineUsers` store updated
4. **Presence dot** shows green (online) or gray (offline)
5. **App background** → Presence channel cleanup

### File Upload Flow
1. **User selects file** via `expo-image-picker` or `expo-document-picker`
2. **Compress if image** (`image-compressor.ts`)
3. **Upload to Storage** → `POST /storage/v1/object/attachments/{path}`
4. **Get signed URL** (public link)
5. **Create message** with `attachment_url` field
6. **Preview rendered** via `file-preview.tsx` or `image-preview.tsx`

---

## 7. Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~55.0.6 | React Native framework |
| `react-native` | 0.83.2 | Core mobile framework |
| `@supabase/supabase-js` | ^2.99.2 | Supabase client (REST, Realtime, Auth, Storage) |
| `@tanstack/react-query` | ^5.90.21 | Data fetching, caching, background sync |
| `zustand` | ^5.0.12 | State management (lightweight alternative to Redux) |
| `@react-navigation/*` | ^7.x | Navigation (stack, tabs, native-stack) |
| `nativewind` | ^4.2.3 | Tailwind CSS for React Native |
| `tailwindcss` | ^3.4.19 | Styling framework |
| `@shopify/flash-list` | ^1.8.3 | Performant list rendering (vs FlatList) |
| `react-native-reanimated` | 4.2.1 | Smooth animations |
| `expo-image-manipulator` | ~55.0.10 | Image compression |
| `expo-notifications` | ~55.0.12 | Push notifications |
| `date-fns` | ^4.1.0 | Date formatting utilities |

---

## 8. Build & Deployment

### Scripts
```bash
npm start          # Start Expo dev server
npm run ios        # Launch iOS simulator
npm run android    # Launch Android emulator
npm run web        # Start web version
```

### Environment Setup
1. **Supabase credentials** → `.env` (SUPABASE_URL, SUPABASE_ANON_KEY)
2. **Build:** `eas build` (Expo Application Services)
3. **Deploy:** `eas submit` to App Store / Google Play

---

## 9. Testing & Quality

### Manual Testing Stages
- **Phase 1 (Core Chat):** Login, conversation list, messaging, real-time
- **Phase 2 (Rich Features):** Group chat, @mentions, file uploads, reactions, typing, presence
- **Phase 3 (Admin):** User management, webhook logs, push notifications

### Code Quality
- **TypeScript strict mode** — No implicit `any`
- **ESLint** — React Native + React Hooks rules
- **Manual code reviews** — Per PR (see `plans/reports/code-review-*.md`)

---

## 10. Development Notes

### Common Pitfalls to Avoid
1. **Keyboard handling** — Always wrap inputs in `KeyboardAvoidingView` or `react-native-screens`
2. **List performance** — Use `FlashList` instead of `FlatList` for better rendering
3. **Realtime cleanup** — Always unsubscribe from channels in `useEffect` cleanup
4. **Image size** — Compress before upload to avoid exceeding 10MB limit
5. **Presence sync** — Handle offline scenarios gracefully (show "offline" instead of crashing)

### File Size Limits
- **Images:** Auto-compress if >2MB, upload max 10MB
- **Files:** Max 10MB per attachment

### API Timeout
- Default: 10 seconds
- Webhook pending: 30-second timeout before showing "Agent offline" message

---

## 11. Next Steps (Future Phases)

- [ ] End-to-end encryption for messages
- [ ] Message search across conversations
- [ ] Voice message recording + playback
- [ ] Offline message queue (send when back online)
- [ ] Dark mode support
- [ ] Biometric authentication (Face ID / Fingerprint)
- [ ] Analytics integration
