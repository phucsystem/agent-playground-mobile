export function calculateUnreadCount(
  lastMessageCreatedAt: string | null,
  lastReadAt: string | null
): number {
  if (!lastMessageCreatedAt) return 0;
  if (!lastReadAt) return 1;
  return new Date(lastMessageCreatedAt) > new Date(lastReadAt) ? 1 : 0;
}
