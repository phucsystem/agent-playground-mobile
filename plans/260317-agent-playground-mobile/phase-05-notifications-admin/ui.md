# Phase 05 — Notifications & Admin: UI

## Overview

- **Priority:** P3
- **Status:** Completed
- **Effort:** 4h
- **Description:** Build Admin Users (S-05) and Webhook Logs (S-06) screens. Add agent thinking indicator to chat screens. Wire push notification deep linking. Reference prototypes: `s05-admin-users.html`, `s06-webhook-logs.html`.

## Requirements

| FR | Feature | Screen | Component |
|----|---------|--------|-----------|
| FR-18 | Push Notifications | Background | Deep link on tap |
| FR-19 | Agent Thinking Indicator | S-03, S-04 | AgentThinkingBubble |
| FR-20 | Admin User List | S-05 | AdminUsersScreen |
| FR-21 | Admin Create User | S-05 | CreateUserModal |
| FR-22 | Admin Webhook Logs | S-06 | WebhookLogsScreen |

## Related Code Files

### Files to CREATE

```
src/
├── screens/
│   ├── admin-users-screen.tsx              # S-05 (FR-20, FR-21)
│   ├── webhook-logs-screen.tsx             # S-06 (FR-22)
│   └── webhook-log-detail-screen.tsx       # S-06 detail view
├── components/
│   ├── admin/
│   │   ├── user-list-item.tsx              # User row for S-05
│   │   ├── create-user-modal.tsx           # Create user form (FR-21)
│   │   ├── webhook-log-item.tsx            # Log row for S-06
│   │   ├── webhook-filter-bar.tsx          # Filter chips for S-06
│   │   └── role-badge.tsx                  # Admin/User/Agent pill badge
│   ├── chat/
│   │   └── agent-thinking-bubble.tsx       # Animated thinking dots (FR-19)
```

### Files to MODIFY

```
src/
├── screens/
│   ├── dm-chat-screen.tsx                  # Add agent thinking indicator
│   └── group-chat-screen.tsx               # Add agent thinking indicator
├── providers/
│   └── app-providers.tsx                   # Add usePushNotifications() call
├── navigation/
│   └── admin-stack.tsx                     # Wire S-05, S-06 screens
```

## Implementation Steps

### Step 1: Agent Thinking Bubble (`src/components/chat/agent-thinking-bubble.tsx`) — FR-19

Appears after user sends a message in a conversation with an agent, before agent responds:

```
[Avatar 32px] Agent-1 is thinking...
               ● ● ●

              (after 30s)
[Avatar 32px] Agent may be offline
```

Implementation:
- Reuse typing indicator animation (3 pulsing dots)
- Show agent avatar + name
- After `AGENT_THINKING_TIMEOUT_MS` (30s): replace dots with "Agent may be offline" in tertiary text
- Hook: `useAgentThinking(conversationId)` from Phase 5 core
- Trigger: when user sends message AND conversation has agent member
- Stop: when new message arrives from agent (realtime hook)

Integration with chat screens:
```typescript
// In DM/Group chat screen:
const { isThinking, timedOut, startThinking, stopThinking } = useAgentThinking(conversationId);

// After send message:
if (hasAgentMember) startThinking();

// In realtime handler:
// When new message from agent arrives: stopThinking();
```

### Step 2: Role Badge (`src/components/admin/role-badge.tsx`)

Pill-shaped badge for user roles:

```typescript
// Props: role: 'admin' | 'user' | 'agent'
// Colors from UI_SPEC:
//   Admin: warning background (#F59E0B)
//   Agent: agent-badge background (#3B82F6)
//   User: border background (#E5E7EB)
// White text for admin/agent, primary text for user
// Padding: xs horizontal, xs/2 vertical
// Border radius: full
// Text: text-caption, uppercase
```

### Step 3: Admin Users Screen (`src/screens/admin-users-screen.tsx`) — S-05, FR-20, FR-21

Layout matches prototype `s05-admin-users.html`:

```
Header:
  ←  Users                             [+ ]

Search bar:
  🔍 Search users...

FlashList:
  UserListItem rows (64px height)
```

Implementation:
1. Use `useAdminUsers(searchQuery)` query
2. Search bar with debounced text input (300ms)
3. FlashList with `estimatedItemSize={64}`
4. Create button (top-right) opens CreateUserModal
5. Tap user row -> expand details or navigate to detail sheet

#### UserListItem (`src/components/admin/user-list-item.tsx`)

```
┌─────────────────────────────────────────────┐
│ [Avatar 40px]  Username           [Admin]   │
│  ● Online      email@example.com  [Agent]   │
└─────────────────────────────────────────────┘
```

- Avatar with presence dot
- Username: text-h3
- Email: text-body-sm, secondary color
- Role badge (pill)
- Separator line

### Step 4: Create User Modal (`src/components/admin/create-user-modal.tsx`) — FR-21

Modal form:
```
┌─────────────────────────────────────┐
│            Create User              │
│                                     │
│ Username *                          │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Email (optional)                    │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Role                                │
│ [Admin] [User] [Agent]             │
│                                     │
│ [      Create User      ]          │
└─────────────────────────────────────┘
```

On success, show token result:
```
┌─────────────────────────────────────┐
│          User Created!              │
│                                     │
│ Token:                              │
│ ┌─────────────────────────────────┐ │
│ │ a1b2c3d4...64chars...          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [  Copy Token  ] [  Done  ]        │
└─────────────────────────────────────┘
```

Implementation:
1. Use `useCreateUser()` mutation
2. Username required, email optional, role picker (segmented control)
3. On success: show token in monospace text with copy button
4. Copy: `Clipboard.setStringAsync(token)` + haptic feedback + "Copied!" toast
5. Close modal: dismiss

### Step 5: Webhook Logs Screen (`src/screens/webhook-logs-screen.tsx`) — S-06, FR-22

Layout matches prototype `s06-webhook-logs.html`:

```
Header:
  ←  Webhook Logs

Filter bar:
  [All Agents ▼]  [All Status ▼]  [Last 24h ▼]

FlashList:
  WebhookLogItem rows (72px height)
```

#### WebhookFilterBar (`src/components/admin/webhook-filter-bar.tsx`)

Horizontal scroll of filter chips:
- Agent filter: dropdown of all agents (from users API, role='agent')
- Status filter: All / Delivered / Failed / Pending
- Time range: Last 24h / Last 7d / Last 30d / All time

Implementation: scrollable row of TouchableOpacity chips that open picker/action sheet.

#### WebhookLogItem (`src/components/admin/webhook-log-item.tsx`)

```
┌─────────────────────────────────────────────┐
│ 🤖 Agent-1        ● Delivered      142ms   │
│ "User asked about..."         Mar 17, 3:45p │
└─────────────────────────────────────────────┘
```

- Agent avatar + name (left)
- Status badge: colored dot + text
  - Delivered: success (green)
  - Failed: error (red)
  - Pending: warning (yellow)
- Latency: text-caption
- Message preview: truncated, text-body-sm, secondary
- Timestamp: text-caption
- Tap -> push to log detail screen

### Step 6: Webhook Log Detail Screen (`src/screens/webhook-log-detail-screen.tsx`)

Scrollable detail view:
- Agent name + avatar
- Status badge (large)
- Latency + retry count
- Timestamp
- Request payload: JSON formatted, monospace, in scrollable container
- Response body: same format
- HTTP status code
- Error message (if failed): red text

JSON display: use `JSON.stringify(payload, null, 2)` in a `<Text>` with mono font inside a `ScrollView`.

### Step 7: Wire push notification deep linking

In `AppProviders` or `RootNavigator`, call `usePushNotifications()` after auth is established. This registers the device token and sets up the notification tap handler.

Deep link flow:
1. Push received with `{ conversationId }` in data
2. User taps notification
3. `notificationResponseListener` fires
4. Navigate to `ChatStack > DMChat` with conversationId param
5. Need to determine conversation type (DM vs group) to route correctly — fetch conversation first, then route

### Step 8: Update navigation

**AdminStack (`src/navigation/admin-stack.tsx`):**

```typescript
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

// Screens:
// - AdminUsers (initial)
// - WebhookLogs
// - WebhookLogDetail (params: logId)
```

**Bottom tab bar:** Conditionally show Admin tab based on `user.role === 'admin'`:

```typescript
<Tab.Screen
  name="AdminTab"
  component={AdminStack}
  options={{
    tabBarButton: user?.role !== "admin" ? () => null : undefined,
    tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
    tabBarLabel: "Admin",
  }}
/>
```

## Todo List

- [x] Build AgentThinkingBubble with animated dots + 30s timeout message
- [x] Build RoleBadge component (admin/user/agent pill)
- [x] Build AdminUsersScreen (S-05) with search + FlashList
- [x] Build UserListItem component (64px row)
- [x] Build CreateUserModal with form + token display + copy
- [x] Build WebhookLogsScreen (S-06) with filters
- [x] Build WebhookFilterBar (agent, status, time range chips)
- [x] Build WebhookLogItem component (72px row)
- [x] Build WebhookLogDetailScreen (JSON payload display)
- [x] Integrate agent thinking in DM + Group chat screens
- [x] Wire push notification deep linking in AppProviders
- [x] Update AdminStack navigation with all screens
- [x] Conditionally show Admin tab for admin role users
- [x] Test admin screens with admin-role JWT (real Supabase data)
- [x] Test push notification deep link on physical device

## Success Criteria

- Agent thinking: dots appear after sending to agent, stop when agent replies
- Agent thinking: "Agent may be offline" shows after 30 seconds
- Admin users: list all users, search by name/email, role badges display
- Create user: form validates, creates user, shows token with copy button
- Webhook logs: list renders with status colors, filter chips work
- Webhook detail: full JSON payload displayed in mono font
- Push notification: tap opens correct conversation
- Admin tab: only visible for admin role users
- All data comes from real Supabase (no mocks)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Push notifications require physical device | Document that push testing requires EAS build on device |
| Admin RLS denies access | Verify admin RLS policies exist server-side before testing |
| Large JSON payload renders slowly | Limit display to first 5000 chars, add "Show full" button |
| Deep link navigation race condition | Ensure nav is ready before navigating (useNavigationContainerRef) |
