import { View, Text, Pressable } from "react-native";
import { memo } from "react";

interface ReactionBadgeProps {
  count: number;
  hasOwnReaction: boolean;
  onPress: () => void;
}

export const ReactionBadge = memo(function ReactionBadge({
  count,
  hasOwnReaction,
  onPress,
}: ReactionBadgeProps) {
  if (count <= 0) return null;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center mt-1 px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: hasOwnReaction ? "#FEE2E2" : "#F3F4F6",
        alignSelf: "flex-start",
      }}
    >
      <Text className="text-xs mr-1">❤️</Text>
      <Text
        className="text-xs"
        style={{ color: hasOwnReaction ? "#EF4444" : "#6B7280" }}
      >
        {count}
      </Text>
    </Pressable>
  );
});
