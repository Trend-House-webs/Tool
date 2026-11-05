import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, validateImageFile } from '../../../utils/fileHelpers';
import { loadImageFromFile } from '../../../utils/imageCompression';

export function TransparentBgChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [bgMode, setBgMode] = useState<'checker' | 'white' | 'black' | 'custom'>('checker');
  const [customColor, setCustomColor] = useState<string>('#3b82f6');
  const [hasAlpha, setHasAlpha] = useState<boolean | null>(null);
  const [alphaStats, setAlphaStats] = useState<{ transparentCount: number; opaqueCount: number; percentage: number } | null>(null);
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
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(img.naturalWidth, 800);
      canvas.height = Math.min(img.naturalHeight, 800);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas.');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      let transparentCount = 0;
      let opaqueCount = 0;

      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) {
          transparentCount++;
        } else {
          opaqueCount++;
        }
      }

      const total = transparentCount + opaqueCount;
      const pct = Math.round((transparentCount / total) * 100);

      setHasAlpha(transparentCount > 0);
      setAlphaStats({
        transparentCount,
        opaqueCount,
        percentage: pct,
      });
    } catch (err: any) {
      setError('Could not analyze pixel transparency.');
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setHasAlpha(null);
    setAlphaStats(null);
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
          accept="image/png,image/webp,image/svg+xml,image/gif"
          title="Select PNG, WebP or SVG to inspect transparency"
          subtitle="Instantly verify if your cutout has a real transparent background or a fake checkered background."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 truncate max-w-sm">{file.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Inspect Another
        </button>
      </div>

      {/* Alpha channel detection banner */}
      {hasAlpha !== null && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            hasAlpha
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          {hasAlpha ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="font-bold text-sm">
              {hasAlpha ? 'Real Transparent Background Detected!' : 'No Transparency Detected (Solid Background)'}
            </h3>
            <p className="text-xs mt-0.5 leading-relaxed">
              {hasAlpha
                ? `Approximately ${alphaStats?.percentage}% of sample pixels contain genuine alpha channel transparency.`
                : 'All examined pixels are 100% opaque. If your image shows a checkerboard pattern, it is a flat raster graphic rather than a real cutout.'}
            </p>
          </div>
        </div>
      )}

      {/* Background Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-700">Preview Against Background:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setBgMode('checker')}
            className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer ${
              bgMode === 'checker' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Checkerboard
          </button>
          <button
            type="button"
            onClick={() => setBgMode('black')}
            className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer ${
              bgMode === 'black' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Solid Black
          </button>
          <button
            type="button"
            onClick={() => setBgMode('white')}
            className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer ${
              bgMode === 'white' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Solid White
          </button>
          <button
            type="button"
            onClick={() => setBgMode('custom')}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer ${
              bgMode === 'custom' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Custom Color
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setBgMode('custom');
              }}
              className="w-4 h-4 rounded cursor-pointer border-0 p-0"
            />
          </button>
        </div>
      </div>

      {/* Preview container */}
      <div
        style={{
          backgroundColor:
            bgMode === 'black' ? '#000000' : bgMode === 'white' ? '#ffffff' : bgMode === 'custom' ? customColor : 'transparent',
          backgroundImage:
            bgMode === 'checker'
              ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
              : 'none',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        }}
        className="relative rounded-xl border border-slate-300 min-h-[300px] max-h-[460px] flex items-center justify-center p-6 overflow-hidden transition-colors"
      >
        <img
          src={previewUrl}
          alt="Transparency inspection"
          className="max-h-[400px] max-w-full object-contain rounded shadow-sm"
        />
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Alpha channel tested client-side without transmitting pixels to any server.</span>
      </div>
    </div>
  );
}
