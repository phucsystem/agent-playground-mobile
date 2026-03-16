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
