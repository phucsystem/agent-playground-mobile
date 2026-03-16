import { View, Text } from "react-native";
import { memo } from "react";

interface BadgeProps {
  count: number;
}

export const Badge = memo(function Badge({ count }: BadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <View className="min-w-[20px] h-5 rounded-full bg-primary items-center justify-center px-1.5">
      <Text className="text-white text-xs font-semibold">{label}</Text>
    </View>
  );
});
