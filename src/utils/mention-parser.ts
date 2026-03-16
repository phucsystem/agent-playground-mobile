export function extractMentionQuery(text: string, cursorPosition: number): string | null {
  const textBeforeCursor = text.slice(0, cursorPosition);
  const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
  if (!mentionMatch) return null;
  return mentionMatch[1];
}

interface MemberMatch {
  userId: string;
  username: string;
  role: string;
  avatarUrl: string | null;
}

export function filterMembers(members: MemberMatch[], query: string): MemberMatch[] {
  if (!query) return members;
  const lowerQuery = query.toLowerCase();
  return members.filter((member) =>
    member.username.toLowerCase().includes(lowerQuery)
  );
}

export function insertMention(
  text: string,
  cursorPosition: number,
  username: string
): { newText: string; newCursorPosition: number } {
  const textBeforeCursor = text.slice(0, cursorPosition);
  const textAfterCursor = text.slice(cursorPosition);
  const mentionStart = textBeforeCursor.lastIndexOf("@");

  if (mentionStart === -1) return { newText: text, newCursorPosition: cursorPosition };

  const before = text.slice(0, mentionStart);
  const mention = `@${username} `;
  const newText = before + mention + textAfterCursor;
  const newCursorPosition = before.length + mention.length;

  return { newText, newCursorPosition };
}
