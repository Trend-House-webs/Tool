import UPNG from 'upng-js';

export interface CompressionResult {
  blob: Blob;
  outputSize: number;
  originalSize: number;
  savingsPercent: number;
  isAlreadyOptimized: boolean;
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  width: number;
  height: number;
  message?: string;
}

/**
 * Loads an image file into an HTMLImageElement with dimensions.
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image. The file may be corrupt or an unsupported format.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses an image client-side in the browser.
 * - JPEG/WebP: Uses native canvas with quality parameter.
 * - PNG: Uses UPNG quantization and DEFLATE compression preserving alpha transparency.
 */
export async function compressImageClientSide(
  file: File,
  qualityPercent: number, // 1 to 100
  desiredOutputFormat?: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<CompressionResult> {
  const img = await loadImageFromFile(file);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  if (width === 0 || height === 0) {
    throw new Error('Image has zero dimensions.');
  }

  // Prevent memory exhaustion / canvas pixel flood (decompression bombs)
  const MAX_CANVAS_DIMENSION = 16384;
  const MAX_TOTAL_PIXELS = 100_000_000;
  if (width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION || (width * height) > MAX_TOTAL_PIXELS) {
    throw new Error(`Image dimensions (${width}×${height}) exceed maximum safe browser canvas limits.`);
  }

  // Determine actual target format
  let format: 'image/jpeg' | 'image/png' | 'image/webp';
  if (desiredOutputFormat) {
    format = desiredOutputFormat;
  } else {
    if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
      format = 'image/png';
    } else if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
      format = 'image/webp';
    } else {
      format = 'image/jpeg';
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create 2D canvas context.');
  }

  // If output is JPEG, fill with solid white background to avoid black transparency
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0);

  let outputBlob: Blob;

  if (format === 'image/png') {
    // REAL PNG COMPRESSION using UPNG.js quantization
    const imageData = ctx.getImageData(0, 0, width, height);
    const rgbaBuffer = imageData.data.buffer;

    let cnum: number;
    if (qualityPercent >= 100) {
      cnum = 0; // Lossless PNG
    } else {
      // 1 to 256 colors adaptive palette with full alpha transparency
      cnum = Math.max(2, Math.min(256, Math.round((qualityPercent / 100) * 256)));
    }

    // UPNG.encode returns an ArrayBuffer containing PNG binary
    const pngArrayBuffer = UPNG.encode([rgbaBuffer], width, height, cnum);
    outputBlob = new Blob([pngArrayBuffer], { type: 'image/png' });
  } else {
    // JPEG or WebP native quality compression
    const q = Math.max(0.01, Math.min(1.0, qualityPercent / 100));
    outputBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate image blob from canvas.'));
        },
        format,
        q
      );
    });
  }

  const originalSize = file.size;
  const compressedSize = outputBlob.size;

  // Check if output is actually smaller than original
  if (compressedSize >= originalSize) {
    // The compressed file would be larger or same size
    return {
      blob: file, // Keep the original file
      outputSize: originalSize,
      originalSize,
      savingsPercent: 0,
      isAlreadyOptimized: true,
      outputFormat: format,
      width,
      height,
      message: 'Your image is already highly optimized. The processed file would be larger, so we kept the original.',
    };
  }

  const savingsPercent = Math.round(((originalSize - compressedSize) / originalSize) * 100);

  return {
    blob: outputBlob,
    outputSize: compressedSize,
    originalSize,
    savingsPercent,
    isAlreadyOptimized: false,
    outputFormat: format,
    width,
    height,
  };
}
