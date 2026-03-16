import { View } from "react-native";
import { memo } from "react";

interface PresenceDotProps {
  isOnline: boolean;
  size?: number;
}

export const PresenceDot = memo(function PresenceDot({
  isOnline,
  size = 10,
}: PresenceDotProps) {
  if (!isOnline) return null;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#10B981",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        position: "absolute",
        bottom: 0,
        right: 0,
      }}
    />
  );
});
