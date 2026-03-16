# Code Standards & Conventions

**Project:** Agent Playground Mobile
**Version:** 1.0.0
**Last Updated:** 2026-03-17
**Stack:** React Native (Expo), TypeScript, Supabase

This document defines coding standards, conventions, and best practices for this project.

---

## 1. TypeScript Standards

### 1.1 No Implicit `any`

**Rule:** TypeScript must run in `strict` mode. Never use implicit `any`.

**Good:**
```typescript
type User = {
  id: string;
  username: string;
  avatar_url: string | null;
};

function getUser(userId: string): Promise<User> {
  // implementation
}
```

**Bad:**
```typescript
function getUser(userId) {  // ❌ implicit any
  // implementation
}

const data: any = response;  // ❌ defeats type safety
```

### 1.2 Explicit Return Types

**Rule:** Always annotate function return types. No implicit `void`.

**Good:**
```typescript
async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId);
  return data ?? [];
}

function calculateUnreadCount(lastReadAt: Date, messages: Message[]): number {
  return messages.filter(m => new Date(m.created_at) > lastReadAt).length;
}
```

**Bad:**
```typescript
async function fetchMessages(conversationId) {  // ❌ no return type
  return supabase.from('messages').select('*');
}
```

### 1.3 Type Organization

Place all types in dedicated `src/types/` files, organized by domain:

- **database.ts** — Supabase schema types (User, Message, Conversation, etc)
- **api-types.ts** — API request/response shapes (LoginResponse, MessageWithAuthor, etc)
- **navigation.ts** — React Navigation param lists and navigation props

**Example:**
```typescript
// src/types/database.ts
export type User = {
  id: string;
  username: string;
  role: 'admin' | 'user' | 'agent';
  avatar_url: string | null;
  created_at: string;
};

// src/screens/chat/conversation-list-screen.tsx
import { User, Conversation } from '@/types/database';

type Props = {
  user: User;
  conversations: Conversation[];
};
```

### 1.4 Union Types for States

Use discriminated unions for component states (loading, error, success):

**Good:**
```typescript
type MessageState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Message[] }
  | { status: 'error'; error: Error };

function MessageList({ state }: { state: MessageState }) {
  if (state.status === 'loading') return <LoadingSpinner />;
  if (state.status === 'error') return <ErrorAlert error={state.error} />;
  if (state.status === 'success') return <List data={state.data} />;
  return null;
}
```

---

## 2. React & React Native Standards

### 2.1 Functional Components Only

Use functional components with hooks. Never use class components.

**Good:**
```typescript
function LoginScreen(): JSX.Element {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithToken(token);
      // navigate
    } catch (error) {
      // show error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <TextInput
        value={token}
        onChangeText={setToken}
        placeholder="Paste your token"
      />
      <Button onPress={handleLogin} disabled={isLoading} title="Login" />
    </View>
  );
}
```

### 2.2 Custom Hook Naming

Prefix custom hooks with `use`:

**Good:**
```typescript
function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // fetch messages
  }, [conversationId]);

  return { messages, isLoading };
}

// Usage:
function ChatScreen() {
  const { messages, isLoading } = useMessages(conversationId);
  // ...
}
```

### 2.3 Effect Dependencies

Always specify dependency arrays. Never omit them.

**Good:**
```typescript
useEffect(() => {
  // Set up Realtime subscription
  const channel = supabase
    .channel(`messages:conversation_id=eq.${conversationId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
    .subscribe();

  return () => {
    // Clean up
    supabase.removeChannel(channel);
  };
}, [conversationId]); // Dependency array required
```

**Bad:**
```typescript
useEffect(() => {
  // Set up subscription
}, ); // ❌ Missing dependency array
```

### 2.4 Props Interface

Always define component props as interfaces:

**Good:**
```typescript
interface MessageBubbleProps {
  content: string;
  senderName: string;
  isAgent: boolean;
  timestamp: Date;
  reactions?: Reaction[];
}

function MessageBubble({ content, senderName, isAgent, timestamp, reactions = [] }: MessageBubbleProps) {
  return <View>...</View>;
}
```

**Bad:**
```typescript
function MessageBubble(props) {  // ❌ No props interface
  return <View>{props.content}</View>;
}
```

---

## 3. Naming Conventions

### 3.1 Files

Use **kebab-case** for filenames. Names should describe the component/module purpose:

**Good:**
```
src/components/chat/message-input-bar.tsx
src/components/conversation/conversation-item.tsx
src/utils/message-grouping.ts
src/api/auth-api.ts
src/stores/auth-store.ts
```

**Bad:**
```
src/components/chat/input.tsx        # ❌ Too vague
src/utils/util.ts                    # ❌ Non-descriptive
src/api/api.ts                       # ❌ Non-descriptive
```

### 3.2 Components & Types

Use **PascalCase** for:
- React components
- TypeScript types, interfaces, enums
- Classes

Use **camelCase** for:
- Variables, functions, constants
- Object properties, keys
- API method names

**Good:**
```typescript
// Component names
function LoginScreen() {}
function MessageBubble() {}
function Avatar() {}

// Type names
type Message = { ... };
interface User { ... }
enum Role { ADMIN, USER, AGENT }

// Functions & variables
const handleSendMessage = () => {};
const isLoading = false;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const formatTime = (date: Date) => {};
```

### 3.3 Avoid Single-Character Names

Never use single-character variable names (except in short loops like `for`).

**Good:**
```typescript
conversations.map((conversation) => <ConversationItem key={conversation.id} item={conversation} />)

const [isLoading, setIsLoading] = useState(false);
const userId = authStore.userId;
```

**Bad:**
```typescript
conversations.map((c) => <ConversationItem key={c.id} item={c} />)  // ❌

const [l, setL] = useState(false);  // ❌
const u = authStore.userId;        // ❌
```

### 3.4 Boolean Variable Names

Prefix boolean variables with `is`, `has`, `should`, `can`:

**Good:**
```typescript
const isAuthenticated = authStore.jwt !== null;
const hasAttachments = message.attachments.length > 0;
const shouldShowTypingIndicator = typingUsers.size > 0;
const canUploadFile = fileSize <= MAX_UPLOAD_SIZE;
```

---

## 4. React Native Specific Standards

### 4.1 Use NativeWind for Styling

Always use NativeWind (Tailwind) classes instead of inline `StyleSheet.create()`.

**Good:**
```typescript
import { View, Text } from 'react-native';

function MessageBubble({ content }: { content: string }) {
  return (
    <View className="bg-blue-100 rounded-lg p-3 mb-2">
      <Text className="text-base text-white">{content}</Text>
    </View>
  );
}
```

**Bad:**
```typescript
import { View, Text, StyleSheet } from 'react-native';

function MessageBubble({ content }: { content: string }) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.text}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { backgroundColor: '#0084FF', borderRadius: 8 },
  text: { fontSize: 16 }
});
```

### 4.2 Flex Layout Patterns

Use Tailwind flex classes for layout:

**Good:**
```typescript
// Full-screen centered container
<View className="flex-1 items-center justify-center">
  <Text>Loading...</Text>
</View>

// Row layout with space-between
<View className="flex-row items-center justify-between px-4 py-3">
  <Text className="flex-1 text-base">Conversation Name</Text>
  <Pressable onPress={handleInfo}>
    <Icon name="info" />
  </Pressable>
</View>

// Column layout (default, no need to specify)
<View className="gap-2">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>
```

### 4.3 Keyboard Handling

Always wrap inputs in keyboard-aware containers:

**Good:**
```typescript
import { KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ChatScreen() {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.bottom}
      className="flex-1"
    >
      <MessageList />
      <MessageInputBar />
    </KeyboardAvoidingView>
  );
}
```

### 4.4 List Rendering with FlashList

Use `@shopify/flash-list` instead of `FlatList` for better performance:

**Good:**
```typescript
import { FlashList } from '@shopify/flash-list';

function ConversationList({ conversations }: { conversations: Conversation[] }) {
  return (
    <FlashList
      data={conversations}
      renderItem={({ item }) => <ConversationItem conversation={item} />}
      keyExtractor={(item) => item.id}
      estimatedItemSize={80}
      onEndReached={loadMoreConversations}
    />
  );
}
```

---

## 5. API & Data Layer Standards

### 5.1 API Functions

Group API calls by domain in separate files under `src/api/`:

**Good:**
```typescript
// src/api/messages-api.ts
import { supabase } from '@/lib/supabase';
import { Message } from '@/types/database';

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conversationId, content }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchMessages(conversationId: string, limit: number = 30): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function subscribeToMessages(conversationId: string, onInsert: (message: Message) => void) {
  const channel = supabase
    .channel(`messages:conversation_id=eq.${conversationId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      onInsert(payload.new as Message);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
```

### 5.2 Error Handling

Always handle Supabase errors gracefully:

**Good:**
```typescript
async function login(token: string): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('login_with_token', { p_token: token });
    if (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
    authStore.setJwt(data.access_token);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Login error:', message);
    // Show user-friendly error message
    Alert.alert('Login Failed', message);
  }
}
```

### 5.3 TanStack Query Usage

Use TanStack Query for data fetching, caching, and background sync:

**Good:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchMessages } from '@/api/messages-api';

function ChatScreen({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    staleTime: 10 * 1000, // 10 seconds
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return <MessageList messages={messages ?? []} />;
}
```

---

## 6. State Management with Zustand

### 6.1 Store Structure

Define stores in `src/stores/` with clear actions and state:

**Good:**
```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { User } from '@/types/database';

interface AuthStore {
  jwt: string | null;
  userId: string | null;
  user: User | null;
  setJwt: (jwt: string, userId: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  jwt: null,
  userId: null,
  user: null,

  setJwt: (jwt, userId, user) => {
    set({ jwt, userId, user });
  },

  logout: () => {
    set({ jwt: null, userId: null, user: null });
  },

  isAuthenticated: () => {
    const state = useAuthStore.getState();
    return state.jwt !== null;
  },
}));
```

### 6.2 Store Usage in Components

**Good:**
```typescript
function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Navigation handled by root navigator checking isAuthenticated
  };

  return (
    <View>
      <Text>{user?.username}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
```

---

## 7. Component Composition

### 7.1 Presentational vs Container Components

Separate presentational logic from data fetching:

**Good:**
```typescript
// Presentational component (no hooks except styling)
interface MessageListProps {
  messages: Message[];
  onScroll: (offset: number) => void;
}

function MessageListUI({ messages, onScroll }: MessageListProps) {
  return (
    <FlashList
      data={messages}
      renderItem={({ item }) => <MessageBubble message={item} />}
      onScroll={onScroll}
      estimatedItemSize={100}
    />
  );
}

// Container component (handles data fetching)
function MessageListContainer({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
  });

  const handleScroll = (offset: number) => {
    if (offset < 100) {
      // Load older messages
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return <MessageListUI messages={messages ?? []} onScroll={handleScroll} />;
}
```

### 7.2 Prop Drilling Prevention

Use context or Zustand to avoid prop drilling:

**Good:**
```typescript
// Use Zustand store instead of prop drilling
function TopLevelComponent() {
  const { user } = useAuthStore();
  return <NestedComponent1 />;
}

function NestedComponent1() {
  return <NestedComponent2 />;
}

function NestedComponent2() {
  const { user } = useAuthStore(); // Direct access, no props
  return <Text>{user?.username}</Text>;
}
```

---

## 8. Code Comments

### 8.1 Minimal, Meaningful Comments

Only add comments for non-obvious logic. Let code be self-documenting:

**Good:**
```typescript
// Calculate unread count excluding the current user's last read position
function getUnreadCount(conversation: Conversation, messages: Message[]): number {
  const lastRead = new Date(conversation.last_read_at);
  return messages.filter(m => new Date(m.created_at) > lastRead).length;
}

// Clean up Realtime subscription to prevent memory leak on unmount
useEffect(() => {
  const unsubscribe = subscribeToMessages(conversationId, handleNewMessage);
  return () => unsubscribe();
}, [conversationId]);
```

**Bad:**
```typescript
// Get messages
function getMessages() { ... }

// Set state
const [messages, setMessages] = useState([]);

// Loop through messages
messages.forEach(msg => { ... })
```

### 8.2 TODO Comments

Prefix incomplete work with `TODO`:

```typescript
// TODO: Add image compression before upload
// TODO: Implement retry logic for failed messages
// TODO: Add dark mode support
```

---

## 9. Testing Standards

### 9.1 Unit Tests (When Required)

If writing tests, follow these patterns:

```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '@/screens/auth/login-screen';

describe('LoginScreen', () => {
  it('should display token input field', () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText('Paste your token')).toBeTruthy();
  });

  it('should disable send button when token is empty', () => {
    render(<LoginScreen />);
    const button = screen.getByRole('button', { name: /login/i });
    expect(button).toBeDisabled();
  });

  it('should call login API when send button pressed with token', async () => {
    render(<LoginScreen />);
    const input = screen.getByPlaceholderText('Paste your token');
    const button = screen.getByRole('button', { name: /login/i });

    fireEvent.changeText(input, 'valid-token-64-chars');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockLoginAPI).toHaveBeenCalledWith('valid-token-64-chars');
    });
  });
});
```

---

## 10. Performance Standards

### 10.1 Memoization

Memoize expensive components and callbacks:

**Good:**
```typescript
import { useMemo, useCallback } from 'react';

function ConversationList({ conversations }: { conversations: Conversation[] }) {
  // Memoize expensive sorting/filtering
  const sortedConversations = useMemo(
    () => conversations.sort((a, b) =>
      new Date(b.last_message_created_at).getTime() - new Date(a.last_message_created_at).getTime()
    ),
    [conversations]
  );

  // Memoize callback to prevent re-renders of child components
  const handleSelectConversation = useCallback((conversationId: string) => {
    navigation.navigate('ChatStack', { conversationId });
  }, [navigation]);

  return (
    <FlashList
      data={sortedConversations}
      renderItem={({ item }) => (
        <ConversationItem
          conversation={item}
          onSelect={() => handleSelectConversation(item.id)}
        />
      )}
      estimatedItemSize={80}
    />
  );
}
```

### 10.2 Image Optimization

Always compress images before upload:

```typescript
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

async function compressImage(uri: string): Promise<string> {
  const result = await manipulateAsync(uri, [], {
    compress: 0.7,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}
```

---

## 11. Git Commit Standards

Use **conventional commit format**:

**Good:**
```
feat: add typing indicators to group chat
fix: handle offline presence gracefully
docs: update API_SPEC.md with new endpoints
refactor: extract message-grouping utility
test: add unit tests for avatar color generation
chore: update dependencies
```

**Bad:**
```
Added stuff
Fixed bug
Updated code
Changed things
```

---

## 12. File Organization Checklist

Before committing, ensure:

- [ ] No `console.log()` statements (except in dev, removed before commit)
- [ ] No `any` types without `// @ts-ignore` comment
- [ ] No commented-out code (delete or create TODO issue)
- [ ] All imports organized: types first, then libraries, then local
- [ ] No circular imports
- [ ] Component props have interface definitions
- [ ] Functions have return type annotations
- [ ] Error messages are user-friendly, not raw API errors
- [ ] No hardcoded strings in components (use constants or i18n)

---

## 13. Summary

| Category | Standard |
|----------|----------|
| **Language** | TypeScript strict mode, no implicit `any` |
| **Components** | Functional, hooks-based, PascalCase names |
| **Styling** | NativeWind (Tailwind) classes, no StyleSheet |
| **Naming** | kebab-case files, camelCase functions, PascalCase types |
| **State** | Zustand for global, React hooks for local |
| **Data Fetching** | TanStack Query v5, error handling required |
| **API Layer** | Domain-specific files in `src/api/` |
| **Lists** | FlashList instead of FlatList |
| **Comments** | Minimal, meaningful, no obvious logic |
| **Commits** | Conventional format (feat:, fix:, etc) |

---

## References

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- React Native Docs: https://reactnative.dev/docs/getting-started
- NativeWind: https://www.nativewind.dev/
- TanStack Query: https://tanstack.com/query/latest
- Zustand: https://github.com/pmndrs/zustand
- React Navigation: https://reactnavigation.org/
