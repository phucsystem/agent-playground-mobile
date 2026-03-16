import { supabase } from "../lib/supabase";
import type { LoginResponse } from "../types/api-types";

export async function loginWithToken(token: string): Promise<LoginResponse> {
  const { data, error } = await supabase.rpc("login_with_token", {
    p_token: token,
  });
  if (error) throw error;
  return data as LoginResponse;
}

export async function getCurrentUser(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, email, username, role, token, avatar_url, is_mock, updated_at, created_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
