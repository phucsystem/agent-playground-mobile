import { View, TextInput, Pressable, Text } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { MAX_INPUT_LINES } from "../../constants/app";

interface MessageInputBarProps {
  onSend: (content: string) => void;
  isSending?: boolean;
}

const LINE_HEIGHT = 22;
const MAX_HEIGHT = MAX_INPUT_LINES * LINE_HEIGHT + 20;

export function MessageInputBar({ onSend, isSending }: MessageInputBarProps) {
  const [text, setText] = useState("");
  const [inputHeight, setInputHeight] = useState(LINE_HEIGHT + 20);
  const insets = useSafeAreaInsets();

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText("");
    setInputHeight(LINE_HEIGHT + 20);
  }, [text, isSending, onSend]);

  const canSend = text.trim().length > 0 && !isSending;

  return (
    <View
      style={{
        paddingBottom: insets.bottom || 8,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View className="flex-row items-end px-3 py-2">
        <Pressable
          className="w-11 h-11 items-center justify-center"
          accessibilityLabel="Attach file"
        >
          <Text className="text-xl text-text-tertiary">+</Text>
        </Pressable>

        <View
          className="flex-1 bg-surface rounded-3xl px-4 mx-1"
          style={{ minHeight: 44 }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={4000}
            style={{
              fontSize: 16,
              lineHeight: LINE_HEIGHT,
              maxHeight: MAX_HEIGHT,
              height: Math.min(inputHeight, MAX_HEIGHT),
              paddingVertical: 10,
              color: colors.textPrimary,
            }}
            onContentSizeChange={(event) => {
              setInputHeight(event.nativeEvent.contentSize.height + 20);
            }}
            returnKeyType="default"
          />
        </View>

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          className="w-11 h-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: canSend ? colors.primary : colors.surface,
          }}
          accessibilityLabel="Send message"
        >
          <Text
            style={{
              color: canSend ? colors.white : colors.textTertiary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            ↑
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
