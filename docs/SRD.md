# System Requirement Definition (SRD)

**Project:** Agent Playground Mobile
**Version:** 0.1.0
**Date:** 2026-03-17
**Status:** Draft
**Source:** [agent-playground](https://github.com/phucsystem/agent-playground) web v0.1.0

---

## 1. System Overview

Agent Playground Mobile is a React Native (Expo) companion app for the existing Agent Playground web platform. It enables AI agent builders and testers to chat with AI agents on-the-go using the **same Supabase backend** — no new backend work required.

### Goals
- Provide mobile access to all conversations (DM + group)
- Deliver real-time messaging with <500ms latency
- Enable push notifications for agent responses
- Support markdown rendering for AI-generated content (code blocks, tables)
- Allow file/image sharing from device camera and gallery

### Constraints
- Shared Supabase backend (PostgreSQL, Realtime, Auth, Storage, Edge Functions)
- Token-based authentication (64-char pre-provisioned tokens)
- Invite-only platform (<50 concurrent users in MVP)
- Max 10MB file upload per attachment

---

## 2. Actors (User Roles)

| ID | Role | Description | Permissions |
|----|------|-------------|-------------|
| A-01 | Human Tester | Team member who chats with AI agents to evaluate quality | Send/receive messages, react, upload files |
| A-02 | Agent Builder | Developer who builds AI agents via webhooks | Same as Human Tester + monitor agent responses |
| A-03 | Admin | Platform manager | All user permissions + user management, webhook log viewing |
| A-04 | AI Agent | Automated participant (webhook-driven, no mobile login) | Receive webhooks, send messages via API |

---

## 3. Functional Requirements (FR-xx)

### Phase 1 — Core Chat (P1)

| ID | Feature | Priority | Description | Screens |
|----|---------|----------|-------------|---------|
| FR-01 | Token Login | P1 | User authenticates with 64-char provisioned token. Token exchanged for JWT via `POST /rpc/login_with_token`. JWT stored securely (expo-secure-store). Auto-detect clipboard paste. | S-01 |
| FR-02 | Session Persistence | P1 | JWT persisted across app restarts. Auto-logout on token expiry (24h). Show login screen when session invalid. | S-01 |
| FR-03 | Conversation List | P1 | Display all conversations (DM + group) sorted by `last_message_created_at` descending. Show avatar, name, last message preview, timestamp. Pull-to-refresh. | S-02 |
| FR-04 | Unread Badges | P1 | Show unread message count per conversation. Calculated from `last_read_at` in `conversation_members`. Badge clears on conversation open. | S-02 |
| FR-05 | Direct Messaging | P1 | 1-on-1 chat with another user or agent. User messages right-aligned in blue bubbles. Agent messages left-aligned, full-width, no bubble background. | S-03 |
| FR-06 | Real-time Messages | P1 | Subscribe to Supabase Realtime `postgres_changes` channel. New messages appear instantly (<500ms). Auto-scroll to bottom on new message. | S-03, S-04 |
| FR-07 | Markdown Rendering | P1 | Render agent responses as markdown: headings, bold, italic, lists, links, code blocks with syntax highlighting, tables. Horizontal scroll for wide code blocks. | S-03, S-04 |
| FR-08 | Message Input | P1 | Auto-growing text input (1-4 lines). Send button disabled when empty. Keyboard-aware scroll. Attachment button for files. | S-03, S-04 |
| FR-09 | Message Pagination | P1 | Load 30 messages initially. Scroll-up triggers older message loading (infinite scroll). Show loading spinner during fetch. | S-03, S-04 |

### Phase 2 — Rich Features (P2)

| ID | Feature | Priority | Description | Screens |
|----|---------|----------|-------------|---------|
| FR-10 | Group Chat | P2 | Multi-participant conversations. Display sender name + avatar above each message. Show member count in header. | S-04 |
| FR-11 | @Mention Autocomplete | P2 | Type `@` to trigger member autocomplete dropdown. Selected mention highlighted in message. Agents only receive webhook when @mentioned in groups. | S-04 |
| FR-12 | File Attachments | P2 | Upload files via expo-document-picker. Max 10MB. Upload to Supabase Storage (`attachments/{conversationId}/{messageId}/{filename}`). Show upload progress bar. | S-03, S-04 |
| FR-13 | Image Sharing | P2 | Upload images via expo-image-picker (camera or gallery). Auto-compress images >2MB. Inline preview in chat (max width 280px). Tap to view fullscreen. | S-03, S-04 |
| FR-14 | Typing Indicators | P2 | Subscribe to Supabase Realtime `broadcast` channel. Show "[Name] is typing..." with animated dots. 3-second debounce on sending typing events. | S-03, S-04 |
| FR-15 | Emoji Reactions | P2 | Long-press message to add heart reaction. Show reaction count below message. Toggle own reaction on tap. | S-03, S-04 |
| FR-16 | Online Presence | P2 | Subscribe to Supabase Realtime `presence` channel. Green dot for online users. Grey dot for offline. Update presence on app foreground/background. | S-02 |
| FR-17 | Read Receipts | P2 | Mark conversation as read via `POST /rpc/mark_conversation_read`. Update `last_read_at` on conversation open. Reflect in unread badges. | S-02, S-03, S-04 |

### Phase 3 — Notifications & Admin (P3)

| ID | Feature | Priority | Description | Screens |
|----|---------|----------|-------------|---------|
| FR-18 | Push Notifications | P3 | Register device token via Expo Notifications. Trigger push on new message (Supabase Edge Function). Show sender name + message preview. Tap opens conversation. | Background |
| FR-19 | Agent Thinking Indicator | P3 | Show animated thinking dots when webhook is pending for agent. 30-second timeout, then show "Agent may be offline". | S-03, S-04 |
| FR-20 | Admin: User List | P3 | List all users (humans + agents). Search by name. Show role badge (admin/user/agent). Tap to view/edit user details. | S-05 |
| FR-21 | Admin: Create User | P3 | Form to create new user: username, role, email (optional). Auto-generate 64-char token. Copy token to clipboard. | S-05 |
| FR-22 | Admin: Webhook Logs | P3 | Filterable list of webhook deliveries. Show agent, status (pending/delivered/failed), latency, timestamp. Tap to view full payload + response. | S-06 |

---

## 4. Screen List (S-xx)

| ID | Screen Name | Description | Phase |
|----|-------------|-------------|-------|
| S-01 | Login | Token input field, paste-from-clipboard, validation, error display | 1 |
| S-02 | Conversation List | All conversations sorted by recent, unread badges, presence dots, pull-to-refresh | 1 |
| S-03 | DM Chat | 1-on-1 message view with bubbles, markdown, input bar, typing indicator | 1 |
| S-04 | Group Chat | Multi-user message view with sender names, @mention, member count | 2 |
| S-05 | Admin: Users | User list, search, create/edit user, token management (admin-only) | 3 |
| S-06 | Admin: Webhook Logs | Webhook delivery log list, filter, payload detail view (admin-only) | 3 |
| S-07 | Image Viewer | Fullscreen image preview with pinch-to-zoom, share, save | 2 |
| S-08 | Conversation Info | Member list, conversation name (groups), leave conversation | 2 |

---

## 5. Entity List (E-xx)

Reuses existing Supabase backend. No new tables required.

| ID | Entity | Description | Key Fields | Phase |
|----|--------|-------------|------------|-------|
| E-01 | users | Human users and AI agents | id, username, role, token, avatar_url, email, is_mock | 1 |
| E-02 | conversations | DM or group chats | id, type, name, description, last_message_created_at | 1 |
| E-03 | conversation_members | Membership and read state | conversation_id, user_id, role, last_read_at, deleted_at | 1 |
| E-04 | messages | Chat messages | id, conversation_id, user_id, content, content_type, metadata | 1 |
| E-05 | attachments | File links to messages | message_id, file_name, file_size, file_type, storage_path | 2 |
| E-06 | reactions | Emoji reactions on messages | message_id, user_id, emoji | 2 |
| E-07 | agent_configs | Webhook configuration per agent | user_id, webhook_url, webhook_secret, is_active | 3 |
| E-08 | webhook_delivery_logs | Webhook audit trail | agent_id, message_id, delivery_status, latency_ms, retry_count | 3 |
| E-09 | user_sessions | Active sessions for presence | user_id, session_token, ip_address, expires_at | 1 |

---

## 6. Non-Functional Requirements

### Performance
- NFR-01: Message delivery latency <500ms via Supabase Realtime
- NFR-02: App cold start <3 seconds on mid-range devices
- NFR-03: Conversation list renders within 1 second for 50 conversations
- NFR-04: Smooth 60fps scrolling through message history
- NFR-05: Image compression to <500KB before upload on cellular

### Security
- NFR-06: JWT stored in expo-secure-store (encrypted keychain/keystore)
- NFR-07: All API calls over HTTPS
- NFR-08: No sensitive data in AsyncStorage or logs
- NFR-09: Auto-logout on JWT expiry (24h TTL)
- NFR-10: RLS enforced server-side (same policies as web)

### Reliability
- NFR-11: Realtime reconnection on network recovery (exponential backoff)
- NFR-12: Optimistic message send with retry on failure
- NFR-13: Graceful handling of Supabase service unavailability
- NFR-14: File upload retry (up to 3 attempts)

### Compatibility
- NFR-15: iOS 15+ and Android 12+ (API 31+)
- NFR-16: React Native 0.76+ with New Architecture
- NFR-17: Expo SDK 52+
- NFR-18: Portrait orientation primary, landscape supported for image viewer

### Accessibility
- NFR-19: Touch targets minimum 44x44pt
- NFR-20: Dynamic text size support (iOS Dynamic Type, Android font scaling)
- NFR-21: VoiceOver/TalkBack labels on all interactive elements
- NFR-22: Sufficient color contrast (WCAG 2.1 AA — 4.5:1 for text)

---

## 7. Key Technical Decisions (D-xx)

| ID | Decision | Chosen | Rationale |
|----|----------|--------|-----------|
| D-01 | Framework | React Native (Expo SDK 52+) | Shared TypeScript with web, Expo simplifies build/deploy, OTA updates |
| D-02 | Navigation | React Navigation v7 (native stack) | Industry standard, stack + bottom tab support, deep linking |
| D-03 | Backend | Existing Supabase (shared instance) | Zero backend work, same DB/auth/realtime/storage |
| D-04 | State Management | Zustand + TanStack Query v5 | Zustand for UI state, TanStack Query for server state + caching |
| D-05 | Markdown | @ronradtke/react-native-markdown-display | Native rendering, code highlighting, table support |
| D-06 | Push Notifications | expo-notifications | Managed push service, APNs/FCM abstraction |
| D-07 | File Handling | expo-image-picker + expo-document-picker | Native camera/gallery/file access |
| D-08 | Styling | NativeWind v4 (Tailwind for RN) | Consistent with web app Tailwind approach |
| D-09 | Secure Storage | expo-secure-store | Encrypted keychain (iOS) / keystore (Android) for JWT |
| D-10 | List Virtualization | FlashList | High-performance list rendering for messages/conversations |

---

## 8. API Endpoints (Existing)

All endpoints are existing Supabase REST/RPC — no new backend work.

| Method | Endpoint | Purpose | Phase |
|--------|----------|---------|-------|
| POST | `/rpc/login_with_token` | Exchange token for JWT | 1 |
| GET | `/rest/v1/conversations` | List user's conversations | 1 |
| GET | `/rest/v1/messages?conversation_id=eq.{id}` | Fetch messages for conversation | 1 |
| POST | `/rest/v1/messages` | Send a message | 1 |
| POST | `/rpc/mark_conversation_read` | Update read receipt | 2 |
| POST | `/storage/v1/object/attachments/{path}` | Upload file attachment | 2 |
| GET | `/rest/v1/users` | List all users (admin) | 3 |
| POST | `/rest/v1/users` | Create user (admin) | 3 |
| GET | `/rest/v1/webhook_delivery_logs` | Fetch webhook logs (admin) | 3 |

### Realtime Channels

| Channel | Type | Purpose | Phase |
|---------|------|---------|-------|
| `messages:conversation_id=eq.{id}` | postgres_changes | New message notifications | 1 |
| `presence:{conversationId}` | presence | Online/offline status | 2 |
| `typing:{conversationId}` | broadcast | Typing indicators | 2 |

---

## 9. Out of Scope

- Agent webhook configuration (complex form, web-only)
- Full admin dashboard (system status, storage metrics)
- QR code token scanning
- Message search (web roadmap v0.2.0)
- Message edit/delete (web roadmap v0.4.0)
- Multi-workspace support (web roadmap v0.6.0)
- Offline mode / local message caching
- Voice/video messaging
- Dark mode (deferred to post-MVP)

---

## 10. Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| R-01 | Supabase Realtime instability on mobile | Messages delayed/lost | Medium | Reconnection logic, fallback polling every 5s |
| R-02 | 64-char token UX on mobile keyboards | Login friction | High | Clipboard paste detection, large monospace input |
| R-03 | Complex markdown on small screens | Poor readability | Medium | Responsive styles, horizontal scroll for code |
| R-04 | Push notification certification complexity | Delayed Phase 3 | Low | Expo managed push service avoids native config |
| R-05 | Large file uploads on cellular | Slow/failed uploads | Medium | Progress indicator, image compression, retry logic |
| R-06 | Expo SDK limitations for native features | Missing functionality | Low | Use development builds instead of Expo Go |
