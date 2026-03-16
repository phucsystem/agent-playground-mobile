import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { Avatar } from "../ui/avatar";
import { RoleBadge } from "./role-badge";

interface UserListItemProps {
  username: string;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  onPress?: () => void;
}

export const UserListItem = memo(function UserListItem({
  username,
  email,
  avatarUrl,
  role,
  onPress,
}: UserListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:opacity-70"
    >
      <Avatar uri={avatarUrl} name={username} size={40} showBotBadge={role === "agent"} />
      <View className="flex-1 ml-3">
        <Text className="text-base font-medium text-text-primary">{username}</Text>
        {email && (
          <Text className="text-xs text-text-secondary mt-0.5">{email}</Text>
        )}
      </View>
      <RoleBadge role={role} />
    </Pressable>
  );
});
