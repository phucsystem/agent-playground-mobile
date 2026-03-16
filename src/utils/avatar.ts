const AVATAR_COLORS = [
  "#F87171", "#FB923C", "#FBBF24", "#34D399",
  "#60A5FA", "#A78BFA", "#F472B6", "#38BDF8",
];

function hashString(str: string): number {
  let hash = 0;
  for (let charIndex = 0; charIndex < str.length; charIndex++) {
    hash = str.charCodeAt(charIndex) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getAvatarColor(name: string): string {
  return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
