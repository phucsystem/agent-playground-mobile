import "../global.css";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "./providers/app-providers";
import { RootNavigator } from "./navigation/root-navigator";

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
