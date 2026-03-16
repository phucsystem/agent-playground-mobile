import { View, Text } from "react-native";
import { memo } from "react";
import { formatMessageTime } from "../../utils/format-time";

interface UserMessageBubbleProps {
  content: string;
  createdAt: string;
  isOptimistic?: boolean;
}

export const UserMessageBubble = memo(function UserMessageBubble({
  content,
  createdAt,
  isOptimistic,
}: UserMessageBubbleProps) {
  return (
    <View className="items-end px-4 mb-1">
      <View
        className="bg-user-bubble px-4 py-2.5 max-w-[75%]"
        style={{
          borderRadius: 18,
          borderBottomRightRadius: 8,
          opacity: isOptimistic ? 0.7 : 1,
        }}
      >
        <Text className="text-white text-base leading-6">{content}</Text>
      </View>
      <Text className="text-[11px] text-text-tertiary mt-1 mr-1">
        {formatMessageTime(createdAt)}
      </Text>
    </View>
  );
});
