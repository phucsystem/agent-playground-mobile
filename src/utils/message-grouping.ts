import type { MessageListItem } from "../types/api-types";
import { isSameDay, formatDateSeparator } from "./format-time";

export interface GroupedMessage extends MessageListItem {
  showDateSeparator: boolean;
  showSenderInfo: boolean;
  dateSeparatorLabel?: string;
}

export function groupMessages(
  messages: MessageListItem[],
  currentUserId: string
): GroupedMessage[] {
  return messages.map((message, index) => {
    const previousMessage = messages[index + 1]; // inverted list: index+1 = older
    const showDateSeparator =
      !previousMessage || !isSameDay(message.created_at, previousMessage.created_at);

    const showSenderInfo =
      message.user_id !== currentUserId &&
      (!previousMessage ||
        previousMessage.user_id !== message.user_id ||
        showDateSeparator);

    return {
      ...message,
      showDateSeparator,
      showSenderInfo,
      dateSeparatorLabel: showDateSeparator
        ? formatDateSeparator(message.created_at)
        : undefined,
    };
  });
}
