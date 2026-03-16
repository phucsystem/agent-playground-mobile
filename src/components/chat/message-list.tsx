import { View, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback } from "react";
import { UserMessageBubble } from "./user-message-bubble";
import { AgentMessageBubble } from "./agent-message-bubble";
import { DateSeparator } from "./date-separator";
import type { GroupedMessage } from "../../utils/message-grouping";
import { colors } from "../../theme/colors";

interface MessageListProps {
  messages: GroupedMessage[];
  currentUserId: string;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  onLoadMore,
  isLoadingMore,
  hasMore,
}: MessageListProps) {
  const renderItem = useCallback(
    ({ item }: { item: GroupedMessage }) => {
      const isOwnMessage = item.user_id === currentUserId;

      return (
        <View>
          {item.showDateSeparator && item.dateSeparatorLabel && (
            <DateSeparator label={item.dateSeparatorLabel} />
          )}
          {isOwnMessage ? (
            <UserMessageBubble
              content={item.content}
              createdAt={item.created_at}
              isOptimistic={item._optimistic}
            />
          ) : (
            <AgentMessageBubble
              content={item.content}
              createdAt={item.created_at}
              senderName={item.users?.username ?? "Unknown"}
              senderAvatar={item.users?.avatar_url}
              senderRole={item.users?.role}
              showSenderInfo={item.showSenderInfo}
            />
          )}
        </View>
      );
    },
    [currentUserId]
  );

  const keyExtractor = useCallback((item: GroupedMessage) => item.id, []);

  return (
    <FlashList
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={80}
      inverted
      onEndReached={() => {
        if (hasMore && !isLoadingMore) onLoadMore();
      }}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isLoadingMore ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
}
