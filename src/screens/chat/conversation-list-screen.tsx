import { View, Text, Pressable, RefreshControl, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useConversations } from "../../hooks/use-conversations";
import { useAuthStore } from "../../stores/auth-store";
import { ConversationItem } from "../../components/conversation/conversation-item";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { EmptyState } from "../../components/ui/empty-state";
import { Avatar } from "../../components/ui/avatar";
import { colors } from "../../theme/colors";
import type { ChatStackParamList } from "../../types/navigation";
import * as SecureStore from "expo-secure-store";

type NavigationProp = NativeStackNavigationProp<ChatStackParamList>;

export function ConversationListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data: conversations, isLoading, refetch, isRefetching } = useConversations();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("user_id");
          clearSession();
        },
      },
    ]);
  }, [clearSession]);

  const processedConversations = useMemo(() => {
    if (!conversations || !user) return [];
    return conversations.map((conv: Record<string, unknown>) => {
      const members = (conv.conversation_members ?? []) as Array<{
        user_id: string;
        last_read_at: string | null;
        users?: { id: string; username: string; avatar_url: string | null; role: string };
      }>;
      const otherMember = members.find((member) => member.user_id !== user.id);
      return {
        ...conv,
        otherMemberName: otherMember?.users?.username,
        otherMemberAvatar: otherMember?.users?.avatar_url,
        otherMemberRole: otherMember?.users?.role,
      };
    });
  }, [conversations, user]);

  const handleConversationPress = useCallback(
    (conversation: Record<string, unknown>) => {
      const convType = conversation.type as string;
      if (convType === "dm") {
        const members = (conversation.conversation_members ?? []) as Array<{ user_id: string }>;
        const otherMember = members.find((member) => member.user_id !== user?.id);
        navigation.navigate("DMChat", {
          conversationId: conversation.id as string,
          recipientId: otherMember?.user_id ?? "",
        });
      } else {
        navigation.navigate("GroupChat", {
          conversationId: conversation.id as string,
        });
      }
    },
    [navigation, user]
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Text className="text-2xl font-bold text-text-primary">Chats</Text>
        <Pressable onPress={handleLogout} accessibilityLabel="User menu">
          <Avatar
            uri={user?.avatar_url}
            name={user?.username ?? "U"}
            size={32}
          />
        </Pressable>
      </View>

      <FlashList
        data={processedConversations}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item as never}
            currentUserId={user!.id}
            otherMemberName={(item as Record<string, unknown>).otherMemberName as string}
            otherMemberAvatar={(item as Record<string, unknown>).otherMemberAvatar as string | null}
            otherMemberRole={(item as Record<string, unknown>).otherMemberRole as string}
            onPress={() => handleConversationPress(item as Record<string, unknown>)}
          />
        )}
        keyExtractor={(item) => (item as Record<string, string>).id}
        estimatedItemSize={72}
        ListEmptyComponent={
          <EmptyState
            title="No conversations yet"
            subtitle="Start chatting with an agent from the web app"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ItemSeparatorComponent={() => (
          <View className="h-px bg-border ml-[76px]" />
        )}
      />
    </View>
  );
}
