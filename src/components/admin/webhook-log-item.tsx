import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { Avatar } from "../ui/avatar";
import { formatConversationTime } from "../../utils/format-time";

interface WebhookLogItemProps {
  agentName: string;
  agentAvatar: string | null;
  status: string;
  latencyMs: number | null;
  messagePreview: string;
  createdAt: string;
  onPress: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  delivered: "#10B981",
  failed: "#EF4444",
  pending: "#F59E0B",
};

export const WebhookLogItem = memo(function WebhookLogItem({
  agentName,
  agentAvatar,
  status,
  latencyMs,
  messagePreview,
  createdAt,
  onPress,
}: WebhookLogItemProps) {
  const statusColor = STATUS_COLORS[status] ?? "#9CA3AF";

  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3 active:opacity-70">
      <Avatar uri={agentAvatar} name={agentName} size={40} showBotBadge />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-text-primary">{agentName}</Text>
          <View className="flex-row items-center">
            <View
              style={{ backgroundColor: statusColor }}
              className="w-2 h-2 rounded-full mr-1.5"
            />
            <Text className="text-xs text-text-secondary capitalize">{status}</Text>
            {latencyMs !== null && (
              <Text className="text-xs text-text-tertiary ml-2">{latencyMs}ms</Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-sm text-text-secondary flex-1 mr-2" numberOfLines={1}>
            {messagePreview}
          </Text>
          <Text className="text-xs text-text-tertiary">
            {formatConversationTime(createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
