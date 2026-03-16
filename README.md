# Agent Playground Mobile

React Native (Expo) companion app for the Agent Playground web platform. Chat with AI agents on iOS and Android in real-time with <500ms latency.

**Status:** ✅ MVP Complete (v1.0.0)
**Release Date:** 2026-03-17
**Last Updated:** 2026-03-17

---

## Features

### Core Features
- **Token-Based Login** — Fast, secure authentication with pre-provisioned tokens
- **Real-Time Messaging** — <500ms latency with Supabase Realtime
- **Markdown Support** — Full markdown rendering with code block syntax highlighting
- **Message Pagination** — Efficient infinite scroll with caching
- **Unread Badges** — Stay updated with conversation counts

### Rich Features
- **Group Chat** — Multi-participant conversations with @mention support
- **File Sharing** — Upload documents and images (max 10MB)
- **Typing Indicators** — See when others are typing
- **Emoji Reactions** — Quick feedback with emoji reactions
- **Online Presence** — Green dot for online status
- **Read Receipts** — Know when your messages are read

### Admin Features
- **User Management** — Create users and generate authentication tokens
- **Webhook Logs** — Monitor AI agent webhook deliveries and latency
- **Agent Thinking** — See when agents are processing your message

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Expo | ~55.0.6 |
| Mobile | React Native | 0.83.2 |
| Language | TypeScript | ~5.9.2 |
| UI | React | 19.2.0 |
| Styling | NativeWind + Tailwind | 4.2.3 + 3.4.19 |
| State | Zustand + TanStack Query | 5.0.12 + 5.90.21 |
| Navigation | React Navigation | ^7.15.5 |
| Backend | Supabase | (shared) |
| Lists | FlashList | ^1.8.3 |

---

## Quick Start

### Prerequisites
- Node.js 18+ (with npm or yarn)
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator
- Supabase account with credentials

### Installation

```bash
# Clone repository
git clone <repo-url>
cd agent-playground-mobile

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run web version (preview only)
npm run web
```

### Getting Your Login Token

1. **For development:** Ask your admin for a pre-provisioned token
2. **Create new user (admin only):** Use the S-05 Admin Users screen
3. **Token format:** 64-character alphanumeric string

---

## Documentation

Comprehensive documentation is in the `/docs/` directory:

| Document | Purpose |
|----------|---------|
| [SRD.md](./docs/SRD.md) | System Requirements Definition (22 features, 8 screens) |
| [UI_SPEC.md](./docs/UI_SPEC.md) | Design system with color tokens, typography, components |
| [API_SPEC.md](./docs/API_SPEC.md) | All REST endpoints and Realtime channels documented |
| [DB_DESIGN.md](./docs/DB_DESIGN.md) | Database schema with 9 entities |
| [codebase-summary.md](./docs/codebase-summary.md) | Architecture overview and file structure |
| [code-standards.md](./docs/code-standards.md) | Coding conventions and standards |
| [design-guidelines.md](./docs/design-guidelines.md) | Design tokens and component patterns |
| [system-architecture.md](./docs/system-architecture.md) | Technical architecture and data flow |
| [project-overview-pdr.md](./docs/project-overview-pdr.md) | Product requirements and vision |
| [development-roadmap.md](./docs/development-roadmap.md) | Project roadmap and future plans |
| [project-changelog.md](./docs/project-changelog.md) | Version history and release notes |

---

## Project Structure

```
agent-playground-mobile/
├── src/
│   ├── screens/              # 8 screens (login, chat, admin, etc)
│   ├── components/           # 31 reusable components
│   │   ├── ui/              # Basic UI (avatar, badge, spinner, etc)
│   │   ├── chat/            # Chat-specific (bubbles, input, etc)
│   │   ├── conversation/    # Conversation list items
│   │   └── admin/           # Admin features
│   ├── api/                 # API integration (7 modules)
│   ├── stores/              # Zustand stores (auth, typing, presence)
│   ├── navigation/          # React Navigation setup
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── constants/           # App constants
│   └── providers/           # Context providers (Query, Zustand setup)
├── docs/                    # Comprehensive documentation
├── plans/                   # Development plans and reports
├── prototypes/              # HTML mockups of screens
├── tailwind.config.js       # Tailwind config with design tokens
├── app.json                 # Expo configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
└── README.md               # This file
```

---

## Architecture

### High-Level Architecture

```
React Native App (Expo SDK 55)
    ↓
├─ State: Zustand (auth, typing, presence)
├─ API: TanStack Query (caching, pagination)
├─ Navigation: React Navigation (stacks + tabs)
└─ Styling: NativeWind + Tailwind CSS
    ↓
Supabase Backend (Shared with Web)
├─ PostgreSQL (9 entities)
├─ Realtime (WebSocket)
├─ Auth (JWT)
├─ Storage (File uploads)
└─ Edge Functions (Optional)
```

### Key Patterns

- **Realtime-First:** Messages appear instantly via Supabase Realtime
- **Efficient Caching:** TanStack Query with 10s staleTime, 5min cacheTime
- **Type Safety:** 100% TypeScript strict mode
- **Performance:** FlashList for fast scrolling, memoization for re-renders

---

## Screens

| ID | Name | Purpose | Admin Only |
|----|------|---------|-----------|
| S-01 | Login | Token authentication | No |
| S-02 | Conversation List | View all conversations | No |
| S-03 | DM Chat | 1-on-1 messaging | No |
| S-04 | Group Chat | Multi-user messaging | No |
| S-05 | Admin Users | User management, token generation | **Yes** |
| S-06 | Webhook Logs | Monitor agent webhooks | **Yes** |
| S-07 | Image Viewer | Fullscreen image preview | No |
| S-08 | Conversation Info | Member list, conversation options | No |

---

## Key Features Explained

### Real-Time Messaging

Messages sync instantly via Supabase Realtime `postgres_changes` subscription:

```typescript
// Subscribe to new messages in conversation
channel.on('postgres_changes', {
  event: 'INSERT',
  table: 'messages',
}, (payload) => {
  // Message received, cache updated, re-render happens
});
```

**Latency:** Typically <300ms (p99: <500ms)

### Typing Indicators

See who's typing via broadcast channel:

```typescript
// Send "typing" event every 300ms (debounced)
channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { user_id, username, isTyping: true }
});
```

**Auto-clear:** 5-second timeout

### Presence (Online Status)

Know who's online via presence channel:

```typescript
// Subscribe to presence updates
channel.on('presence', { event: 'join' }, (user) => {
  // User came online
});

channel.on('presence', { event: 'leave' }, (user) => {
  // User went offline
});
```

### File Uploads

Upload files to Supabase Storage:

```typescript
// 1. Pick file via expo-document-picker
// 2. Compress if image (expo-image-manipulator)
// 3. Upload to Storage
// 4. Create message with attachment_url
// 5. Show preview in chat
```

**Limits:** Max 10MB per file

### Message Pagination

Efficient pagination with TanStack Query:

```typescript
// Load 30 messages initially
// Scroll up → Load older 30 messages
// Previous data shown while fetching
// Infinite scroll supported
```

---

## Development Workflow

### 1. Code & Commit

```bash
# Make changes
npm run ios  # Test on simulator

# Commit (follow conventional format)
git add .
git commit -m "feat: add new feature"
```

### 2. Code Quality

```bash
# Run TypeScript check
npx tsc --noEmit

# Run ESLint
npm run lint
```

### 3. Testing

- Manual testing on iOS simulator
- Manual testing on Android emulator
- No unit tests in MVP (can add in v1.1)

### 4. Build & Deploy

```bash
# Build for iOS and Android (via Expo)
eas build

# Submit to App Stores
eas submit
```

---

## Environment Variables

Create `.env` file in project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# (Optional) Custom API Base URL
# API_BASE_URL=https://custom.supabase.co
```

**Never commit `.env`** to version control.

---

## Performance Tips

### For Development
- Use Expo dev tools (`?` key in terminal)
- Profile with Flipper (React Native debugger)
- Monitor re-renders with React DevTools

### For Production
- Use FlashList instead of FlatList (3-5x faster)
- Memoize expensive components
- Lazy load images
- Pagination over infinite lists
- Keep message history limited (last 100 messages)

---

## Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### TypeScript Errors
```bash
# Strict mode check
npx tsc --noEmit --strict

# Update types
npm update @types/*
```

### Real-Time Not Working
1. Check Supabase credentials in `.env`
2. Verify network connection (WiFi/cellular)
3. Check Supabase project status
4. View browser console for errors

### Image Upload Issues
- Image must be <2MB (auto-compressed)
- Final file must be <10MB
- Check storage quota in Supabase

---

## Security

### JWT Storage
- Stored in `expo-secure-store` (encrypted, platform-specific)
- Cleared on logout
- Never stored in AsyncStorage or plain text

### API Authentication
All requests include:
```
Authorization: Bearer {JWT}
apikey: {SUPABASE_ANON_KEY}
```

### Data Privacy
- Row-Level Security (RLS) enforced by Supabase
- Users can only see conversations they're members of
- Admins can see all users and webhook logs

---

## Testing

### Manual Testing Checklist

#### Phase 1: Core Chat
- [ ] Login with token
- [ ] Conversation list loads
- [ ] Can send/receive messages
- [ ] Messages appear in real-time
- [ ] Markdown renders correctly

#### Phase 2: Rich Features
- [ ] Group chat messages work
- [ ] @mention autocomplete appears
- [ ] File upload works (file picker)
- [ ] Image upload works (camera/gallery)
- [ ] Typing indicator shows
- [ ] Emoji reactions work
- [ ] Presence dots update

#### Phase 3: Admin
- [ ] Admin users screen loads (if admin)
- [ ] Can create new user
- [ ] Token copied to clipboard
- [ ] Webhook logs display (if admin)
- [ ] Webhook details modal opens

### Known Test Scenarios
- Empty conversation (show empty state)
- Long message (test wrapping and scroll)
- Special characters (emoji, unicode)
- Network interruption (test reconnect)
- App backgrounding (test lifecycle)

---

## Deployment

### iOS App Store

1. **Build:** `eas build --platform ios`
2. **Review:** Expo builds the app
3. **Submit:** `eas submit --platform ios`
4. **Wait:** ~1-3 days for review

### Google Play Store

1. **Build:** `eas build --platform android`
2. **Review:** Expo builds the app
3. **Submit:** `eas submit --platform android`
4. **Wait:** ~2-4 hours for review

---

## Monitoring & Support

### Post-Launch Monitoring
- Crash analytics (via Sentry, if configured)
- Performance monitoring (Expo Insights)
- User feedback collection
- Push notification delivery rates

### Support Channels
- GitHub Issues (bugs, feature requests)
- Email support (if applicable)
- Team Slack channel (internal)

---

## Roadmap

### Current (v1.0.0)
✅ Complete MVP with all core features

### Next (v1.1, Q2 2026)
- Message search
- Voice messages
- Message edit/delete
- Message pinning

### Future (v1.2-v2.0, Q3-Q4 2026)
- Offline sync
- End-to-end encryption
- Dark mode
- Advanced admin panel

See [development-roadmap.md](./docs/development-roadmap.md) for details.

---

## Contributing

### Code Style
- Use TypeScript (strict mode)
- Follow conventions in [code-standards.md](./docs/code-standards.md)
- NativeWind for styling (not StyleSheet)
- Functional components with hooks

### Pull Request Process
1. Create feature branch (`git checkout -b feat/your-feature`)
2. Make changes and test
3. Commit with conventional message (`feat:`, `fix:`, etc)
4. Push and create pull request
5. Wait for code review
6. Merge after approval

---

## License

(To be determined)

---

## Support

For questions or issues:
1. Check [docs/](./docs/) for documentation
2. Review [troubleshooting](#troubleshooting) section
3. Check GitHub issues
4. Contact the team

---

## Quick Links

- **Supabase Dashboard:** https://app.supabase.com/
- **Expo Dashboard:** https://expo.dev/
- **React Navigation Docs:** https://reactnavigation.org/
- **TanStack Query Docs:** https://tanstack.com/query/latest
- **NativeWind Docs:** https://www.nativewind.dev/

---

**Happy coding!** 🚀

For more information, see the [documentation](./docs/) directory.

Last Updated: 2026-03-17
Version: 1.0.0
