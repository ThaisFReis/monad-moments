/**
 * Strip EXIF data from an image by redrawing it through a canvas.
 * Also compresses the image to stay under the target size.
 */
export async function stripExifAndCompress(
  file: File | Blob,
  maxWidth = 1920,
  maxSizeMB = 2,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Redraw — this strips all EXIF data
      ctx.drawImage(img, 0, 0, width, height);

      // Compress iteratively until under target size
      let currentQuality = quality;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }
            if (blob.size > maxSizeMB * 1024 * 1024 && currentQuality > 0.3) {
              currentQuality -= 0.1;
              tryCompress();
            } else {
              resolve(blob);
            }
          },
          'image/jpeg',
          currentQuality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Create a thumbnail from an image blob for the feed grid.
 */
export async function createThumbnail(blob: Blob, size = 400): Promise<Blob> {
  return stripExifAndCompress(blob, size, 0.5, 0.7);
}
