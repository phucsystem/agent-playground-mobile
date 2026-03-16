import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useCallback, useMemo, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMessages } from "../../hooks/use-messages";
import { useSendMessage } from "../../hooks/use-send-message";
import { useRealtimeMessages } from "../../hooks/use-realtime-messages";
import { useConversationMembers } from "../../hooks/use-conversation-members";
import { useTypingIndicator } from "../../hooks/use-typing-indicator";
import { useReadReceipt } from "../../hooks/use-read-receipt";
import { useAuthStore } from "../../stores/auth-store";
import { useTypingStore } from "../../stores/typing-store";
import { MessageList } from "../../components/chat/message-list";
import { MessageInputBar } from "../../components/chat/message-input-bar";
import { TypingIndicator } from "../../components/chat/typing-indicator";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { groupMessages } from "../../utils/message-grouping";
import type { ChatStackParamList } from "../../types/navigation";
import type { MessageListItem } from "../../types/api-types";

type RouteType = RouteProp<ChatStackParamList, "GroupChat">;
type NavigationType = NativeStackNavigationProp<ChatStackParamList, "GroupChat">;

export function GroupChatScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavigationType>();
  const { conversationId } = route.params;
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const { data: members } = useConversationMembers(conversationId);
  const { sendTypingEvent } = useTypingIndicator(conversationId);
  const readReceipt = useReadReceipt(conversationId);
  useRealtimeMessages(conversationId);

  const typingUsers = useTypingStore(
    (state) => state.typingUsers[conversationId] ?? []
  );

  useEffect(() => {
    readReceipt.mutate();
  }, []);

  useEffect(() => {
    const memberCount = members?.length ?? 0;
    navigation.setOptions({
      title: `Group (${memberCount})`,
      headerRight: () => (
        <Text
          className="text-primary text-sm font-medium"
          onPress={() => navigation.navigate("ConversationInfo", { conversationId })}
        >
          Info
        </Text>
      ),
    });
  }, [members, navigation, conversationId]);

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
        <TypingIndicator
          usernames={typingUsers.map((entry) => entry.username)}
        />
      </View>
      <MessageInputBar
        onSend={handleSend}
        isSending={sendMessage.isPending}
      />
    </KeyboardAvoidingView>
  );
}
