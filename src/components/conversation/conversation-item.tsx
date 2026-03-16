import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { Avatar } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { formatConversationTime } from "../../utils/format-time";
import { calculateUnreadCount } from "../../utils/unread";

interface ConversationItemProps {
  conversation: {
    id: string;
    type: string;
    name: string | null;
    last_message_created_at: string | null;
    conversation_members: { user_id: string; last_read_at: string | null }[];
    messages: { content: string; content_type: string; user_id: string; created_at: string }[];
  };
  currentUserId: string;
  otherMemberName?: string;
  otherMemberAvatar?: string | null;
  otherMemberRole?: string;
  onPress: () => void;
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  currentUserId,
  otherMemberName,
  otherMemberAvatar,
  otherMemberRole,
  onPress,
}: ConversationItemProps) {
  const displayName = conversation.type === "dm"
    ? (otherMemberName ?? "Unknown")
    : (conversation.name ?? "Group Chat");

  const lastMessage = conversation.messages?.[0];
  const lastMessagePreview = lastMessage
    ? lastMessage.content_type === "image"
      ? "Sent an image"
      : lastMessage.content_type === "file"
        ? "Sent a file"
        : lastMessage.content.slice(0, 80)
    : "No messages yet";

  const membership = conversation.conversation_members?.find(
    (member) => member.user_id === currentUserId
  );
  const unreadCount = calculateUnreadCount(
    conversation.last_message_created_at,
    membership?.last_read_at ?? null
  );

  const isAgent = otherMemberRole === "agent";

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-70"
      style={{ paddingHorizontal: 16, paddingVertical: 12 }}
    >
      <View className="flex-row items-center">
        <Avatar
          uri={otherMemberAvatar}
          name={displayName}
          size={48}
          showBotBadge={isAgent}
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <Text
                className="text-base font-semibold text-text-primary"
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </View>
            {lastMessage && (
              <Text className="text-xs text-text-tertiary">
                {formatConversationTime(lastMessage.created_at)}
              </Text>
            )}
          </View>
          <View className="flex-row items-center justify-between mt-0.5">
            <Text
              className="text-sm text-text-secondary flex-1 mr-2"
              numberOfLines={1}
            >
              {lastMessagePreview}
            </Text>
            <Badge count={unreadCount} />
          </View>
        </View>
      </View>
    </Pressable>
  );
});
