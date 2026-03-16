import { View, KeyboardAvoidingView, Platform } from "react-native";
import { useCallback, useMemo, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMessages } from "../../hooks/use-messages";
import { useSendMessage } from "../../hooks/use-send-message";
import { useRealtimeMessages } from "../../hooks/use-realtime-messages";
import { useAuthStore } from "../../stores/auth-store";
import { MessageList } from "../../components/chat/message-list";
import { MessageInputBar } from "../../components/chat/message-input-bar";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { groupMessages } from "../../utils/message-grouping";
import type { ChatStackParamList } from "../../types/navigation";
import type { MessageListItem } from "../../types/api-types";

type RouteType = RouteProp<ChatStackParamList, "DMChat">;
type NavigationType = NativeStackNavigationProp<ChatStackParamList, "DMChat">;

export function DMChatScreen() {
  const route = useRoute<RouteType>();
  const { conversationId } = route.params;
  const user = useAuthStore((state) => state.user);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId);

  const sendMessage = useSendMessage(conversationId);
  useRealtimeMessages(conversationId);

  const allMessages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat() as MessageListItem[];
  }, [data]);

  const groupedMessages = useMemo(
    () => groupMessages(allMessages, user?.id ?? ""),
    [allMessages, user?.id]
  );

  const handleSend = useCallback(
    (content: string) => {
      sendMessage.mutate(content);
    },
    [sendMessage]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="flex-1">
        <MessageList
          messages={groupedMessages}
          currentUserId={user?.id ?? ""}
          onLoadMore={handleLoadMore}
          isLoadingMore={isFetchingNextPage}
          hasMore={!!hasNextPage}
        />
      </View>
      <MessageInputBar
        onSend={handleSend}
        isSending={sendMessage.isPending}
      />
    </KeyboardAvoidingView>
  );
}
