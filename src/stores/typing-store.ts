import { create } from "zustand";

interface TypingEntry {
  userId: string;
  username: string;
}

interface TypingState {
  typingUsers: Record<string, TypingEntry[]>;
  setTyping: (conversationId: string, userId: string, username: string) => void;
  clearTyping: (conversationId: string, userId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingUsers: {},
  setTyping: (conversationId, userId, username) =>
    set((state) => {
      const current = state.typingUsers[conversationId] ?? [];
      const exists = current.some((entry) => entry.userId === userId);
      if (exists) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, { userId, username }],
        },
      };
    }),
  clearTyping: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] ?? [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter((entry) => entry.userId !== userId),
        },
      };
    }),
}));
