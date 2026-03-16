import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ChatStackParamList } from "../types/navigation";
import { ConversationListScreen } from "../screens/chat/conversation-list-screen";
import { DMChatScreen } from "../screens/chat/dm-chat-screen";
import { GroupChatScreen } from "../screens/chat/group-chat-screen";
import { ImageViewerScreen } from "../screens/chat/image-viewer-screen";
import { ConversationInfoScreen } from "../screens/chat/conversation-info-screen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary, fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="ConversationList"
        component={ConversationListScreen}
        options={{ title: "Chats" }}
      />
      <Stack.Screen
        name="DMChat"
        component={DMChatScreen}
        options={{ title: "Chat" }}
      />
      <Stack.Screen
        name="GroupChat"
        component={GroupChatScreen}
        options={{ title: "Group" }}
      />
      <Stack.Screen
        name="ImageViewer"
        component={ImageViewerScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="ConversationInfo"
        component={ConversationInfoScreen}
        options={{ title: "Info" }}
      />
    </Stack.Navigator>
  );
}
