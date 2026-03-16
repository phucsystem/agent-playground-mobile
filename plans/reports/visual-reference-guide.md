# Visual Reference Guide - Mobile Chat UI Patterns
## Agent Playground Mobile (March 2026)

---

## Layout Architecture - MVP

```
┌──────────────────────────────────────────────┐
│ Agent Playground Mobile Chat App             │
├──────────────────────────────────────────────┤
│                                              │
│  [Chats]  [Agents]  [Settings]  [Profile]   │ ← Tab Bar
│   (Active)                                   │
│                                              │
├──────────────────────────────────────────────┤
│  Recent Conversations                        │
│  ─────────────────────────────────────────  │
│  ┌─────────────────────────────────────────┐ │
│  │ Agent Alpha        Today 2:45pm      (3)│ │ ← Unread
│  │ "Here's the analysis..."                │ │    badge
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │ Support Team       Yesterday 11:30am     │ │
│  │ "Your issue has been resolved"          │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │ Code Helper        3 days ago            │ │
│  │ "Python function is ready"              │ │
│  └─────────────────────────────────────────┘ │
│                                              │
├──────────────────────────────────────────────┤
│  [🔍 Search conversations]                   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Chat View - Message Layout

```
┌──────────────────────────────────────────────┐
│ Chat with Agent Alpha          [⋮ Options]   │ ← Header
├──────────────────────────────────────────────┤
│                                              │
│ (Earlier messages...)                        │
│                                              │
│                      ┌────────────────────┐  │ ← User
│                      │ What's the weather │  │   message
│                      │ in SF today?       │  │   (right)
│                      └────────────────────┘  │
│                           Today 2:45pm       │
│                                              │
│  ┌─────────────────────────────────────────┐ │ ← AI
│  │ Agent Alpha 🤖                          │ │   response
│  ├─────────────────────────────────────────┤ │   (left)
│  │ Based on current weather data:          │ │
│  │                                         │ │
│  │ Temperature: 72°F                       │ │
│  │ Condition: Partly cloudy                │ │
│  │ Wind: 8 mph from the west               │ │
│  │                                         │ │
│  │ [Copy]  [Share]  [More ⋯]              │ │ ← Actions
│  └─────────────────────────────────────────┘ │
│                           2:46pm              │
│                                              │
│  Agent is typing... ●  ●  ●                 │ ← Typing
│                                              │
├──────────────────────────────────────────────┤
│  [📎]  Type your message...   [🎤] [→]      │ ← Input
│         (placeholder text)                    │
└──────────────────────────────────────────────┘
```

---

## Color Coding - User vs. Agent vs. System

```
User Message Bubble:
┌─────────────────────┐
│ Hello, are you      │  Background: #0084FF (blue)
│ available?          │  Text: #FFFFFF (white)
└─────────────────────┘  Corner radius: 16pt
                         Alignment: Right
                         ✓ Distinct from agent

Agent Response Card:
┌──────────────────────┐
│ Agent Alpha 🤖       │  Header background: #F5F5F5
├──────────────────────┤  Border: 1pt #E5E5E5
│ Yes, I'm online      │  Content background: #FFFFFF
│ and ready to help.   │  Text: #1D1D1D
│                      │  Alignment: Left
│ [Copy] [Share]       │  ✓ Card format for clarity
└──────────────────────┘

System Message:
┌──────────────────────────────────┐
│ • Agent transferred to Sarah      │  Background: #F9F9F9
│   at 3:15pm (3 messages)         │  Text: #666666
│                                   │  Alignment: Center
└──────────────────────────────────┘  Icon: ℹ️

Error Message:
┌──────────────────────────────────┐
│ ⚠ Failed to send message         │  Background: #FFEBEE
│                   [Retry] [Delete]│  Text: #D32F2F
└──────────────────────────────────┘  Border: 1pt #FFCDD2
```

---

## Input Composition Area

```
Standard Input (MVP):
┌────────────────────────────────────────────┐
│ Type your message here...                  │ [⏎]
└────────────────────────────────────────────┘
 ▲                                             ▲
 Touch target minimum: 48pt height          Send button
 Input text color: #1D1D1D                  48pt × 48pt
 Placeholder: #999999

Rich Input (v0.2+):
┌────────────────────────────────────────────┐
│ [📎 📷] Type your message...    [🎤] [→] │
└────────────────────────────────────────────┘
   ▲                                    ▲    ▲
   Attachment                        Voice  Send
   & Photo                          Message (48pt)
   (48pt touch)                     (48pt)

Quick Reply Buttons (Optional):
┌────────────────────────────────────────────┐
│ Which would you like help with?            │
├────────────────────────────────────────────┤
│  [Billing]  [Technical]  [Other] [More▼]  │
└────────────────────────────────────────────┘
 All 44-48pt height for thumb-friendly taps
```

---

## Dark Mode - Side by Side

```
Light Mode (Default)           Dark Mode (Toggle)
═════════════════════════════════════════════════════

┌─────────────────────────┐   ┌─────────────────────────┐
│ Chat with Alpha   [⋮]   │   │ Chat with Alpha   [⋮]   │
├─────────────────────────┤   ├─────────────────────────┤
│                         │   │                         │
│          ┌──────────┐   │   │      ┌──────────┐       │
│          │ Hi there!│   │   │      │ Hi there!│       │
│          └──────────┘   │   │      └──────────┘       │
│                         │   │                         │
│ ┌─────────────────────┐ │   │ ┌─────────────────────┐ │
│ │ Agent: Thanks for   │ │   │ │ Agent: Thanks for   │ │
│ │ reaching out!       │ │   │ │ reaching out!       │ │
│ │ [Copy] [Share]      │ │   │ │ [Copy] [Share]      │ │
│ │                     │ │   │ │                     │ │
│ │ [Options ⋯]         │ │   │ │ [Options ⋯]         │ │
│ └─────────────────────┘ │   │ └─────────────────────┘ │
│                         │   │                         │
├─────────────────────────┤   ├─────────────────────────┤
│ [📎] Type message... [→]│   │ [📎] Type message... [→]│
└─────────────────────────┘   └─────────────────────────┘

BG: #FFFFFF          │   BG: #212121
Text: #1D1D1D        │   Text: #FFFFFF
Input BG: #FFFFFF    │   Input BG: #2D2D2D
Bubble: #0084FF      │   Bubble: #5C9EFF
Card BG: #F5F5F5     │   Card BG: #2D2D2D
Card Border: #E5E5E5 │   Card Border: #3F3F3F
```

---

## Navigation Gesture Flow (v0.2+)

```
Primary View (Chat List):
┌─────────────────────────────────┐
│ Chats | Agents | Settings       │
├─────────────────────────────────┤
│ • Agent Alpha                   │
│ • Support Team                  │
│ • Code Helper                   │
└─────────────────────────────────┘
         ↓ (Swipe down)
         ↓↓↓↓↓

Secondary View (Expanded Options):
┌─────────────────────────────────┐
│ [Recents ▼] [Archived] [Muted]   │  (quick filters)
├─────────────────────────────────┤
│ Recent Chats                    │
│ • Agent Alpha          TODAY    │
│ • Support Team      YESTERDAY   │
│ • Code Helper       3 DAYS AGO  │
└─────────────────────────────────┘
         ↓ (Swipe down again)
         ↓↓↓↓↓

Tertiary View (Channel/Agent List):
┌─────────────────────────────────┐
│ [Search]                        │
├─────────────────────────────────┤
│ All Agents                      │
│ ☆ Agent Alpha (Active)          │
│ • Support Team                  │
│ • Code Helper                   │
│ • Finance Advisor               │
│ • Legal Consultant              │
└─────────────────────────────────┘

(Swipe back up to return to main chat)
```

---

## Message Action Menu (Long Press)

```
Message:
┌──────────────────────────────────┐
│ Agent: Here's the answer: 42     │
└──────────────────────────────────┘

Long press (500ms) → Context menu appears:

          ┌───────────────────┐
          │ 📋 Copy           │ ← Copy to clipboard
          │ 🔗 Share          │ ← Share via system
          │ ↺ Regenerate      │ ← AI: generate new
          │ ⭐ Pin to top      │ ← Mark important
          │ 🔔 Mute agent     │ ← Silence notifications
          │ ⚠️ Report          │ ← Flag as inappropriate
          │ 🗑️ Delete        │ ← Remove message
          └───────────────────┘

   Tap outside → Close menu
   Tap option → Execute & close
```

---

## Empty States

### No Conversations
```
┌──────────────────────────────────┐
│                                  │
│                                  │
│            📭                     │ ← Friendly icon
│                                  │
│      No conversations yet        │ ← Clear heading
│                                  │
│    Start a new chat by           │ ← Helper text
│    selecting an agent below      │
│                                  │
│    [Create Conversation]         │ ← Primary action
│                                  │
│                                  │
└──────────────────────────────────┘
```

### No Search Results
```
┌──────────────────────────────────┐
│ Results for "xyz..."             │
├──────────────────────────────────┤
│                                  │
│            🔍                     │
│                                  │
│      No messages found           │
│                                  │
│    Try:                          │
│    • Checking spelling           │
│    • Using broader keywords      │
│    • Removing filters            │
│                                  │
│    [Clear Filters]               │
│                                  │
└──────────────────────────────────┘
```

---

## Error States

### Connection Lost
```
┌──────────────────────────────────┐
│                                  │
│            ⚠️                     │
│                                  │
│    No internet connection        │
│                                  │
│    Messages will send when       │ ← Reassuring text
│    connection is restored        │
│                                  │
│    [Retry]  [Settings]           │
│                                  │
└──────────────────────────────────┘
```

### Agent Unavailable
```
┌──────────────────────────────────┐
│                                  │
│            ⏱️                     │
│                                  │
│    Agent Alpha is unavailable    │
│                                  │
│    Expected wait: ~5 minutes     │
│                                  │
│    [Wait in Queue] [Try Another] │
│                                  │
└──────────────────────────────────┘
```

---

## Loading States

### Skeleton Loading (Preferred)
```
┌─────────────────────────────────┐
│ Chat with Agent...      [⋮]     │
├─────────────────────────────────┤
│                                 │
│  ┌────────────────────────┐     │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │     │
│  │ ▓▓▓▓▓▓▓▓▓▓             │     │
│  └────────────────────────┘     │
│                                 │
│  ┌────────────────────────┐     │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     │     │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓         │     │
│  │ ▓▓▓▓▓▓                 │     │
│  └────────────────────────┘     │
│                                 │
│ (Animated pulse effect)         │
└─────────────────────────────────┘
```

### Spinner Loading (Fallback)
```
┌─────────────────────────────────┐
│                                 │
│            ⌛                    │
│         Loading...              │
│                                 │
└─────────────────────────────────┘
```

---

## Accessibility Features

### High Contrast Dark Mode
```
Text on dark background: 7:1 contrast ratio
Colors chosen specifically for colorblind users
```

### Touch Target Specifications
```
Minimum size: 48pt × 48pt
Comfortable spacing: 8pt padding between targets
Examples:
  • Message bubble: 48pt min height
  • Button: 48pt × 48pt
  • Tab bar item: 44pt height
  • Input field: 48pt min height
```

### Screen Reader Labels
```
<AccessibilityLabel>
  "Message from Agent Alpha sent at 2:45pm.
   Here's the analysis. 42.
   Double tap for actions."
</AccessibilityLabel>
```

---

## Typography Hierarchy

```
Header (Chat name):
  Font: System bold
  Size: 17pt
  Color: #1D1D1D (light) / #FFFFFF (dark)
  Line height: 1.2

Message sender (Agent name):
  Font: System semibold
  Size: 15pt
  Color: #666666 (light) / #AAAAAA (dark)

Message text:
  Font: System regular
  Size: 15pt
  Color: #1D1D1D (light) / #FFFFFF (dark)
  Line height: 1.4

Timestamp:
  Font: System regular
  Size: 12pt
  Color: #999999 (light) / #666666 (dark)

Placeholder text:
  Font: System regular
  Size: 15pt
  Color: #999999 (light) / #666666 (dark)

Caption/Helper text:
  Font: System regular
  Size: 12pt
  Color: #666666 (light) / #999999 (dark)
```

---

## Spacing Guidelines

```
Component Padding:
  Message bubble internal: 12pt (top/bottom), 14pt (left/right)
  Card internal: 16pt all sides
  Input field: 12pt internal padding

Component Margins:
  Between messages: 8pt (same sender), 12pt (different sender)
  Between messages and timestamp: 4pt
  Header to message list: 12pt
  Message list to input: 12pt

List Item Spacing:
  Conversation list item height: 64pt
  Internal padding: 12pt vertical, 16pt horizontal

Safe Area Margins:
  All content: 16pt from screen edge (except edge-to-edge)
```

---

## Button Styles

### Primary Button (Send, Create)
```
Background: #0084FF
Text: #FFFFFF, 15pt bold
Height: 48pt
Corner radius: 8pt
Padding: 0 20pt
Press state: darken 10%
Disabled: opacity 50%
```

### Secondary Button (Cancel, Options)
```
Background: #F5F5F5 (light) / #2D2D2D (dark)
Text: #0084FF, 15pt semibold
Height: 44pt
Corner radius: 8pt
Padding: 0 16pt
Border: 1pt #E5E5E5
Press state: opacity 70%
```

### Tertiary Button (More, Details)
```
Background: Transparent
Text: #0084FF, 15pt semibold
Height: 44pt
No border
Press state: opacity 50%
```

---

**Visual Guide Version:** 1.0
**Last Updated:** 2026-03-17
**Use with:** design-patterns-detailed-comparison.md
