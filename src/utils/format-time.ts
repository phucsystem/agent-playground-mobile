import { formatDistanceToNowStrict, format, isToday, isYesterday } from "date-fns";

export function formatConversationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d");
}

export function formatMessageTime(dateString: string): string {
  return format(new Date(dateString), "h:mm a");
}

export function formatDateSeparator(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export function isSameDay(dateA: string, dateB: string): boolean {
  return new Date(dateA).toDateString() === new Date(dateB).toDateString();
}
