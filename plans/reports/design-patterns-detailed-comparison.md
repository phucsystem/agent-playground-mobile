# Design Patterns: Detailed Comparison Matrix
## Mobile Chat UI Research (March 2026)

---

## Message Bubble Patterns

### Pattern 1: Simple Bubbles (ChatGPT, Telegram)
```
User Message (left-aligned on mobile):
┌──────────────────────┐
│ Hey, what's the      │  (white bubble, rounded)
│ weather today?       │  Text color: #1D1D1D
└──────────────────────┘

AI Response (right-aligned or distinct):
┌──────────────────────────┐
│ Based on current data,   │  (light gray bubble)
│ it's 72°F and partly     │  Text color: #1D1D1D
│ cloudy in your area.     │
└──────────────────────────┘
```

**Use When:** Simple 1:1 conversations, minimal context needed
**Pros:** Familiar pattern, high adoption, low cognitive load
**Cons:** Doesn't scale well for complex responses (code, tables)
**Recommendation for Agent Playground:** Start here for MVP

---

### Pattern 2: Card-Based Responses (Claude, ChatGPT Pro)
```
User Message:
┌────────────────────────┐
│ Write a Python function│
└────────────────────────┘

AI Response (card with structure):
┌──────────────────────────────────────┐
│ Here's a function to calculate sum:  │  (card header)
├──────────────────────────────────────┤
│ def sum_list(numbers):               │  (code block)
│     return sum(numbers)              │
│                        [Copy] [▼ ]   │  (action buttons)
├──────────────────────────────────────┤
│ This function takes a list and       │  (explanation)
│ returns the sum of all elements.     │
│ Time complexity: O(n)                │
└──────────────────────────────────────┘
```

**Use When:** Technical responses, structured data, multiple actions needed
**Pros:** Supports complex content, clear affordances, scalable
**Cons:** More UI real estate, heavier design
**Recommendation for Agent Playground:** Add in v0.2+ for code agents

---

### Pattern 3: Threaded Replies (Slack)
```
Main Conversation:
┌────────────────────┐
│ Agent: Here's the  │
│ analysis           │
└────────────────────┘

User Starts Thread (tap or swipe):
┌────────────────────────────────┐
│ ↳ Can you explain the first     │
│   point more?                   │
└────────────────────────────────┘

Nested Response:
┌────────────────────────────────┐
│ ↳ Yes, that refers to...       │
│   [Show thread view] (2 replies)│
└────────────────────────────────┘
```

**Use When:** Branching conversations, keeping main feed clean
**Pros:** Reduces cognitive load in large conversations, asynchronous-friendly
**Cons:** Requires navigation overhead
**Recommendation for Agent Playground:** v1+ feature for team use cases

---

## Navigation Patterns

### Pattern 1: Tab Bar (Discord, simplest)
```
Bottom Tab Bar (4-5 items max):
┌──────────────┬──────────────┬──────────────┬──────────────┐
│    Chats     │   Contacts   │   Settings   │   Profile    │
│   [Active]   │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Pros:** Simple, discoverable, native iOS pattern
**Cons:** Takes up screen real estate, limited to 4-5 items
**Best For:** Simple platforms with <5 top-level actions

---

### Pattern 2: Gesture-Based Navigation (Slack)
```
Swipe Down (from top):
     ╔════════════════════╗
     ║  Recent Chats      ║  (pull down reveals)
     ║  • Agent Alpha     ║
     ║  • Support Team    ║
     ╚════════════════════╝
          ↓ (swipe again)
     ╔════════════════════╗
     ║  All Channels      ║
     ║  • #general        ║
     ║  • #announcements  ║
     ╚════════════════════╝

Main View stays above - no tab switch needed
```

**Pros:** Compact, fast re-entry, modern feel
**Cons:** Not immediately discoverable, requires learning
**Best For:** Power users, frequent re-entry patterns
**Recommendation for Agent Playground:** Secondary gesture, with tab bar fallback

---

### Pattern 3: Side Drawer + Tabs (Hybrid)
```
┌──────────────┬─────────────────────────┐
│ ☰ Drawer     │  Chats (Tab 1)          │
│ • Agents     │                         │
│ • Settings   │  [Message list]         │
│ • Help       │                         │
└──────────────┴─────────────────────────┘

Tab Row (secondary navigation):
            ┌──────────────┬──────────────┐
            │  Inbox (3)   │  Mentions(1) │
            └──────────────┴──────────────┘
```

**Pros:** Supports complex hierarchy, familiar to mobile users
**Cons:** More complex, needs careful IA
**Best For:** Teams with multi-level navigation (agents, channels, DMs)

---

## Agent Identification Patterns

### Pattern 1: Simple Color Coding
```
User Message (blue bubble):
┌──────────────────┐
│ Hello there!     │  (background: #0084FF)
└──────────────────┘

Agent Message (gray bubble):
┌──────────────────┐
│ Hi! How can I    │  (background: #F5F5F5)
│ help?            │  or neutral
└──────────────────┘
```

**Usage:** ChatGPT, basic chat apps
**Pros:** Simple, immediate visual distinction
**Cons:** Doesn't scale for multiple agents

---

### Pattern 2: Avatar + Label
```
┌─────────────────────────────┐
│ 👤 Sarah (Support Agent)    │  (header with avatar)
├─────────────────────────────┤
│ I'd be happy to help with   │
│ your account issue.         │
│                             │
│          [Transfer] [Reply] │  (actions)
└─────────────────────────────┘
```

**Usage:** Intercom, professional support tools
**Pros:** Personalization, trust-building, clear agent identity
**Cons:** Takes more space, requires avatar system
**Recommendation for Agent Playground:** Best for team/escalation scenarios

---

### Pattern 3: Badge + Icon
```
┌──────────────────────────────┐
│ Agent "Alpha" 🤖             │  (inline badge)
├──────────────────────────────┤
│ I found 3 matching results:  │
│                              │
│ 1. Result A                  │
│ 2. Result B                  │
│ 3. Result C                  │
└──────────────────────────────┘
```

**Usage:** Claude, Gemini
**Pros:** Lightweight, scalable, minimal space
**Cons:** Less personal, harder to build trust
**Best For:** Lightweight UI, multiple quick agent switches

---

## Input Methods & Quick Actions

### Input Pattern 1: Text Only (MVP)
```
┌────────────────────────────────────────┐
│ Type your message here...              │ [Send 🔍]
└────────────────────────────────────────┘

Single action: Text input + send button (48px touch target)
```

**Adoption:** All chat apps start here
**Best For:** MVP launch

---

### Input Pattern 2: Rich Input with Quick Actions
```
┌────────────────────────────────────────┐
│ [📎] Type your message...     [Voice 🎤]│
└────────────────────────────────────────┘

Left icon: Attachment (images, files, voice)
Right icon: Voice message or send with options
```

**Adoption:** ChatGPT, Discord, Slack
**Best For:** v0.2+, supporting media-rich conversations

---

### Action Buttons Below Messages
```
AI Response:
┌──────────────────────┐
│ Here's the answer:   │
│ 42                   │
└──────────────────────┘
     [Copy] [Edit] [Share] [Regenerate]
     (max 2-3 visible, rest in menu)
```

**Usage:** Claude, ChatGPT Pro
**Best For:** High-interaction agents
**Recommendation:** Keep primary actions visible (copy, regenerate), secondary in menu

---

## Real-Time Feedback Patterns

### Typing Indicator (All Apps)
```
┌──────────────────┐
│ Agent is typing… │  (animated dots or text)
│ ●  ●  ●          │  or spinner icon
└──────────────────┘
```

**Appearance Time:** <500ms after user sends
**Duration:** 0.5-3 seconds (or until response arrives)
**UX Impact:** Signals processing, reduces user anxiety

---

### Read Receipts (Slack, Discord, iMessage)
```
Before send:     📤 (uploading icon)
After send:      ✓  (single checkmark)
Delivered:       ✓✓ (double checkmark, lighter)
Read:            ✓✓ (double checkmark, bold/blue)
                    "Read at 2:45 PM"
```

**MVP:** Skip (reduces complexity)
**v0.2+:** Add if multi-agent or asynchronous

---

### Presence Indicators (Discord, Slack)
```
Online:    🟢 Agent Online
Idle:      🟡 Agent Away
Offline:   ⚫ Agent Offline
DND:       🔴 Do Not Disturb
```

**Usage:** Team/multi-agent platforms only
**Display Location:** Avatar corner, header status

---

## Search & Discovery Patterns

### Simple Search (MVP)
```
┌─────────────────────────────────────┐
│ 🔍 Search conversations            │
│                                     │
│ Results:                            │
│ • Agent Alpha - "pricing details"   │
│ • Support - "refund policy"         │
│ • Sarah - "project timeline"        │
└─────────────────────────────────────┘
```

---

### Advanced Search with Filters (v1+)
```
┌──────────────────────────────────┐
│ 🔍 Search messages               │
├──────────────────────────────────┤
│ Results for "pricing" (5):        │
├──────────────────────────────────┤
│ [Filters ▼]                      │
│ • From: [Agent Alpha ▼]          │
│ • Date: [Last week ▼]            │
│ • Type: [All ▼]                  │
├──────────────────────────────────┤
│ Results:                          │
│ • "Pricing starts at..." - 2:45pm│
│ • "Bulk pricing available" - 1/5 │
└──────────────────────────────────┘
```

**Best For:** Teams with large conversation histories

---

## Dark Mode Approach

### Light Mode (Default Start)
```
Background:   #FFFFFF
Text:         #1D1D1D
Bubbles:      #0084FF (user) / #F5F5F5 (agent)
Borders:      #E5E5E5
Status OK:    #31A24C
```

### Dark Mode (Toggle Available)
```
Background:   #121212 (or #0F0F0F)
Text:         #FFFFFF
Bubbles:      #5C9EFF (user) / #2D2D2D (agent)
Borders:      #3F3F3F
Status OK:    #43B581
```

**Implementation:** Use CSS variables or React Context for theme toggle

---

## Mobile-Specific Touch Patterns

### Swipe Left (Common)
```
[Message] ← Swipe left reveals:
   [Delete] [Pin] [Reply]
```

**Support in:** Slack, Discord, iMessage
**Best For:** Quick message actions

---

### Long Press Context Menu
```
[Message] ← Long press (500ms) reveals:
   ┌──────────────────┐
   │ Copy             │
   │ Share            │
   │ Pin to top       │
   │ Mute this user   │
   │ Report...        │
   │ Delete           │
   └──────────────────┘
```

**Support in:** All iOS/Android native chat apps
**Recommended for Agent Playground:** Main interaction for secondary actions

---

## Accessibility Considerations

### Keyboard Navigation
- Tab through messages (navigate)
- Enter to focus on message
- Right arrow to reveal actions
- Return to activate

### Screen Reader Labels
```html
<View
  accessible={true}
  accessibilityLabel="Message from Agent Alpha sent at 2:45pm: Here's the analysis"
>
```

### Color Contrast
- Text on background: 4.5:1 minimum (WCAG AA)
- Interactive elements: 3:1 minimum
- Status indicators: Not color-only (add icon + text)

### Touch Targets
- Minimum 48x48 points (iOS) / 48x48 dp (Android)
- Comfortable spacing: 8pt minimum between targets

---

## Recommended Pattern Combo for MVP

```
┌────────────────────────────────────────┐
│ Agent Playground v0.1 (MVP)            │
├────────────────────────────────────────┤
│                                        │
│ Navigation:   Tab Bar (simple)         │
│ Message UI:   Simple bubbles           │
│ Agent ID:     Color + Badge            │
│ Input:        Text + Send              │
│ Feedback:     Typing indicator         │
│ Search:       Basic (keyword only)     │
│ Dark Mode:    Toggle available         │
│ Accessibility: WCAG AA basics          │
│                                        │
│ → Clean, familiar, quick to build      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Agent Playground v0.2+ (Enhancement)   │
├────────────────────────────────────────┤
│                                        │
│ + Gesture nav (swipe down)             │
│ + Card-based agent responses           │
│ + Quick actions (copy, regenerate)     │
│ + File attachments                     │
│ + Advanced search with filters         │
│ + Thread support (optional)            │
│ + Read receipts                        │
│                                        │
│ → Professional, feature-rich           │
└────────────────────────────────────────┘
```

---

## Red Flags to Avoid

❌ **Skipping Dark Mode** — 2026 users expect it day 1
❌ **Tiny Touch Targets** — <44pt causes mobile frustration
❌ **No Typing Indicators** — Feels broken, increases support burden
❌ **Color-Only Status** — Inaccessible, colorblind users struggle
❌ **Too Many Tabs** — >5 top-level items creates analysis paralysis
❌ **No Message Search** — Users feel lost in large conversations
❌ **No Accessibility Labels** — Excludes screen reader users
❌ **Inconsistent Visual Hierarchy** — Hard to distinguish agent vs. user
❌ **No Gesture Support** — Feels unpolished vs. native apps
❌ **Loading States Missing** — Users don't know what's happening

---

**Document Purpose:** Reference guide for design implementation
**Next Step:** Create Figma mockups based on recommended patterns
