import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useConversationMembers } from "../../hooks/use-conversation-members";
import { usePresenceStore } from "../../stores/presence-store";
import { MemberListItem } from "../../components/conversation/member-list-item";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import type { ChatStackParamList } from "../../types/navigation";

type RouteType = RouteProp<ChatStackParamList, "ConversationInfo">;

export function ConversationInfoScreen() {
  const route = useRoute<RouteType>();
  const { conversationId } = route.params;
  const { data: members, isLoading } = useConversationMembers(conversationId);
  const isOnline = usePresenceStore((state) => state.isOnline);

  if (isLoading) return <LoadingSpinner />;

  const memberList = (members ?? []).map((member: Record<string, unknown>) => {
    const userData = member.users as {
      id: string;
      username: string;
      avatar_url: string | null;
      role: string;
    } | null;
    return {
      id: member.id as string,
      userId: userData?.id ?? "",
      username: userData?.username ?? "Unknown",
      avatarUrl: userData?.avatar_url ?? null,
      role: userData?.role ?? "user",
    };
  });

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-lg font-semibold text-text-primary">
          Members ({memberList.length})
        </Text>
      </View>
      <FlashList
        data={memberList}
        renderItem={({ item }) => (
          <MemberListItem
            username={item.username}
            avatarUrl={item.avatarUrl}
            role={item.role}
            isOnline={isOnline(item.userId)}
          />
        )}
        keyExtractor={(item) => item.id}
        estimatedItemSize={56}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-border ml-16" />
        )}
      />
    </View>
  );
}
