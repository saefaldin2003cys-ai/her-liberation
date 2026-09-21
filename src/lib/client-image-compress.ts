/**
 * Compresses and resizes an image file in the browser using HTML5 Canvas.
 * - Scales down images larger than maxDimension (default: 1920px)
 * - Converts to JPEG with quality 0.85 to keep file size small (~200KB-500KB)
 * - Prevents HTTP upload timeouts, proxy dropouts, and "Failed to fetch" errors
 * - Falls back safely to the original file if Canvas or Bitmap is unsupported
 */
export async function compressImageClient(
  file: File,
  maxDimension = 1920,
  quality = 0.85,
): Promise<File | Blob> {
  // If not an image or SVG/GIF, return as-is
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  try {
    // 1. Try createImageBitmap or fallback to Image element
    let width = 0;
    let height = 0;
    let source: ImageBitmap | HTMLImageElement;

    if (typeof createImageBitmap === "function") {
      try {
        const bmp = await createImageBitmap(file);
        width = bmp.width;
        height = bmp.height;
        source = bmp;
      } catch {
        source = await loadImageElement(file);
        width = source.naturalWidth;
        height = source.naturalHeight;
      }
    } else {
      source = await loadImageElement(file);
      width = source.naturalWidth;
      height = source.naturalHeight;
    }

    if (!width || !height) return file;

    // 2. Calculate scaled dimensions
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    // 3. Draw on canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if ("close" in source && typeof source.close === "function") source.close();
      return file;
    }

    ctx.drawImage(source, 0, 0, width, height);
    if ("close" in source && typeof source.close === "function") source.close();

    // 4. Export as compressed JPEG or PNG
    const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mimeType, quality),
    );

    if (!blob) return file;

    // Only return compressed blob if it actually reduced the size
    if (blob.size < file.size) {
      const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
      const cleanName = file.name.replace(/\.[^.]+$/, "") + extension;
      return new File([blob], cleanName, { type: mimeType });
    }

    return file;
  } catch (err) {
    console.warn("Client compression failed, using original file:", err);
    return file;
  }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
