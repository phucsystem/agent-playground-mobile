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

interface TypingIndicatorProps {
  usernames: string[];
}

function AnimatedDot({ delay }: { delay: number }) {
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
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#9CA3AF",
          marginHorizontal: 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export const TypingIndicator = memo(function TypingIndicator({
  usernames,
}: TypingIndicatorProps) {
  if (usernames.length === 0) return null;

  const label =
    usernames.length === 1
      ? `${usernames[0]} is typing`
      : `${usernames.slice(0, 2).join(", ")} are typing`;

  return (
    <View className="flex-row items-center px-4 py-2">
      <View className="flex-row items-center mr-2">
        <AnimatedDot delay={0} />
        <AnimatedDot delay={200} />
        <AnimatedDot delay={400} />
      </View>
      <Text className="text-xs text-text-tertiary">{label}</Text>
    </View>
  );
});
