import { View, Text, TextInput, Pressable, Keyboard, TouchableWithoutFeedback, Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLogin } from "../../hooks/use-login";
import { colors } from "../../theme/colors";
import { LoadingSpinner } from "../../components/ui/loading-spinner";

export function LoginScreen() {
  const [token, setToken] = useState("");
  const [isSecure, setIsSecure] = useState(true);
  const [clipboardToken, setClipboardToken] = useState<string | null>(null);
  const login = useLogin();

  useEffect(() => {
    checkClipboard();
  }, []);

  async function checkClipboard() {
    try {
      const content = await Clipboard.getStringAsync();
      if (content && content.length === 64 && /^[a-zA-Z0-9]+$/.test(content)) {
        setClipboardToken(content);
      }
    } catch {
      // Clipboard access denied
    }
  }

  const handlePasteFromClipboard = useCallback(() => {
    if (clipboardToken) {
      setToken(clipboardToken);
      setClipboardToken(null);
    }
  }, [clipboardToken]);

  const handleLogin = useCallback(() => {
    if (!token.trim()) return;
    Keyboard.dismiss();
    login.mutate(token, {
      onError: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
    });
  }, [token, login]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white justify-center px-8">
        <View className="items-center mb-12">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">AP</Text>
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-2">
            Agent Playground
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            Enter your access token to continue
          </Text>
        </View>

        <View className="mb-4">
          <View className="flex-row items-center bg-surface rounded-xl border border-border px-4">
            <TextInput
              value={token}
              onChangeText={setToken}
              placeholder="Paste your 64-character token"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={isSecure}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                fontSize: 16,
                fontFamily: "Menlo",
                paddingVertical: 14,
                color: colors.textPrimary,
              }}
            />
            <Pressable
              onPress={() => setIsSecure(!isSecure)}
              className="p-2"
              accessibilityLabel={isSecure ? "Show token" : "Hide token"}
            >
              <Text className="text-text-secondary text-sm">
                {isSecure ? "Show" : "Hide"}
              </Text>
            </Pressable>
          </View>

          {login.isError && (
            <Text className="text-error text-sm mt-2 ml-1">
              Invalid token. Please check and try again.
            </Text>
          )}
        </View>

        {clipboardToken && (
          <Pressable
            onPress={handlePasteFromClipboard}
            className="mb-4 py-3 px-4 bg-primary-light rounded-xl flex-row items-center justify-center"
          >
            <Text className="text-primary text-sm font-medium">
              Paste token from clipboard
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleLogin}
          disabled={!token.trim() || login.isPending}
          className="py-4 rounded-xl items-center"
          style={{
            backgroundColor: token.trim() && !login.isPending
              ? colors.primary
              : colors.border,
          }}
        >
          {login.isPending ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text
              className="text-base font-semibold"
              style={{
                color: token.trim() ? colors.white : colors.textTertiary,
              }}
            >
              Sign In
            </Text>
          )}
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}
