# Interface Specification (API)

**Project:** Agent Playground Mobile
**Version:** 0.1.0
**Date:** 2026-03-17
**Backend:** Existing Supabase instance (shared with web app)
**Base URL:** `{SUPABASE_URL}` (environment variable)
**Auth Header:** `Authorization: Bearer {JWT}` + `apikey: {SUPABASE_ANON_KEY}`

---

## 1. Endpoint Matrix

| Method | URL | Feature (FR-xx) | Screen (S-xx) | Phase |
|--------|-----|-----------------|---------------|-------|
| POST | `/rpc/login_with_token` | FR-01 | S-01 | 1 |
| GET | `/rest/v1/users?id=eq.{id}` | FR-02 | S-01 | 1 |
| GET | `/rest/v1/conversations` | FR-03, FR-04 | S-02 | 1 |
| GET | `/rest/v1/conversation_members` | FR-03, FR-11 | S-02, S-04, S-08 | 1 |
| GET | `/rest/v1/messages` | FR-05, FR-09 | S-03, S-04 | 1 |
| POST | `/rest/v1/messages` | FR-05, FR-08 | S-03, S-04 | 1 |
| POST | `/rpc/mark_conversation_read` | FR-17 | S-03, S-04 | 2 |
| POST | `/storage/v1/object/attachments/{path}` | FR-12, FR-13 | S-03, S-04 | 2 |
| GET | `/storage/v1/object/sign/attachments/{path}` | FR-12, FR-13 | S-03, S-04, S-07 | 2 |
| POST | `/rest/v1/reactions` | FR-15 | S-03, S-04 | 2 |
| DELETE | `/rest/v1/reactions?id=eq.{id}` | FR-15 | S-03, S-04 | 2 |
| GET | `/rest/v1/users` | FR-20 | S-05 | 3 |
| POST | `/rest/v1/users` | FR-21 | S-05 | 3 |
| PATCH | `/rest/v1/users?id=eq.{id}` | FR-20 | S-05 | 3 |
| GET | `/rest/v1/webhook_delivery_logs` | FR-22 | S-06 | 3 |

### Realtime Subscriptions

| Channel | Type | Feature (FR-xx) | Screen (S-xx) | Phase |
|---------|------|-----------------|---------------|-------|
| `messages:conversation_id=eq.{id}` | postgres_changes (INSERT) | FR-06 | S-03, S-04 | 1 |
| `presence:{conversationId}` | presence (sync/join/leave) | FR-16 | S-02 | 2 |
| `typing:{conversationId}` | broadcast | FR-14 | S-03, S-04 | 2 |

---

## 2. Endpoint Details

### Phase 1 — Core Chat

---

#### POST `/rpc/login_with_token`

**Description:** Exchange provisioned token for JWT session. (FR-01, S-01)

**Auth:** None (public RPC)

**Request:**
```json
{
  "p_token": "a1b2c3d4...64-character-token"
}
```

**Response (200):**
```json
{
  "user_id": "uuid",
  "access_token": "eyJhbGci...",
  "refresh_token": "v1.abc...",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "username": "Alice",
    "email": "alice@example.com",
    "role": "user",
    "avatar_url": "avatars/uuid/photo.jpg"
  }
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| 401 | `{ "error": "Invalid token" }` | Token not found or expired |
| 429 | `{ "error": "Too many attempts" }` | Rate limit (5 attempts/min) |

**Mobile Implementation:**
1. Call endpoint with token from input
2. Store `access_token` in expo-secure-store
3. Store `user` in Zustand for UI display
4. Set `Authorization` header for all subsequent requests
5. Navigate to S-02

---

#### GET `/rest/v1/conversations`

**Description:** Fetch user's conversations with last message and unread count. (FR-03, FR-04, S-02)

**Auth:** Bearer JWT

**Query Parameters:**
```
select=*,
  conversation_members!inner(user_id,last_read_at),
  messages(id,content,content_type,user_id,created_at)
&conversation_members.user_id=eq.{currentUserId}
&conversation_members.deleted_at=is.null
&messages.order=created_at.desc
&messages.limit=1
&order=last_message_created_at.desc.nullslast
&limit=50
```

**Response (200):**
```json
[
  {
    "id": "conv-uuid-1",
    "type": "dm",
    "name": null,
    "description": null,
    "last_message_created_at": "2026-03-17T10:30:00Z",
    "created_at": "2026-03-15T08:00:00Z",
    "conversation_members": [
      {
        "user_id": "current-user-uuid",
        "last_read_at": "2026-03-17T10:25:00Z"
      }
    ],
    "messages": [
      {
        "id": "msg-uuid",
        "content": "Here's the analysis...",
        "content_type": "text",
        "user_id": "agent-uuid",
        "created_at": "2026-03-17T10:30:00Z"
      }
    ]
  }
]
```

**Mobile Implementation:**
1. Fetch on screen mount and pull-to-refresh
2. Calculate unread count client-side: count messages where `created_at > last_read_at`
3. For DM: fetch other member's user info for display name/avatar
4. Cache with TanStack Query (staleTime: 30s)

---

#### GET `/rest/v1/conversation_members`

**Description:** Fetch members of a conversation with user details. (FR-03, FR-11, S-02, S-04, S-08)

**Auth:** Bearer JWT

**Query Parameters:**
```
select=*,users(id,username,avatar_url,role)
&conversation_id=eq.{conversationId}
&deleted_at=is.null
```

**Response (200):**
```json
[
  {
    "id": "cm-uuid",
    "conversation_id": "conv-uuid",
    "user_id": "user-uuid",
    "role": "admin",
    "last_read_at": "2026-03-17T10:25:00Z",
    "users": {
      "id": "user-uuid",
      "username": "Alice",
      "avatar_url": "avatars/uuid/photo.jpg",
      "role": "user"
    }
  }
]
```

**Mobile Usage:**
- S-02: Get other member name/avatar for DM display
- S-04: Member list for @mention autocomplete
- S-08: Conversation info member list

---

#### GET `/rest/v1/messages`

**Description:** Fetch paginated messages for a conversation with sender info and reactions. (FR-05, FR-07, FR-09, S-03, S-04)

**Auth:** Bearer JWT

**Query Parameters:**
```
select=*,
  users!messages_user_id_fkey(id,username,avatar_url,role),
  reactions(id,emoji,user_id),
  attachments(id,file_name,file_size,file_type,storage_path)
&conversation_id=eq.{conversationId}
&created_at=lt.{cursor}          -- pagination: older than cursor
&order=created_at.desc
&limit=30
```

**Response (200):**
```json
[
  {
    "id": "msg-uuid-1",
    "conversation_id": "conv-uuid",
    "user_id": "agent-uuid",
    "content": "Here's the analysis:\n\n```python\ndef hello():\n    return 'world'\n```",
    "content_type": "text",
    "metadata": null,
    "created_at": "2026-03-17T10:30:00Z",
    "updated_at": "2026-03-17T10:30:00Z",
    "users": {
      "id": "agent-uuid",
      "username": "Agent-1",
      "avatar_url": null,
      "role": "agent"
    },
    "reactions": [
      { "id": "react-uuid", "emoji": "❤️", "user_id": "user-uuid" }
    ],
    "attachments": []
  }
]
```

**Pagination:**
- Initial load: no `cursor` param, get 30 newest messages
- Scroll up: use `created_at` of oldest loaded message as cursor
- No more messages: response returns empty array

**Mobile Implementation:**
1. FlashList with inverted layout (newest at bottom)
2. `onEndReached` triggers next page fetch (scroll-up in inverted list)
3. Subscribe to Realtime for new messages (prepend to top of list)
4. Render markdown for agent messages (role='agent')

---

#### POST `/rest/v1/messages`

**Description:** Send a new message. (FR-05, FR-08, S-03, S-04)

**Auth:** Bearer JWT

**Headers:**
```
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "conversation_id": "conv-uuid",
  "user_id": "current-user-uuid",
  "content": "Hello, can you help me?",
  "content_type": "text",
  "metadata": null
}
```

**For image message (FR-13):**
```json
{
  "conversation_id": "conv-uuid",
  "user_id": "current-user-uuid",
  "content": "Shared an image",
  "content_type": "image",
  "metadata": {
    "image_url": "attachments/conv-uuid/msg-uuid/photo.jpg"
  }
}
```

**For file message (FR-12):**
```json
{
  "conversation_id": "conv-uuid",
  "user_id": "current-user-uuid",
  "content": "Shared a file: report.pdf",
  "content_type": "file",
  "metadata": {
    "file_name": "report.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf"
  }
}
```

**Response (201):**
```json
{
  "id": "new-msg-uuid",
  "conversation_id": "conv-uuid",
  "user_id": "current-user-uuid",
  "content": "Hello, can you help me?",
  "content_type": "text",
  "metadata": null,
  "created_at": "2026-03-17T10:31:00Z",
  "updated_at": "2026-03-17T10:31:00Z"
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| 403 | `{ "message": "new row violates RLS" }` | User not a conversation member |
| 413 | `{ "error": "Payload too large" }` | Content exceeds limit |

**Mobile Implementation:**
1. Optimistic update: add message to local list immediately with pending state
2. POST to API
3. On success: update message ID from response
4. On failure: show retry option, mark message as failed
5. DB trigger auto-dispatches webhook to agents in conversation

---

### Phase 2 — Rich Features

---

#### POST `/rpc/mark_conversation_read`

**Description:** Update read receipt for current user in conversation. (FR-17, S-03, S-04)

**Auth:** Bearer JWT

**Request:**
```json
{
  "p_conversation_id": "conv-uuid"
}
```

**Response (200):**
```json
{ "success": true }
```

**Mobile Implementation:**
- Call when chat screen opens (after messages loaded)
- Call when app returns to foreground on a chat screen
- Debounce: max once per 5 seconds per conversation
- Invalidate conversation list query to update badge counts

---

#### POST `/storage/v1/object/attachments/{path}`

**Description:** Upload file attachment to Supabase Storage. (FR-12, FR-13, S-03, S-04)

**Auth:** Bearer JWT

**Path:** `attachments/{conversationId}/{messageId}/{filename}`

**Headers:**
```
Content-Type: {mime-type}
x-upsert: false
```

**Request Body:** Binary file data

**Response (200):**
```json
{
  "Key": "attachments/conv-uuid/msg-uuid/photo.jpg",
  "Id": "storage-uuid"
}
```

**Mobile Implementation:**
1. Pick file via expo-document-picker or expo-image-picker
2. For images >2MB: compress using expo-image-manipulator (resize to max 1920px, quality 0.8)
3. Generate message UUID client-side (for storage path)
4. Upload file with progress tracking (XMLHttpRequest for progress events)
5. On upload success: POST message with content_type='image'/'file' and metadata
6. Show progress bar during upload
7. Retry up to 3 times on failure

---

#### GET `/storage/v1/object/sign/attachments/{path}`

**Description:** Get signed URL for file download. (FR-12, FR-13, S-03, S-04, S-07)

**Auth:** Bearer JWT

**Query Parameters:**
```
expiresIn=3600   -- 1 hour
```

**Response (200):**
```json
{
  "signedURL": "https://...supabase.co/storage/v1/object/sign/attachments/...?token=..."
}
```

**Mobile Implementation:**
- Request signed URL before displaying image or downloading file
- Cache signed URLs for 50 minutes (below 1h expiry)
- Use signed URL in Image component source

---

#### POST `/rest/v1/reactions`

**Description:** Add emoji reaction to a message. (FR-15, S-03, S-04)

**Auth:** Bearer JWT

**Request:**
```json
{
  "message_id": "msg-uuid",
  "user_id": "current-user-uuid",
  "emoji": "❤️"
}
```

**Response (201):**
```json
{
  "id": "reaction-uuid",
  "message_id": "msg-uuid",
  "user_id": "current-user-uuid",
  "emoji": "❤️",
  "created_at": "2026-03-17T10:32:00Z"
}
```

**Error:** 409 Conflict if already reacted (unique constraint)

---

#### DELETE `/rest/v1/reactions?id=eq.{id}`

**Description:** Remove own reaction from a message. (FR-15, S-03, S-04)

**Auth:** Bearer JWT

**Response:** 204 No Content

**Mobile Implementation:**
- Long-press message -> show heart reaction option
- If already reacted: tap to remove (DELETE)
- If not reacted: tap to add (POST)
- Optimistic update on both add/remove

---

### Phase 3 — Notifications & Admin

---

#### GET `/rest/v1/users` (Admin)

**Description:** List all users for admin management. (FR-20, S-05)

**Auth:** Bearer JWT (admin role required)

**Query Parameters:**
```
select=id,username,email,role,avatar_url,is_mock,created_at
&order=created_at.desc
&limit=100
```

**Optional search:**
```
&or=(username.ilike.*{query}*,email.ilike.*{query}*)
```

**Response (200):**
```json
[
  {
    "id": "user-uuid",
    "username": "Agent-1",
    "email": null,
    "role": "agent",
    "avatar_url": null,
    "is_mock": false,
    "created_at": "2026-03-15T08:00:00Z"
  }
]
```

---

#### POST `/rest/v1/users` (Admin)

**Description:** Create a new user with auto-generated token. (FR-21, S-05)

**Auth:** Bearer JWT (admin role required)

**Request:**
```json
{
  "username": "NewAgent",
  "email": "agent@example.com",
  "role": "agent"
}
```

**Note:** Token is auto-generated server-side via database trigger or RPC. The response includes the generated token.

**Response (201):**
```json
{
  "id": "new-user-uuid",
  "username": "NewAgent",
  "email": "agent@example.com",
  "role": "agent",
  "token": "generated-64-char-token...",
  "created_at": "2026-03-17T10:33:00Z"
}
```

**Mobile Implementation:**
- Show success modal with token
- "Copy Token" button -> Clipboard.setStringAsync(token)

---

#### PATCH `/rest/v1/users?id=eq.{id}` (Admin)

**Description:** Update user details. (FR-20, S-05)

**Auth:** Bearer JWT (admin role required)

**Request:**
```json
{
  "username": "Updated Name",
  "role": "admin"
}
```

**Response (200):** Updated user object

---

#### GET `/rest/v1/webhook_delivery_logs` (Admin)

**Description:** Fetch webhook delivery logs with filters. (FR-22, S-06)

**Auth:** Bearer JWT (admin role required)

**Query Parameters:**
```
select=*,
  users!webhook_delivery_logs_agent_id_fkey(id,username,avatar_url),
  conversations(id,name)
&order=created_at.desc
&limit=50
```

**Optional filters:**
```
&agent_id=eq.{agentId}                          -- filter by agent
&delivery_status=eq.failed                       -- filter by status
&created_at=gte.{dateFrom}                       -- date range start
&created_at=lte.{dateTo}                         -- date range end
```

**Response (200):**
```json
[
  {
    "id": "log-uuid",
    "agent_id": "agent-uuid",
    "conversation_id": "conv-uuid",
    "message_id": "msg-uuid",
    "request_payload": { "message": "...", "conversation": "..." },
    "response_body": "{ \"reply\": \"...\" }",
    "http_status": 200,
    "error_message": null,
    "delivery_status": "delivered",
    "retry_count": 1,
    "latency_ms": 142,
    "created_at": "2026-03-17T10:30:05Z",
    "users": {
      "id": "agent-uuid",
      "username": "Agent-1",
      "avatar_url": null
    },
    "conversations": {
      "id": "conv-uuid",
      "name": "Testing Group"
    }
  }
]
```

---

## 3. Realtime Subscription Details

### Messages Channel (Phase 1, FR-06)

**Subscribe:**
```typescript
supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages',
      filter: `conversation_id=eq.${conversationId}` },
    (payload) => {
      // payload.new = full message row
      // Fetch sender info if not in cache
      // Append to message list
      // Auto-scroll to bottom
    }
  )
  .subscribe()
```

**Lifecycle:**
- Subscribe when chat screen mounts (S-03/S-04)
- Unsubscribe when chat screen unmounts
- Handle reconnection on network recovery

---

### Presence Channel (Phase 2, FR-16)

**Subscribe:**
```typescript
supabase
  .channel('presence:global')
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    // state = { [userId]: [{ online_at: timestamp }] }
    // Update online status for all users
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: currentUserId, online_at: new Date() })
    }
  })
```

**Lifecycle:**
- Subscribe on app mount (after login)
- Track presence on app foreground (AppState listener)
- Untrack on app background
- Unsubscribe on logout

---

### Typing Channel (Phase 2, FR-14)

**Send typing event:**
```typescript
supabase
  .channel(`typing:${conversationId}`)
  .send({
    type: 'broadcast',
    event: 'typing',
    payload: { user_id: currentUserId, username: currentUsername }
  })
```

**Receive typing event:**
```typescript
supabase
  .channel(`typing:${conversationId}`)
  .on('broadcast', { event: 'typing' }, (payload) => {
    // Show "[username] is typing..." for 3 seconds
    // Reset timer on each new event
  })
  .subscribe()
```

**Debounce:** Send typing event max once per 3 seconds per conversation.

---

## 4. Push Notification Payload (Phase 3, FR-18)

**Expo Push Token Registration:**
```typescript
// On app start (after login)
const token = await Notifications.getExpoPushTokenAsync()
// Store token server-side (new RPC or user metadata)
```

**Push Payload (sent by Edge Function):**
```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "Agent-1",
  "body": "Here's the analysis you requested...",
  "data": {
    "conversationId": "conv-uuid",
    "messageId": "msg-uuid",
    "type": "new_message"
  },
  "sound": "default",
  "badge": 1
}
```

**Deep Link:** Tapping notification navigates to `/chat/{conversationId}`

---

## 5. Error Handling Strategy

| HTTP Status | Meaning | Mobile Behavior |
|-------------|---------|-----------------|
| 200-201 | Success | Process response |
| 401 | JWT expired | Clear session, navigate to S-01 Login |
| 403 | RLS violation | Show "Access denied" toast |
| 404 | Not found | Show "Not found" toast |
| 409 | Conflict (duplicate) | Ignore (e.g., duplicate reaction) |
| 413 | Payload too large | Show "File too large (max 10MB)" toast |
| 429 | Rate limited | Show "Too many requests, try again" toast, exponential backoff |
| 500+ | Server error | Show "Server error" toast, retry with backoff |

**Global Interceptor (Supabase client):**
- Intercept 401 responses -> auto-logout
- Retry 5xx responses once after 2 seconds
- Log errors for debugging (non-sensitive data only)

---

## 6. Traceability Matrix

| FR-xx | Endpoints Used | Realtime Channels |
|-------|---------------|-------------------|
| FR-01 | POST /rpc/login_with_token | — |
| FR-02 | GET /rest/v1/users (self) | — |
| FR-03 | GET /rest/v1/conversations, GET /rest/v1/conversation_members | — |
| FR-04 | GET /rest/v1/conversations (unread calc) | — |
| FR-05 | GET /rest/v1/messages, POST /rest/v1/messages | messages channel |
| FR-06 | — | messages channel (INSERT) |
| FR-07 | GET /rest/v1/messages (markdown in content) | — |
| FR-08 | POST /rest/v1/messages | — |
| FR-09 | GET /rest/v1/messages (cursor pagination) | — |
| FR-10 | GET /rest/v1/conversations, GET /rest/v1/conversation_members | — |
| FR-11 | GET /rest/v1/conversation_members | — |
| FR-12 | POST /storage/v1/object, GET /storage/v1/object/sign | — |
| FR-13 | POST /storage/v1/object, GET /storage/v1/object/sign | — |
| FR-14 | — | typing channel (broadcast) |
| FR-15 | POST /rest/v1/reactions, DELETE /rest/v1/reactions | — |
| FR-16 | — | presence channel |
| FR-17 | POST /rpc/mark_conversation_read | — |
| FR-18 | Expo Push Token registration | — |
| FR-19 | GET /rest/v1/webhook_delivery_logs (pending check) | — |
| FR-20 | GET /rest/v1/users, PATCH /rest/v1/users | — |
| FR-21 | POST /rest/v1/users | — |
| FR-22 | GET /rest/v1/webhook_delivery_logs | — |
