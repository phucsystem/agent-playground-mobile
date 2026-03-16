import { supabase } from "../lib/supabase";

export async function fetchConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      conversation_members!inner(user_id, last_read_at),
      messages(id, content, content_type, user_id, created_at)
    `)
    .eq("conversation_members.user_id", userId)
    .is("conversation_members.deleted_at", null)
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" })
    .order("last_message_created_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function fetchConversationMembers(conversationId: string) {
  const { data, error } = await supabase
    .from("conversation_members")
    .select("*, users(id, username, avatar_url, role)")
    .eq("conversation_id", conversationId)
    .is("deleted_at", null);

  if (error) throw error;
  return data;
}

export async function markConversationRead(conversationId: string) {
  const { error } = await supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId,
  });
  if (error) throw error;
}
