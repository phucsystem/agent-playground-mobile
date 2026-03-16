# Phase 01 — Project Setup

## Overview

- **Priority:** P1 (blocking all other phases)
- **Status:** Completed
- **Effort:** 3h
- **Description:** Initialize Expo project, install all dependencies, configure NativeWind, set up project folder structure, configure Supabase client, and establish TypeScript types from the existing DB schema.

## Requirements

No FR directly — this phase enables all subsequent FRs.

## Related Code Files

### Files to CREATE

```
src/
├── app.tsx                          # App entry — providers wrapper
├── lib/
│   ├── supabase.ts                  # Supabase client init
│   ├── secure-store.ts              # expo-secure-store wrapper
│   └── query-client.ts              # TanStack Query client
├── types/
│   ├── database.ts                  # Supabase DB types (all 9 entities)
│   └── navigation.ts                # React Navigation param types
├── stores/
│   └── auth-store.ts                # Zustand auth store (user, jwt, login/logout)
├── providers/
│   └── app-providers.tsx            # QueryClientProvider + auth gate
├── navigation/
│   ├── root-navigator.tsx           # Auth check -> AuthStack or MainTabs
│   ├── auth-stack.tsx               # S-01 Login
│   ├── chat-stack.tsx               # S-02 -> S-03/S-04 -> S-07/S-08
│   └── admin-stack.tsx              # S-05 -> S-06
├── theme/
│   └── colors.ts                    # Design system color tokens
tailwind.config.js                   # NativeWind config with design tokens
app.json                             # Expo config
.env.example                         # SUPABASE_URL, SUPABASE_ANON_KEY
```

## Implementation Steps

### Step 1: Create Expo project

```bash
npx create-expo-app@latest agent-playground-mobile --template blank-typescript
cd agent-playground-mobile
```

Since we are already in the repo root, initialize Expo in place:

```bash
npx create-expo-app@latest . --template blank-typescript
```

### Step 2: Install dependencies

Core packages with specific versions:

```bash
# Navigation
npx expo install react-native-screens react-native-safe-area-context
npm install @react-navigation/native@7 @react-navigation/native-stack@7 @react-navigation/bottom-tabs@7

# State management
npm install zustand@5 @tanstack/react-query@5

# Supabase
npm install @supabase/supabase-js@2

# UI / Styling
npm install nativewind@4 tailwindcss@3
npx expo install react-native-reanimated

# Lists
npm install @shopify/flash-list@1

# Markdown
npm install @ronradtke/react-native-markdown-display

# Secure storage
npx expo install expo-secure-store

# Utilities
npx expo install expo-clipboard expo-haptics expo-image expo-status-bar
npm install date-fns@4
```

### Step 3: Configure NativeWind / Tailwind

Create `tailwind.config.js` at project root:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0084FF",
        "primary-light": "#E8F4FD",
        surface: "#F7F7F8",
        "agent-bubble": "#F0F0F0",
        "user-bubble": "#0084FF",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B7280",
        "text-tertiary": "#9CA3AF",
        border: "#E5E7EB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        "agent-badge": "#3B82F6",
        "code-bg": "#1E1E1E",
        "code-text": "#D4D4D4",
      },
      fontFamily: {
        sans: ["Inter", "System"],
        mono: ["JetBrainsMono", "monospace"],
      },
      borderRadius: {
        bubble: "18px",
      },
    },
  },
  plugins: [],
};
```

Add NativeWind babel preset in `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### Step 4: Create Supabase client (`src/lib/supabase.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import type { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Step 5: Define TypeScript types (`src/types/database.ts`)

Generate types from the 9 entities (E-01 to E-09) documented in DB_DESIGN.md. Key types:

```typescript
export type UserRole = "admin" | "user" | "agent";
export type ConversationType = "dm" | "group";
export type ContentType = "text" | "file" | "image" | "url";
export type DeliveryStatus = "pending" | "delivered" | "failed";

export interface User {
  id: string;
  auth_id: string;
  email: string | null;
  username: string;
  role: UserRole;
  token: string;
  avatar_url: string | null;
  is_mock: boolean;
  updated_at: string;
  created_at: string;
}

export interface Conversation { /* from E-02 */ }
export interface ConversationMember { /* from E-03 */ }
export interface Message { /* from E-04 */ }
export interface Attachment { /* from E-05 */ }
export interface Reaction { /* from E-06 */ }
export interface AgentConfig { /* from E-07 */ }
export interface WebhookDeliveryLog { /* from E-08 */ }
export interface UserSession { /* from E-09 */ }
```

Full interfaces must match DB_DESIGN.md columns exactly.

### Step 6: Define navigation types (`src/types/navigation.ts`)

```typescript
export type AuthStackParamList = {
  Login: undefined;
};

export type ChatStackParamList = {
  ConversationList: undefined;
  DMChat: { conversationId: string; recipientId: string };
  GroupChat: { conversationId: string };
  ImageViewer: { uri: string };
  ConversationInfo: { conversationId: string };
};

export type AdminStackParamList = {
  AdminUsers: undefined;
  WebhookLogs: undefined;
};
```

### Step 7: Create Zustand auth store (`src/stores/auth-store.ts`)

```typescript
import { create } from "zustand";
import type { User } from "../types/database";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setSession: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),
  clearSession: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));
```

### Step 8: Create TanStack Query client (`src/lib/query-client.ts`)

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Step 9: Create App Providers (`src/providers/app-providers.tsx`)

Wrap app with QueryClientProvider, SafeAreaProvider, NavigationContainer.

### Step 10: Create Root Navigator (`src/navigation/root-navigator.tsx`)

Check `useAuthStore().isAuthenticated` -> render AuthStack or MainTabs.

### Step 11: Create `.env.example`

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 12: Verify build

```bash
npx expo start
```

Ensure clean build with no errors on iOS simulator and Android emulator.

## Todo List

- [x] Initialize Expo project in repo root
- [x] Install all dependencies (navigation, state, supabase, UI, storage)
- [x] Configure NativeWind with design system tokens
- [x] Create `src/lib/supabase.ts` with SecureStore adapter
- [x] Define all 9 entity TypeScript interfaces in `src/types/database.ts`
- [x] Define navigation param types in `src/types/navigation.ts`
- [x] Create Zustand auth store
- [x] Create TanStack Query client
- [x] Create AppProviders wrapper component
- [x] Create RootNavigator with auth gate
- [x] Create AuthStack, ChatStack, AdminStack navigators (empty screens)
- [x] Create `.env.example` and add `.env` to `.gitignore`
- [x] Verify clean build on iOS + Android

## Success Criteria

- `npx expo start` launches without errors
- All packages installed and importable
- NativeWind classes render correctly (test with a colored View)
- Supabase client initializes (no runtime errors)
- Navigation renders AuthStack when unauthenticated
- TypeScript compiles with zero errors

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| NativeWind v4 + Expo SDK 52 compatibility | Check NativeWind docs for Expo SDK 52 support; fall back to StyleSheet if needed |
| SecureStore size limits (2KB per key) | JWT is ~1KB — fits comfortably |
