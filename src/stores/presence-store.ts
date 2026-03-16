import { create } from "zustand";

interface PresenceState {
  onlineUserIds: Set<string>;
  setOnlineUsers: (userIds: string[]) => void;
  isOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUserIds: new Set(),
  setOnlineUsers: (userIds) => set({ onlineUserIds: new Set(userIds) }),
  isOnline: (userId) => get().onlineUserIds.has(userId),
}));
