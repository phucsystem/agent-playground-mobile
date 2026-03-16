import { View, Text, TextInput, Pressable, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useCallback, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAdminUsers } from "../../hooks/use-admin-users";
import { UserListItem } from "../../components/admin/user-list-item";
import { CreateUserModal } from "../../components/admin/create-user-modal";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { EmptyState } from "../../components/ui/empty-state";
import { colors } from "../../theme/colors";
import type { AdminStackParamList } from "../../types/navigation";

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export function AdminUsersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: users, isLoading, refetch, isRefetching } = useAdminUsers(debouncedQuery || undefined);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => setShowCreateModal(true)}>
          <Text className="text-primary text-base font-medium">+ New</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 py-2">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search users..."
          placeholderTextColor={colors.textTertiary}
          className="bg-surface rounded-xl px-4 py-2.5 text-base text-text-primary"
        />
      </View>

      <FlashList
        data={users ?? []}
        renderItem={({ item }) => {
          const userData = item as Record<string, unknown>;
          return (
            <UserListItem
              username={userData.username as string}
              email={userData.email as string | null}
              avatarUrl={userData.avatar_url as string | null}
              role={userData.role as string}
            />
          );
        }}
        keyExtractor={(item) => (item as Record<string, string>).id}
        estimatedItemSize={64}
        ListEmptyComponent={
          <EmptyState title="No users found" subtitle="Try a different search" />
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => <View className="h-px bg-border ml-16" />}
      />

      <CreateUserModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}
