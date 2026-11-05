import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Sliders } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, validateImageFile, downloadBlob } from '../../../utils/fileHelpers';
import { compressImageClientSide, CompressionResult } from '../../../utils/imageCompression';

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string>('');
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [quality, setQuality] = useState<number>(75);
  const [exportAsWebp, setExportAsWebp] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'compressed' | 'original'>('compressed');

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, []);

  const handleSelectFile = (selectedFile: File) => {
    setError(null);
    const val = validateImageFile(selectedFile);
    if (!val.valid) {
      setError(val.error || 'Invalid image file.');
      return;
    }

    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);

    setFile(selectedFile);
    const objUrl = URL.createObjectURL(selectedFile);
    setOriginalPreviewUrl(objUrl);
    setCompressedUrl('');
    setResult(null);

    // Run initial compression
    runCompression(selectedFile, quality, exportAsWebp);
  };

  const runCompression = async (targetFile: File, q: number, toWebp: boolean) => {
    setIsProcessing(true);
    setError(null);

    try {
      let desiredFormat: 'image/jpeg' | 'image/png' | 'image/webp' | undefined = undefined;
      if (toWebp) {
        desiredFormat = 'image/webp';
      }

      const res = await compressImageClientSide(targetFile, q, desiredFormat);
      setResult(res);

      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      const newUrl = URL.createObjectURL(res.blob);
      setCompressedUrl(newUrl);
    } catch (err: any) {
      console.error('Compression error:', err);
      setError(err?.message || 'Failed to compress image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    if (file) {
      runCompression(file, newQuality, exportAsWebp);
    }
  };

  const handleWebpToggle = (checked: boolean) => {
    setExportAsWebp(checked);
    if (file) {
      runCompression(file, quality, checked);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl || !file) return;

    let extension = 'jpg';
    if (result) {
      extension = result.outputFormat === 'image/png' ? 'png' : result.outputFormat === 'image/webp' ? 'webp' : 'jpg';
    } else {
      extension = file.name.substring(file.name.lastIndexOf('.') + 1) || 'jpg';
    }

    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(compressedUrl, `${baseName}-compressed.${extension}`);
  };

  const handleReset = () => {
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null);
    setOriginalPreviewUrl('');
    setCompressedUrl('');
    setResult(null);
    setError(null);
    setQuality(75);
    setExportAsWebp(false);
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
          accept="image/jpeg,image/jpg,image/png,image/webp"
          title="Select JPG, PNG or WebP image to compress"
          subtitle="Drag & drop your file here, or click to browse. Processing runs locally in your browser."
        />
      </div>
    );
  }

  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Top File Summary & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 truncate">
            {file.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {result ? `${result.width} × ${result.height} px` : ''} · Original format: {file.type.replace('image/', '').toUpperCase()}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Choose Another Image
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Compression Result Banner */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <div className="text-center p-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Original
            </span>
            <span className="text-lg sm:text-xl font-bold text-slate-800">
              {formatBytes(result.originalSize)}
            </span>
          </div>

          <div className="text-center p-2 border-y sm:border-y-0 sm:border-x border-slate-200">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Compressed
            </span>
            <span className="text-lg sm:text-xl font-bold text-emerald-700">
              {formatBytes(result.outputSize)}
            </span>
          </div>

          <div className="text-center p-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Saved
            </span>
            <span
              className={`text-lg sm:text-xl font-bold ${
                result.savingsPercent > 0 ? 'text-emerald-600' : 'text-slate-600'
              }`}
            >
              {result.savingsPercent > 0 ? `${result.savingsPercent}%` : '0%'}
            </span>
          </div>
        </div>
      )}

      {/* Explanatory notice if already optimized */}
      {result?.isAlreadyOptimized && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950 mb-0.5">Notice</p>
            <p>Your image is already highly optimized. The processed file would be larger, so we kept the original.</p>
          </div>
        </div>
      )}

      {/* Controls: Quality Slider & Options */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <label htmlFor="quality-slider" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            Compression Quality: <span className="text-emerald-700">{quality}%</span>
          </label>
          <span className="text-xs text-slate-500 font-medium">
            {quality >= 85 ? 'High Clarity' : quality >= 60 ? 'Recommended Balance' : 'Smallest Size'}
          </span>
        </div>

        <input
          id="quality-slider"
          type="range"
          min="10"
          max="100"
          step="5"
          value={quality}
          onChange={(e) => handleQualityChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-hidden"
        />

        {/* Quality presets */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <button
            type="button"
            onClick={() => handleQualityChange(50)}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              quality === 50 ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            Max Compression (50%)
          </button>
          <button
            type="button"
            onClick={() => handleQualityChange(75)}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              quality === 75 ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            Balanced (75%)
          </button>
          <button
            type="button"
            onClick={() => handleQualityChange(90)}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              quality === 90 ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            High Quality (90%)
          </button>
        </div>

        {/* PNG specific controls */}
        {isPng && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">PNG Color Quantization Active</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Preserves Transparency
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              PNGs are compressed using 8-bit adaptive palette quantization with full alpha transparency preserved.
            </p>
            <label className="flex items-center gap-2 pt-1 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={exportAsWebp}
                onChange={(e) => handleWebpToggle(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
              />
              <span>Optional: Convert PNG to modern WebP format for even smaller web files</span>
            </label>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('compressed')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'compressed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compressed Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'original' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Original View
            </button>
          </div>

          {isProcessing && (
            <span className="text-xs text-emerald-700 font-medium animate-pulse flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Processing locally...
            </span>
          )}
        </div>

        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] min-h-[220px] max-h-[460px] flex items-center justify-center p-4">
          <img
            src={activeTab === 'compressed' && compressedUrl ? compressedUrl : originalPreviewUrl}
            alt="Compression Preview"
            className="max-h-[420px] max-w-full object-contain rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* Action Buttons: Compress & Download */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isProcessing || !compressedUrl}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          Download Compressed Image
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Privacy Guarantee */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your files are processed in your browser and are not uploaded to our server.</span>
      </div>
    </div>
  );
}
