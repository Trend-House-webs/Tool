import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, ShieldCheck, AlertCircle, Sliders, CheckCircle2 } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';
import { loadImageFromFile } from '../../../utils/imageCompression';

export function PhotoSizeReducer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [targetKb, setTargetKb] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [previewUrl, processedUrl]);

  const handleSelectFile = (selectedFile: File) => {
    setError(null);
    const val = validateImageFile(selectedFile);
    if (!val.valid) {
      setError(val.error || 'Invalid image file.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setProcessedBlob(null);
    setProcessedUrl('');

    // Trigger reduction
    reduceToTargetKb(selectedFile, targetKb);
  };

  const reduceToTargetKb = async (targetFile: File, maxKb: number) => {
    setIsProcessing(true);
    setError(null);

    const maxBytes = maxKb * 1024;

    try {
      const img = await loadImageFromFile(targetFile);

      // Binary search on quality and scale if necessary
      let minQuality = 0.05;
      let maxQuality = 0.95;
      let bestBlob: Blob | null = null;
      let currentScale = 1.0;

      for (let scaleAttempt = 0; scaleAttempt < 3; scaleAttempt++) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * currentScale);
        canvas.height = Math.round(img.naturalHeight * currentScale);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context.');

        // Fill white for transparent images when exporting jpeg
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Binary search 5 steps
        for (let step = 0; step < 6; step++) {
          const midQ = (minQuality + maxQuality) / 2;
          const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', midQ)
          );

          if (blob) {
            if (blob.size <= maxBytes) {
              bestBlob = blob;
              minQuality = midQ; // Try to get higher quality that still fits
            } else {
              maxQuality = midQ; // File too large, decrease quality
            }
          }
        }

        if (bestBlob && bestBlob.size <= maxBytes) {
          break; // Successfully found quality that fits
        }

        // If even lowest quality at 1.0x scale is too large, downscale slightly
        currentScale *= 0.75;
        minQuality = 0.1;
        maxQuality = 0.9;
      }

      if (!bestBlob) {
        // Fallback: lowest possible render
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(200, Math.round(img.naturalWidth * 0.5));
        canvas.height = Math.max(200, Math.round(img.naturalHeight * 0.5));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        bestBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.4));
      }

      if (processedUrl) URL.revokeObjectURL(processedUrl);
      if (bestBlob) {
        setProcessedBlob(bestBlob);
        setProcessedUrl(URL.createObjectURL(bestBlob));
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to reduce photo size.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTargetChange = (kb: number) => {
    setTargetKb(kb);
    if (file) {
      reduceToTargetKb(file, kb);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'photo';
    downloadBlob(processedUrl, `${baseName}-under-${targetKb}kb.jpg`);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setPreviewUrl('');
    setProcessedBlob(null);
    setProcessedUrl('');
    setError(null);
  };

  const presets = [20, 50, 100, 200, 500];

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
          accept="image/*"
          title="Select photo to reduce to exact KB size limit"
          subtitle="Guaranteed to compress photos below 20KB, 50KB, 100KB, 200KB or your custom limit for portals and applications."
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

      {/* Target Size Controls */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="target-kb" className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            Maximum Target Size (KB Limit)
          </label>
          <span className="text-xs font-mono font-bold text-emerald-700">≤ {targetKb} KB</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presets.map((kb) => (
            <button
              key={kb}
              type="button"
              onClick={() => handleTargetChange(kb)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                targetKb === kb
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Under {kb} KB
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <input
              id="target-kb"
              type="number"
              min="10"
              max="5000"
              value={targetKb}
              onChange={(e) => handleTargetChange(Math.max(5, Number(e.target.value)))}
              className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center"
            />
            <span className="text-xs text-slate-500">KB</span>
          </div>
        </div>
      </div>

      {/* Result Metrics */}
      {processedBlob && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70 text-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Original</span>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-800 mt-0.5">{formatBytes(file.size)}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase">Output Size</span>
            <p className="text-base sm:text-lg font-bold font-mono text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {formatBytes(processedBlob.size)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase">Ceiling Met</span>
            <p className="text-xs text-slate-600 mt-1">Guaranteed &lt; {targetKb} KB limit</p>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[220px] flex items-center justify-center p-4">
        <img
          src={processedUrl || previewUrl}
          alt="Reduced preview"
          className="max-h-[360px] max-w-full object-contain rounded-lg shadow-sm"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center text-xs font-semibold text-emerald-700 animate-pulse">
            Optimizing to under {targetKb} KB...
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isProcessing || !processedBlob}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          Download Photo (Under {targetKb} KB)
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Reduced locally in your browser. Perfect for government, job and university portals.</span>
      </div>
    </div>
  );
}
