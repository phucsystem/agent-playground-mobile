# Phase 04 — Rich Features: Core (Business Logic)

## Overview

- **Priority:** P2
- **Status:** Completed
- **Effort:** 3h
- **Description:** Business logic utilities for image compression, @mention parsing, file type detection, and action sheet helpers used by rich feature UI components.

## Requirements

| FR | Feature | Core Concern |
|----|---------|-------------|
| FR-11 | @Mention Autocomplete | Parse @mention text, filter members, insert formatted mention |
| FR-12 | File Attachments | File type detection, size validation |
| FR-13 | Image Sharing | Image compression (>2MB), dimension resize |
| FR-15 | Emoji Reactions | Find own reaction in list |

## Related Code Files

### Files to CREATE

```
src/
├── utils/
│   ├── mention-parser.ts            # Parse @mentions from text, filter members
│   ├── image-compressor.ts          # Compress images >2MB using expo-image-manipulator
│   └── file-helpers.ts              # File type icons, size formatting, validation
```

## Implementation Steps

### Step 1: Install image manipulation package

```bash
npx expo install expo-image-manipulator
```

### Step 2: Mention parser (`src/utils/mention-parser.ts`)

```typescript
interface MemberMatch {
  userId: string;
  username: string;
  role: string;
  avatarUrl: string | null;
}

export function extractMentionQuery(text: string, cursorPosition: number): string | null {
  // Find the last @ before cursor
  const textBeforeCursor = text.slice(0, cursorPosition);
  const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
  if (!mentionMatch) return null;
  return mentionMatch[1]; // text after @
}

export function filterMembers(
  members: MemberMatch[],
  query: string
): MemberMatch[] {
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
```

### Step 3: Image compressor (`src/utils/image-compressor.ts`)

```typescript
import * as ImageManipulator from "expo-image-manipulator";
import { IMAGE_COMPRESS_THRESHOLD_BYTES, IMAGE_MAX_DIMENSION, IMAGE_QUALITY } from "../constants/app";

interface CompressedImage {
  uri: string;
  width: number;
  height: number;
}

export async function compressImageIfNeeded(
  uri: string,
  fileSize: number
): Promise<CompressedImage> {
  if (fileSize <= IMAGE_COMPRESS_THRESHOLD_BYTES) {
    // No compression needed
    return { uri, width: 0, height: 0 };
  }

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: IMAGE_MAX_DIMENSION } }],
    { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
}
```

### Step 4: File helpers (`src/utils/file-helpers.ts`)

```typescript
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
```

### Step 5: Reaction helpers

Add to existing message utilities or inline:

```typescript
export function findOwnReaction(
  reactions: { id: string; user_id: string; emoji: string }[],
  userId: string
): string | undefined {
  return reactions.find((reaction) => reaction.user_id === userId)?.id;
}
```

## Todo List

- [x] Install `expo-image-manipulator`
- [x] Implement `src/utils/mention-parser.ts` (extract query, filter, insert)
- [x] Implement `src/utils/image-compressor.ts` (compress >2MB, resize to 1920px)
- [x] Implement `src/utils/file-helpers.ts` (size format, icon, validation)
- [x] Add reaction helper (findOwnReaction)
- [x] Test image compression with various sizes (1MB, 3MB, 5MB)
- [x] Test mention parser with edge cases (multiple @, empty query, special chars)

## Success Criteria

- `extractMentionQuery("hello @Al", 9)` returns `"Al"`
- `compressImageIfNeeded(uri, 3MB)` outputs JPEG under 500KB
- `formatFileSize(1048576)` returns `"1.0 MB"`
- `validateFileSize(11MB)` returns `{ valid: false, error: "..." }`
