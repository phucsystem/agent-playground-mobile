# Design Guidelines & System

**Project:** Agent Playground Mobile
**Version:** 1.0.0
**Last Updated:** 2026-03-17
**Design Reference:** ChatGPT + Claude mobile (minimalist, technical, trustworthy)

Complete design system for the Agent Playground Mobile app, including color palette, typography, spacing, components, and interaction patterns.

---

## 1. Design Philosophy

The app follows a **minimalist, technical design** inspired by ChatGPT and Claude mobile apps:

- **Clean & Simple** — No visual clutter, clear content hierarchy
- **Technical Depth** — Code blocks, markdown, technical information readable
- **Trustworthy** — Professional colors, clear status indicators, no dark patterns
- **Performance Focused** — Smooth animations, responsive interactions, fast feedback
- **Accessibility** — High contrast, readable text sizes, proper spacing

---

## 2. Color System

### 2.1 Core Palette

All colors are defined in `tailwind.config.js` and available as Tailwind classes:

| Token | Value | Tailwind Class | Usage |
|-------|-------|---|---|
| **Primary** | `#0084FF` | `bg-primary`, `text-primary`, `border-primary` | Main actions, links, user messages |
| **Primary Light** | `#E8F4FD` | `bg-primary-light` | Selected/active conversation state, highlights |
| **Background** | `#FFFFFF` | `bg-white` | Screen backgrounds, modals |
| **Surface** | `#F7F7F8` | `bg-surface` | Conversation list items, input bar, cards |
| **Agent Bubble** | `#F0F0F0` | `bg-agent-bubble` | Agent message background (subtle gray) |
| **User Bubble** | `#0084FF` | `bg-user-bubble` | User message background |

### 2.2 Text Colors

| Token | Value | Tailwind Class | Usage |
|-------|-------|---|---|
| **Text Primary** | `#1A1A1A` | `text-text-primary` | Main content, message text, headers |
| **Text Secondary** | `#6B7280` | `text-text-secondary` | Timestamps, subtitles, metadata |
| **Text Tertiary** | `#9CA3AF` | `text-text-tertiary` | Disabled states, helper text, hints |
| **User Text** | `#FFFFFF` | `text-white` | Text on user bubbles (high contrast) |

### 2.3 Semantic Colors

| Token | Value | Tailwind Class | Usage |
|-------|-------|---|---|
| **Success** | `#10B981` | `bg-success`, `text-success` | Online presence dot, delivered status |
| **Warning** | `#F59E0B` | `bg-warning`, `text-warning` | Pending webhook, loading states |
| **Error** | `#EF4444` | `bg-error`, `text-error` | Failed status, error messages, destructive actions |
| **Border** | `#E5E7EB` | `border-border` | Input borders, dividers, separator lines |
| **Agent Badge** | `#3B82F6` | `bg-agent-badge` | Bot badge overlay on agent avatars |
| **Code Background** | `#1E1E1E` | `bg-code-bg` | Code block dark background |
| **Code Text** | `#D4D4D4` | `text-code-text` | Code block light text on dark |

### 2.4 Color Usage Examples

**Message Bubbles:**
```jsx
// User message (right-aligned, blue)
<View className="bg-user-bubble rounded-bubble px-3 py-2">
  <Text className="text-white">{messageContent}</Text>
</View>

// Agent message (left-aligned, light gray)
<View className="bg-agent-bubble rounded-bubble px-3 py-2">
  <Text className="text-text-primary">{markdownContent}</Text>
</View>
```

**Status Indicators:**
```jsx
// Online presence
<View className="w-3 h-3 rounded-full bg-success" /> {/* Green dot */}

// Offline presence
<View className="w-3 h-3 rounded-full bg-text-tertiary" /> {/* Gray dot */}

// Error message
<Text className="text-error text-sm">{errorMessage}</Text>
```

---

## 3. Typography System

### 3.1 Font Families

| Font | Value | Usage |
|------|-------|-------|
| **Sans** | Inter, System UI | All UI text (default) |
| **Mono** | JetBrains Mono | Code blocks, token input, technical content |

**Tailwind classes:**
```jsx
<Text className="font-sans">Regular UI text (default)</Text>
<Text className="font-mono">Code or monospace text</Text>
```

### 3.2 Type Scale

| Level | Size | Weight | Line Height | Usage | Tailwind Class |
|-------|------|--------|-------------|-------|---|
| **H1** | 24px | 700 | 1.2 | Screen titles | `text-2xl font-bold` |
| **H2** | 20px | 600 | 1.25 | Section headers | `text-xl font-semibold` |
| **H3** | 16px | 600 | 1.4 | Subsection, conversation names | `text-lg font-semibold` |
| **Body** | 16px | 400 | 1.5 | Message content, labels | `text-base` |
| **Body Small** | 14px | 400 | 1.5 | Last message preview, member names | `text-sm` |
| **Caption** | 12px | 400 | 1.4 | Timestamps, badges, helper text | `text-xs` |
| **Code** | 13px | 400 | 1.6 | Code block content | `text-code font-mono` |
| **Input** | 16px | 400 | 1.5 | Input fields (prevents iOS zoom) | `text-base` |

### 3.3 Typography Usage

**Screen Title:**
```jsx
<Text className="text-2xl font-bold text-text-primary mb-4">Conversations</Text>
```

**Message Content:**
```jsx
<Text className="text-base text-text-primary leading-6">{message.content}</Text>
```

**Metadata (Timestamp):**
```jsx
<Text className="text-xs text-text-secondary">Today at 3:45 PM</Text>
```

**Code Block (via Markdown):**
```jsx
<View className="bg-code-bg rounded px-2 py-1">
  <Text className="font-mono text-code-text">console.log('hello')</Text>
</View>
```

---

## 4. Spacing System

All spacing values follow the Tailwind scale, defined in `tailwind.config.js`:

| Token | Value | Tailwind Class | Usage |
|-------|-------|---|---|
| **xs** | 4px | `p-1`, `gap-1` | Tight gaps, tight padding (badge padding) |
| **sm** | 8px | `p-2`, `gap-2` | Compact spacing (between elements) |
| **md** | 12px | `p-3`, `gap-3` | Default spacing (message padding, list gaps) |
| **lg** | 16px | `p-4`, `gap-4` | Section spacing, screen padding |
| **xl** | 24px | `p-6`, `gap-6` | Major section gaps |
| **2xl** | 32px | `p-8`, `gap-8` | Screen top/bottom safe areas |

### 4.1 Spacing Patterns

**Screen Padding:**
```jsx
<View className="flex-1 px-4 py-6"> {/* lg horizontally, xl vertically */}
  <Text>Screen content</Text>
</View>
```

**Conversation List Item:**
```jsx
<View className="px-4 py-3 border-b border-border"> {/* lg/md spacing */}
  {/* Item content */}
</View>
```

**Message Bubble:**
```jsx
<View className="px-3 py-2 rounded-bubble"> {/* md spacing, bubble radius */}
  <Text>Message</Text>
</View>
```

**Gap Between Elements (Column):**
```jsx
<View className="gap-3"> {/* md gap between children */}
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</View>
```

---

## 5. Border Radius

| Token | Value | Tailwind Class | Usage |
|-------|-------|---|---|
| **Small** | 8px | `rounded-lg` | Buttons, input fields |
| **Medium** | 12px | `rounded-xl` | Cards, modals, conversation items |
| **Large (Bubble)** | 18px | `rounded-bubble` | Message bubbles |
| **XL** | 20px | `rounded-2xl` | Image previews, large modals |
| **Full** | 9999px | `rounded-full` | Avatars, badges, presence dots |

### 5.1 Radius Usage

**Avatar (Full Circle):**
```jsx
<Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-full" />
```

**Message Bubble (with square corner on user messages):**
```jsx
// User message: rounded except bottom-right
<View className="bg-user-bubble rounded-bubble" style={{ borderBottomRightRadius: 0 }} />

// Agent message: fully rounded
<View className="bg-agent-bubble rounded-bubble" />
```

**Button:**
```jsx
<Pressable className="bg-primary rounded-lg px-4 py-2">
  <Text className="text-white font-semibold">Send</Text>
</Pressable>
```

---

## 6. Shadows

Shadows are applied using React Native's `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` (iOS) and `elevation` (Android).

| Token | Shadow | Usage |
|-------|--------|-------|
| **Small** | `0 1px 2px rgba(0,0,0,0.05)` | Subtle shadows (input bar, floating elements) |
| **Medium** | `0 2px 8px rgba(0,0,0,0.1)` | Cards, mention autocomplete dropdown |
| **Large** | `0 4px 16px rgba(0,0,0,0.12)` | Modals, action sheets |

**Note:** NativeWind may not have built-in shadow utilities. Use React Native's shadow properties:

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

<View style={styles.shadowMedium} className="bg-white rounded-xl p-4">
  {/* Content */}
</View>
```

---

## 7. Component Patterns

### 7.1 Message Bubbles

**User Message (Right-aligned):**
- Background: `#0084FF` (primary)
- Text color: `#FFFFFF` (white)
- Alignment: Right
- Radius: 18px (bubble) with 0px bottom-right corner
- Padding: 12px (md)
- Max width: ~70% of screen

```jsx
<View className="flex-row justify-end mb-3 px-4">
  <View className="bg-primary rounded-bubble px-3 py-2 max-w-[70%]">
    <Text className="text-white">{content}</Text>
  </View>
</View>
```

**Agent Message (Left-aligned, Full Width):**
- Background: `#F0F0F0` (subtle gray) OR transparent
- Text color: `#1A1A1A` (text-primary)
- Alignment: Left
- Radius: 18px (bubble)
- Padding: 12px (md)
- Avatar on left (32px circle)
- Full width with sender name

```jsx
<View className="flex-row items-start gap-2 mb-3 px-4">
  <Avatar uri={senderAvatar} size={32} />
  <View className="flex-1">
    <Text className="text-xs text-text-secondary font-semibold mb-1">{senderName}</Text>
    <View className="bg-agent-bubble rounded-bubble px-3 py-2">
      <Markdown>{content}</Markdown>
    </View>
  </View>
</View>
```

**System Message (Centered, No Bubble):**
- Text: Gray (`#6B7280`)
- Size: Small (12px)
- No background or bubble

```jsx
<View className="flex-row justify-center my-3">
  <Text className="text-text-secondary text-xs">Today</Text>
</View>
```

### 7.2 Avatar Component

**Specifications:**
- Circle shape (border-radius: 50%)
- 40px for conversation list
- 32px for message sender
- 16px for inline badges/reactions
- Initials fallback with hash-based background color
- Agent: Blue bot badge overlay (bottom-right, 12px)

**Sizes:**
```jsx
<Avatar uri={avatarUrl} size={40} /> {/* Conversation list */}
<Avatar uri={avatarUrl} size={32} /> {/* Message sender */}
<Avatar uri={avatarUrl} size={16} /> {/* Inline badge */}
```

**With Agent Badge:**
```jsx
<View className="relative">
  <Avatar uri={agentAvatar} size={32} />
  <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-agent-badge border border-white" />
</View>
```

### 7.3 Badge Styles

**Role Badge (Admin/User/Agent):**
```jsx
// Admin badge (red)
<View className="bg-error rounded-full px-2 py-0.5">
  <Text className="text-white text-xs font-semibold">Admin</Text>
</View>

// Agent badge (blue)
<View className="bg-agent-badge rounded-full px-2 py-0.5">
  <Text className="text-white text-xs font-semibold">Agent</Text>
</View>

// User badge (gray)
<View className="bg-text-tertiary rounded-full px-2 py-0.5">
  <Text className="text-white text-xs font-semibold">User</Text>
</View>
```

**Status Badge (Online/Offline):**
```jsx
// Online (green dot with text)
<View className="flex-row items-center gap-1">
  <View className="w-2 h-2 rounded-full bg-success" />
  <Text className="text-xs text-text-secondary">Online</Text>
</View>
```

**Unread Badge:**
```jsx
<View className="bg-primary rounded-full w-5 h-5 items-center justify-center">
  <Text className="text-white text-xs font-bold">3</Text>
</View>
```

### 7.4 Navigation Bar (Bottom Tabs)

**For Admin Users:**
- Two tabs: "Chats", "Admin"
- Tab height: 56px
- Active tab text: Primary blue (`#0084FF`)
- Inactive tab text: Text secondary (`#6B7280`)
- Tab bar background: White (`#FFFFFF`)
- Icons: 24x24px

**For Regular Users:**
- One tab: "Chats"
- Same styling as above

```jsx
<BottomTabNavigator
  screenOptions={{
    headerShown: false,
    tabBarHeight: 56,
    tabBarStyle: { borderTopColor: '#E5E7EB' },
    tabBarActiveTintColor: '#0084FF',
    tabBarInactiveTintColor: '#6B7280',
  }}
>
  {/* Tab screens */}
</BottomTabNavigator>
```

### 7.5 Input Bar (Message Input)

**Layout:**
- Fixed at bottom, above keyboard
- Padding: lg (16px)
- Background: Surface (`#F7F7F8`)
- Border: Top border (1px, `#E5E7EB`)

**Elements:**
- **Attachment button:** Left (24x24px icon)
- **Text input:** Center (auto-grows, 1-4 lines, 16px font for iOS)
- **Send button:** Right (24x24px icon)

**States:**
- **Enabled:** Send button text/icon in primary blue
- **Disabled:** Send button in text-tertiary (gray)
- **Typing:** Text input expands, border none

```jsx
<View className="flex-row items-center gap-2 px-4 py-3 bg-surface border-t border-border">
  {/* Attachment button */}
  <Pressable onPress={handleAttachment}>
    <Icon name="paperclip" size={24} color="#6B7280" />
  </Pressable>

  {/* Text input (auto-growing) */}
  <TextInput
    className="flex-1 text-base font-sans px-3 py-2 bg-white rounded-lg border border-border"
    multiline
    maxHeight={100}
    placeholder="Type a message..."
    placeholderTextColor="#9CA3AF"
    value={text}
    onChangeText={setText}
  />

  {/* Send button */}
  <Pressable disabled={!text.trim()} onPress={handleSend}>
    <Icon
      name="send"
      size={24}
      color={text.trim() ? '#0084FF' : '#9CA3AF'}
    />
  </Pressable>
</View>
```

---

## 8. Screen-Specific Styles

### 8.1 Conversation List (S-02)

**Header:**
- Title: "Conversations" (H1, 24px bold)
- Padding: lg (16px)

**List Items:**
- Padding: lg horizontal (16px), md vertical (12px)
- Border bottom: 1px (`#E5E7EB`)
- Selected state: Primary light background (`#E8F4FD`)

**Row Layout:**
```
[Avatar] [Name + Preview] [Timestamp + Badge]
  40px     flex-1            content-width
```

### 8.2 Chat Screens (S-03, S-04)

**Header:**
- Background: White
- Back button: 24x24px
- Title: Conversation name (H3)
- Info button: Right (24x24px)
- Padding: lg (16px)
- Border bottom: 1px (`#E5E7EB`)

**Message List:**
- Background: White
- Message spacing: md (12px)
- Screen padding: lg (16px)

**Input Bar:**
- Fixed at bottom
- Keyboard-aware (above keyboard)

---

## 9. Interaction Patterns

### 9.1 Loading States

**Spinner:**
```jsx
<View className="flex-1 items-center justify-center">
  <ActivityIndicator size="large" color="#0084FF" />
</View>
```

**Skeleton Loading:**
```jsx
<View className="gap-3">
  <View className="h-16 bg-surface rounded-lg animate-pulse" />
  <View className="h-16 bg-surface rounded-lg animate-pulse" />
  <View className="h-16 bg-surface rounded-lg animate-pulse" />
</View>
```

### 9.2 Error States

**Error Banner:**
```jsx
<View className="bg-error px-4 py-3 flex-row items-center gap-2">
  <Icon name="alert-circle" size={20} color="white" />
  <Text className="text-white flex-1">{errorMessage}</Text>
  <Pressable onPress={handleDismiss}>
    <Icon name="close" size={20} color="white" />
  </Pressable>
</View>
```

**Empty State:**
```jsx
<View className="flex-1 items-center justify-center gap-3 px-4">
  <Icon name="inbox" size={48} color="#9CA3AF" />
  <Text className="text-text-secondary text-center">No conversations yet</Text>
  <Text className="text-text-tertiary text-xs text-center">
    Start a conversation to get messages here
  </Text>
</View>
```

### 9.3 Animations

**Typing Indicator:**
- Three dots animating up/down
- 0.6s animation duration, repeat infinite

**Presence Dot:**
- Green (online) or gray (offline)
- No animation

**Message Appear:**
- Fade in + slight scale (0.95 → 1)
- Duration: 200ms

---

## 10. Accessibility Guidelines

### 10.1 Text Contrast

- Primary text on white: WCAG AAA (7:1)
- Secondary text: WCAG AA (4.5:1 minimum)
- Error/success colors: WCAG AA contrast

### 10.2 Touch Targets

- Minimum touch target: 44x44px
- Spacing between targets: At least 8px

### 10.3 Type Sizes

- Minimum readable size: 14px for body text
- Input field: 16px (prevents iOS zoom)

### 10.4 Labels

- All form inputs must have labels (accessibility)
- Use `accessibilityLabel` prop on icon buttons

```jsx
<Pressable accessibilityLabel="Send message" onPress={handleSend}>
  <Icon name="send" size={24} />
</Pressable>
```

---

## 11. Dark Mode (Future)

This design is currently **light mode only**. For future dark mode support:

- Primary: `#0084FF` (same)
- Text primary: `#FFFFFF` (inverted)
- Background: `#000000` (inverted)
- Surface: `#1A1A1A` (inverted)
- Agent bubble: `#2D2D2D` (darker gray)

---

## 12. Responsive Design

### Screen Breakpoints

- **Mobile:** 320px - 768px
- **Tablet:** 768px+

### Adaptive Layouts

**Conversation List on Tablet:**
- Two-column layout: List + Chat side-by-side
- List width: 300px fixed

**Message Input on Tablet:**
- Max width: 600px (centered)

---

## 13. Implementation Checklist

Before building a screen, ensure:

- [ ] All colors use Tailwind tokens from `tailwind.config.js`
- [ ] Spacing follows the defined scale (xs, sm, md, lg, xl, 2xl)
- [ ] Text uses appropriate type scale (H1-Body-Caption)
- [ ] Border radius uses defined tokens (bubble, full, etc)
- [ ] Images/avatars are compressed before display
- [ ] Keyboard handling is implemented (KeyboardAvoidingView)
- [ ] Touch targets are minimum 44x44px
- [ ] Error and loading states are visible
- [ ] Accessibility labels on icon buttons
- [ ] Pull-to-refresh has proper visual feedback
- [ ] Loading indicators use primary color (`#0084FF`)

---

## 14. Tools & Resources

- **Figma Design System:** (Link to shared design file, if applicable)
- **Color Reference:** ChatGPT Mobile + Claude Mobile apps
- **Font:** Inter (Google Fonts) + JetBrains Mono
- **Tailwind Config:** `/tailwind.config.js`
- **Global Styles:** `/nativewind/input.css`

---

## Summary

Use this guide when:
1. Building new screens
2. Creating components
3. Styling UI elements
4. Ensuring design consistency
5. Onboarding new designers/developers

All tokens are defined in `tailwind.config.js` and available as Tailwind utility classes throughout the codebase.
