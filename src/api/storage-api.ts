import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

export async function uploadFile(
  path: string,
  file: Blob | ArrayBuffer,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/attachments/${path}`;
  const token = useAuthStore.getState().accessToken;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(path);
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("attachments")
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}
