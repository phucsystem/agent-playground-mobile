import { supabase } from "../lib/supabase";

export async function addReaction(messageId: string, userId: string, emoji: string) {
  const { data, error } = await supabase
    .from("reactions")
    .insert({ message_id: messageId, user_id: userId, emoji })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeReaction(reactionId: string) {
  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("id", reactionId);
  if (error) throw error;
}
