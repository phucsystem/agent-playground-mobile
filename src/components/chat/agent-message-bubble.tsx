import { View, Text, ScrollView } from "react-native";
import { memo } from "react";
import Markdown from "@ronradtke/react-native-markdown-display";
import { Avatar } from "../ui/avatar";
import { markdownStyles } from "../../utils/markdown-styles";
import { formatMessageTime } from "../../utils/format-time";

interface AgentMessageBubbleProps {
  content: string;
  createdAt: string;
  senderName: string;
  senderAvatar?: string | null;
  senderRole?: string;
  showSenderInfo: boolean;
}

const markdownRules = {
  fence: (node: { content: string }) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator
      style={{
        backgroundColor: "#1E1E1E",
        borderRadius: 8,
        marginVertical: 8,
      }}
    >
      <View style={{ padding: 12, minWidth: "100%" }}>
        <Text
          style={{
            color: "#D4D4D4",
            fontFamily: "Menlo",
            fontSize: 13,
            lineHeight: 20,
          }}
        >
          {node.content}
        </Text>
      </View>
    </ScrollView>
  ),
};

export const AgentMessageBubble = memo(function AgentMessageBubble({
  content,
  createdAt,
  senderName,
  senderAvatar,
  senderRole,
  showSenderInfo,
}: AgentMessageBubbleProps) {
  return (
    <View className="px-4 mb-1">
      <View className="flex-row max-w-[90%]">
        {showSenderInfo ? (
          <Avatar
            uri={senderAvatar}
            name={senderName}
            size={32}
            showBotBadge={senderRole === "agent"}
          />
        ) : (
          <View style={{ width: 32 }} />
        )}
        <View className="flex-1 ml-2">
          {showSenderInfo && (
            <Text className="text-xs text-text-secondary font-medium mb-1">
              {senderName}
            </Text>
          )}
          <Markdown style={markdownStyles} rules={markdownRules}>
            {content}
          </Markdown>
          <Text className="text-[11px] text-text-tertiary mt-0.5">
            {formatMessageTime(createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
});
