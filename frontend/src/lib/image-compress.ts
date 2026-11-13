/**
 * Compresses an image file in the browser using HTML5 Canvas
 * ensuring it stays under the specified max size (default 2MB)
 * while preserving aspect ratio and quality for YOLO inference.
 */
export async function compressImage(
  file: File,
  maxSizeBytes: number = 2 * 1024 * 1024,
  maxDimension: number = 1920
): Promise<File> {
  // If file is already smaller than target, return as-is
  if (file.size <= maxSizeBytes && file.type === 'image/jpeg') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if dimensions exceed maximum
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // fallback to original
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Progressively lower quality if necessary
        let quality = 0.85;

        const attemptCompression = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }

              if (blob.size <= maxSizeBytes || q <= 0.4) {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.jpg'),
                  {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }
                );
                resolve(compressedFile);
              } else {
                attemptCompression(q - 0.15);
              }
            },
            'image/jpeg',
            q
          );
        };

        attemptCompression(quality);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

