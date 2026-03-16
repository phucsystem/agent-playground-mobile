import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { uploadFile } from "../api/storage-api";
import { sendMessage } from "../api/messages-api";
import { useAuthStore } from "../stores/auth-store";
import { queryKeys } from "../types/api-types";
import { MAX_FILE_SIZE_BYTES } from "../constants/app";

interface UploadParams {
  conversationId: string;
  file: { uri: string; name: string; size: number; type: string };
  onProgress?: (progress: number) => void;
}

export function useUploadFile() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, file, onProgress }: UploadParams) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("File exceeds 10MB limit");
      }

      const messageId = randomUUID();
      const storagePath = `${conversationId}/${messageId}/${file.name}`;

      const response = await fetch(file.uri);
      const blob = await response.blob();

      await uploadFile(storagePath, blob, file.type, onProgress);

      const isImage = file.type.startsWith("image/");
      const contentType = isImage ? "image" : "file";
      const content = isImage ? "Shared an image" : `Shared a file: ${file.name}`;

      const message = await sendMessage({
        conversation_id: conversationId,
        user_id: user!.id,
        content,
        content_type: contentType,
        metadata: isImage
          ? { image_url: `attachments/${storagePath}` }
          : { file_name: file.name, file_size: file.size, file_type: file.type },
      });

      return message;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(variables.conversationId),
      });
    },
  });
}
