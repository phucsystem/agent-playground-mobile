import { MAX_FILE_SIZE_BYTES } from "../constants/app";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "film";
  if (mimeType === "application/pdf") return "file-text";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "grid";
  if (mimeType.includes("document") || mimeType.includes("word")) return "file-text";
  return "file";
}

export function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds 10MB limit (${formatFileSize(size)})` };
  }
  return { valid: true };
}

export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function findOwnReaction(
  reactions: { id: string; user_id: string; emoji: string }[],
  userId: string
): string | undefined {
  return reactions.find((reaction) => reaction.user_id === userId)?.id;
}
