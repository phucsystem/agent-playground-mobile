import { View, Text } from "react-native";
import { memo } from "react";
import { colors } from "../../theme/colors";

interface UploadProgressBarProps {
  fileName: string;
  progress: number;
}

export const UploadProgressBar = memo(function UploadProgressBar({
  fileName,
  progress,
}: UploadProgressBarProps) {
  return (
    <View className="px-4 py-2 bg-primary-light">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-xs text-text-secondary" numberOfLines={1}>
          Uploading {fileName}
        </Text>
        <Text className="text-xs text-primary font-medium">
          {Math.round(progress * 100)}%
        </Text>
      </View>
      <View className="h-1 bg-border rounded-full overflow-hidden">
        <View
          style={{
            width: `${Math.round(progress * 100)}%`,
            height: "100%",
            backgroundColor: colors.primary,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
});
