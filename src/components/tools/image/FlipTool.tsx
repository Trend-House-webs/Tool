import React, { useState, useEffect } from 'react';
import { FlipHorizontal, FlipVertical, Download, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';
import { loadImageFromFile } from '../../../utils/imageCompression';

export function FlipTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelectFile = (selectedFile: File) => {
    setError(null);
    const val = validateImageFile(selectedFile);
    if (!val.valid) {
      setError(val.error || 'Invalid image file.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setFlipH(false);
    setFlipV(false);
  };

  const handleDownload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context.');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.save();
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(
        img,
        flipH ? -img.naturalWidth : 0,
        flipV ? -img.naturalHeight : 0,
        img.naturalWidth,
        img.naturalHeight
      );
      ctx.restore();

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const ext = mime === 'image/png' ? 'png' : 'jpg';

      canvas.toBlob((blob) => {
        setIsProcessing(false);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
          downloadBlob(url, `${baseName}-flipped.${ext}`);
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        } else {
          setError('Failed to export flipped image.');
        }
      }, mime, 0.92);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Error processing flipped image.');
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setFlipH(false);
    setFlipV(false);
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
          accept="image/jpeg,image/png,image/webp,image/bmp"
          title="Select image to flip or mirror"
          subtitle="Mirror photos horizontally (selfie fix) or vertically in your browser with zero quality degradation."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 truncate max-w-sm">{file.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Original size: {formatBytes(file.size)}</p>
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

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Flip Toggle Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setFlipH(!flipH)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            flipH
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <FlipHorizontal className="w-4 h-4" />
          Flip Horizontal {flipH ? '(Active)' : ''}
        </button>
        <button
          type="button"
          onClick={() => setFlipV(!flipV)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            flipV
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <FlipVertical className="w-4 h-4" />
          Flip Vertical {flipV ? '(Active)' : ''}
        </button>
      </div>

      {/* Live Preview Container */}
      <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] min-h-[300px] max-h-[500px] flex items-center justify-center p-6">
        <img
          src={previewUrl}
          alt="Flipped preview"
          style={{
            transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
            transition: 'transform 0.2s ease-in-out',
          }}
          className="max-h-[440px] max-w-full object-contain rounded-lg shadow-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isProcessing}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          {isProcessing ? 'Processing locally...' : 'Download Flipped Image'}
        </button>
        <button
          type="button"
          onClick={() => {
            setFlipH(false);
            setFlipV(false);
          }}
          className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your files are processed in your browser and are not uploaded to our server.</span>
      </div>
    </div>
  );
}
