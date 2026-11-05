/**
 * High-performance, zero-dependency PDF generator for images.
 * Generates valid PDF 1.4 documents completely client-side.
 */

export interface PdfPageConfig {
  pageSize: 'a4' | 'letter';
  orientation: 'p' | 'l';
  marginMm: number;
}

export interface PdfImageInput {
  file: File;
  previewUrl: string;
}

const MM_TO_PT = 72 / 25.4;

const PAGE_SIZES: Record<'a4' | 'letter', [number, number]> = {
  a4: [210 * MM_TO_PT, 297 * MM_TO_PT], // 595.28 x 841.89 pt
  letter: [215.9 * MM_TO_PT, 279.4 * MM_TO_PT], // 612 x 792 pt
};

/**
 * Loads an image from a URL, draws it to canvas, and extracts JPEG binary bytes and dimensions.
 */
async function processImageToJpeg(imageUrl: string): Promise<{ width: number; height: number; bytes: Uint8Array }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        // Draw white background in case source has transparency
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const base64 = dataUrl.split(',')[1];
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          bytes,
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for PDF generation'));
    img.src = imageUrl;
  });
}

/**
 * Generates an image-based PDF document without any external dependencies or polyfills.
 */
export async function createImagesPdf(
  images: PdfImageInput[],
  config: PdfPageConfig
): Promise<Blob> {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let currentOffset = 0;

  function pushString(str: string) {
    const encoded = encoder.encode(str);
    chunks.push(encoded);
    currentOffset += encoded.byteLength;
  }

  function pushBytes(arr: Uint8Array) {
    chunks.push(arr);
    currentOffset += arr.byteLength;
  }

  // Determine page dimensions
  const [baseW, baseH] = PAGE_SIZES[config.pageSize];
  const pageWidthPt = config.orientation === 'p' ? baseW : baseH;
  const pageHeightPt = config.orientation === 'p' ? baseH : baseW;
  const marginPt = config.marginMm * MM_TO_PT;

  // Process all images to JPEG
  const processedImages = await Promise.all(
    images.map((item) => processImageToJpeg(item.previewUrl))
  );

  // PDF Header
  pushString('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  const objCount = 2 + processedImages.length * 3;

  // Object 1: Catalog
  offsets[1] = currentOffset;
  pushString('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages
  offsets[2] = currentOffset;
  const pageRefs = processedImages.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
  pushString(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${processedImages.length} >>\nendobj\n`);

  // Objects for each page
  processedImages.forEach((img, i) => {
    const pageObjId = 3 + i * 3;
    const contentObjId = 4 + i * 3;
    const imgObjId = 5 + i * 3;

    // Available space on page
    const availW = Math.max(10, pageWidthPt - marginPt * 2);
    const availH = Math.max(10, pageHeightPt - marginPt * 2);

    const imgRatio = img.width / img.height;
    const pageRatio = availW / availH;

    let renderW = availW;
    let renderH = availH;

    if (imgRatio > pageRatio) {
      renderW = availW;
      renderH = availW / imgRatio;
    } else {
      renderH = availH;
      renderW = availH * imgRatio;
    }

    // PDF coordinate system origin is bottom-left
    const xPos = marginPt + (availW - renderW) / 2;
    const yPos = marginPt + (availH - renderH) / 2;

    // Page object
    offsets[pageObjId] = currentOffset;
    pushString(
      `${pageObjId} 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${pageWidthPt.toFixed(2)} ${pageHeightPt.toFixed(2)}]\n  /Contents ${contentObjId} 0 R\n  /Resources << /XObject << /Im${i + 1} ${imgObjId} 0 R >> >>\n>>\nendobj\n`
    );

    // Content stream
    const contentStream = `q\n${renderW.toFixed(2)} 0 0 ${renderH.toFixed(2)} ${xPos.toFixed(2)} ${yPos.toFixed(2)} cm\n/Im${i + 1} Do\nQ\n`;
    offsets[contentObjId] = currentOffset;
    pushString(`${contentObjId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

    // Image object
    offsets[imgObjId] = currentOffset;
    pushString(
      `${imgObjId} 0 obj\n<<\n  /Type /XObject\n  /Subtype /Image\n  /Width ${img.width}\n  /Height ${img.height}\n  /ColorSpace /DeviceRGB\n  /BitsPerComponent 8\n  /Filter /DCTDecode\n  /Length ${img.bytes.byteLength}\n>>\nstream\n`
    );
    pushBytes(img.bytes);
    pushString('\nendstream\nendobj\n');
  });

  // Cross-reference table
  const xrefOffset = currentOffset;
  pushString(`xref\n0 ${objCount + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= objCount; i++) {
    pushString(`${(offsets[i] || 0).toString().padStart(10, '0')} 00000 n \n`);
  }

  // Trailer
  pushString(`trailer\n<< /Size ${objCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return new Blob(chunks as any, { type: 'application/pdf' });
}
