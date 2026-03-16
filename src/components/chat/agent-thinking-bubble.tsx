import { View, Text } from "react-native";
import { memo, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { Avatar } from "../ui/avatar";

interface AgentThinkingBubbleProps {
  agentName: string;
  agentAvatar?: string | null;
  timedOut: boolean;
}

function ThinkingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        ),
        -1
      )
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#9CA3AF",
          marginHorizontal: 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export const AgentThinkingBubble = memo(function AgentThinkingBubble({
  agentName,
  agentAvatar,
  timedOut,
}: AgentThinkingBubbleProps) {
  return (
    <View className="flex-row items-start px-4 py-2">
      <Avatar uri={agentAvatar} name={agentName} size={32} showBotBadge />
      <View className="ml-2">
        <Text className="text-xs text-text-secondary font-medium mb-1">
          {agentName}
        </Text>
        {timedOut ? (
          <Text className="text-sm text-text-tertiary">Agent may be offline</Text>
        ) : (
          <View className="flex-row items-center py-1">
            <ThinkingDot delay={0} />
            <ThinkingDot delay={200} />
            <ThinkingDot delay={400} />
          </View>
        )}
      </View>
    </View>
  );
});
