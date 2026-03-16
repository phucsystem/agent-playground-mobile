import { View, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";

interface LoadingSpinnerProps {
  size?: "small" | "large";
}

export function LoadingSpinner({ size = "large" }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}
