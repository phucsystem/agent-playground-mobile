import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../types/navigation";
import { LoginScreen } from "../screens/auth/login-screen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
