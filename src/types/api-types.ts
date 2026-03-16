import type { Conversation, Message, User, ConversationMember, Attachment } from "./database";

export const queryKeys = {
  conversations: {
    all: ["conversations"] as const,
    list: () => [...queryKeys.conversations.all, "list"] as const,
  },
  messages: {
    all: ["messages"] as const,
    byConversation: (conversationId: string) =>
      [...queryKeys.messages.all, conversationId] as const,
  },
  members: {
    byConversation: (conversationId: string) =>
      ["members", conversationId] as const,
  },
  users: {
    all: ["users"] as const,
    current: ["users", "current"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
  },
  webhookLogs: {
    all: ["webhookLogs"] as const,
    list: () => [...queryKeys.webhookLogs.all, "list"] as const,
  },
} as const;

export interface ConversationListItem extends Conversation {
  conversation_members: Pick<ConversationMember, "user_id" | "last_read_at">[];
  messages: Pick<Message, "id" | "content" | "content_type" | "user_id" | "created_at">[];
  unread_count?: number;
  other_member?: Pick<User, "id" | "username" | "avatar_url" | "role">;
}

export interface MessageListItem extends Message {
  users: Pick<User, "id" | "username" | "avatar_url" | "role">;
  reactions: { id: string; emoji: string; user_id: string }[];
  attachments: Pick<Attachment, "id" | "file_name" | "file_size" | "file_type" | "storage_path">[];
  _optimistic?: boolean;
}

export interface LoginResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string | null;
    role: string;
    avatar_url: string | null;
  };
}
