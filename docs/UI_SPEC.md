# Basic Design (UI Specification)

**Project:** Agent Playground Mobile
**Version:** 0.1.0
**Date:** 2026-03-17
**Design Style:** ChatGPT + Claude Hybrid (Minimalist, Technical, Trustworthy)

---

## 1. Design System

### Reference Source
- Style: ChatGPT mobile + Claude mobile hybrid
- Vibe: Clean minimalist with technical depth
- Extracted: 2026-03-17

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#0084FF` | Main actions, send button, user message bubbles, links |
| `--color-primary-light` | `#E8F4FD` | Selected/active conversation background |
| `--color-background` | `#FFFFFF` | Screen backgrounds |
| `--color-surface` | `#F7F7F8` | Conversation list item background, input bar |
| `--color-agent-bubble` | `#F0F0F0` | Agent message background (subtle, not white) |
| `--color-user-bubble` | `#0084FF` | User message bubble background |
| `--color-user-text` | `#FFFFFF` | Text on user bubbles |
| `--color-text-primary` | `#1A1A1A` | Primary text, message content |
| `--color-text-secondary` | `#6B7280` | Timestamps, subtitles, placeholders |
| `--color-text-tertiary` | `#9CA3AF` | Disabled states, hints |
| `--color-border` | `#E5E7EB` | Dividers, input borders |
| `--color-success` | `#10B981` | Online presence dot, delivered status |
| `--color-warning` | `#F59E0B` | Pending webhook status |
| `--color-error` | `#EF4444` | Failed status, error messages, destructive actions |
| `--color-agent-badge` | `#3B82F6` | Bot badge on agent avatars |
| `--color-code-bg` | `#1E1E1E` | Code block background (dark) |
| `--color-code-text` | `#D4D4D4` | Code block text (light on dark) |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'Inter', system-ui, -apple-system` | All UI text |
| `--font-mono` | `'JetBrains Mono', 'SF Mono', monospace` | Code blocks, token input |
| `--text-h1` | `24px / 700` | Screen titles |
| `--text-h2` | `20px / 600` | Section headers |
| `--text-h3` | `16px / 600` | Subsection headers, conversation names |
| `--text-body` | `16px / 400` | Message content, form labels |
| `--text-body-sm` | `14px / 400` | Last message preview, member names |
| `--text-caption` | `12px / 400` | Timestamps, badges, helper text |
| `--text-code` | `13px / 400` | Code block content |
| `--text-input` | `16px / 400` | Input fields (16px minimum prevents iOS zoom) |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps (badge padding, icon gaps) |
| `--space-sm` | `8px` | Compact spacing (between elements in a row) |
| `--space-md` | `12px` | Default spacing (message padding, list gaps) |
| `--space-lg` | `16px` | Section spacing, screen padding |
| `--space-xl` | `24px` | Major section gaps |
| `--space-2xl` | `32px` | Screen top/bottom safe areas |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `8px` | Buttons, input fields |
| `--radius-md` | `12px` | Cards, conversation items |
| `--radius-lg` | `18px` | Message bubbles (user) |
| `--radius-xl` | `20px` | Image previews, modals |
| `--radius-full` | `9999px` | Avatars, badges, presence dots |

### Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Input bar, floating elements |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.1)` | Mention autocomplete dropdown |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.12)` | Modals, action sheets |

### Component Patterns

**Message Bubbles:**
- User: right-aligned, `--color-user-bubble` background, `--radius-lg` with bottom-right square corner, white text
- Agent: left-aligned, full-width, `--color-agent-bubble` background or transparent, markdown content, avatar + bot badge on left
- System: centered, `--color-text-secondary`, small text, no bubble

**Navigation:**
- Bottom tab bar: 2 tabs (Chats, Admin) for admins; 1 tab (Chats) for regular users
- Stack navigation within each tab
- Header: back arrow + conversation name + info button

**Input Bar:**
- Fixed at bottom, above keyboard
- Rounded container with `--color-surface` background
- Attachment icon (left), auto-growing textarea (center), send icon (right)
- Send button: `--color-primary` when active, `--color-text-tertiary` when disabled

**Avatars:**
- 40px circle for conversation list
- 32px circle for message sender
- Initials fallback with hash-based background color
- Agent: blue bot badge overlay (bottom-right, 12px)

### CJX Stage Variables

| Stage | Screens | Design Focus |
|-------|---------|--------------|
| Onboarding | S-01 Login | Simple token paste, clear error states, welcoming copy |
| Usage | S-02, S-03, S-04 | Fast navigation, readable messages, minimal friction |
| Retention | S-03, S-04 (push) | Push notifications, unread badges, presence indicators |
| Discovery | S-05, S-06 | Admin features revealed progressively (tab bar for admins only) |

---

## 2. Screen Flow

```
                    App Launch
                        |
                   [Auth Check]
                    /         \
              No JWT          Valid JWT
                |                |
            [S-01 Login]    [S-02 Conversations]
                |                |
           Token Valid      Tap Conversation
                |            /          \
        [S-02 Conversations]          [Type Check]
                               DM /           \ Group
                          [S-03 DM Chat]  [S-04 Group Chat]
                               |                |
                          [S-07 Image]    [S-08 Conv Info]
                          (fullscreen)    (member list)

        [Bottom Tab: Admin] (admin-only)
                |
        [S-05 Admin Users]
                |
        [S-06 Webhook Logs]
```

---

## 3. Screen Specifications

### S-01: Login Screen

**CJX Stage:** Onboarding

**Layout:** Centered card on white background

**Elements:**
- App logo + name ("Agent Playground") — centered, top 30%
- Subtitle: "Enter your access token to continue" — `--text-body-sm`, `--color-text-secondary`
- Token input field:
  - Full-width, `--font-mono`, `--text-input`
  - `--color-surface` background, `--radius-sm` border
  - Placeholder: "Paste your 64-character token"
  - Secure text entry (masked with reveal toggle)
  - Auto-detect clipboard content on focus (if 64 chars, offer to paste)
- "Sign In" button:
  - Full-width, `--color-primary` background, white text, `--radius-sm`
  - Disabled state: `--color-text-tertiary` background
  - Loading state: spinner replacing text
- Error message: `--color-error` text below input, appears on invalid token

**Transitions:**
- Success -> S-02 Conversation List (stack replace, no back)
- Error -> Shake animation on input, error text displayed

**Interactions:**
- Clipboard paste detection on input focus
- Haptic feedback on error
- Keyboard dismiss on tap outside

---

### S-02: Conversation List Screen

**CJX Stage:** Usage / Retention

**Layout:** Full-screen list with header and bottom tabs

**Header:**
- Title: "Chats" — `--text-h1`, left-aligned
- User avatar (top-right, 32px) — tap opens profile/logout menu

**Conversation List Item (72px height):**
```
┌─────────────────────────────────────────────┐
│ [Avatar 40px]  Name              Timestamp  │
│    🤖 badge    Last message pre...  (3)     │
│                ● typing...                  │
└─────────────────────────────────────────────┘
```
- Avatar: 40px circle, presence dot overlay (bottom-right, 10px)
  - Green: online (`--color-success`)
  - No dot: offline
- Name: `--text-h3` — conversation name (group) or other user name (DM)
  - Agent badge: small blue robot icon after name
- Last message: `--text-body-sm`, `--color-text-secondary`, single line, truncated
- Timestamp: `--text-caption`, `--color-text-secondary`, right-aligned
  - <1h: "5m ago", <24h: "3:45 PM", >24h: "Mar 16"
- Unread badge: `--color-primary` circle, white text, right side
- Typing indicator: replaces last message text with "[Name] is typing..."
- Separator: 1px `--color-border` line, inset 68px from left (after avatar)

**Empty State:**
- Illustration + "No conversations yet"
- Subtitle: "Your chats will appear here"

**Pull-to-refresh:** Native pull-to-refresh with spinner

**Bottom Tab Bar:**
- Chats tab (message icon, active)
- Admin tab (gear icon) — visible only if user role = admin

**Transitions:**
- Tap conversation -> Push S-03 (DM) or S-04 (Group)
- Tap Admin tab -> Push S-05

---

### S-03: DM Chat Screen

**CJX Stage:** Usage

**Layout:** Messages list + fixed input bar at bottom

**Header (56px):**
```
┌─────────────────────────────────────────────┐
│ ← [Avatar 32px] Name 🤖  ● Online      ⓘ  │
└─────────────────────────────────────────────┘
```
- Back arrow (left)
- Recipient avatar (32px) + name + agent badge (if agent)
- Presence status: green dot + "Online" or grey "Offline"
- Info button (right) -> S-08

**Message List (FlashList):**

*User message (right-aligned):*
```
                          ┌──────────────────┐
                          │ Your message here │
                          │ continued text... │
                          └──────────────────┘
                                    12:45 PM ♡
```
- Background: `--color-user-bubble`
- Text: `--color-user-text`, `--text-body`
- Border radius: `--radius-lg` with bottom-right `--radius-sm` (chat tail)
- Max width: 75% of screen
- Timestamp: `--text-caption`, below bubble, right-aligned
- Reaction: heart icon, below timestamp

*Agent message (left-aligned, full-width):*
```
┌──┐
│🤖│ Agent Name
└──┘
  Here's the analysis with **markdown**:

  ```python
  def hello():
      return "world"
  ```

  And a table:
  | Col 1 | Col 2 |
  |-------|-------|
  | A     | B     |

  12:45 PM  ♡
```
- Avatar: 32px, left side, bot badge
- Name: `--text-body-sm`, `--color-text-secondary`
- Content: full markdown rendering, `--text-body`
- Code blocks: `--color-code-bg` background, `--color-code-text`, `--font-mono`, `--text-code`, horizontal scroll, copy button (top-right of block)
- No bubble background (flat, like Claude mobile)
- Max width: 90% of screen

*Typing indicator (left-aligned):*
```
┌──┐
│🤖│ ● ● ●
└──┘
```
- Three animated dots, pulsing opacity
- Shows below last message
- Disappears when agent sends message or after 30s timeout
- After 30s: "Agent may be offline" in `--color-text-tertiary`

*Date separator:*
```
─────── Today ───────
```
- Centered text, `--text-caption`, `--color-text-secondary`
- Shows between messages from different days

**Message Interactions:**
- Long-press message -> Haptic feedback + action menu:
  - Copy text
  - React (heart)
- Reaction display: small heart + count below message

**Input Bar (fixed bottom, above keyboard):**
```
┌─────────────────────────────────────────────┐
│ 📎  Type a message...                   ➤  │
└─────────────────────────────────────────────┘
```
- Background: `--color-surface`, `--shadow-sm` top border
- Attachment button: left, opens action sheet (Camera, Photo Library, File)
- Text input: auto-growing (1-4 lines), `--text-input`, `--font-sans`
- Send button: right, `--color-primary` when text present, `--color-text-tertiary` when empty
- Safe area padding at bottom (iPhone notch)

**Transitions:**
- Back arrow -> Pop to S-02
- Info button -> Push S-08
- Tap image in message -> Push S-07

---

### S-04: Group Chat Screen

**CJX Stage:** Usage

**Layout:** Same as S-03 with group-specific additions

**Header:**
```
┌─────────────────────────────────────────────┐
│ ←  Group Name                  (5 👥)   ⓘ  │
└─────────────────────────────────────────────┘
```
- Group name (or member names if no name set)
- Member count with icon
- Info button -> S-08 (member list)

**Message differences from S-03:**
- All messages show sender name above content: `--text-body-sm`, `--color-text-secondary`
- User's own messages: no name shown (right-aligned as in S-03)
- Other humans: name + avatar, left-aligned, `--color-agent-bubble` background
- Agents: name + avatar + bot badge, left-aligned, no background (same as S-03)

**@Mention Autocomplete:**
```
┌─────────────────────────────────────────┐
│ 👤 Alice (Human)                        │
│ 🤖 Agent-1 (Agent)                      │
│ 🤖 Agent-2 (Agent)                      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📎  @A                              ➤  │
└─────────────────────────────────────────┘
```
- Appears above input bar when `@` typed
- `--shadow-md`, `--color-background` background
- Filter by typed text after `@`
- Tap to insert `@Name` (highlighted in `--color-primary`)
- Max 4 visible items, scrollable

**Transitions:** Same as S-03

---

### S-05: Admin Users Screen

**CJX Stage:** Discovery

**Layout:** Searchable list with create action

**Header:**
```
┌─────────────────────────────────────────────┐
│ ←  Users                             [+ ]  │
├─────────────────────────────────────────────┤
│ 🔍 Search users...                          │
└─────────────────────────────────────────────┘
```
- Back or tab navigation
- Create button (top-right) -> create user form (modal)
- Search bar below header

**User List Item (64px height):**
```
┌─────────────────────────────────────────────┐
│ [Avatar 40px]  Username           [Admin]   │
│                email@example.com  [Agent]   │
└─────────────────────────────────────────────┘
```
- Avatar: 40px, with presence dot
- Username: `--text-h3`
- Email: `--text-body-sm`, `--color-text-secondary`
- Role badge: pill shape
  - Admin: `--color-warning` background
  - Agent: `--color-agent-badge` background
  - User: `--color-border` background

**Create User Form (Modal):**
- Username input (required)
- Email input (optional)
- Role picker: Admin / User / Agent
- "Create" button -> generates token
- Success: show token with copy button

**Transitions:**
- Tap user -> User detail sheet (name, role, token, edit options)
- Create button -> Modal form
- Tab: Webhook Logs -> S-06

---

### S-06: Admin Webhook Logs Screen

**CJX Stage:** Discovery

**Layout:** Filterable list of webhook deliveries

**Header + Filters:**
```
┌─────────────────────────────────────────────┐
│ ←  Webhook Logs                             │
├─────────────────────────────────────────────┤
│ [All ▼]  [Delivered ▼]  [Last 24h ▼]       │
└─────────────────────────────────────────────┘
```
- Filter chips: Agent (all/specific), Status (all/delivered/failed/pending), Time range

**Log List Item (72px height):**
```
┌─────────────────────────────────────────────┐
│ 🤖 Agent-1        ● Delivered      142ms   │
│ "User asked about..."         Mar 17, 3:45p │
└─────────────────────────────────────────────┘
```
- Agent name + avatar (left)
- Status badge:
  - Delivered: `--color-success` dot + text
  - Failed: `--color-error` dot + text
  - Pending: `--color-warning` dot + text
- Latency: `--text-caption`
- Message preview: truncated, `--text-body-sm`, `--color-text-secondary`
- Timestamp: `--text-caption`

**Log Detail (Push or Bottom Sheet):**
- Full webhook payload (JSON, `--font-mono`, scrollable)
- Response body
- HTTP status code
- Error message (if failed)
- Retry count and timeline

**Transitions:**
- Tap log item -> Push log detail view or expand bottom sheet

---

### S-07: Image Viewer Screen

**CJX Stage:** Usage

**Layout:** Fullscreen dark background with image

- Tap to toggle header/footer visibility
- Pinch-to-zoom gesture support
- Header: close button (X), share button, save button
- Background: black
- Swipe down to dismiss

---

### S-08: Conversation Info Screen

**CJX Stage:** Usage

**Layout:** Stack view with conversation details

**For DM:**
- User avatar (80px, centered)
- Username + role badge
- Presence status
- "Shared Files" section (list of attachments)

**For Group:**
- Group name (editable by admin)
- Member list with roles and presence
- "Shared Files" section

---

## 4. Navigation Structure

```
BottomTabNavigator
├── ChatStack (Stack Navigator)
│   ├── S-02 ConversationList (initial)
│   ├── S-03 DMChat
│   ├── S-04 GroupChat
│   ├── S-07 ImageViewer (modal presentation)
│   └── S-08 ConversationInfo
└── AdminStack (Stack Navigator) [admin-only]
    ├── S-05 AdminUsers (initial)
    └── S-06 WebhookLogs

AuthStack (shown when no JWT)
└── S-01 Login
```

---

## 5. Design Rationale

### Why ChatGPT + Claude Hybrid?

1. **Minimalist base (ChatGPT):** Agent Playground is a testing tool — UI should not distract from the conversation content. Clean white backgrounds, single blue accent keep focus on messages.

2. **Technical depth (Claude):** AI agents respond with markdown, code blocks, and structured data. Full-width agent messages without bubble backgrounds give more room for complex content rendering.

3. **Trust signals:** Blue primary color conveys reliability. Clear visual distinction between user (blue bubbles) and agent (flat, full-width) prevents confusion about who said what.

4. **Mobile-first patterns:** Bottom tab navigation, pull-to-refresh, swipe gestures, and keyboard-aware scrolling follow iOS/Android conventions users already know.

### Why no dark mode in MVP?

Dark mode doubles the design/QA surface area. Ship light mode first, validate core chat experience, then add dark mode with proper token inversion in post-MVP.

### Why bottom tabs instead of drawer?

- Only 2 top-level sections (Chats + Admin)
- Bottom tabs are thumb-reachable on large phones
- Admin tab conditionally shown based on role
- Drawer adds navigation complexity for minimal benefit

---

## 6. Responsive Considerations

| Device | Adjustments |
|--------|-------------|
| iPhone SE (375px) | Message max-width 80%, smaller avatars (28px in messages) |
| iPhone 15 (393px) | Default layout, all specs as documented |
| iPhone 15 Pro Max (430px) | Message max-width 70%, more whitespace |
| Android compact (360px) | Same as iPhone SE adjustments |
| Tablet (768px+) | Two-column layout: conversation list (left) + chat (right), like iPad Slack |

---

## GATE 2: Requirements Validation

Before proceeding to `/ipa:design`:

- [ ] Stakeholders reviewed SRD.md feature list (FR-01 through FR-22)
- [ ] Feature priorities (P1/P2/P3) confirmed — P1 is launch-blocking
- [ ] Scope still matches /lean output (3 phases, no creep)
- [ ] Design system tokens approved (colors, typography, spacing)
- [ ] No scope creep detected — out-of-scope items remain excluded
- [ ] Screen flow covers all user journeys

**Next:** `/ipa:design` to generate HTML prototypes implementing this Design System
