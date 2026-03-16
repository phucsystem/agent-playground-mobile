import { View, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useCallback } from "react";
import { useWebhookLogs } from "../../hooks/use-webhook-logs";
import { WebhookLogItem } from "../../components/admin/webhook-log-item";
import { WebhookFilterBar } from "../../components/admin/webhook-filter-bar";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { EmptyState } from "../../components/ui/empty-state";
import { colors } from "../../theme/colors";

export function WebhookLogsScreen() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: logs, isLoading, refetch, isRefetching } = useWebhookLogs({
    status: statusFilter,
  });

  const handleStatusChange = useCallback((status: string | undefined) => {
    setStatusFilter(status);
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-white">
      <WebhookFilterBar
        selectedStatus={statusFilter}
        onStatusChange={handleStatusChange}
      />

      <FlashList
        data={logs ?? []}
        renderItem={({ item }) => {
          const log = item as Record<string, unknown>;
          const agent = log.users as { username: string; avatar_url: string | null } | null;
          return (
            <WebhookLogItem
              agentName={agent?.username ?? "Unknown"}
              agentAvatar={agent?.avatar_url ?? null}
              status={log.delivery_status as string}
              latencyMs={log.latency_ms as number | null}
              messagePreview={(log.request_payload as Record<string, string>)?.content ?? ""}
              createdAt={log.created_at as string}
              onPress={() => {}}
            />
          );
        }}
        keyExtractor={(item) => (item as Record<string, string>).id}
        estimatedItemSize={72}
        ListEmptyComponent={
          <EmptyState title="No webhook logs" subtitle="Webhook deliveries will appear here" />
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => <View className="h-px bg-border ml-16" />}
      />
    </View>
  );
}
