import { View, Pressable, Text, StatusBar } from "react-native";
import { Image } from "expo-image";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatStackParamList } from "../../types/navigation";

type RouteType = RouteProp<ChatStackParamList, "ImageViewer">;

export function ImageViewerScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { uri } = route.params;

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <Pressable
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          zIndex: 10,
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text className="text-white text-2xl">✕</Text>
      </Pressable>
      <Image
        source={{ uri }}
        style={{ flex: 1 }}
        contentFit="contain"
        transition={300}
      />
    </View>
  );
}
