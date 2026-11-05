import React, { useState } from 'react';
import { Download, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';
import { loadImageFromFile } from '../../../utils/imageCompression';

export function BmpToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const [quality, setQuality] = useState<number>(90);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [previewUrl, convertedUrl]);

  const handleSelectFile = (selectedFile: File) => {
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    convertBmpToJpg(selectedFile, quality);
  };

  const convertBmpToJpg = async (targetFile: File, q: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      const img = await loadImageFromFile(targetFile);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context.');

      // Solid white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (blob) {
            if (convertedUrl) URL.revokeObjectURL(convertedUrl);
            setConvertedUrl(URL.createObjectURL(blob));
            setConvertedSize(blob.size);
          } else {
            setError('Failed to convert BMP image.');
          }
        },
        'image/jpeg',
        q / 100
      );
    } catch (err: any) {
      setIsProcessing(false);
      setError('Could not decode BMP image.');
    }
  };

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(convertedUrl, `${baseName}.jpg`);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setFile(null);
    setPreviewUrl('');
    setConvertedUrl('');
    setError(null);
  };

  if (!file) {
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
          accept="image/bmp,.bmp,image/x-ms-bmp"
          title="Select BMP bitmap image to convert to JPG"
          subtitle="Turn heavy, uncompressed bitmap images into lightweight, web-compatible JPEG photos instantly."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 truncate max-w-sm">{file.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Original BMP size: {formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Choose Another
        </button>
      </div>

      {convertedSize > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Original BMP</span>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-800 mt-0.5">{formatBytes(file.size)}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase">JPEG Output</span>
            <p className="text-base sm:text-lg font-bold font-mono text-emerald-700 mt-0.5">{formatBytes(convertedSize)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase">Reduction</span>
            <p className="text-base sm:text-lg font-bold font-mono text-emerald-600 mt-0.5">
              -{Math.round(((file.size - convertedSize) / file.size) * 100)}%
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[220px] flex items-center justify-center p-4">
        <img
          src={convertedUrl || previewUrl}
          alt="Converted preview"
          className="max-h-[380px] max-w-full object-contain rounded shadow-sm"
        />
      </div>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isProcessing || !convertedUrl}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          Download JPG Image
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your files are processed in your browser and are not uploaded to our server.</span>
      </div>
    </div>
  );
}
