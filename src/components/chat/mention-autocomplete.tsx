import { View, Text, FlatList, Pressable } from "react-native";
import { memo } from "react";
import { Avatar } from "../ui/avatar";
import { MENTION_MAX_VISIBLE } from "../../constants/app";

interface MemberItem {
  userId: string;
  username: string;
  role: string;
  avatarUrl: string | null;
}

interface MentionAutocompleteProps {
  members: MemberItem[];
  onSelect: (username: string) => void;
}

export const MentionAutocomplete = memo(function MentionAutocomplete({
  members,
  onSelect,
}: MentionAutocompleteProps) {
  if (members.length === 0) return null;

  return (
    <View
      className="bg-white border border-border rounded-xl mx-4 mb-1"
      style={{
        maxHeight: MENTION_MAX_VISIBLE * 48,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item.username)}
            className="flex-row items-center px-3 py-2.5 active:bg-surface"
          >
            <Avatar uri={item.avatarUrl} name={item.username} size={28} />
            <Text className="text-sm font-medium text-text-primary ml-2 flex-1">
              {item.username}
            </Text>
            {item.role === "agent" && (
              <View className="bg-agent-badge px-1.5 py-0.5 rounded">
                <Text className="text-[10px] text-white font-medium">Agent</Text>
              </View>
            )}
          </Pressable>
        )}
      />
    </View>
  );
});
