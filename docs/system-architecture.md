# System Architecture

**Project:** Agent Playground Mobile
**Version:** 1.0.0
**Last Updated:** 2026-03-17
**Type:** React Native (Expo) Mobile App

Comprehensive system architecture documentation for the Agent Playground Mobile app, including backend infrastructure, authentication flow, real-time messaging, and data synchronization.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   React Native (Expo) App                   │
│  (iOS/Android via Expo SDK 55, React 19, React Native 0.83) │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    REST API         Realtime Channels   Auth
    (TanStack Query)  (Supabase)        (JWT)
          │                │                │
          └────────────────┼────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │   Supabase Backend (Shared)     │
          │  ┌──────────────────────────┐   │
          │  │ PostgreSQL Database      │   │
          │  │ (Users, Messages, etc)   │   │
          │  └──────────────────────────┘   │
          │  ┌──────────────────────────┐   │
          │  │ Realtime (WebSocket)     │   │
          │  │ (Presence, Typing, Msgs) │   │
          │  └──────────────────────────┘   │
          │  ┌──────────────────────────┐   │
          │  │ Auth (JWT Tokens)        │   │
          │  │ (User Sessions)          │   │
          │  └──────────────────────────┘   │
          │  ┌──────────────────────────┐   │
          │  │ Storage (File Upload)    │   │
          │  │ (Images, Attachments)    │   │
          │  └──────────────────────────┘   │
          │  ┌──────────────────────────┐   │
          │  │ Edge Functions (Optional)│   │
          │  │ (Webhooks, Push Notifs)  │   │
          │  └──────────────────────────┘   │
          └─────────────────────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │    External Services (Optional) │
          │  ┌──────────────────────────┐   │
          │  │ Push Notification Service│   │
          │  │ (Expo Notifications)     │   │
          │  └──────────────────────────┘   │
          │  ┌──────────────────────────┐   │
          │  │ AI Agent Webhooks        │   │
          │  │ (External Agent APIs)    │   │
          │  └──────────────────────────┘   │
          └─────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend (Mobile)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Expo | ~55.0.6 | React Native framework for iOS/Android |
| **Language** | React Native | 0.83.2 | Cross-platform mobile development |
| **UI Framework** | React | 19.2.0 | Component library |
| **Styling** | NativeWind v4 + Tailwind CSS | 4.2.3 + 3.4.19 | Utility-first styling |
| **Type Safety** | TypeScript | ~5.9.2 | Static type checking |
| **Navigation** | React Navigation | ^7.x | Screen routing and stacks |
| **State Management** | Zustand | ^5.0.12 | Global client state (auth, typing, presence) |
| **Data Fetching** | TanStack Query | ^5.90.21 | API caching, background sync, pagination |
| **List Rendering** | FlashList | ^1.8.3 | High-performance list component |
| **Realtime** | Supabase Realtime | (built-in) | WebSocket subscriptions |

### Backend (Shared)
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | PostgreSQL | Relational data (users, messages, conversations) |
| **Auth** | Supabase Auth (JWT) | User authentication and session management |
| **REST API** | PostgREST | Auto-generated REST endpoints from PostgreSQL |
| **Realtime** | Supabase Realtime (WebSocket) | Live message updates, presence, typing |
| **Storage** | Supabase Storage | File/image upload and serving |
| **Edge Functions** | Supabase Functions (optional) | Serverless functions for webhooks, push notifications |

### Utilities
| Library | Version | Purpose |
|---------|---------|---------|
| **Image Manipulation** | expo-image-manipulator | Image compression before upload |
| **Image Picker** | expo-image-picker | Camera and gallery access |
| **Document Picker** | expo-document-picker | File selection |
| **Clipboard** | expo-clipboard | Paste token from clipboard |
| **Secure Store** | expo-secure-store | Encrypted JWT storage |
| **Notifications** | expo-notifications | Push notifications |
| **Date Formatting** | date-fns | Human-readable timestamps |
| **Markdown** | react-native-markdown-display | Render markdown in messages |

---

## 3. Authentication Flow

### 3.1 Token-Based Authentication

The app uses **pre-provisioned 64-character tokens** for login (no username/password):

```
┌──────────────┐
│   User       │  Enter 64-char token
│   (Mobile)   │ (from invite email)
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────┐
│ S-01: Login Screen                 │
│ ✓ Token input field                │
│ ✓ Auto-paste from clipboard        │
│ ✓ Validate format (64 chars)       │
└──────┬───────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ POST /rpc/login_with_token         │
│ { p_token: "abc...64-chars" }      │
└──────┬───────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Supabase Response                  │
│ {                                  │
│   access_token: "eyJhbGci...",    │
│   refresh_token: "v1.abc...",     │
│   expires_in: 86400,               │
│   user: { id, username, ... }     │
│ }                                  │
└──────┬───────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Client-Side Storage                │
│ ✓ JWT → expo-secure-store          │
│ ✓ User info → Zustand store        │
│ ✓ Set auth-store.jwt               │
└──────┬───────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Navigation Check                   │
│ isAuthenticated = true             │
│ → Show MainTabs                    │
│ → Hide AuthStack                   │
└────────────────────────────────────┘
```

### 3.2 Session Persistence

On app launch:

```
App Start
   │
   ▼
RootNavigator → useEffect
   │
   ▼
Check expo-secure-store for JWT
   │
   ├─ Found JWT → Restore to Zustand
   │    ▼
   │    POST /rest/v1/users?id=eq.{userId}
   │    ▼
   │    Valid user → Show MainTabs
   │
   └─ No JWT Found → Show AuthStack (Login)
```

### 3.3 Logout Flow

```
User presses Logout
   │
   ▼
auth-store.logout()
   │
   ├─ Clear JWT from state
   ├─ Clear JWT from expo-secure-store
   ├─ Clear user info
   │
   ▼
RootNavigator detects isAuthenticated = false
   │
   ▼
Show S-01 Login Screen
```

### 3.4 Token Expiry

- **JWT Expiry:** 24 hours (set on server)
- **Handling:** If API returns 401, show login screen
- **Refresh Token:** Supabase provides, but not used in MVP (user re-enters token)

---

## 4. Real-Time Architecture

### 4.1 Realtime Channels

The app uses three types of Supabase Realtime channels:

#### Channel 1: postgres_changes (Messages)
**Purpose:** New messages appear instantly

```
Subscribe: messages:conversation_id=eq.{conversationId}
Event Type: INSERT
Schema: public
Table: messages

When triggered:
  ├─ New message inserted in DB
  ├─ Supabase broadcasts INSERT event
  ├─ App receives payload
  ├─ TanStack Query cache updated
  └─ Message list re-renders
```

**Subscription Setup:**
```typescript
const unsubscribe = supabase
  .channel(`messages:conversation_id=eq.${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
  }, (payload) => {
    // Update TanStack Query cache with new message
    queryClient.setQueryData(['messages', conversationId], (old) => [
      ...old,
      payload.new,
    ]);
  })
  .subscribe();
```

#### Channel 2: presence (Online Status)
**Purpose:** Show who's online/offline

```
Subscribe: presence:{conversationId}
Event Type: SYNC, JOIN, LEAVE

State:
  presence_store.onlineUsers = Set<userId>

When triggered:
  ├─ User joins conversation
  │  └─ SYNC event: List of online users
  │  └─ JOIN event: User appears online
  │
  ├─ User leaves conversation
  │  └─ LEAVE event: User goes offline
  │
  └─ Presence dot updates (green/gray)
```

**Subscription Setup:**
```typescript
const channel = supabase
  .channel(`presence:${conversationId}`, {
    config: { broadcast: { self: true } },
  })
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const onlineUserIds = Object.keys(state).map(uid => uid);
    presence_store.setOnlineUsers(onlineUserIds);
  })
  .on('presence', { event: 'join' }, ({ key }) => {
    presence_store.addPresence(key);
  })
  .on('presence', { event: 'leave' }, ({ key }) => {
    presence_store.removePresence(key);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: userId });
    }
  });
```

#### Channel 3: broadcast (Typing Indicators)
**Purpose:** Show "[Name] is typing..."

```
Subscribe: typing:{conversationId}
Event Type: Broadcast (client-initiated)

State:
  typing_store.typingUsers = {
    [userId]: { name, startedAt }
  }

When triggered:
  ├─ User starts typing → Send broadcast
  │  Event: { user_id, username, isTyping: true }
  │
  ├─ Debounce 3 seconds (prevent spam)
  │
  └─ Typing indicator updates in real-time
```

**Subscription Setup:**
```typescript
const channel = supabase.channel(`typing:${conversationId}`);

channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
  if (payload.isTyping) {
    typing_store.setTyping(payload.user_id, payload.username);
    // Auto-clear after 5 seconds
    setTimeout(() => typing_store.clearTyping(payload.user_id), 5000);
  } else {
    typing_store.clearTyping(payload.user_id);
  }
});

channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    // Ready to broadcast
  }
});

// Send typing event (debounced)
const handleTextChange = debounce(() => {
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { user_id: userId, username, isTyping: true },
  });
}, 300);
```

### 4.2 Realtime Subscription Lifecycle

For each screen that displays messages:

```
useEffect(() => {
  // 1. Subscribe to channels
  const unsubscribe1 = subscribeToMessages(conversationId, handleNewMessage);
  const unsubscribe2 = subscribeToPresence(conversationId);
  const unsubscribe3 = subscribeToTyping(conversationId);

  // 2. Cleanup on unmount
  return () => {
    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
  };
}, [conversationId]);
```

---

## 5. Data Synchronization

### 5.1 Message Flow

```
User Types Message
   │
   ▼
handleSendMessage()
   │
   ├─ Validate (not empty)
   ├─ Set isLoading = true
   │
   ▼
POST /rest/v1/messages
{
  conversation_id: uuid,
  content: string,
  attachment_url?: string,
  created_at: ISO timestamp
}
   │
   ├─ API Response: 200 { id, created_at, ... }
   │
   ▼
Update TanStack Query Cache
   ├─ Add message to ['messages', conversationId]
   │
   ▼
Realtime Event Arrives (INSERT)
   ├─ Cache already has message
   ├─ No duplicate (same ID)
   │
   ▼
Message Renders in List
   ├─ Auto-scroll to bottom
   │
   ▼
Set isLoading = false
```

### 5.2 Unread Badge Update

```
User Opens Conversation (S-03/S-04)
   │
   ▼
useEffect → mark_conversation_read()
   │
   ├─ POST /rpc/mark_conversation_read
   │  { conversation_id: uuid }
   │
   ├─ Update: conversation_members.last_read_at = now()
   │
   ▼
Realtime Event (UPDATE on conversation_members)
   │
   ▼
TanStack Query Update
   ├─ Update ['conversations'] cache
   ├─ Unread count recalculated
   │
   ▼
Conversation List Re-renders
   └─ Badge shows 0 for this conversation
```

### 5.3 File Upload Flow

```
User Selects File
   │
   ├─ Via expo-image-picker (photos) or expo-document-picker (files)
   │
   ▼
handleFileUpload()
   │
   ├─ Compress if image > 2MB
   │  └─ expo-image-manipulator
   │
   ├─ Validate size < 10MB
   │
   ▼
POST /storage/v1/object/attachments/{path}
   │
   ├─ Upload multipart form data
   ├─ Track upload progress
   │
   ▼
Storage Response: 200
   │
   ├─ File stored in Supabase Storage
   ├─ Public URL: {storageUrl}/attachments/{path}
   │
   ▼
POST /rest/v1/messages
{
  conversation_id,
  content,
  attachment_url: "{storageUrl}/attachments/{path}",
  file_name: "photo.jpg",
  file_size: 1024000
}
   │
   ▼
Realtime Event (INSERT)
   │
   ▼
Message with Attachment Renders
   ├─ Show file preview (image or doc icon)
   ├─ Tap to view fullscreen (images)
```

---

## 6. State Management Architecture

### 6.1 Global State (Zustand Stores)

```
auth-store (JWT, user info)
├─ jwt: string | null
├─ userId: string | null
├─ user: User | null
├─ setJwt(jwt, userId, user)
└─ logout()
    └─ Triggers navigation to AuthStack

typing-store (Who's typing)
├─ typingUsers: Map<userId, { name, timestamp }>
├─ setTyping(userId, username)
├─ clearTyping(userId)
└─ isTyping(conversationId)

presence-store (Who's online)
├─ onlineUsers: Set<userId>
├─ addPresence(userId)
├─ removePresence(userId)
└─ isOnline(userId)
```

### 6.2 Local State (React Hooks)

Each screen/component manages its own local state:

```
ChatScreen
├─ [messages, setMessages] = useState([])          // From TanStack Query
├─ [inputText, setInputText] = useState('')        // Local
├─ [isLoading, setIsLoading] = useState(false)     // Local
├─ [selectedMessage, setSelectedMessage] = useState(null)  // Local
└─ useQuery() → Fetches messages, handles caching

ConversationListScreen
├─ [conversations, setConversations] = useState([]) // From TanStack Query
├─ [isRefreshing, setIsRefreshing] = useState(false) // Local
└─ useQuery() → Fetches conversation list
```

### 6.3 Server State (TanStack Query)

```
useQuery({
  queryKey: ['messages', conversationId],
  queryFn: () => fetchMessages(conversationId),
  staleTime: 10 * 1000,           // 10 seconds
  cacheTime: 5 * 60 * 1000,       // 5 minutes
  keepPreviousData: true,         // Show old data while fetching
})

Cache Structure:
cache/
├─ ['messages', 'conv-123'] → Message[]
├─ ['conversations'] → Conversation[]
├─ ['users'] → User[]
└─ ['reactions', 'msg-456'] → Reaction[]
```

---

## 7. API Endpoints

### 7.1 REST API (PostgREST)

| Method | Endpoint | Purpose | Cache Key |
|--------|----------|---------|-----------|
| **POST** | `/rpc/login_with_token` | Login | (not cached) |
| **GET** | `/rest/v1/conversations` | List conversations | `['conversations']` |
| **GET** | `/rest/v1/messages` | Fetch messages (paginated) | `['messages', conversationId]` |
| **POST** | `/rest/v1/messages` | Send message | (auto-updated) |
| **GET** | `/rest/v1/conversation_members` | Get members | `['members', conversationId]` |
| **POST** | `/rpc/mark_conversation_read` | Mark as read | (auto-updated) |
| **POST** | `/rest/v1/reactions` | Add reaction | (auto-updated) |
| **DELETE** | `/rest/v1/reactions` | Remove reaction | (auto-updated) |
| **POST** | `/storage/v1/object/attachments/*` | Upload file | (not cached) |
| **GET** | `/storage/v1/object/sign/attachments/*` | Sign URL | (not cached) |

### 7.2 Realtime Subscriptions

| Channel | Type | Purpose |
|---------|------|---------|
| `messages:conversation_id=eq.{id}` | postgres_changes | New messages INSERT events |
| `presence:{conversationId}` | presence | Online/offline status |
| `typing:{conversationId}` | broadcast | Typing indicators |

---

## 8. Data Models

### 8.1 Core Entities

```typescript
// From Supabase (shared schema)
User {
  id: uuid
  username: string
  role: 'admin' | 'user' | 'agent'
  avatar_url?: string
  email?: string
  created_at: timestamp
}

Conversation {
  id: uuid
  name?: string
  is_group: boolean
  created_at: timestamp
  created_by_id: uuid
}

ConversationMember {
  id: uuid
  conversation_id: uuid
  user_id: uuid
  joined_at: timestamp
  last_read_at: timestamp
}

Message {
  id: uuid
  conversation_id: uuid
  sender_id: uuid
  content: text
  attachment_url?: string
  file_name?: string
  file_size?: integer
  created_at: timestamp
}

Reaction {
  id: uuid
  message_id: uuid
  user_id: uuid
  emoji: string
  created_at: timestamp
}

WebhookDeliveryLog {
  id: uuid
  agent_id: uuid
  conversation_id: uuid
  message_id: uuid
  status: 'pending' | 'delivered' | 'failed'
  latency_ms: integer
  created_at: timestamp
}
```

---

## 9. Error Handling

### 9.1 Network Errors

```typescript
try {
  const result = await fetchMessages(conversationId);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Show offline message
    Alert.alert('No internet connection');
  } else if (error.status === 401) {
    // JWT expired
    auth_store.logout();
  } else if (error.status === 403) {
    // Permission denied
    Alert.alert('You do not have access to this conversation');
  } else {
    // Generic error
    Alert.alert('Failed to load messages. Please try again.');
  }
}
```

### 9.2 Realtime Errors

```typescript
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    // Connected
  } else if (status === 'CHANNEL_ERROR') {
    // Realtime connection failed
    console.error('Realtime error');
    // Fallback: poll API
  } else if (status === 'CLOSED') {
    // Connection closed
    // Attempt reconnect
  }
});
```

---

## 10. Security & Privacy

### 10.1 JWT Storage

- **Platform:** expo-secure-store
- **Encryption:** Platform-specific (Keychain on iOS, Keystore on Android)
- **Expiry:** 24 hours (set by Supabase)
- **Refresh:** Not implemented (user re-enters token)

### 10.2 API Authentication

All requests include:
```
Authorization: Bearer {JWT}
apikey: {SUPABASE_ANON_KEY}
```

### 10.3 Row-Level Security (RLS)

Supabase RLS policies enforce:
- Users can only see conversations they're members of
- Users can only create messages in conversations they're members of
- Admins can view all users and webhook logs

### 10.4 File Upload Security

- Max file size: 10MB
- Allowed file types: Images, documents
- Storage path: `/attachments/{conversationId}/{messageId}/{filename}`
- Access: Private URLs with signed tokens

---

## 11. Scalability Considerations

### 11.1 Message Pagination

```
Initial Load: 30 messages
   │
   ├─ User scrolls up
   │
   ▼
When nearTop(offset < 100):
   ├─ Fetch older messages (30 more)
   ├─ Prepend to list
   ├─ Scroll position maintained
   │
   ▼
TanStack Query caches all loaded messages
```

### 11.2 Connection Pooling

Supabase manages connection pooling automatically. App handles:
- Max concurrent Realtime subscriptions: 10-20
- Cleanup subscriptions on screen unmount
- Debounce typing events (3 seconds)

### 11.3 Cache Strategy

```
staleTime: 10 * 1000        // Reuse cache for 10s
cacheTime: 5 * 60 * 1000    // Keep in memory for 5 min
gcTime: (same as cacheTime)
keepPreviousData: true      // Show old while fetching new
```

---

## 12. Deployment Architecture

### 12.1 Build Process

```
Source Code (GitHub)
   │
   ▼
Expo Prebuild
   ├─ Generate native iOS/Android code
   ├─ Install dependencies
   │
   ▼
Build
   ├─ eas build (Expo Application Services)
   ├─ iOS: .ipa file
   ├─ Android: .aab file
   │
   ▼
Sign & Certificate
   ├─ Apple Developer Certificate (iOS)
   ├─ Google Play Keystore (Android)
   │
   ▼
Submit
   └─ eas submit (App Store / Google Play)
```

### 12.2 Environment Setup

```
.env (not committed)
├─ SUPABASE_URL=https://xxx.supabase.co
├─ SUPABASE_ANON_KEY=eyJhbGci...
└─ (other configs)

app.json (committed)
├─ name, version, icon
├─ entryPoint: src/app.tsx
├─ plugins: [expo-notifications, ...]
└─ (other Expo configs)
```

---

## 13. Performance Optimization

### 13.1 Rendering Performance

| Optimization | Impact | Implementation |
|-------------|--------|---|
| **FlashList instead of FlatList** | 3-5x faster scrolling | `@shopify/flash-list` |
| **Message grouping** | Fewer re-renders | Group by sender, show avatar once |
| **Memoization** | Prevent unnecessary renders | `useMemo`, `useCallback` |
| **Lazy loading images** | Faster initial render | `expo-image` with `cachePolicy` |
| **Code splitting** | Smaller bundle | Separate stacks, lazy navigation |

### 13.2 Memory Management

- Clean up Realtime subscriptions on unmount
- Clear TanStack Query cache for old conversations
- Unload message pagination history (keep last 100)

---

## 14. Architecture Evolution

### Phase 1 (Current): MVP
- Basic chat + conversations
- Real-time messaging
- No offline support

### Phase 2 (Planned): Enhanced
- End-to-end encryption
- Message search
- Voice messages
- Offline queue

### Phase 3 (Future): Platform
- Dark mode
- Biometric auth
- Advanced analytics
- Native module extensions

---

## 15. Monitoring & Debugging

### 15.1 Logging

```typescript
// Dev environment
if (__DEV__) {
  console.log('Message received:', message);
}

// Production: Use error tracking
import * as Sentry from 'sentry-expo';
Sentry.init({ dsn: '...' });

Sentry.captureException(error);
```

### 15.2 Network Inspection

- **Flipper:** React Native debugging tool
- **Supabase Studio:** Real-time dashboard
- **Expo DevTools:** Built-in dev tools

---

## Summary Table

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Presentation** | React Native, NativeWind | UI components |
| **State** | Zustand, TanStack Query | Global + server state |
| **Navigation** | React Navigation | Screen routing |
| **API** | Supabase REST + Realtime | Data sync |
| **Backend** | PostgreSQL, PostgREST | Data persistence |
| **Auth** | JWT (expo-secure-store) | Session management |
| **Storage** | Supabase Storage | File/image hosting |
| **Notifications** | Expo Notifications | Push notifications |

---

## References

- [Supabase Docs](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [NativeWind](https://www.nativewind.dev/)
