# Agent Playground Mobile — HTML Prototypes

Production-ready HTML/CSS/JS prototypes generated from `docs/UI_SPEC.md`.

## How to View

Open any `.html` file in a browser. Each screen renders inside a 393x852 iPhone 15 frame. Screens link to each other via navigation buttons.

**Start here:** `s01-login.html` or `s02-conversation-list.html`

## Screen Index

| File | Screen | CJX Stage | Description |
|------|--------|-----------|-------------|
| `s01-login.html` | S-01 Login | Onboarding | Token input, paste detection, error states |
| `s02-conversation-list.html` | S-02 Conversation List | Usage | DM + group list, unread badges, presence, typing |
| `s03-dm-chat.html` | S-03 DM Chat | Usage | 1-on-1 messages, markdown, code blocks, typing indicator |
| `s04-group-chat.html` | S-04 Group Chat | Usage | Multi-user messages, sender names, @mention autocomplete |
| `s05-admin-users.html` | S-05 Admin Users | Discovery | User list, search, role badges, create user modal |
| `s06-webhook-logs.html` | S-06 Webhook Logs | Discovery | Filterable webhook log list, status badges, latency |
| `s07-image-viewer.html` | S-07 Image Viewer | Usage | Fullscreen dark viewer, share/save actions, SVG chart |
| `s08-conversation-info.html` | S-08 Conversation Info | Usage | Member list, roles, presence, shared files |

## FR Mapping

| FR | Feature | Screens |
|----|---------|---------|
| FR-01 | Token Login | S-01 |
| FR-02 | Session Persistence | S-01 |
| FR-03 | Conversation List | S-02 |
| FR-04 | Unread Badges | S-02 |
| FR-05 | Direct Messaging | S-03 |
| FR-06 | Real-time Messages | S-03, S-04 |
| FR-07 | Markdown Rendering | S-03, S-04 |
| FR-08 | Message Input | S-03, S-04 |
| FR-09 | Message Pagination | S-03, S-04 |
| FR-10 | Group Chat | S-04, S-08 |
| FR-11 | @Mention Autocomplete | S-04 |
| FR-12 | File Attachments | S-03, S-04, S-08 |
| FR-13 | Image Sharing | S-03, S-04, S-07 |
| FR-14 | Typing Indicators | S-03, S-04 |
| FR-15 | Emoji Reactions | S-03, S-04 |
| FR-16 | Online Presence | S-02, S-08 |
| FR-17 | Read Receipts | S-02, S-03, S-04 |
| FR-19 | Agent Thinking Indicator | S-03 |
| FR-20 | Admin: User List | S-05 |
| FR-21 | Admin: Create User | S-05 |
| FR-22 | Admin: Webhook Logs | S-06 |

## Shared Files

| File | Purpose |
|------|---------|
| `styles.css` | Design tokens from UI_SPEC (colors, typography, spacing, shadows) |
| `components.css` | Reusable component styles (avatars, badges, input bar, etc.) |
| `interactions.js` | CJX animations, auto-grow textarea, mention autocomplete, filter chips |
