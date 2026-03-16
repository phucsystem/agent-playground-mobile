# Lean MVP Analysis: Agent Playground Mobile

**Date:** 2026-03-17
**Type:** MVP Definition
**Source:** https://github.com/phucsystem/agent-playground (Web v0.1.0)
**Target:** React Native mobile app sharing same Supabase backend

---

## Problem Statement

AI agent builders and testers need to interact with agents on-the-go. The current web-only Agent Playground limits accessibility — users can't respond to agent messages, monitor conversations, or test agents from their phones. A mobile app provides push notifications for real-time agent responses, native camera/file sharing, and always-available access to the testing environment.

---

## Target Users (-> IPA User Roles)

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| **Agent Builder** | Developer who builds & tests AI agents via webhooks | Monitor agent responses, debug webhook issues on mobile |
| **Human Tester** | Team member chatting with agents to evaluate quality | Reply to agent messages anytime, anywhere |
| **Admin** | Platform manager who creates users/agents | Quick user management, view webhook health |

---

## MVP Features (-> IPA Feature List FR-xx)

| Priority | Feature | User Value | Screen | Assumption |
|----------|---------|------------|--------|------------|
| P1 | Token-based login | Access the platform | S-01 Login | Users have tokens from admin |
| P1 | Conversation list | See all DMs and groups | S-02 Conversations | Users have <50 conversations |
| P1 | Direct messaging | Chat with agents 1-on-1 | S-03 DM Chat | Core use case |
| P1 | Real-time messages | Instant message delivery | S-03/S-04 | Supabase Realtime works on mobile |
| P1 | Group chat with @mentions | Multi-participant conversations | S-04 Group Chat | Groups have <20 members |
| P1 | Markdown rendering | Read agent responses properly | S-03/S-04 | Agents reply in markdown |
| P1 | Typing indicators | Know when agent is processing | S-03/S-04 | Reduces perceived latency |
| P2 | File/image attachments | Share files with agents | S-03/S-04 | 10MB limit sufficient |
| P2 | Image previews | View shared images inline | S-03/S-04 | Common in agent testing |
| P2 | Push notifications | Get alerted to new messages | Background | Key mobile differentiator |
| P2 | Online/offline presence | See who's active | S-02 | Helps know agent availability |
| P2 | Emoji reactions | Quick feedback on messages | S-03/S-04 | Heart reactions only (v1) |
| P2 | Read receipts | Track conversation progress | S-02 | Unread count in conversation list |
| P3 | Admin: user management | Create/edit users on mobile | S-05 Admin | Admins need quick access |
| P3 | Admin: webhook logs | Debug webhook delivery | S-06 Webhook Logs | Critical for agent debugging |
| P3 | Agent thinking indicator | Visual feedback while webhook processes | S-03/S-04 | 30s timeout from web app |

---

## Out of Scope (Post-MVP)

- **Agent webhook configuration** — complex form, better on web
- **Full admin dashboard** — system status, storage metrics stay web-only
- **QR code token scanning** — nice-to-have, not core
- **Message search** — web roadmap v0.2.0, defer for mobile too
- **Message edit/delete** — web roadmap v0.4.0
- **Multi-workspace support** — web roadmap v0.6.0
- **Offline mode / local caching** — adds complexity, validate need first
- **Dark mode** — defer to phase 2, focus on functionality first

---

## Implementation Phases (Estimated)

| Phase | Focus | Key Features | Effort |
|-------|-------|--------------|--------|
| 1 | Core Chat | Login, conversation list, DM chat, real-time messages, markdown | L |
| 2 | Rich Features | Group chat, @mentions, file attachments, image previews, typing indicators, reactions | M |
| 3 | Notifications & Admin | Push notifications, presence, admin screens, webhook logs | M |

---

## Plan Structure Preview

```
plans/{date}-agent-playground-mobile/
├── plan.md
├── phase-01-core-chat/
│   ├── data.md       # Supabase client, auth, real-time subscriptions
│   ├── core.md       # State management, hooks, services
│   └── ui.md         # Login, conversation list, DM chat screens
├── phase-02-rich-features/
│   ├── data.md       # File upload, attachments
│   ├── core.md       # Group logic, mentions, reactions
│   └── ui.md         # Group chat, file picker, image preview
└── phase-03-notifications-admin/
    ├── core.md       # Push notification service, presence
    └── ui.md         # Admin screens, webhook log viewer
```

---

## MVP Screens (-> IPA Screen List S-xx)

| Screen | Purpose | Features |
|--------|---------|----------|
| S-01 Login | Token entry & authentication | Token input, validation, JWT storage |
| S-02 Conversations | Browse all chats | List sorted by recent, unread badges, presence dots, pull-to-refresh |
| S-03 DM Chat | 1-on-1 messaging | Message bubbles, markdown, typing indicator, file attach, reactions |
| S-04 Group Chat | Multi-user messaging | Sender names, @mention autocomplete, member count |
| S-05 Admin Users | User management | List users, create/edit, token management |
| S-06 Webhook Logs | Debug agent webhooks | Filterable log list, status/latency, payload detail |

---

## Data Entities (-> IPA Entity List E-xx)

Reuses existing Supabase backend — no new tables needed.

| Entity | Description | Key Fields |
|--------|-------------|------------|
| E-01 users | Human users & AI agents | id, username, role, token, avatar_url |
| E-02 conversations | DM or group chats | id, type, name, last_message_created_at |
| E-03 conversation_members | Membership & read state | conversation_id, user_id, role, last_read_at |
| E-04 messages | Chat messages | id, conversation_id, user_id, content, content_type, metadata |
| E-05 attachments | File links to messages | message_id, file_name, file_size, storage_path |
| E-06 reactions | Emoji reactions | message_id, user_id, emoji |

Admin-only (Phase 3):
| E-07 agent_configs | Webhook configuration | user_id, webhook_url, is_active |
| E-08 webhook_delivery_logs | Delivery audit trail | agent_id, message_id, delivery_status, latency_ms |

---

## User Flow (-> IPA Screen Flow)

```
[S-01 Login] --token valid--> [S-02 Conversations]
                                    |
                          +---------+---------+
                          |                   |
                    [S-03 DM Chat]    [S-04 Group Chat]
                          |                   |
                    (send message,      (send message,
                     attach file,        @mention agent,
                     react)              attach file)

[S-02 Conversations] --admin tab--> [S-05 Admin Users]
                                         |
                                    [S-06 Webhook Logs]
```

---

## Tech Decisions (-> IPA Key Decisions D-xx)

| Decision | Context | Chosen | Rationale |
|----------|---------|--------|-----------|
| D-01 Framework | Cross-platform mobile | React Native (Expo) | Shared JS/TS with web app, large ecosystem, Expo simplifies build/deploy |
| D-02 Navigation | Screen routing | React Navigation | Industry standard for RN, supports stack + tab navigators |
| D-03 Backend | API & realtime | Existing Supabase (shared) | Zero backend work, same DB/auth/realtime/storage |
| D-04 State | Client state management | Zustand or TanStack Query | Lightweight, works well with Supabase subscriptions |
| D-05 Markdown | Render agent responses | react-native-markdown-display | Native markdown rendering with code highlighting |
| D-06 Push | Notifications | Expo Notifications + Supabase Edge Function | Expo handles device tokens; Edge Function triggers on message INSERT |
| D-07 File handling | Camera & file picker | expo-image-picker + expo-document-picker | Native access to camera roll and file system |
| D-08 Styling | UI framework | NativeWind (Tailwind for RN) | Consistent with web app's Tailwind approach |

---

## Key Assumptions to Validate

1. **Supabase Realtime works reliably on React Native** — Validate: Build a spike with supabase-js in Expo, test message latency on iOS/Android
2. **Token-based auth is sufficient for mobile** — Validate: Test UX of pasting 64-char tokens on mobile (may need QR code later)
3. **Users want mobile access** — Validate: Survey 3+ current web users about mobile usage patterns
4. **Push notifications are the killer feature** — Validate: Ask users if delayed response to agents is a pain point
5. **Markdown renders well on mobile** — Validate: Test complex agent responses (code blocks, tables) on small screens

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase Realtime instability on mobile | Messages delayed or lost | Implement reconnection logic, fallback polling |
| 64-char token UX on mobile | Users struggle to log in | Add clipboard paste detection, consider QR scan in P2 |
| Complex markdown on small screens | Poor readability | Responsive markdown styles, horizontal scroll for code blocks |
| Push notification setup complexity | Delayed P3 delivery | Use Expo's managed push service, avoid native config |
| Large file uploads on cellular | Slow/failed uploads | Show progress indicator, compress images before upload, retry logic |
| Expo SDK limitations | Missing native features | Use development build instead of Expo Go if needed |

---

## GATE 1: Scope Validation

Before proceeding to `/ipa:spec`, complete this checklist:

- [ ] Talked to 3+ potential users about the problem
- [ ] Users confirmed mobile access is a real pain point
- [ ] Users confirmed push notifications would improve their workflow
- [ ] MVP scope acceptable (3 phases)
- [ ] Assumptions documented for later validation
- [ ] Team aligned on priorities (P1 chat first, P2 rich features, P3 admin/notifications)

**WARNING: Do NOT proceed if scope > 3 phases without re-scoping**

---

## Next Step

After GATE 1 validation:
-> Run `/ipa:spec` to generate SRD.md + UI_SPEC.md (with Design System)

Suggested command:
```
/ipa:spec @docs/ @https://github.com/phucsystem/agent-playground
```
