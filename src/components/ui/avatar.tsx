import { View, Text } from "react-native";
import { Image } from "expo-image";
import { memo } from "react";
import { getAvatarColor, getInitials } from "../../utils/avatar";

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  showBotBadge?: boolean;
}

export const Avatar = memo(function Avatar({
  uri,
  name,
  size = 40,
  showBotBadge = false,
}: AvatarProps) {
  const fontSize = size * 0.4;

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getAvatarColor(name),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize,
              fontWeight: "600",
            }}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}
      {showBotBadge && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: "#3B82F6",
            borderWidth: 2,
            borderColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 7, fontWeight: "700" }}>
            AI
          </Text>
        </View>
      )}
    </View>
  );
});
