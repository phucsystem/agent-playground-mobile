# Phase 03 — Core UI

## Overview

- **Priority:** P1
- **Status:** Completed
- **Effort:** 10h
- **Description:** Build all Phase 1 screens: Login (S-01), Conversation List (S-02), DM Chat (S-03). These screens cover FR-01 through FR-09 and form the core chat experience. Reference prototypes: `s01-login.html`, `s02-conversation-list.html`, `s03-dm-chat.html`.

## Requirements

| FR | Feature | Screen | Component |
|----|---------|--------|-----------|
| FR-01 | Token Login | S-01 | LoginScreen |
| FR-02 | Session Persistence | S-01 | RootNavigator (auto-restore) |
| FR-03 | Conversation List | S-02 | ConversationListScreen |
| FR-04 | Unread Badges | S-02 | ConversationItem |
| FR-05 | Direct Messaging | S-03 | DMChatScreen |
| FR-06 | Real-time Messages | S-03 | useRealtimeMessages hook |
| FR-07 | Markdown Rendering | S-03 | AgentMessageBubble |
| FR-08 | Message Input | S-03 | MessageInputBar |
| FR-09 | Message Pagination | S-03 | MessageList (FlashList) |

## Related Code Files

### Files to CREATE

```
src/
├── screens/
│   ├── login-screen.tsx                    # S-01 (FR-01, FR-02)
│   ├── conversation-list-screen.tsx        # S-02 (FR-03, FR-04)
│   └── dm-chat-screen.tsx                  # S-03 (FR-05..FR-09)
├── components/
│   ├── ui/
│   │   ├── avatar.tsx                      # Reusable avatar (image + initials fallback)
│   │   ├── badge.tsx                       # Unread count badge
│   │   ├── loading-spinner.tsx             # Centered spinner
│   │   └── empty-state.tsx                 # Empty list placeholder
│   ├── conversation/
│   │   ├── conversation-item.tsx           # List row (S-02)
│   │   └── conversation-list.tsx           # FlashList wrapper (S-02)
│   ├── chat/
│   │   ├── message-list.tsx                # FlashList inverted (S-03)
│   │   ├── user-message-bubble.tsx         # Right-aligned blue bubble
│   │   ├── agent-message-bubble.tsx        # Left-aligned, markdown, full-width
│   │   ├── date-separator.tsx              # "--- Today ---" divider
│   │   └── message-input-bar.tsx           # Input + send + attach button
```

## Implementation Steps

### Step 1: Shared UI Components

#### Avatar (`src/components/ui/avatar.tsx`)

```typescript
// Props: uri?: string, name: string, size: number (default 40), showBotBadge?: boolean
// - If uri: render Image with borderRadius full
// - If no uri: render View with hash-based background color + initials text
// - If showBotBadge: render 12px blue circle with robot icon at bottom-right
// - Touch target: minimum 44x44pt (NFR-19)
```

Key layout from UI_SPEC:
- Conversation list: 40px circle
- Message sender: 32px circle
- Agent badge: blue dot overlay, bottom-right, 12px

#### Badge (`src/components/ui/badge.tsx`)

```typescript
// Props: count: number
// - Render only if count > 0
// - Circle with primary background, white text
// - Display "99+" for counts > 99
// - text-caption size (12px)
```

#### Empty State (`src/components/ui/empty-state.tsx`)

```typescript
// Props: title: string, subtitle: string
// - Centered vertically
// - Icon/illustration placeholder
// - title in text-h3, subtitle in text-body-sm text-secondary
```

### Step 2: Login Screen (`src/screens/login-screen.tsx`) — S-01, FR-01, FR-02

Layout matches prototype `s01-login.html`:

```
Centered card on white background:
  - App logo + "Agent Playground" (top 30%)
  - "Enter your access token to continue" subtitle
  - Token input (monospace, masked, reveal toggle)
  - "Sign In" button (full-width, primary color)
  - Error message below input
```

Implementation details:
1. Use `useLogin()` mutation from Phase 2
2. Auto-detect clipboard on input focus: if clipboard has 64-char alphanumeric string, show "Paste from clipboard?" prompt
3. Secure text entry with eye icon toggle for reveal
4. Input uses `--font-mono`, 16px (prevents iOS zoom)
5. Button states: disabled (empty input), loading (spinner), enabled (primary bg)
6. Error: shake animation via `react-native-reanimated`, red text below input
7. Haptic feedback on error via `expo-haptics`
8. Keyboard dismiss on tap outside via `TouchableWithoutFeedback` + `Keyboard.dismiss()`
9. On success: navigate to ConversationList (stack replace, no back gesture)

```typescript
// Clipboard detection
import * as Clipboard from "expo-clipboard";

async function checkClipboard() {
  const content = await Clipboard.getStringAsync();
  if (content && content.length === 64 && /^[a-zA-Z0-9]+$/.test(content)) {
    // Show paste suggestion
    setClipboardToken(content);
  }
}
```

### Step 3: Conversation List Screen (`src/screens/conversation-list-screen.tsx`) — S-02, FR-03, FR-04

Layout matches prototype `s02-conversation-list.html`:

```
Header:
  - "Chats" title (h1, left)
  - User avatar (32px, top-right) -> logout menu

FlashList:
  - ConversationItem rows (72px height)
  - Pull-to-refresh

Bottom Tabs:
  - Chats (active)
  - Admin (if role=admin)
```

Implementation details:
1. Use `useConversations()` query from Phase 2
2. FlashList with `estimatedItemSize={72}` for optimal perf
3. Pull-to-refresh: `RefreshControl` with `onRefresh` calling `refetch()`
4. Each item renders `ConversationItem` component
5. For DMs: fetch other member's name/avatar from conversation_members join
6. Tap navigates to DMChat (type='dm') or GroupChat (type='group')
7. Logout: dropdown menu from avatar tap -> clear session -> navigate to Login

#### ConversationItem (`src/components/conversation/conversation-item.tsx`)

```
┌─────────────────────────────────────────────┐
│ [Avatar 40px]  Name              Timestamp  │
│    bot badge   Last message pre...  (3)     │
└─────────────────────────────────────────────┘
```

Props:
- conversation: ConversationWithDetails
- otherMember: User (for DM display name)
- onPress: () => void

Details:
- Avatar with presence dot (green for online — Phase 2, skip for now)
- Name: `text-h3` — group name or other user's username (DM)
- Agent badge: small blue icon after name if other member is agent
- Last message: `text-body-sm`, secondary color, single line truncated
- Timestamp: `formatConversationTime()` from utils
- Unread badge: only if unread_count > 0
- Separator: 1px border, inset 68px from left
- Pressable with subtle opacity feedback

### Step 4: DM Chat Screen (`src/screens/dm-chat-screen.tsx`) — S-03, FR-05..FR-09

Layout matches prototype `s03-dm-chat.html`:

```
Header (56px):
  ← [Avatar 32px] Name bot-badge  ● Online    (i)

MessageList (FlashList inverted):
  - Date separators
  - User messages (right, blue bubble)
  - Agent messages (left, full-width, markdown)

InputBar (fixed bottom):
  📎  "Type a message..."                   ➤
```

Implementation details:
1. Use `useMessages(conversationId)` infinite query
2. Use `useRealtimeMessages(conversationId)` for live updates
3. Use `useSendMessage(conversationId)` for sending
4. FlashList with `inverted={true}` — newest messages at bottom
5. `onEndReached` triggers `fetchNextPage()` for older messages
6. Auto-scroll to bottom on new message (only if already at bottom)
7. `KeyboardAvoidingView` wraps entire screen (behavior="padding" on iOS)

#### MessageList (`src/components/chat/message-list.tsx`)

```typescript
// Uses FlashList inverted
// Renders: UserMessageBubble | AgentMessageBubble | DateSeparator
// Props: conversationId, messages (grouped), onLoadMore, isLoadingMore
// estimatedItemSize: 80 (average message height)
```

Rendering logic:
- Use `groupMessages()` utility from Phase 2 core
- If `showDateSeparator`: render DateSeparator above message
- If `message.user_id === currentUserId`: render UserMessageBubble
- Else: render AgentMessageBubble (or human bubble in groups — Phase 4)

#### UserMessageBubble (`src/components/chat/user-message-bubble.tsx`)

```
                          ┌──────────────────┐
                          │ Your message here │
                          └──────────────────┘
                                    12:45 PM
```

- Right-aligned, max-width 75%
- Background: `--color-user-bubble` (#0084FF)
- Text: white, text-body (16px)
- Border radius: 18px with bottom-right 8px (chat tail effect)
- Timestamp: text-caption, below bubble, right-aligned, secondary color

#### AgentMessageBubble (`src/components/chat/agent-message-bubble.tsx`)

```
[Avatar 32px] Agent Name
  Markdown content here with **bold**, `code`,
  ```python
  def hello(): ...
  ```
  12:45 PM
```

- Left-aligned, max-width 90%
- Avatar: 32px with bot badge (if role=agent)
- Name: text-body-sm, secondary color (only if `showSenderInfo`)
- Content: rendered via `<Markdown style={markdownStyles}>` from `@ronradtke/react-native-markdown-display`
- Code blocks: dark background, mono font, horizontal scroll via `ScrollView horizontal`
- No bubble background (flat, like Claude mobile)
- Timestamp: text-caption, below content

Code block horizontal scroll — wrap the `fence` renderer:

```typescript
import Markdown from "@ronradtke/react-native-markdown-display";

const rules = {
  fence: (node: any, children: any, parent: any, styles: any) => (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={styles.fence}>
        <Text style={styles.fenceText}>{node.content}</Text>
      </View>
      {/* Copy button top-right */}
    </ScrollView>
  ),
};
```

#### DateSeparator (`src/components/chat/date-separator.tsx`)

```
─────── Today ───────
```

- Centered text, text-caption, secondary color
- Horizontal lines on both sides (View with border)

#### MessageInputBar (`src/components/chat/message-input-bar.tsx`)

```
┌─────────────────────────────────────────────┐
│ 📎  Type a message...                   ➤  │
└─────────────────────────────────────────────┘
```

- Fixed at bottom, above keyboard
- `SafeAreaView` bottom padding for iPhone notch
- Background: surface color, top shadow
- Attachment button (left) — placeholder for Phase 4, renders icon but no action yet
- TextInput: auto-growing 1-4 lines, 16px font, sans font
- Send button (right): primary color when text non-empty, tertiary when empty
- `onSubmitEditing` sends message (but does NOT dismiss keyboard)
- Send clears input, calls `useSendMessage().mutate(content)`

Auto-growing input:

```typescript
<TextInput
  multiline
  maxLength={4000}
  style={{ maxHeight: 4 * 24 }} // 4 lines * lineHeight
  onContentSizeChange={(event) => {
    const height = event.nativeEvent.contentSize.height;
    setInputHeight(Math.min(height, 4 * 24));
  }}
/>
```

### Step 5: Wire up navigation

Update navigators from Phase 1 setup:

**AuthStack:** Login screen only
**ChatStack:**
- ConversationList (initial)
- DMChat (params: conversationId, recipientId)
- GroupChat (placeholder — Phase 4)
- ImageViewer (placeholder — Phase 4)
- ConversationInfo (placeholder — Phase 4)

**RootNavigator:** Show loading spinner during session restore, then AuthStack or ChatStack.

### Step 6: Header configuration

DM Chat header customization:

```typescript
navigation.setOptions({
  headerLeft: () => <BackButton />,
  headerTitle: () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Avatar uri={recipient.avatar_url} name={recipient.username} size={32} />
      <Text style={{ marginLeft: 8, fontWeight: "600" }}>{recipient.username}</Text>
      {recipient.role === "agent" && <BotBadge />}
    </View>
  ),
  headerRight: () => <InfoButton onPress={navigateToInfo} />,
});
```

## Todo List

- [x] Create `Avatar` component with image, initials fallback, bot badge
- [x] Create `Badge` component for unread counts
- [x] Create `EmptyState` and `LoadingSpinner` components
- [x] Build Login screen (S-01) with token input, clipboard detection, error states
- [x] Build ConversationItem component (72px row, avatar, name, preview, timestamp, badge)
- [x] Build ConversationList screen (S-02) with FlashList, pull-to-refresh, logout
- [x] Build UserMessageBubble (right-aligned, blue, chat tail)
- [x] Build AgentMessageBubble (left-aligned, markdown, code blocks, avatar)
- [x] Build DateSeparator component
- [x] Build MessageInputBar (auto-growing, send button states, attachment placeholder)
- [x] Build MessageList with FlashList inverted, pagination, auto-scroll
- [x] Build DM Chat screen (S-03) combining all chat components
- [x] Wire up navigation (auth gate, stack push, params)
- [x] Configure chat header (avatar, name, bot badge, info button)
- [x] Test full flow: Login -> Conversation List -> DM Chat -> send/receive messages

## Success Criteria

- Login: paste 64-char token -> sign in -> see conversations (no mocks)
- Conversation list: sorted by recent, shows last message preview, unread badges
- DM chat: messages display with correct alignment (user right, agent left)
- Markdown renders: headings, bold, code blocks (dark bg, horizontal scroll), tables, links
- Send message: appears instantly (optimistic), confirmed by server
- Realtime: partner's message appears within 500ms
- Pagination: scroll up loads older messages with spinner
- Keyboard: input stays above keyboard, auto-scroll to bottom on new message
- Pull-to-refresh: conversation list refreshes

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| FlashList inverted scroll jank | Set `estimatedItemSize`, avoid dynamic height changes during render |
| Keyboard covering input on Android | Use `KeyboardAvoidingView` with `behavior="height"` on Android |
| Markdown rendering performance on long messages | Memoize AgentMessageBubble with `React.memo`, limit re-renders |
| Code block overflow on small screens | Horizontal ScrollView wrapper for fence blocks |
