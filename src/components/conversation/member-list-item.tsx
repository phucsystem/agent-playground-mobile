import { View, Text } from "react-native";
import { memo } from "react";
import { Avatar } from "../ui/avatar";
import { PresenceDot } from "../ui/presence-dot";

interface MemberListItemProps {
  username: string;
  avatarUrl: string | null;
  role: string;
  isOnline: boolean;
}

export const MemberListItem = memo(function MemberListItem({
  username,
  avatarUrl,
  role,
  isOnline,
}: MemberListItemProps) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View>
        <Avatar uri={avatarUrl} name={username} size={40} showBotBadge={role === "agent"} />
        <PresenceDot isOnline={isOnline} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-medium text-text-primary">{username}</Text>
        <Text className="text-xs text-text-tertiary">
          {isOnline ? "Online" : "Offline"}
        </Text>
      </View>
      {role === "admin" && (
        <View className="bg-warning px-2 py-0.5 rounded">
          <Text className="text-[10px] text-white font-medium">Admin</Text>
        </View>
      )}
    </View>
  );
});
