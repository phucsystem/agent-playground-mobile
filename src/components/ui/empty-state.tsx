import { View, Text } from "react-native";

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </Text>
      <Text className="text-sm text-text-secondary text-center">
        {subtitle}
      </Text>
    </View>
  );
}
