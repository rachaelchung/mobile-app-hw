import { manipulateAsync, SaveFormat, type Action } from "expo-image-manipulator";
import { Image } from "react-native";

/** Max longest side in px — keeps a digicam-ish resolution cap. */
const MAX_LONG_EDGE = 1920;
/** Slightly aggressive JPEG = warmer, grainier “archived” look (spec: digicam quality). */
const JPEG_QUALITY = 0.78;

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (e) =>
        reject(e instanceof Error ? e : new Error("Could not read image size")),
    );
  });
}

/**
 * Re-encodes and optionally downsizes the image for stored mementos.
 * Runs automatically on save (camera or library); not user-tunable per spec.
 */
export async function applyDigicamFilter(sourceUri: string): Promise<string> {
  const actions: Action[] = [];
  try {
    const { width, height } = await getImageSize(sourceUri);
    const longEdge = Math.max(width, height);
    if (longEdge > MAX_LONG_EDGE) {
      if (width >= height) {
        actions.push({ resize: { width: MAX_LONG_EDGE } });
      } else {
        actions.push({ resize: { height: MAX_LONG_EDGE } });
      }
    }
  } catch {
    // Size is optional; still apply compression pass.
  }

  const { uri } = await manipulateAsync(sourceUri, actions, {
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });
  return uri;
}
