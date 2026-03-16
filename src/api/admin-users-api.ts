import { supabase } from "../lib/supabase";

export async function fetchUsers(searchQuery?: string) {
  let query = supabase
    .from("users")
    .select("id, username, email, role, avatar_url, is_mock, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchQuery) {
    query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createUser(params: {
  username: string;
  email?: string;
  role: string;
}) {
  const { data, error } = await supabase
    .from("users")
    .insert(params)
    .select("id, username, email, role, token, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(
  userId: string,
  params: { username?: string; role?: string }
) {
  const { data, error } = await supabase
    .from("users")
    .update(params)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
