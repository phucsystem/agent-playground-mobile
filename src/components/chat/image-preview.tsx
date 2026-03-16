import { Pressable } from "react-native";
import { Image } from "expo-image";
import { memo } from "react";

interface ImagePreviewProps {
  uri: string;
  onPress: () => void;
}

export const ImagePreview = memo(function ImagePreview({
  uri,
  onPress,
}: ImagePreviewProps) {
  return (
    <Pressable onPress={onPress} className="my-1">
      <Image
        source={{ uri }}
        style={{
          width: 280,
          height: 200,
          borderRadius: 12,
        }}
        contentFit="cover"
        transition={200}
      />
    </Pressable>
  );
});
