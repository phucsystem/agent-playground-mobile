# Phase 04 — Rich Features: UI

## Overview

- **Priority:** P2
- **Status:** Completed
- **Effort:** 5h
- **Description:** Build Group Chat (S-04), Image Viewer (S-07), Conversation Info (S-08) screens. Add @mention autocomplete, file/image upload, typing indicators, reactions, presence dots, and read receipts to existing chat components. Reference prototypes: `s04-group-chat.html`, `s07-image-viewer.html`, `s08-conversation-info.html`.

## Requirements

| FR | Feature | Screen | Component |
|----|---------|--------|-----------|
| FR-10 | Group Chat | S-04 | GroupChatScreen |
| FR-11 | @Mention Autocomplete | S-04 | MentionAutocomplete |
| FR-12 | File Attachments | S-03, S-04 | AttachmentPicker, FilePreview |
| FR-13 | Image Sharing | S-03, S-04 | ImagePicker, ImagePreview |
| FR-14 | Typing Indicators | S-03, S-04 | TypingIndicator |
| FR-15 | Emoji Reactions | S-03, S-04 | ReactionBadge, long-press menu |
| FR-16 | Online Presence | S-02 | PresenceDot (on Avatar) |
| FR-17 | Read Receipts | S-02, S-03, S-04 | useReadReceipt call |

## Related Code Files

### Files to CREATE

```
src/
├── screens/
│   ├── group-chat-screen.tsx               # S-04 (FR-10, FR-11)
│   ├── image-viewer-screen.tsx             # S-07 (FR-13)
│   └── conversation-info-screen.tsx        # S-08
├── components/
│   ├── chat/
│   │   ├── mention-autocomplete.tsx        # @mention dropdown (FR-11)
│   │   ├── typing-indicator.tsx            # Animated dots (FR-14)
│   │   ├── reaction-badge.tsx              # Heart count below message (FR-15)
│   │   ├── message-actions-menu.tsx        # Long-press: copy, react (FR-15)
│   │   ├── image-preview.tsx              # Inline image in chat (FR-13)
│   │   ├── file-preview.tsx               # File card in chat (FR-12)
│   │   ├── upload-progress-bar.tsx         # Upload progress (FR-12, FR-13)
│   │   └── human-message-bubble.tsx        # Left-aligned bubble for humans in group
│   ├── ui/
│   │   └── presence-dot.tsx               # Green/grey dot (FR-16)
│   ├── conversation/
│   │   └── member-list-item.tsx           # Member row for S-08
```

### Files to MODIFY

```
src/
├── components/
│   ├── ui/avatar.tsx                      # Add PresenceDot overlay
│   ├── chat/message-input-bar.tsx         # Add attachment action sheet, @mention trigger
│   ├── chat/user-message-bubble.tsx       # Add reaction badge, long-press
│   ├── chat/agent-message-bubble.tsx      # Add reaction badge, long-press, image/file preview
│   └── conversation/conversation-item.tsx # Add presence dot, typing indicator text
├── screens/
│   └── dm-chat-screen.tsx                 # Add read receipt call, typing indicator, file upload
```

## Implementation Steps

### Step 1: Install file/image picker packages

```bash
npx expo install expo-image-picker expo-document-picker
```

### Step 2: Presence Dot (`src/components/ui/presence-dot.tsx`)

```typescript
// Props: isOnline: boolean, size?: number (default 10)
// Green circle for online, no dot for offline
// Positioned absolute at bottom-right of parent
// Border: 2px white (to separate from avatar)
```

Update `Avatar` component: accept `userId` prop, read from `usePresenceStore` to show dot.

### Step 3: Group Chat Screen (`src/screens/group-chat-screen.tsx`) — S-04, FR-10

Same structure as DM Chat with these differences:
- Header: group name + member count icon + info button
- Messages from other humans: show sender name + avatar, left-aligned, `agent-bubble` background
- Messages from agents: same as DM (no background, markdown)
- Own messages: same as DM (right, blue bubble)
- @Mention autocomplete above input bar
- Use `useConversationMembers()` for member data

Header layout:
```
┌─────────────────────────────────────────────┐
│ ←  Group Name                  (5 members) ⓘ│
└─────────────────────────────────────────────┘
```

New component needed: `HumanMessageBubble` — like agent bubble but WITH bubble background (`agent-bubble` color).

### Step 4: HumanMessageBubble (`src/components/chat/human-message-bubble.tsx`)

For non-current-user human messages in groups:

```
[Avatar 32px] Alice
  ┌───────────────────────────┐
  │ Message text here         │
  └───────────────────────────┘
  12:45 PM  heart(2)
```

- Left-aligned, max-width 75%
- Background: `--color-agent-bubble` (#F0F0F0)
- Sender name + avatar
- No markdown rendering (human messages are plain text)
- Reaction badge below

### Step 5: MentionAutocomplete (`src/components/chat/mention-autocomplete.tsx`) — FR-11

Appears above input bar when `@` is typed:

```
┌─────────────────────────────────────────┐
│ [Avatar] Alice (Human)                  │
│ [Avatar] Agent-1 (Agent)  🤖           │
│ [Avatar] Agent-2 (Agent)  🤖           │
└─────────────────────────────────────────┘
```

Implementation:
1. Watch input text + cursor position via `onSelectionChange`
2. Call `extractMentionQuery()` on each change
3. If query !== null: show dropdown, filter members
4. Max 4 visible items, FlatList with scrolling
5. Tap item: call `insertMention()`, update input text
6. Dropdown: positioned absolute above input, shadow-md, white bg
7. Each row: Avatar (24px) + username + role badge

### Step 6: Typing Indicator (`src/components/chat/typing-indicator.tsx`) — FR-14

```
[Avatar 32px] ● ● ●
```

- Three dots with pulsing opacity animation (react-native-reanimated)
- Read from `useTypingStore` for conversationId
- Show below last message in list
- Display "[Name] is typing..." text variant for conversation list

```typescript
// Animation: 3 dots with staggered opacity
// Use Animated.loop with Animated.sequence
// Dot 1: 0ms delay, Dot 2: 200ms delay, Dot 3: 400ms delay
// Each: opacity 0.3 -> 1.0 -> 0.3 over 600ms
```

### Step 7: Reaction Badge + Long-press Menu — FR-15

**ReactionBadge (`src/components/chat/reaction-badge.tsx`):**

```
heart(3)
```

- Small heart icon + count
- Highlighted if current user has reacted
- Tap to toggle own reaction
- Positioned below message timestamp

**MessageActionsMenu (`src/components/chat/message-actions-menu.tsx`):**

- Triggered by long-press on any message bubble
- Haptic feedback via `expo-haptics`
- Options: "Copy Text", "React heart" (toggle)
- Implementation: Action sheet or bottom sheet
- Use `react-native` built-in `ActionSheetIOS` on iOS, custom bottom sheet on Android

```typescript
import * as Haptics from "expo-haptics";

function onLongPress(message: MessageWithSender) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // Show action menu
}
```

### Step 8: File/Image Upload Flow — FR-12, FR-13

**Attachment Action Sheet (modify MessageInputBar):**

When attachment button (paperclip icon) pressed, show action sheet:
1. "Take Photo" -> `expo-image-picker` camera
2. "Photo Library" -> `expo-image-picker` gallery
3. "Choose File" -> `expo-document-picker`

```typescript
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

async function pickImage(source: "camera" | "library") {
  const launcher = source === "camera"
    ? ImagePicker.launchCameraAsync
    : ImagePicker.launchImageLibraryAsync;

  const result = await launcher({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: false,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    // Compress if needed
    const compressed = await compressImageIfNeeded(asset.uri, asset.fileSize ?? 0);
    // Upload via useUploadFile mutation
  }
}

async function pickDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (result.assets && result.assets.length > 0) {
    const file = result.assets[0];
    // Validate size
    // Upload via useUploadFile mutation
  }
}
```

**UploadProgressBar (`src/components/chat/upload-progress-bar.tsx`):**

- Shown above input bar during upload
- Animated width from 0% to 100%
- File name + progress percentage
- Cancel button (optional, stretch goal)

**ImagePreview (`src/components/chat/image-preview.tsx`):**

- Inline image in chat message (for content_type='image')
- Max width 280px, aspect ratio maintained
- Rounded corners (radius-xl)
- Tap -> navigate to S-07 ImageViewer
- Use `expo-image` for optimized loading with placeholder

**FilePreview (`src/components/chat/file-preview.tsx`):**

- Card with file icon + file name + file size
- Background: surface color, border
- Tap -> open signed URL in browser/share sheet

### Step 9: Image Viewer Screen (`src/screens/image-viewer-screen.tsx`) — S-07

Modal presentation, fullscreen dark background:

- `react-native-gesture-handler` for pinch-to-zoom (or use `expo-image` zoom)
- Header: close (X) button, share button, save button
- Swipe down to dismiss
- Black background
- Use `expo-image` for cached display

```typescript
// Navigation: modal presentation
navigation.setOptions({
  presentation: "modal",
  headerShown: true,
  headerTransparent: true,
  headerLeft: () => <CloseButton />,
  headerRight: () => <ShareSaveButtons />,
});
```

### Step 10: Conversation Info Screen (`src/screens/conversation-info-screen.tsx`) — S-08

**For DM:**
- Large avatar (80px, centered)
- Username + role badge
- Presence status text
- "Shared Files" section — list attachments from conversation

**For Group:**
- Group name
- Member list (FlashList) with avatar, name, role badge, presence dot
- "Shared Files" section

**MemberListItem (`src/components/conversation/member-list-item.tsx`):**

```
[Avatar 40px]  Username    [Admin badge]
  ● Online                 [Agent badge]
```

### Step 11: Update existing components

1. **ConversationItem**: Add presence dot to avatar, replace last message text with typing indicator when someone is typing
2. **DM Chat Screen**: Call `useReadReceipt` on mount and foreground; add typing indicator below messages; wire up file upload from input bar
3. **MessageInputBar**: Add `onChangeText` callback that triggers `sendTypingEvent()`; wire attachment button to action sheet
4. **UserMessageBubble**: Add long-press handler, reaction badge
5. **AgentMessageBubble**: Add long-press handler, reaction badge, render ImagePreview/FilePreview for non-text messages

### Step 12: Update navigation

Add new screens to ChatStack:
- GroupChat (params: conversationId)
- ImageViewer (modal, params: uri)
- ConversationInfo (params: conversationId)

Update ConversationListScreen: route to GroupChat when `conversation.type === 'group'`.

## Todo List

- [x] Install `expo-image-picker`, `expo-document-picker`
- [x] Create PresenceDot component, integrate with Avatar
- [x] Build GroupChatScreen (S-04) with member count header
- [x] Build HumanMessageBubble for group human messages
- [x] Build MentionAutocomplete dropdown with member filtering
- [x] Build TypingIndicator with animated dots
- [x] Build ReactionBadge and MessageActionsMenu (long-press)
- [x] Build attachment action sheet (camera, gallery, file)
- [x] Build UploadProgressBar component
- [x] Build ImagePreview (inline) and FilePreview (card) components
- [x] Build ImageViewer screen (S-07) with pinch-to-zoom
- [x] Build ConversationInfo screen (S-08) with member list
- [x] Update ConversationItem with presence dot + typing text
- [x] Update DM chat with read receipts + typing + file upload
- [x] Update MessageInputBar with typing event + attachment
- [x] Add long-press + reaction badge to both bubble components
- [x] Update navigation with new screens and routing logic

## Success Criteria

- Group chat: displays sender names, member count in header
- @Mention: type `@` shows autocomplete, select inserts `@Name`
- File upload: pick file -> progress bar -> message appears with file card
- Image upload: pick image -> compress if >2MB -> upload -> inline preview in chat
- Image viewer: tap image -> fullscreen, pinch to zoom, swipe to dismiss
- Typing: partner types -> animated dots appear within 500ms, disappear after 3s
- Reactions: long-press -> haptic + menu -> tap heart -> badge appears below message
- Presence: green dot on online users in conversation list and chat header
- Read receipts: open conversation -> badges clear in conversation list
- Conversation info: shows member list with roles and presence

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Image picker permissions | Request camera/library permissions with clear rationale messages |
| Large images crash on compression | Set max dimension to 1920px, catch OOM errors |
| Mention autocomplete Z-index issues | Use absolute positioning with zIndex, test on both platforms |
| File upload fails on cellular | Retry 3x with exponential backoff, show error toast |
