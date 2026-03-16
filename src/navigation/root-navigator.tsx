import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "../stores/auth-store";
import { useSessionRestore } from "../hooks/use-session-restore";
import { AuthStack } from "./auth-stack";
import { ChatStack } from "./chat-stack";
import { AdminStack } from "./admin-stack";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { colors } from "../theme/colors";
import type { MainTabParamList } from "../types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{ title: "Chats" }}
      />
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStack}
          options={{ title: "Admin" }}
        />
      )}
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isLoading } = useSessionRestore();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthStack />;

  return <MainTabs />;
}
