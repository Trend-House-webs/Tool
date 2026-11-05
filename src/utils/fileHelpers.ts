/**
 * Utility helpers for client-side file and canvas handling.
 */

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateImageFile(file: File, maxMb = 50): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'File is empty (0 bytes). Please upload a valid image.' };
  }

  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  const ext = file.name.split('.').pop()?.toLowerCase();
  const isImageMime = file.type.startsWith('image/') || validMimes.includes(file.type.toLowerCase());
  const isImageExt = ext ? ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext) : false;

  if (!isImageMime && !isImageExt) {
    return { valid: false, error: 'Please upload a valid image file (JPG, PNG, WebP, GIF, or BMP).' };
  }

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File is too large (${formatBytes(file.size)}). Max recommended size is ${maxMb}MB for browser performance.` };
  }

  return { valid: true };
}

export function validatePdfFile(file: File, maxMb = 100): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'File is empty (0 bytes). Please select a valid PDF.' };
  }

  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfMime && !isPdfExt) {
    return { valid: false, error: `"${file.name}" is not a valid PDF file. Only PDF files are supported.` };
  }

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `PDF file "${file.name}" is too large (${formatBytes(file.size)}). Max size is ${maxMb}MB for in-browser processing.` };
  }

  return { valid: true };
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image into browser memory'));
    img.src = src;
  });
}

export function downloadBlob(blob: Blob | string, filename: string): void {
  const url = typeof blob === 'string' ? blob : URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof blob !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
