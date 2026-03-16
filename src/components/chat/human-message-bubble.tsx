import { View, Text } from "react-native";
import { memo } from "react";
import { Avatar } from "../ui/avatar";
import { formatMessageTime } from "../../utils/format-time";

interface HumanMessageBubbleProps {
  content: string;
  createdAt: string;
  senderName: string;
  senderAvatar?: string | null;
  showSenderInfo: boolean;
}

export const HumanMessageBubble = memo(function HumanMessageBubble({
  content,
  createdAt,
  senderName,
  senderAvatar,
  showSenderInfo,
}: HumanMessageBubbleProps) {
  return (
    <View className="px-4 mb-1">
      <View className="flex-row max-w-[75%]">
        {showSenderInfo ? (
          <Avatar uri={senderAvatar} name={senderName} size={32} />
        ) : (
          <View style={{ width: 32 }} />
        )}
        <View className="flex-1 ml-2">
          {showSenderInfo && (
            <Text className="text-xs text-text-secondary font-medium mb-1">
              {senderName}
            </Text>
          )}
          <View
            className="bg-agent-bubble px-4 py-2.5"
            style={{
              borderRadius: 18,
              borderBottomLeftRadius: 8,
            }}
          >
            <Text className="text-base leading-6 text-text-primary">
              {content}
            </Text>
          </View>
          <Text className="text-[11px] text-text-tertiary mt-0.5">
            {formatMessageTime(createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
});
