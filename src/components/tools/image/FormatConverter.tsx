import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, validateImageFile, downloadBlob } from '../../../utils/fileHelpers';

interface FormatConverterProps {
  sourceFormatName: string; // e.g. "JPG", "PNG", "WebP"
  targetFormatName: string; // e.g. "PNG", "JPG", "WebP"
  targetMime: 'image/jpeg' | 'image/png' | 'image/webp';
  targetExtension: 'jpg' | 'png' | 'webp';
  accept?: string;
}

export function FormatConverter({
  sourceFormatName,
  targetFormatName,
  targetMime,
  targetExtension,
  accept = 'image/*',
}: FormatConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [quality, setQuality] = useState<number>(90);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, []);

  const handleSelectFile = (selectedFile: File) => {
    setError(null);
    const val = validateImageFile(selectedFile);
    if (!val.valid) {
      setError(val.error || 'Invalid image file.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  useEffect(() => {
    if (!previewUrl) return;

    setIsConverting(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsConverting(false);
        return;
      }

      // If target is JPEG and source may have transparent pixels, fill background color
      if (targetMime === 'image/jpeg') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (convertedUrl) URL.revokeObjectURL(convertedUrl);
            setConvertedSize(blob.size);
            setConvertedUrl(URL.createObjectURL(blob));
          }
          setIsConverting(false);
        },
        targetMime,
        targetMime === 'image/png' ? undefined : quality / 100
      );
    };
    img.src = previewUrl;
  }, [previewUrl, bgColor, quality, targetMime]);

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'converted-image';
    downloadBlob(convertedUrl, `${baseName}.${targetExtension}`);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setFile(null);
    setPreviewUrl('');
    setConvertedUrl('');
    setOriginalSize(0);
    setConvertedSize(0);
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
          accept={accept}
          title={`Select a ${sourceFormatName} file to convert to ${targetFormatName}`}
          subtitle={`Upload any ${sourceFormatName} image to convert into high-quality ${targetFormatName} format locally`}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 truncate max-w-sm">
            {file.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Converting {sourceFormatName} → {targetFormatName} · Original: {formatBytes(originalSize)}
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Choose another image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="space-y-5 bg-slate-50/70 p-5 rounded-xl border border-slate-200/70">
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span>Conversion Flow</span>
              <span className="font-semibold text-slate-800">{sourceFormatName} → {targetFormatName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Original Size</span>
              <span className="font-mono text-slate-700">{formatBytes(originalSize)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Converted Size</span>
              <span className="font-mono font-semibold text-slate-900">{formatBytes(convertedSize)}</span>
            </div>
          </div>

          {targetMime === 'image/jpeg' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Background Color (fills transparent areas)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 p-0.5 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-24 px-2 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => setBgColor('#ffffff')}
                  className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => setBgColor('#000000')}
                  className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
                >
                  Black
                </button>
              </div>
            </div>
          )}

          {targetMime !== 'image/png' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Output Quality</span>
                <span className="font-mono text-emerald-700">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Smaller (10%)</span>
                <span>High Quality (100%)</span>
              </div>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={isConverting || !convertedUrl}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isConverting ? 'Converting...' : `Download .${targetExtension.toUpperCase()}`}
          </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center bg-slate-100 rounded-xl p-4 border border-slate-200 overflow-hidden min-h-[300px]">
          {convertedUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={convertedUrl}
                alt="Converted output"
                className="max-h-[340px] max-w-full object-contain rounded-lg shadow-xs"
              />
              <span className="text-[11px] text-slate-400 mt-2">
                Format: .{targetExtension.toUpperCase()} · Ready for download
              </span>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">Processing conversion...</div>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-600 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your files are processed in your browser and are not uploaded to our server.</span>
      </div>
    </div>
  );
}
