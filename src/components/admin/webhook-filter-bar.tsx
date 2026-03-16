import { View, Text, ScrollView, Pressable } from "react-native";
import { memo } from "react";
import { colors } from "../../theme/colors";

interface WebhookFilterBarProps {
  selectedStatus: string | undefined;
  onStatusChange: (status: string | undefined) => void;
}

const STATUS_OPTIONS = [
  { label: "All", value: undefined },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
  { label: "Pending", value: "pending" },
] as const;

export const WebhookFilterBar = memo(function WebhookFilterBar({
  selectedStatus,
  onStatusChange,
}: WebhookFilterBarProps) {
  return (
    <View className="border-b border-border">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-3 py-2">
        {STATUS_OPTIONS.map((option) => {
          const isActive = selectedStatus === option.value;
          return (
            <Pressable
              key={option.label}
              onPress={() => onStatusChange(option.value)}
              className="px-3 py-1.5 rounded-full mr-2"
              style={{
                backgroundColor: isActive ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: isActive ? colors.white : colors.textSecondary }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});
