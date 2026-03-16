import { View, Text } from "react-native";
import { memo } from "react";

interface DateSeparatorProps {
  label: string;
}

export const DateSeparator = memo(function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <View className="flex-row items-center py-4 px-4">
      <View className="flex-1 h-px bg-border" />
      <Text className="text-xs text-text-tertiary mx-3 font-medium">{label}</Text>
      <View className="flex-1 h-px bg-border" />
    </View>
  );
});
