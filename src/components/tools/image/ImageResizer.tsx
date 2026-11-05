import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Lock, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [resizedUrl, setResizedUrl] = useState<string>('');
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
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
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = objectUrl;
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && originalWidth > 0 && originalHeight > 0) {
      setHeight(Math.max(1, Math.round((val / originalWidth) * originalHeight)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && originalWidth > 0 && originalHeight > 0) {
      setWidth(Math.max(1, Math.round((val / originalHeight) * originalWidth)));
    }
  };

  const handleScalePercent = (percent: number) => {
    if (originalWidth > 0 && originalHeight > 0) {
      setWidth(Math.max(1, Math.round((originalWidth * percent) / 100)));
      setHeight(Math.max(1, Math.round((originalHeight * percent) / 100)));
    }
  };

  useEffect(() => {
    if (!previewUrl || width <= 0 || height <= 0) return;

    const timer = setTimeout(() => {
      setIsProcessing(true);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (resizedUrl) URL.revokeObjectURL(resizedUrl);
              setResizedSize(blob.size);
              setResizedUrl(URL.createObjectURL(blob));
            }
            setIsProcessing(false);
          },
          format,
          0.9
        );
      };
      img.src = previewUrl;
    }, 150);

    return () => clearTimeout(timer);
  }, [previewUrl, width, height, format]);

  const handleDownload = () => {
    if (!resizedUrl || !file) return;
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(resizedUrl, `${baseName}-${width}x${height}.${ext}`);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setFile(null);
    setPreviewUrl('');
    setResizedUrl('');
    setResizedSize(0);
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
          title="Select an image to resize"
          subtitle="Scale pixel dimensions or percentages with aspect ratio lock"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 truncate max-w-sm">
            {file.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Original: {originalWidth} × {originalHeight} px · {formatBytes(file.size)}
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
        <div className="space-y-5 bg-slate-50/70 p-5 rounded-xl border border-slate-200/70">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Dimensions</span>
              <button
                type="button"
                onClick={() => setLockRatio(!lockRatio)}
                className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium hover:underline cursor-pointer"
              >
                {lockRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                {lockRatio ? 'Ratio Locked' : 'Ratio Unlocked'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Width (px)</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={width || ''}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Height (px)</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={height || ''}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Quick Scale Presets
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 200].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleScalePercent(p)}
                  className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors text-slate-700 cursor-pointer"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Format
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/60 rounded-lg">
              {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    format === fmt ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt === 'image/jpeg' ? 'JPEG' : fmt === 'image/png' ? 'PNG' : 'WebP'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <span>Estimated Resized Size:</span>
            <span className="font-mono font-semibold text-slate-900">{formatBytes(resizedSize)}</span>
          </div>

          <button
            onClick={handleDownload}
            disabled={isProcessing || width <= 0 || height <= 0 || !resizedUrl}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isProcessing ? 'Resizing...' : `Download ${width}×${height} Image`}
          </button>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center items-center bg-slate-100 rounded-xl p-4 border border-slate-200 overflow-hidden min-h-[300px]">
          {resizedUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={resizedUrl}
                alt="Resized output"
                className="max-h-[340px] max-w-full object-contain rounded-lg shadow-xs"
              />
              <span className="text-[11px] text-slate-400 mt-2">
                Resized preview: {width} × {height} px
              </span>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">Generating preview...</div>
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
