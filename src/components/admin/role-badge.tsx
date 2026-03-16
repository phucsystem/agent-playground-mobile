import { View, Text } from "react-native";
import { memo } from "react";

interface RoleBadgeProps {
  role: string;
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#F59E0B", text: "#FFFFFF" },
  agent: { bg: "#3B82F6", text: "#FFFFFF" },
  user: { bg: "#E5E7EB", text: "#1A1A1A" },
};

export const RoleBadge = memo(function RoleBadge({ role }: RoleBadgeProps) {
  const style = ROLE_STYLES[role] ?? ROLE_STYLES.user;

  return (
    <View
      style={{ backgroundColor: style.bg }}
      className="px-2 py-0.5 rounded-full"
    >
      <Text
        style={{ color: style.text }}
        className="text-[10px] font-semibold uppercase"
      >
        {role}
      </Text>
    </View>
  );
});
