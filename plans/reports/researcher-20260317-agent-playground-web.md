# Agent Playground Web App - Comprehensive Research Report

**Date:** March 17, 2026
**Repository:** https://github.com/phucsystem/agent-playground
**Version:** 0.1.0 MVP
**License:** MIT Open Source

---

## Executive Summary

Agent Playground is an **invite-only, real-time chat collaboration platform** designed to enable human testers and AI agents to interact seamlessly. The key differentiator is "Easy API Integration"—agents connect via simple webhook HTTP POST without requiring SDKs. The platform consists of a modern full-stack application built with Next.js 16 + React 19 on the frontend, Supabase (PostgreSQL, Realtime, Auth, Storage, Edge Functions) on the backend, and styled with Tailwind CSS 4.

**Current Status:** MVP complete with 55+ source files (~6,080 LOC), 8 core database tables, and 13 sequential database migrations. Shipped with pre-seeded test accounts, admin dashboard, and full webhook integration.

---

## 1. What the App Does

### Core Purpose
Agent Playground is a **chat interface for human-agent collaboration** with webhook-based API integrations. It solves the problem of testing AI agents with real users in a controlled, invite-only environment.

### Primary Features (Implemented)

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Token-based login | 1 | ✅ Live | 64-character pre-provisioned tokens, no email/password |
| Direct messaging | 1 | ✅ Live | 1-on-1 DM threads between users and agents |
| Real-time delivery | 1 | ✅ Live | <500ms message latency via Supabase Realtime |
| Message history | 1 | ✅ Live | Persistent, paginated message storage |
| Markdown rendering | 1 | ✅ Live | Full markdown support with syntax highlighting |
| File attachments | 2 | ✅ Live | Max 10MB per file, S3-compatible storage |
| Image previews | 2 | ✅ Live | Embedded image rendering in messages |
| URL metadata | 2 | ✅ Live | Automatic preview extraction for shared links |
| Group conversations | 2 | ✅ Live | 3+ participants with @mention routing |
| Typing indicators | 3 | ✅ Live | Real-time "user is typing" feedback |
| Read receipts | 3 | ✅ Live | Last_read_at tracking per conversation |
| Emoji reactions | 3 | ✅ Live | Heart reactions on messages (hover to add) |
| Admin dashboard | 4 | ✅ Live | User management, token generation, webhook logs |
| Agent webhooks | 5 | ✅ Live | Webhook dispatch with HMAC-SHA256, retry logic, logging |

### Target Users
1. **AI Agent Builders** – Test agents in real conversations without building chat infrastructure
2. **Teams** – Integrate external services (webhooks) into chat workflows
3. **Admins** – Manage users, agents, and monitor webhook delivery

---

## 2. Technology Stack

### Frontend Layer

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Next.js | 16.1.6 | React meta-framework with SSR, routing, API routes |
| Runtime | React | 19.2.4 | UI library with hooks, components, state management |
| Language | TypeScript | 5.9.3 | Type-safe JavaScript with strict mode |
| Styling | Tailwind CSS | 4.2.1 | Utility-first CSS framework, mobile-first design |
| Icons | lucide-react | latest | SVG icon library (24+ icons) |
| Notifications | sonner | latest | Toast notification system |
| Markdown | react-markdown | latest | Render markdown in React with plugins |
| Syntax Highlighting | rehype-highlight | latest | Code block syntax coloring |
| GitHub Flavored MD | remark-gfm | latest | Tables, strikethrough, task lists |
| List Virtualization | react-virtual | latest | Efficient rendering of long conversation lists |
| User Agent Detection | ua-parser-js | 0.7.39 | Parse browser/device info |

### Backend Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | PostgreSQL (via Supabase) | 9 tables with RLS, indexes, triggers |
| API | Supabase PostgREST | Auto-generated REST endpoints |
| Realtime | Supabase Realtime | 3 channels: postgres_changes, presence, broadcast |
| Auth | Supabase Auth | JWT-based session management |
| Storage | Supabase Storage | S3-compatible file storage (10MB limit) |
| Edge Functions | Deno (via Supabase) | Webhook dispatch (webhook-dispatch function) |
| Middleware | Supabase Auth Middleware | Session validation, route protection |

### Development & Deployment

| Tool | Purpose |
|------|---------|
| pnpm | Package manager (faster than npm) |
| Next.js Standalone | Optimized production bundle |
| Vercel | Frontend deployment target |
| Supabase Cloud | Backend deployment target |
| Docker | Containerization (included in repo) |
| TypeScript Strict | Type safety enforcement |

### External Integrations

| Service | Key |
|---------|-----|
| GIPHY | GIF search (if enabled) |

---

## 3. Key Screens, Pages, and User Flows

### Screen Hierarchy (with IDs from UI_SPEC.md)

#### **S-01: Login Screen**
- **Route:** `/login`
- **User Input:** 64-character provisioned token
- **Flow:**
  1. User enters token → Validation
  2. Exchange token for JWT via `POST /rpc/login_with_token`
  3. Store JWT in HTTP-only cookie
  4. Auto-cache token to localStorage (for QR code scanning in mobile)
  5. Redirect to `/chat` or `/setup` (first-time users)
- **Error Handling:** Invalid token displays error; token not found redirects to signup (future)

#### **S-02: Main Layout**
- **Route:** `/chat` (protected, requires JWT)
- **Layout Components:**
  - **260px Fixed Sidebar:** Conversation list, presence indicator, user menu
  - **Flexible Main Area:** Current conversation (messages, input)
  - **Optional 320px Right Panel:** Conversation info, member list, file sharing
- **Responsive Design:**
  - Desktop: Sidebar + Main + Optional Panel
  - Tablet: Sidebar + Main (panel on demand)
  - Mobile: Sidebar (collapsible) + Main + Bottom action bar
- **Mobile Sidebar Hook:** `use-mobile-sidebar.tsx` toggles visibility
- **Sidebar Sort:** By `last_message_created_at` (most recent first)

#### **S-03: Direct Message Chat**
- **Route:** `/chat/[conversationId]` (where conversation type = "dm")
- **Participants:** 2 users/agents
- **Message Display:**
  - **User Messages:** Right-aligned, light background bubbles, rounded corners
  - **Agent Messages:** Flat text (no container), full markdown support, no background
  - **Agent Avatar:** Blue bot badge indicator
- **Input Bar:**
  - Rounded container with integrated attachment icon
  - Auto-growing textarea (2-4 lines default)
  - Send button (dark neutral-900 background)
  - File upload button (max 10MB, auto-preview)
- **Agent Thinking:**
  - Animated dots indicator while awaiting webhook response
  - 30-second timeout (then shows "Agent offline")
  - Clicking dots fetches webhook logs for debugging
- **Timestamps:**
  - Recent messages: "2m ago" (relative)
  - Older messages: "3:45 PM" (clock time) or "Today 3:45 PM"
- **Interactions:**
  - Hover on message → Heart icon appears (add emoji reaction)
  - Message selection → Copy, Delete (if sender), Pin options
  - URL auto-linked with metadata preview
  - Image inline preview (max 400px width)

#### **S-04: Group Chat**
- **Route:** `/chat/[conversationId]` (where conversation type = "group")
- **Participants:** 3+ users/agents
- **Sender Names:** Displayed on each message for clarity
- **@Mention Routing:**
  - Type `@` → Autocomplete of conversation members
  - @mention in message → Tagged user/agent receives notification
  - In groups: Agent only receives webhook if @mentioned
  - In DMs: Agent always receives webhook
- **Admin Badge:** Admins shown with gold badge if designated admin
- **Member List:** Right panel shows all conversation members
- **Admin Controls:** Remove member, promote to admin, transfer ownership

#### **S-05: Setup / Onboarding**
- **Route:** `/setup` (first-time users)
- **Steps:**
  1. Set display name (optional, defaults to "User-{id}")
  2. Upload avatar (optional, defaults to initials)
  3. Configure webhook (if user is an agent)
  4. Confirm and redirect to `/chat`
- **Webhook Setup (for agents):**
  - Webhook URL (HTTPS, not localhost/private IP)
  - Shared secret (for HMAC-SHA256 signature)
  - Toggle activation
  - Test webhook delivery

#### **S-06: Admin Dashboard**
- **Route:** `/admin` (admin-only, RLS enforced)
- **Main Component:** 24 KB single page.tsx file
- **Sub-features:**

**User Management Tab:**
- List all users (humans + agents)
- Search by name/email
- Create new user (auto-generates token)
- Edit user details (name, role, mock status)
- Delete user (soft delete)
- Reset token (generate new 64-char token)

**Agent Management Tab:**
- List agents (filtered from users where role = "agent")
- View webhook configuration
- Edit webhook URL and secret
- Test webhook delivery
- View delivery history

**Webhook Logs Tab:**
- Search by agent, conversation, status
- Filter by date range
- Columns: Agent, Message, Status, Latency, Timestamp
- Click row → View full payload + response
- Retry failed webhook (manual trigger)

**System Status:**
- Current users online
- Webhook delivery rate (last 24h)
- Storage usage
- Performance metrics

#### **S-07: Webhook Configuration**
- **Access:** In setup wizard OR admin dashboard
- **Fields:**
  - Webhook URL (validation: HTTPS, not private IP)
  - Shared secret (min 32 chars)
  - Test delivery (sandbox message)
  - Activation toggle

#### **S-08: Webhook Delivery Logs**
- **Access:** Admin dashboard or by clicking agent "thinking" indicator
- **Columns:**
  - Timestamp
  - Agent name
  - Conversation
  - Status (pending/delivered/failed)
  - Latency (ms)
  - Retry count (1/3, 2/3, 3/3)
- **Click Row:** Expand to show:
  - Request payload (JSON)
  - Response body
  - HTTP status code
  - Error message (if failed)
  - Retry timeline (timestamps of retries)

### Key User Flows

**Flow 1: Human sends message to Agent**
```
1. Human types message in chat input
2. Click Send → Message inserted to DB
3. RLS validates human is conversation member
4. Database trigger fires → Invokes webhook-dispatch Edge Function
5. Edge Function retrieves agent_configs for conversation agents
6. Builds payload with message, conversation context, up to 50 recent messages
7. POSTs to agent's webhook URL with HMAC-SHA256 signature
8. Webhook log created (pending → delivered/failed)
9. If delivery 2xx → Agent can POST message back via REST API
10. New message inserted, realtime broadcast to all members
```

**Flow 2: Agent responds to webhook**
```
1. Agent receives webhook payload at their endpoint
2. Validates HMAC-SHA256 signature using shared secret
3. Processes message (LLM inference, etc.)
4. POSTs response to /rest/v1/messages with JWT token (agent auth)
5. Message inserted to DB with sender = agent
6. Realtime broadcast to conversation members
7. Agent thinking indicator disappears
```

**Flow 3: Group message with @mention**
```
1. Human types "@Alice hello" in group chat
2. Click Send → Message inserted
3. Edge Function detects @mention of Alice
4. If Alice is agent → Webhook dispatched ONLY to Alice
5. If Alice is human → No webhook, but mention notification sent
6. Typing indicator shows for Alice (if agent) while processing
```

---

## 4. Data Models & Entities

### Database Schema (9 Tables)

```sql
-- Entity IDs from DB_DESIGN.md:

-- E-01: users
id UUID PRIMARY KEY
auth_id UUID (foreign key to Supabase auth.users)
email TEXT
username TEXT (unique, display name)
role ENUM ('admin', 'user', 'agent')
token TEXT (64-char, pre-provisioned)
avatar_url TEXT (Supabase Storage path)
is_mock BOOLEAN (test data flag)
updated_at TIMESTAMP
created_at TIMESTAMP
-- RLS: All users can see, but only own token is readable

-- E-02: conversations
id UUID PRIMARY KEY
type ENUM ('dm', 'group')
name TEXT (group name, null for DM)
description TEXT (group description)
created_by UUID (foreign key → users.id)
last_message_created_at TIMESTAMP (updated by trigger)
updated_at TIMESTAMP
created_at TIMESTAMP
-- RLS: Only conversation members can read/write

-- E-03: conversation_members
id UUID PRIMARY KEY
conversation_id UUID (foreign key → conversations.id)
user_id UUID (foreign key → users.id)
role ENUM ('admin', 'member')
last_read_at TIMESTAMP (for read receipts)
deleted_at TIMESTAMP (soft delete)
-- RLS: Own records visible, admin-only for others

-- E-04: messages
id UUID PRIMARY KEY
conversation_id UUID (foreign key → conversations.id)
user_id UUID (sender, foreign key → users.id)
content TEXT (message text, markdown supported)
content_type ENUM ('text', 'file', 'image', 'url')
metadata JSONB (image URL, file info, URL preview)
created_at TIMESTAMP
updated_at TIMESTAMP
-- RLS: Visible to conversation members

-- E-05: attachments
id UUID PRIMARY KEY
message_id UUID (foreign key → messages.id)
conversation_id UUID (scoping, foreign key → conversations.id)
file_name TEXT
file_size INT (bytes)
file_type TEXT (MIME type)
storage_path TEXT (pattern: attachments/{conversationId}/{messageId}/{filename})
signed_url TEXT (1-hour expiry)
-- RLS: Accessible by conversation members only

-- E-06: reactions
id UUID PRIMARY KEY
message_id UUID (foreign key → messages.id)
user_id UUID (foreign key → users.id)
emoji TEXT (unicode emoji, typically "❤️")
created_at TIMESTAMP
-- UNIQUE(message_id, user_id) prevents duplicate reactions per user
-- RLS: Visible to conversation members

-- E-07: agent_configs
id UUID PRIMARY KEY
user_id UUID (unique, foreign key → users.id, must be role='agent')
webhook_url TEXT (HTTPS, not private IP)
webhook_secret TEXT (for HMAC-SHA256 signature)
is_active BOOLEAN (default true)
updated_at TIMESTAMP
created_at TIMESTAMP
-- RLS: Only admin and agent user can read own config

-- E-08: webhook_delivery_logs
id UUID PRIMARY KEY
agent_id UUID (foreign key → users.id, agent)
conversation_id UUID (foreign key → conversations.id)
message_id UUID (foreign key → messages.id)
request_payload JSONB (full webhook payload sent)
response_body TEXT (response from agent's endpoint)
http_status INT (status code)
error_message TEXT (null if successful)
delivery_status ENUM ('pending', 'delivered', 'failed')
retry_count INT (1-3)
latency_ms INT (how long request took)
expires_at TIMESTAMP (30 days from creation, auto-delete)
created_at TIMESTAMP
-- RLS: Admin-only visibility
-- Used for debugging and audit

-- E-09: user_sessions
id UUID PRIMARY KEY
user_id UUID (foreign key → users.id)
session_token TEXT (JW, stored in HTTP-only cookie)
ip_address TEXT (for security auditing)
user_agent TEXT (device info)
expires_at TIMESTAMP
created_at TIMESTAMP
-- RLS: Own record visible
```

### Composite Types (from API responses)

```typescript
// MessageWithSender
{
  id: UUID
  content: string
  content_type: 'text' | 'file' | 'image' | 'url'
  metadata?: {
    image_url?: string
    file_name?: string
    file_size?: number
    url_preview?: {
      title: string
      description: string
      image: string
    }
  }
  user: {
    id: UUID
    username: string
    avatar_url: string
    role: 'admin' | 'user' | 'agent'
  }
  reactions: Array<{
    emoji: string
    count: number
    by_current_user: boolean
  }>
  created_at: timestamp
}

// ConversationWithDetails
{
  id: UUID
  type: 'dm' | 'group'
  name?: string
  members: Array<{
    id: UUID
    username: string
    role: 'admin' | 'member'
    is_online: boolean
  }>
  last_message: MessageWithSender
  unread_count: number
  last_message_created_at: timestamp
}

// WebhookLogWithDetails
{
  id: UUID
  agent: { id: UUID, username: string }
  message: { id: UUID, content: string }
  conversation: { id: UUID, name: string }
  status: 'pending' | 'delivered' | 'failed'
  http_status?: number
  error_message?: string
  latency_ms: number
  retry_count: number
  created_at: timestamp
}
```

### Enums & Constants

```typescript
// User roles (E-01)
enum UserRole {
  ADMIN = "admin",      // Can manage users, agents, webhooks
  USER = "user",        // Regular chat participant
  AGENT = "agent"       // AI agent, accessed via webhook only
}

// Conversation types (E-02)
enum ConversationType {
  DM = "dm",            // 2 participants only
  GROUP = "group"       // 3+ participants
}

// Member roles (E-03)
enum MemberRole {
  ADMIN = "admin",      // Can remove members, manage settings
  MEMBER = "member"     // Regular participant
}

// Message content types (E-04)
enum ContentType {
  TEXT = "text",        // Plain text + markdown
  FILE = "file",        // Document attachment
  IMAGE = "image",      // Image file
  URL = "url"           // Link with preview
}

// Webhook delivery status (E-08)
enum DeliveryStatus {
  PENDING = "pending",  // Awaiting delivery
  DELIVERED = "delivered", // 2xx response
  FAILED = "failed"     // Max retries exceeded
}
```

---

## 5. Authentication & Authorization Approach

### Authentication Flow

**Step 1: Token Provisioning**
- Admin creates user via `POST /rest/v1/users` with user data
- System generates 64-character random token (cryptographically secure)
- Token stored in `users.token` column
- Token sent to user via email (in future, currently display in admin)
- No email/password signup—tokens only

**Step 2: Login**
```
POST /rpc/login_with_token
{
  "token": "64-character-string"
}
```
- Function validates token against `users.token`
- If valid: Supabase Auth creates JWT session
- JWT stored in HTTP-only cookie (name: `sb-{project-id}-auth-token`)
- JWT valid for 24 hours (configurable)
- Refresh token for long-lived sessions (stored in Supabase)

**Step 3: Session Validation**
- Middleware in `src/middleware.ts` intercepts all requests
- Calls `updateSession(request)` to validate JWT from cookie
- If invalid/expired: Redirect to `/login`
- If valid: Proceed with request (JWT in Authorization header automatically added by Supabase client)

**Step 4: Logout**
```
Middleware clears HTTP-only cookie
User redirected to /login
```

### Authorization (Row-Level Security - RLS)

**RLS Enforcement:**
All 9 database tables have RLS enabled. Policies prevent unauthorized access at the SQL level.

**Policy Examples:**

```sql
-- E-01: users table
-- Everyone can SELECT all users (for presence, DM creation)
CREATE POLICY "Users are visible" ON users
  FOR SELECT
  USING (true);

-- But tokens are hidden (view-only for own token)
-- Handled by users_public view (SELECT without token column)

-- E-02: conversations table
-- Only members can access
CREATE POLICY "Users can only access their conversations" ON conversations
  FOR SELECT
  USING (id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()));

-- E-03: messages table
-- Only conversation members can read
CREATE POLICY "Members can read messages" ON messages
  FOR SELECT
  USING (conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()));

-- Only the sender can delete
CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE
  USING (user_id = auth.uid());

-- E-05: attachments table
-- Only conversation members can access
CREATE POLICY "Attachments accessible to members" ON attachments
  FOR SELECT
  USING (conversation_id IN (...my_conversation_ids...));

-- E-07: agent_configs table
-- Only admin and the agent themselves
CREATE POLICY "Admin and agent can view config" ON agent_configs
  FOR SELECT
  USING (is_admin() OR user_id = auth.uid());

-- E-08: webhook_delivery_logs table
-- Admin-only
CREATE POLICY "Admin can view logs" ON webhook_delivery_logs
  FOR SELECT
  USING (is_admin());
```

**Helper Functions (SECURITY DEFINER to prevent RLS recursion):**

```sql
-- Check if current user is admin
FUNCTION is_admin()
  RETURNS boolean AS
  SELECT role = 'admin' FROM users WHERE id = auth.uid();

-- Get user's conversation IDs (used in multiple policies)
FUNCTION my_conversation_ids()
  RETURNS TABLE(conversation_id UUID) AS
  SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid();

-- Get user's agent config (if applicable)
FUNCTION get_agent_config(user_id UUID)
  RETURNS TABLE(...) AS
  SELECT * FROM agent_configs WHERE user_id = $1;
```

### Storage Access Control

**File Storage Paths:** `attachments/{conversationId}/{messageId}/{filename}`

**Storage RLS Policies:**
```sql
-- Only conversation members can list files
CREATE POLICY "Members can access attachments" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'attachments' AND
         split_part(name, '/', 1) IN (SELECT conversation_id::text FROM my_conversation_ids()));

-- Only conversation members can upload
CREATE POLICY "Members can upload to conversation" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'attachments' AND
              split_part(name, '/', 1) IN (...my_conversation_ids...));
```

**Signed URLs:**
- Generated with 1-hour expiry
- Scoped to specific file path
- Passed to frontend for file downloads
- Prevents direct /storage/ URL access without auth

### Token Security

1. **Token Generation:** 64 random characters (256 bits entropy)
2. **No Reset Flow:** Tokens are static (admin regenerates if compromised)
3. **Transmission:** Over HTTPS only
4. **Storage:** In HTTP-only, Secure, SameSite=Strict cookie
5. **Logging:** Token value never logged (only user_id in audit logs)

---

## 6. API Integrations & Webhook Architecture

### Supabase REST API Endpoints

**Base URL:** `https://{project-ref}.supabase.co`

**Authentication:** JWT in Authorization header (auto-added by Supabase client)

#### **Authentication Endpoints**

```
POST /rpc/login_with_token
Request:  { "token": "64-char-string" }
Response: { "session": { "access_token": "...", "refresh_token": "..." } }
```

#### **User Management**

```
GET /rest/v1/users
Response: Array<{
  id, email, username, role, avatar_url, is_mock, updated_at, created_at
}>
Query params: limit, offset, order_by

POST /rest/v1/users (admin-only)
Request: { email, username, role, is_mock }
Response: { id, token, ..._all_fields... }

PATCH /rest/v1/users?id=eq.{user-id} (admin-only)
Request: { username, avatar_url, role }
Response: { updated record }

DELETE /rest/v1/users?id=eq.{user-id} (admin-only, soft-delete)
Response: 204 No Content
```

#### **Conversation Management**

```
GET /rest/v1/conversations
Response: Array<ConversationWithDetails>
Query: limit, offset, order_by=last_message_created_at.desc

POST /rest/v1/conversations
Request: { type, name, description }
Response: { id, type, name, created_by, ... }

POST /rpc/find_or_create_dm
Request: { other_user_id }
Response: { id, type: "dm", members: [...] }
(Creates DM if doesn't exist, returns existing if does)

GET /rpc/get_my_conversations
Response: Array<ConversationWithDetails>
(Includes member_count, unread_count, last_message, last_message_created_at)
```

#### **Messaging**

```
GET /rest/v1/messages?conversation_id=eq.{id}
Response: Array<MessageWithSender>
Query: limit=50, offset=0, order_by=created_at.desc

POST /rest/v1/messages
Request: { conversation_id, content, content_type, metadata }
Response: { id, user_id, created_at, ... }

POST /rpc/mark_conversation_read
Request: { conversation_id }
Response: { success: true }
(Updates conversation_members.last_read_at for current user)
```

#### **File Handling**

```
POST /storage/v1/object/attachments/{conversationId}/{messageId}/{filename}
Headers: Content-Type: application/octet-stream
Body: Binary file data (max 10MB)
Response: { path: "attachments/...", id: "...", ... }

POST /rest/v1/attachments
Request: { message_id, file_name, file_size, file_type, storage_path }
Response: { id, storage_path, signed_url, ... }

GET /storage/v1/object/sign/attachments/{path}?expiresIn=3600
Response: { signedURL: "...", expiresIn: 3600 }
(1-hour signed URL for client-side download)
```

#### **Reactions**

```
POST /rest/v1/reactions
Request: { message_id, emoji }
Response: { id, message_id, user_id, emoji, ... }

DELETE /rest/v1/reactions?message_id=eq.{id}&user_id=eq.{uid}&emoji=eq.❤️
Response: 204 No Content

GET /rest/v1/reactions?message_id=eq.{id}
Response: Array<{ user_id, emoji, count, by_current_user }>
```

#### **Group Management**

```
POST /rest/v1/conversation_members
Request: { conversation_id, user_id, role: "member" }
Response: { id, conversation_id, user_id, role, ... }

DELETE /rest/v1/conversation_members?conversation_id=eq.{id}&user_id=eq.{uid}
Response: 204 No Content

GET /rest/v1/conversation_members?conversation_id=eq.{id}
Response: Array<{ id, user_id, role, user: {...} }>
```

#### **Agent Configuration (Admin)**

```
GET /rest/v1/agent_configs?user_id=eq.{agent-id}
Response: { id, webhook_url, is_active, updated_at } (secret hidden)

POST /rest/v1/agent_configs
Request: { user_id, webhook_url, webhook_secret, is_active }
Response: { id, user_id, webhook_url, ... (secret hidden) }

PATCH /rest/v1/agent_configs?user_id=eq.{agent-id}
Request: { webhook_url, webhook_secret, is_active }
Response: { updated record }
```

#### **Webhook Delivery Logs (Admin)**

```
GET /rest/v1/webhook_delivery_logs
Response: Array<WebhookLogWithDetails>
Query: agent_id, conversation_id, status, created_at.gt, limit, offset

GET /rest/v1/webhook_delivery_logs?id=eq.{log-id}
Response: { ..., request_payload, response_body, error_message, ... }
(Full log details including payload)
```

### Webhook Integration Details

**How Webhooks Are Triggered:**

1. **Message Inserted** → Database trigger fires on `messages` INSERT
2. **Trigger executes:** `SELECT webhook_dispatch_handler(NEW.*)`
3. **Handler invokes Edge Function** (asynchronously) with message data
4. **Edge Function processes** webhook distribution

**Webhook Dispatch Edge Function** (`supabase/functions/webhook-dispatch/index.ts`)

**Input Payload:**
```typescript
{
  event: "message:new" | "message:mentioned",
  message: {
    id: UUID,
    content: string,
    content_type: ContentType,
    created_at: timestamp
  },
  sender: {
    id: UUID,
    username: string,
    role: UserRole
  },
  conversation: {
    id: UUID,
    type: ConversationType,
    name?: string,
    members: Array<{ id, username, role }>
  },
  history: Array<MessageWithSender> // up to 50 recent messages
}
```

**Dispatch Logic:**

```typescript
// 1. Skip if sender is agent (prevent loops)
if (sender.role === 'agent') {
  // Unless explicitly @mentioned in group, then do dispatch
  if (conversation.type !== 'group' || !message.mentions_agents) {
    return; // Skip dispatch
  }
}

// 2. Get agent configs for conversation members
agents = conversation.members.filter(m => m.role === 'agent');

// 3. For groups: filter to @mentioned agents only
if (conversation.type === 'group') {
  agents = agents.filter(agent => message.mentions.includes(agent.id));
}

// 4. For DMs: dispatch to all agents in conversation
if (conversation.type === 'dm') {
  agents = agents; // All agents in DM
}

// 5. For each agent, fetch webhook config
for agent in agents:
  config = agent_configs[agent.id];

  // 6. Validate webhook URL
  if (!isHttps(config.webhook_url) || isPrivateIP(config.webhook_url)) {
    log_error("Invalid webhook URL");
    continue;
  }

  // 7. Build HMAC-SHA256 signature
  signature = hmacSha256(JSON.stringify(payload), config.webhook_secret);

  // 8. POST to webhook with retries
  for retry in [0, 10s, 60s]:
    response = POST config.webhook_url
      Headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'User-Agent': 'agent-playground/v1'
      }
      Timeout: 30s

    // 9. Log delivery attempt
    insert into webhook_delivery_logs:
      agent_id, conversation_id, message_id,
      request_payload, response_body, http_status,
      delivery_status, retry_count, latency_ms

    // 10. On success (2xx): Parse response
    if (response.status in [200, 201, 202]):
      delivery_status = 'delivered';

      // If agent returns JSON with reply/message/content field
      if (response.json.reply || response.json.message || response.json.content):
        // Auto-insert agent's response as new message
        insert into messages:
          conversation_id, user_id=agent.id,
          content=response.json.reply/message/content,
          content_type='text'

    // 11. On failure: Log error, retry on schedule
    if (response.status >= 400 or timeout):
      error_message = response.error || "Timeout";
      if (retry < 2): continue to next retry_delay;
      else: delivery_status = 'failed'; break;
```

**Webhook Signature Example:**

Agent receives HTTP POST with headers:
```
POST /webhook HTTP/1.1
Host: agent.example.com
Content-Type: application/json
X-Webhook-Signature: sha256=abcd1234ef5678...
User-Agent: agent-playground/v1

{
  "event": "message:new",
  "message": { ... },
  "sender": { ... },
  "conversation": { ... },
  "history": [ ... ]
}
```

Agent validates:
```typescript
// Agent's shared secret (from agent_configs.webhook_secret)
secret = "agent-shared-secret";

// Verify signature
received_signature = request.headers['X-Webhook-Signature'].split('=')[1];
computed_signature = hmacSha256(request.body_raw, secret);

if (received_signature !== computed_signature) {
  return 401 Unauthorized; // Invalid signature
}

// Process message...
```

**Agent Response (optional):**

Agent can respond by POSTing back to the API:

```
POST /rest/v1/messages HTTP/1.1
Authorization: Bearer {agent-jwt-token}
Content-Type: application/json

{
  "conversation_id": "...",
  "content": "My response to the user",
  "content_type": "text"
}
```

Or return from webhook with JSON body:
```json
{
  "reply": "My response to the user"
}
```

System will auto-insert both methods as messages.

**Retry Policy:**
- Attempt 1: Immediate
- Attempt 2: After 10 seconds
- Attempt 3: After 60 seconds
- Timeout: 30 seconds per attempt
- Max 3 total attempts
- All attempts logged with timestamps, status codes, latency

**Security Measures:**
- HMAC-SHA256 signature validation required
- Webhook URL must be HTTPS
- Rejects localhost, 127.0.0.1, private IPs (10.x, 172.16-31.x, 192.168.x)
- Rejects .local, .internal domains (mDNS)
- 30-second timeout prevents resource exhaustion
- Retry backoff prevents thundering herd
- Delivery logs auto-expire after 30 days

### Realtime Features (Supabase Realtime)

**Three Supabase Channels:**

1. **postgres_changes Channel**
   - Subscribes to: `messages` table INSERT events
   - Subscription: `ON messages INSERT WHERE conversation_id = $1`
   - Latency: <500ms (depends on network + server processing)
   - Payload: Full inserted message row + sender details
   - Used for: New message delivery to all conversation members

2. **presence Channel**
   - Broadcast: User online/offline status
   - Subscription: Per-conversation presence updates
   - Latency: ~2 seconds (presence sync interval)
   - Payload: { user_id, username, status: "online"|"offline" }
   - Used for: Green dot indicator, "user is online" status

3. **broadcast Channel**
   - Broadcast: Typing indicator events
   - Subscription: Per-conversation typing status
   - Latency: ~100ms
   - Debounce: 3 seconds (batches multiple keystrokes)
   - Payload: { user_id, username, is_typing: boolean }
   - Used for: "Alice is typing..." indicator

**Hook Implementation:**

Custom hooks manage subscriptions:
- `use-realtime-messages.ts` → postgres_changes subscription
- `use-supabase-presence.ts` → Presence channel subscription
- `use-typing-indicator.ts` → Broadcast channel subscription + debounce

---

## 7. Codebase Structure & Organization

### Project Statistics

| Metric | Count |
|--------|-------|
| Total source files | 55+ |
| Total lines of code (LOC) | ~6,080 |
| React components | 24 |
| Custom hooks | 12 |
| Database tables | 9 |
| Database migrations | 13 |
| Edge Functions | 1 (webhook-dispatch) |
| TypeScript types file | 1 (database.ts) |
| Documentation files | 8 |

### Directory Structure

```
agent-playground/
├── src/
│   ├── app/                          # Next.js app directory (routing + pages)
│   │   ├── layout.tsx                # Root layout (405 bytes)
│   │   ├── page.tsx                  # Home (redirects to /chat or /login)
│   │   ├── globals.css               # Global styles (1.6 KB)
│   │   ├── icon.svg                  # App icon/favicon
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx              # Login page (token entry)
│   │   │
│   │   ├── setup/
│   │   │   └── page.tsx              # Onboarding (name, avatar, webhook config)
│   │   │
│   │   ├── chat/
│   │   │   ├── layout.tsx            # Chat layout (sidebar + main) (4.2 KB)
│   │   │   ├── page.tsx              # Chat entry (970 bytes)
│   │   │   └── [conversationId]/
│   │   │       └── page.tsx          # Individual conversation
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx              # Admin dashboard (24 KB, single file)
│   │   │   └── webhooks/
│   │   │       └── page.tsx          # Webhook management
│   │   │
│   │   └── api/                      # API routes (if any custom endpoints)
│   │
│   ├── components/                   # Reusable React components (24 total)
│   │   ├── chat/                     # Chat-specific (10 components)
│   │   │   ├── message-list.tsx
│   │   │   ├── message-input.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   ├── agent-thinking.tsx
│   │   │   ├── typing-indicator.tsx
│   │   │   ├── reactions-display.tsx
│   │   │   ├── file-preview.tsx
│   │   │   ├── url-preview.tsx
│   │   │   ├── markdown-renderer.tsx
│   │   │   └── attachment-upload.tsx
│   │   │
│   │   ├── sidebar/                  # Sidebar-specific (5 components)
│   │   │   ├── sidebar.tsx
│   │   │   ├── conversation-list.tsx
│   │   │   ├── presence-indicator.tsx
│   │   │   ├── user-menu.tsx
│   │   │   └── conversation-search.tsx
│   │   │
│   │   ├── admin/                    # Admin-specific (3 components)
│   │   │   ├── user-management.tsx
│   │   │   ├── agent-config-form.tsx
│   │   │   └── webhook-logs-viewer.tsx
│   │   │
│   │   └── ui/                       # Shared UI components (1 file)
│   │       └── base-components.tsx   # Button, Input, Modal, etc.
│   │
│   ├── hooks/                        # Custom React hooks (12 total)
│   │   ├── use-conversations.ts      # Load/create/update conversations
│   │   ├── use-realtime-messages.ts  # Realtime message subscription
│   │   ├── use-supabase-presence.ts  # Online status tracking
│   │   ├── use-typing-indicator.ts   # Typing status broadcast
│   │   ├── use-reactions.ts          # Emoji reactions CRUD
│   │   ├── use-current-user.ts       # Current auth user
│   │   ├── use-file-upload.ts        # File upload to storage
│   │   ├── use-agent-configs.ts      # Webhook config CRUD
│   │   ├── use-webhook-logs.ts       # Fetch/filter webhook logs
│   │   ├── use-conversation-members.ts  # Member list + roles
│   │   ├── use-agent-thinking.ts     # Track agent processing state
│   │   └── use-pinned-conversations.ts  # Favorite conversations
│   │
│   ├── lib/                          # Utility functions & clients
│   │   ├── auth.ts                   # Auth utilities (token validation, JWT refresh)
│   │   ├── session-utils.ts          # Session helpers
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   └── server.ts             # Server-side Supabase client
│   │   │
│   │   └── [other utilities]
│   │
│   ├── types/
│   │   └── database.ts               # TypeScript database types (4.7 KB)
│   │
│   └── middleware.ts                 # Route protection middleware (351 bytes)
│
├── supabase/                         # Supabase backend configuration
│   ├── config.toml                   # Project config (505 bytes)
│   │
│   ├── migrations/                   # Database migrations (13 files, sequential)
│   │   ├── 001_initial_schema.sql    # Core schema (12.9 KB)
│   │   │   - users, conversations, conversation_members, messages
│   │   │   - attachments, reactions, tables + RLS policies, indexes
│   │   │
│   │   ├── 002_add_user_role.sql     # User role ENUM + role column
│   │   ├── 003_admin_user_management.sql # Admin RLS policies
│   │   ├── 004_add_mock_flag.sql     # is_mock flag for test data
│   │   ├── 005_security_fixes.sql    # RLS improvements
│   │   ├── 006_fix_rls_recursion.sql # SECURITY DEFINER functions
│   │   │
│   │   ├── 007_agent_webhooks.sql    # agent_configs + webhook_delivery_logs (3.2 KB)
│   │   ├── 008_webhook_debug_columns.sql # Debug fields for webhook logs
│   │   │
│   │   ├── 009_create_group_function.sql # Group conversation creation function
│   │   ├── 010_archive_group.sql     # Group archival logic (3.1 KB)
│   │   │
│   │   ├── 011_get_conversation_members_fn.sql # Member retrieval function
│   │   ├── 012_admin_only_create_group.sql # Restrict group creation to admin
│   │   └── 013_user_sessions.sql     # Session tracking table
│   │
│   ├── functions/                    # Edge Functions (Deno)
│   │   └── webhook-dispatch/         # Webhook dispatch (12.9 KB)
│   │       ├── index.ts              # Main dispatch logic
│   │       ├── deno.json             # Deno runtime config
│   │       └── .npmrc                # NPM config
│   │
│   └── seed.sql                      # Seed data template

├── docs/                             # Documentation (8 files, ~150 KB total)
│   ├── API_SPEC.md                   # (29.6 KB) API endpoints + webhooks
│   ├── DB_DESIGN.md                  # (25.8 KB) Schema + RLS + design patterns
│   ├── UI_SPEC.md                    # (35.9 KB) Screens, flows, design system
│   ├── SRD.md                        # (14.8 KB) Requirements + features
│   ├── system-architecture.md        # (11.5 KB) Architecture overview
│   ├── project-overview-pdr.md       # (9.2 KB) PDR + goals
│   ├── codebase-summary.md           # (19.2 KB) Code organization
│   └── project-roadmap.md            # (8.1 KB) Roadmap + milestones

├── public/                           # Static assets
│   └── [images, icons, etc.]

├── scripts/                          # Utility scripts
│   └── seed.ts                       # Database seeding script

├── .env.example                      # Environment variables template

├── Dockerfile                        # Container configuration

├── docker-compose.yml                # Multi-container setup

├── package.json                      # Dependencies, scripts

├── pnpm-lock.yaml                    # Dependency lock file

├── next.config.ts                    # Next.js configuration

├── tsconfig.json                     # TypeScript configuration

├── postcss.config.mjs                # PostCSS (Tailwind) configuration

└── README.md                         # Project overview
```

### Code File Sizes & Complexity

| File | Size | Complexity | Purpose |
|------|------|-----------|---------|
| `src/app/admin/page.tsx` | 24 KB | High | Single-file admin dashboard |
| `docs/UI_SPEC.md` | 35.9 KB | Medium | UI/UX specification |
| `supabase/functions/webhook-dispatch/index.ts` | 12.9 KB | High | Webhook dispatch logic |
| `supabase/migrations/001_initial_schema.sql` | 12.9 KB | High | Core database schema |
| `src/app/chat/layout.tsx` | 4.2 KB | Medium | Chat layout + sidebar |
| `src/types/database.ts` | 4.7 KB | Low | Type definitions |
| `src/middleware.ts` | 351 bytes | Low | Route protection |
| `src/lib/auth.ts` | 1.5 KB | Low | Auth utilities |
| `src/lib/session-utils.ts` | 762 bytes | Low | Session helpers |

### Code Standards & Conventions

**Naming:**
- **Files:** kebab-case (e.g., `message-input.tsx`, `use-conversations.ts`)
- **Components:** PascalCase (e.g., `MessageInput`, `ChatLayout`)
- **Hooks:** camelCase with `use` prefix (e.g., `useConversations`)
- **Variables:** camelCase (e.g., `conversationId`, `unreadCount`)
- **Types/Interfaces:** PascalCase (e.g., `MessageWithSender`, `ConversationType`)

**File Size Limits:**
- Components: <150 LOC (single responsibility)
- Hooks: <100 LOC (focused data logic)
- Pages: <200 LOC (routing, layout)

**Styling:**
- Tailwind CSS only (no CSS modules, BEM, or styled-components)
- Mobile-first responsive design
- Consistent spacing (4px grid), typography (rem units), colors (zinc + blue scale)

**Imports:**
- `@/*` path alias → `src/*`
- Group imports: React, external libs, relative files
- No circular imports

**TypeScript:**
- Strict mode enabled (`"strict": true`)
- Type all function params and returns
- No `any` type (except legacy cases)
- Use discriminated unions for types

---

## 8. Authentication & Security Deep Dive

### Security Features Implemented

| Feature | Implementation | Purpose |
|---------|---|---------|
| Pre-provisioned tokens | 64-char random strings (admin-generated) | Eliminate password complexity |
| HTTPS enforced | TLS 1.2+ required | Prevent MITM attacks |
| HTTP-only cookies | `Secure, SameSite=Strict` flags | Prevent XSS token theft |
| JWT sessions | 24-hour TTL + refresh tokens | Stateless session management |
| Row-Level Security | SQL policies on all 9 tables | Data isolation per user |
| SECURITY DEFINER functions | Helper functions for RLS logic | Prevent authorization bypass |
| HMAC-SHA256 signatures | Required on webhook payloads | Agent endpoint validation |
| Webhook URL validation | HTTPS + no private IPs | Prevent SSRF attacks |
| Signed storage URLs | 1-hour expiry per file | Prevent unauthorized file access |
| IP address logging | User session tracking | Audit and anomaly detection |
| No email/password | Token-only auth | Eliminate password attacks |

### Known Security Considerations

1. **No End-to-End Encryption:** Messages stored plaintext in PostgreSQL. Future enhancement planned.
2. **Token Rotation:** No automatic rotation. Admin must regenerate if compromised.
3. **No Device Management:** All devices can use same token (future: per-device tokens).
4. **Webhook Timeout:** 30 seconds max—slower agents timeout and fail.
5. **Delivery Log Retention:** Auto-delete after 30 days (audits don't persist long-term).

---

## 9. Deployment & Infrastructure

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT TARGETS                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────┐         ┌──────▼───────┐
    │ Vercel │         │  Supabase    │
    │        │         │   Cloud      │
    │ Next.js│         │              │
    │ Server │         │ PostgreSQL   │
    │ Client │         │ Realtime     │
    │ Edge   │         │ Auth         │
    └────────┘         │ Storage      │
                       │ Edge Fns     │
                       └──────────────┘
```

**Frontend Deployment (Vercel):**
- Next.js with `output: "standalone"` for self-contained builds
- Automatic deployments on git push to main branch
- Edge caching for static assets
- Automatic SSL/TLS certificates

**Backend Deployment (Supabase Cloud):**
- PostgreSQL managed database
- Automatic backups and failover
- Realtime API (always-on WebSocket connections)
- Auth service (JWT management)
- Storage buckets (S3-compatible)
- Edge Functions (Deno runtime)

**Local Development:**
- `docker-compose.yml` for local Supabase + PostgreSQL
- `pnpm dev` runs Next.js dev server on http://localhost:3000/login
- Hot reload for frontend changes
- Live reload for migrations (via Supabase CLI)

### Current Capacity Limits

| Metric | Limit | Rationale |
|--------|-------|-----------|
| Concurrent users | <50 | MVP scope; free-tier Supabase = 500 realtime connections |
| Message delivery latency | <500ms | Real-time chat requirement |
| Webhook latency | <5s (30s timeout) | Reasonable for webhook dispatch |
| File size | 10 MB | Practical limit for uploads |
| File retention | Unlimited | S3 storage cost, but logged separately |
| Webhook log retention | 30 days | Auto-cleanup to prevent storage bloat |
| Conversation history | Unlimited (per-message pagination) | Paginated loading prevents memory issues |
| Webhook delivery retries | 3 attempts | Balances reliability vs. resource usage |

### Environment Variables for Deployment

**Production Environment:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://{project-ref}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={anon-key}
SUPABASE_SERVICE_ROLE_KEY={service-role-key}
ADMIN_INITIAL_TOKEN={first-admin-token}
NEXT_PUBLIC_GIPHY_API_KEY={optional-giphy-api-key}
```

**Docker Deployment:**
- `.env.local` file passed to container
- Environment variables injected at runtime
- No hardcoded secrets in Dockerfile or source

---

## 10. Roadmap & Future Direction

### Released (MVP)
**v0.1.0 — Core Chat + Webhooks** (March 17, 2026)
- Real-time messaging, file attachments, markdown rendering
- Token-based auth, role-based access control
- Admin dashboard for user/agent management
- Webhook integration with HMAC-SHA256 signatures
- Delivery logging and retry mechanism

### Upcoming Releases

**v0.2.0 — Search & Discovery** (Q2 2026)
- Full-text message search with filters (sender, date, content type)
- Elasticsearch or PostgreSQL full-text search indexing
- Search UI in sidebar with results view

**v0.3.0 — User Controls** (Q2 2026)
- User blocking (blocked users can't message)
- Conversation muting (hide from sidebar, no notifications)
- Soft deletes for conversations
- Privacy settings per conversation

**v0.4.0 — Message Management** (Q3 2026)
- Edit messages (with edit history)
- Delete messages (soft delete with "message deleted" tombstone)
- Pin important messages
- Audit trail for message changes

**v0.5.0 — Public Agent Marketplace** (Q3 2026)
- Searchable catalog of agents
- Agent preview (description, sample conversation)
- 5-star ratings and reviews
- One-click workspace integration
- Featured/trending agents

**v0.6.0 — Projects & Workspaces** (Q3-Q4 2026)
- Multi-workspace support (separate chats per project)
- Per-workspace agents and members
- Workspace roles (owner, admin, member, guest)
- Quota management per workspace
- Transfer workspace ownership

**v0.7.0 — Tool Marketplace** (Q4 2026)
- Pre-built integrations (Zapier, Slack, Discord)
- Workflow automation triggers
- Custom workflow builder
- API key management
- Usage analytics per tool

**Future (Post-MVP):**
- Voice/video calls (via WebRTC)
- End-to-end encryption (E2EE)
- Offline-first support (PWA with IndexedDB)
- Mobile apps (React Native—notes mention "mobile enhancements now live")
- Agent versioning and rollback
- Cost tracking per agent (token usage, API calls)

### Success Metrics (6-month goal)

| Metric | Target |
|--------|--------|
| Active agents | 20+ |
| Webhook latency | <500ms avg |
| Marketplace entries | 50+ |
| NPS score | >50 |
| Uptime | >99.9% |
| User signups | 100+ |

---

## 11. Codebase Quality & Standards

### Code Organization Principles

1. **Separation of Concerns**
   - Components: UI only (no API calls)
   - Hooks: Data fetching + Realtime subscriptions (no UI)
   - Pages: Routing + layout composition
   - Utilities: Helper functions, no state

2. **DRY (Don't Repeat Yourself)**
   - Reusable components for buttons, inputs, modals
   - Custom hooks for conversations, messages, presence
   - Tailwind utilities instead of custom CSS

3. **Type Safety**
   - All database types auto-generated from schema
   - TypeScript strict mode enforced
   - No implicit `any` types
   - Discriminated unions for API response types

4. **Scalability**
   - Per-conversation Realtime channels (not global)
   - Paginated message loading (not all history at once)
   - Indexed queries for sidebar sorting
   - Lazy-loaded components with React.lazy()

### Testing Approach

- **No unit tests visible in repo** (MVP phase)
- Manual testing with pre-seeded accounts
- Browser DevTools for debugging Realtime subscriptions
- Webhook delivery logging for integration verification

### Documentation Quality

**8 comprehensive documentation files:**
- API_SPEC.md: 29.6 KB (endpoint reference)
- DB_DESIGN.md: 25.8 KB (schema + RLS + patterns)
- UI_SPEC.md: 35.9 KB (screens + flows + design system)
- SRD.md: 14.8 KB (requirements)
- system-architecture.md: 11.5 KB (architecture)
- project-overview-pdr.md: 9.2 KB (PDR + goals)
- codebase-summary.md: 19.2 KB (code organization)
- project-roadmap.md: 8.1 KB (release timeline)

**Total documentation: ~150 KB** (well-documented for MVP)

---

## 12. Unresolved Questions & Observations

### Ambiguities in Research

1. **Webhook Response Handling:** Documentation mentions agents can POST back OR return JSON from webhook. Exact priority/conflict resolution unclear. (Assumption: Both methods supported, webhook response takes precedence.)

2. **Message Editing History:** Roadmap mentions v0.4.0 will add message edits with history. No current implementation visible. (Assumption: Edit history stored separately, timestamps in metadata.)

3. **Agent-to-Agent Communication:** Webhook dispatch skips if sender is agent, unless @mentioned in groups. But what if Agent A @mentions Agent B in a group? Does B receive webhook? (Assumption: Yes, B receives webhook if @mentioned explicitly.)

4. **Pinned Conversations:** `use-pinned-conversations.ts` hook exists, but no UI visible in admin/chat. (Assumption: Partially implemented, may be hidden feature.)

5. **Mobile Enhancements:** Project PDR mentions "mobile enhancements now live" but repo is web-only. (Assumption: Separate mobile repo exists; local directory is `agent-playground-mobile`.)

6. **File Preview Metadata:** URL previews extract title/description/image. Storage for preview data unclear. (Assumption: Stored in `messages.metadata` JSONB column.)

7. **Conversation Archival:** v0.3.0 mentions "soft deletes" for conversations. Migration 010 mentions "archive_group" function. Different features or same? (Assumption: Archive = soft delete, tombstone in sidebar with archive indicator.)

8. **Webhook Secret Management:** Initial setup in `/setup` page, but secret transmission/storage unclear. Is it shown to user once or regenerable? (Assumption: Shown once after setup, regenerable by admin/agent.)

9. **Agent Mentions in DMs:** @mention logic applies to groups. For DMs with agents, mention system unclear. (Assumption: @mentions ignored in DMs, webhook always dispatched to agent in DM.)

10. **GIPHY Integration:** `.env.example` includes GIPHY key, but no visible feature in code. (Assumption: Future feature or incomplete implementation.)

### Notable Architectural Decisions

1. **Single Admin File (24 KB):** Admin dashboard is single `page.tsx` file. Not split into sub-components. Likely refactored in future phases.

2. **Webhook Dispatch as Edge Function:** Instead of Node.js background job, uses Supabase Deno Edge Function. Faster cold start, but limited customization.

3. **No Message Encryption:** Messages stored plaintext. Future E2EE may require significant schema changes (encrypted column, key distribution).

4. **Token-Only Auth:** No email/password reduces login friction but increases admin burden (token distribution via email). Scales to ~100 users easily, but not 1000+.

5. **Realtime Over Polling:** Supabase Realtime for instant delivery. Polling would be simpler but less responsive.

6. **Per-Conversation Channels:** Realtime subscribed per conversation. Prevents global subscription overhead, scales better.

---

## 13. Quick Reference: Key APIs & Webhooks

### Most Important Endpoints for Integration

**For Frontend:**
```
POST /rpc/login_with_token          # User login
GET  /rpc/get_my_conversations      # Load conversation list
GET  /rest/v1/messages              # Load conversation history
POST /rest/v1/messages              # Send message
POST /rpc/find_or_create_dm         # Find/create DM
```

**For Agents:**
```
POST {webhook_url}                  # Receive message webhook
POST /rest/v1/messages              # Send response message
GET  /rest/v1/messages              # Load conversation history
```

**For Admins:**
```
POST /rest/v1/users                 # Create user + generate token
GET  /rest/v1/webhook_delivery_logs # View webhook delivery status
PATCH /rest/v1/agent_configs        # Configure agent webhook
```

### Common Webhook Payload

```json
{
  "event": "message:new",
  "message": {
    "id": "uuid",
    "content": "Hello agent!",
    "content_type": "text",
    "created_at": "2026-03-17T10:30:00Z"
  },
  "sender": {
    "id": "uuid",
    "username": "alice",
    "role": "user"
  },
  "conversation": {
    "id": "uuid",
    "type": "dm",
    "members": [
      { "id": "uuid", "username": "alice", "role": "user" },
      { "id": "uuid", "username": "claude-agent", "role": "agent" }
    ]
  },
  "history": [
    { "id": "uuid", "content": "Previous message...", "sender": {...}, "created_at": "..." },
    ...
  ]
}
```

---

## Summary

Agent Playground is a **well-architected, MVP-ready chat platform** built on modern tech stack (Next.js 16, React 19, Supabase). It solves a real problem (easy agent integration via webhooks) with clean code organization, comprehensive documentation, and thoughtful UX design.

**Strengths:**
- Token-based auth eliminates password complexity
- RLS ensures data isolation at SQL level
- Webhook dispatch with retry + logging is production-grade
- Real-time features (<500ms) enable responsive chat
- Comprehensive documentation (8 files, ~150 KB)
- Modular code structure (24 components, 12 hooks)

**Areas for Growth:**
- No unit tests yet (MVP phase)
- Admin dashboard is single 24KB file (refactoring opportunity)
- Limited webhook customization (one webhook per agent)
- No message encryption (planned for future)
- Token rotation not automated (admin-driven)

**Best For:**
- AI agent builders testing with real users
- Teams integrating webhooks into chat workflows
- Proof-of-concept collaborations between humans and agents

