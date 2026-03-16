import { useQuery } from "@tanstack/react-query";
import { fetchWebhookLogs } from "../api/webhook-logs-api";
import { queryKeys } from "../types/api-types";

export function useWebhookLogs(
  filters: { agentId?: string; status?: string; dateFrom?: string; dateTo?: string } = {}
) {
  return useQuery({
    queryKey: [...queryKeys.webhookLogs.list(), filters],
    queryFn: () => fetchWebhookLogs(filters),
    staleTime: 15_000,
  });
}
