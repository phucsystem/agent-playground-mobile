import { supabase } from "../lib/supabase";

interface WebhookLogFilters {
  agentId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchWebhookLogs(filters: WebhookLogFilters = {}) {
  let query = supabase
    .from("webhook_delivery_logs")
    .select(`
      *,
      users!webhook_delivery_logs_agent_id_fkey(id, username, avatar_url),
      conversations(id, name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (filters.agentId) query = query.eq("agent_id", filters.agentId);
  if (filters.status) query = query.eq("delivery_status", filters.status);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
