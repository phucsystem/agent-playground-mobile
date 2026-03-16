export type UserRole = "admin" | "user" | "agent";
export type ConversationType = "dm" | "group";
export type ContentType = "text" | "file" | "image" | "url";
export type DeliveryStatus = "pending" | "delivered" | "failed";
export type MemberRole = "admin" | "member";

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

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  description: string | null;
  created_by: string;
  last_message_created_at: string | null;
  updated_at: string;
  created_at: string;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MemberRole;
  last_read_at: string | null;
  deleted_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  content_type: ContentType;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  message_id: string;
  conversation_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  signed_url: string | null;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface AgentConfig {
  id: string;
  user_id: string;
  webhook_url: string;
  webhook_secret: string;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface WebhookDeliveryLog {
  id: string;
  agent_id: string;
  conversation_id: string;
  message_id: string;
  request_payload: Record<string, unknown>;
  response_body: string | null;
  http_status: number | null;
  error_message: string | null;
  delivery_status: DeliveryStatus;
  retry_count: number;
  latency_ms: number | null;
  expires_at: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  created_at: string;
}

// Joined types for UI consumption
export interface MessageWithSender extends Message {
  sender: Pick<User, "id" | "username" | "avatar_url" | "role">;
  reactions: Pick<Reaction, "emoji" | "user_id">[];
  attachments?: Attachment[];
}

export interface ConversationWithDetails extends Conversation {
  last_message: Pick<Message, "content" | "user_id" | "created_at"> | null;
  unread_count: number;
  members?: Pick<User, "id" | "username" | "avatar_url" | "role">[];
}

export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      conversations: { Row: Conversation; Insert: Partial<Conversation>; Update: Partial<Conversation> };
      conversation_members: { Row: ConversationMember; Insert: Partial<ConversationMember>; Update: Partial<ConversationMember> };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
      attachments: { Row: Attachment; Insert: Partial<Attachment>; Update: Partial<Attachment> };
      reactions: { Row: Reaction; Insert: Partial<Reaction>; Update: Partial<Reaction> };
      agent_configs: { Row: AgentConfig; Insert: Partial<AgentConfig>; Update: Partial<AgentConfig> };
      webhook_delivery_logs: { Row: WebhookDeliveryLog; Insert: Partial<WebhookDeliveryLog>; Update: Partial<WebhookDeliveryLog> };
      user_sessions: { Row: UserSession; Insert: Partial<UserSession>; Update: Partial<UserSession> };
    };
  };
};
