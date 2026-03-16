import { View, Text, TextInput, Pressable, Modal, Alert } from "react-native";
import { useState, useCallback } from "react";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useCreateUser } from "../../hooks/use-create-user";
import { colors } from "../../theme/colors";

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
}

const ROLES = ["user", "agent", "admin"] as const;

export function CreateUserModal({ visible, onClose }: CreateUserModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("user");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const createUser = useCreateUser();

  const handleCreate = useCallback(() => {
    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }
    createUser.mutate(
      { username: username.trim(), email: email.trim() || undefined, role },
      {
        onSuccess: (data) => {
          setCreatedToken((data as Record<string, string>).token ?? null);
        },
      }
    );
  }, [username, email, role, createUser]);

  const handleCopyToken = useCallback(async () => {
    if (createdToken) {
      await Clipboard.setStringAsync(createdToken);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Copied", "Token copied to clipboard");
    }
  }, [createdToken]);

  const handleClose = useCallback(() => {
    setUsername("");
    setEmail("");
    setRole("user");
    setCreatedToken(null);
    createUser.reset();
    onClose();
  }, [onClose, createUser]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white px-6 pt-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold text-text-primary">
            {createdToken ? "User Created!" : "Create User"}
          </Text>
          <Pressable onPress={handleClose}>
            <Text className="text-primary text-base font-medium">Done</Text>
          </Pressable>
        </View>

        {createdToken ? (
          <View>
            <Text className="text-sm text-text-secondary mb-2">Token:</Text>
            <View className="bg-surface border border-border rounded-xl p-4 mb-4">
              <Text
                style={{ fontFamily: "Menlo", fontSize: 12 }}
                className="text-text-primary"
                selectable
              >
                {createdToken}
              </Text>
            </View>
            <Pressable
              onPress={handleCopyToken}
              className="py-3 rounded-xl items-center bg-primary"
            >
              <Text className="text-white text-base font-semibold">Copy Token</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text className="text-sm text-text-secondary mb-1">Username *</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={colors.textTertiary}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-text-primary mb-4"
              autoCapitalize="none"
            />

            <Text className="text-sm text-text-secondary mb-1">Email (optional)</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor={colors.textTertiary}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-text-primary mb-4"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text className="text-sm text-text-secondary mb-2">Role</Text>
            <View className="flex-row mb-6">
              {ROLES.map((roleOption) => (
                <Pressable
                  key={roleOption}
                  onPress={() => setRole(roleOption)}
                  className="flex-1 py-2.5 items-center rounded-lg mx-1"
                  style={{
                    backgroundColor: role === roleOption ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    className="text-sm font-medium capitalize"
                    style={{
                      color: role === roleOption ? colors.white : colors.textSecondary,
                    }}
                  >
                    {roleOption}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleCreate}
              disabled={!username.trim() || createUser.isPending}
              className="py-3.5 rounded-xl items-center"
              style={{
                backgroundColor: username.trim() ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: username.trim() ? colors.white : colors.textTertiary }}
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </Text>
            </Pressable>

            {createUser.isError && (
              <Text className="text-error text-sm mt-2 text-center">
                Failed to create user. Please try again.
              </Text>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
