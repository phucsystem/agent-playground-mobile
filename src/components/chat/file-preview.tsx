import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { formatFileSize } from "../../utils/file-helpers";

interface FilePreviewProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  onPress: () => void;
}

export const FilePreview = memo(function FilePreview({
  fileName,
  fileSize,
  onPress,
}: FilePreviewProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-surface border border-border rounded-xl px-3 py-3 my-1"
      style={{ maxWidth: 260 }}
    >
      <View className="w-10 h-10 rounded-lg bg-primary-light items-center justify-center mr-3">
        <Text className="text-primary text-lg">📄</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-text-primary" numberOfLines={1}>
          {fileName}
        </Text>
        <Text className="text-xs text-text-tertiary mt-0.5">
          {formatFileSize(fileSize)}
        </Text>
      </View>
    </Pressable>
  );
});
