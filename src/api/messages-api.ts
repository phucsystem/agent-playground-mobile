import { supabase } from "../lib/supabase";
import { PAGE_SIZE } from "../constants/app";

export async function fetchMessages(
  conversationId: string,
  cursor?: string,
  limit = PAGE_SIZE
) {
  let query = supabase
    .from("messages")
    .select(`
      *,
      users!messages_user_id_fkey(id, username, avatar_url, role),
      reactions(id, emoji, user_id),
      attachments(id, file_name, file_size, file_type, storage_path)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function sendMessage(params: {
  conversation_id: string;
  user_id: string;
  content: string;
  content_type?: string;
  metadata?: Record<string, unknown> | null;
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversation_id,
      user_id: params.user_id,
      content: params.content,
      content_type: params.content_type ?? "text",
      metadata: params.metadata ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
