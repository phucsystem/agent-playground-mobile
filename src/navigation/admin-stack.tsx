import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../types/navigation";
import { AdminUsersScreen } from "../screens/admin/admin-users-screen";
import { WebhookLogsScreen } from "../screens/admin/webhook-logs-screen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary, fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ title: "Users" }}
      />
      <Stack.Screen
        name="WebhookLogs"
        component={WebhookLogsScreen}
        options={{ title: "Webhook Logs" }}
      />
    </Stack.Navigator>
  );
}
