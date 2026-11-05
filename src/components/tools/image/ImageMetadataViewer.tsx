import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, ShieldCheck, AlertCircle, Info, Copy, Check } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, validateImageFile } from '../../../utils/fileHelpers';
import { loadImageFromFile } from '../../../utils/imageCompression';

interface MetadataInfo {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  mimeType: string;
  lastModified: string;
  width: number;
  height: number;
  aspectRatio: string;
  orientation: 'Landscape' | 'Portrait' | 'Square';
  megapixels: string;
  colorDepth: string;
}

export function ImageMetadataViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [metadata, setMetadata] = useState<MetadataInfo | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelectFile = async (selectedFile: File) => {
    setError(null);
    const val = validateImageFile(selectedFile);
    if (!val.valid) {
      setError(val.error || 'Invalid image file.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    try {
      const img = await loadImageFromFile(selectedFile);
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Calculate simplified aspect ratio
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const ratioStr = `${w / divisor}:${h / divisor}`;

      const orientation: 'Landscape' | 'Portrait' | 'Square' =
        w > h ? 'Landscape' : h > w ? 'Portrait' : 'Square';

      const mp = ((w * h) / 1000000).toFixed(2);

      setMetadata({
        name: selectedFile.name,
        sizeBytes: selectedFile.size,
        sizeFormatted: formatBytes(selectedFile.size),
        mimeType: selectedFile.type || 'image/unknown',
        lastModified: new Date(selectedFile.lastModified).toLocaleString(),
        width: w,
        height: h,
        aspectRatio: ratioStr,
        orientation,
        megapixels: `${mp} MP`,
        colorDepth: '24-bit sRGB / 32-bit RGBA',
      });
    } catch (err: any) {
      setError('Could not extract image dimensions or properties.');
    }
  };

  const handleCopySummary = () => {
    if (!metadata) return;
    const summary = [
      `File Name: ${metadata.name}`,
      `File Size: ${metadata.sizeFormatted} (${metadata.sizeBytes.toLocaleString()} bytes)`,
      `MIME Type: ${metadata.mimeType}`,
      `Dimensions: ${metadata.width} × ${metadata.height} px`,
      `Aspect Ratio: ${metadata.aspectRatio}`,
      `Orientation: ${metadata.orientation}`,
      `Megapixels: ${metadata.megapixels}`,
      `Last Modified: ${metadata.lastModified}`,
    ].join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setMetadata(null);
    setError(null);
  };

  if (!file || !metadata) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <ImageDropzone
          onImageSelected={handleSelectFile}
          accept="image/*"
          title="Select image to inspect metadata & properties"
          subtitle="Check resolution, megapixels, dimensions, color format, and file properties directly in your browser."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 truncate max-w-sm">{metadata.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{metadata.sizeFormatted} · {metadata.mimeType}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Data'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Inspect Another
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Preview image */}
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[260px] flex items-center justify-center p-4">
          <img
            src={previewUrl}
            alt="Metadata Preview"
            className="max-h-[320px] max-w-full object-contain rounded-lg shadow-sm"
          />
        </div>

        {/* Detailed Properties Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">File & Visual Properties</h3>
          <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-xl overflow-hidden bg-slate-50/50 text-xs">
            <div className="flex justify-between p-3 bg-white">
              <span className="text-slate-500">Dimensions</span>
              <span className="font-mono font-semibold text-slate-900">{metadata.width} × {metadata.height} px</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-slate-500">Total Resolution</span>
              <span className="font-mono font-semibold text-emerald-700">{metadata.megapixels}</span>
            </div>
            <div className="flex justify-between p-3 bg-white">
              <span className="text-slate-500">Aspect Ratio</span>
              <span className="font-mono font-semibold text-slate-900">{metadata.aspectRatio} ({metadata.orientation})</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-slate-500">Exact File Size</span>
              <span className="font-mono font-semibold text-slate-900">{metadata.sizeBytes.toLocaleString()} bytes ({metadata.sizeFormatted})</span>
            </div>
            <div className="flex justify-between p-3 bg-white">
              <span className="text-slate-500">MIME Media Type</span>
              <span className="font-mono font-semibold text-slate-900">{metadata.mimeType}</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-slate-500">Estimated Depth</span>
              <span className="font-mono font-semibold text-slate-900">{metadata.colorDepth}</span>
            </div>
            <div className="flex justify-between p-3 bg-white">
              <span className="text-slate-500">Last Modified</span>
              <span className="font-mono text-slate-700">{metadata.lastModified}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Inspected locally in your browser memory without server file uploads.</span>
      </div>
    </div>
  );
}
