import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';
import { loadImageFromFile } from '../../../utils/imageCompression';

interface PassportPreset {
  id: string;
  name: string;
  country: string;
  widthPx: number;
  heightPx: number;
  dimensionsDesc: string;
}

const PRESETS: PassportPreset[] = [
  { id: 'us', name: 'US Passport / Visa', country: 'United States', widthPx: 600, heightPx: 600, dimensionsDesc: '2 × 2 inches (51 × 51 mm) @ 300 DPI' },
  { id: 'uk_eu', name: 'UK / Schengen Visa / EU', country: 'Europe / UK', widthPx: 413, heightPx: 531, dimensionsDesc: '35 × 45 mm @ 300 DPI' },
  { id: 'india', name: 'India Passport / OCI', country: 'India', widthPx: 600, heightPx: 600, dimensionsDesc: '51 × 51 mm (2 × 2 inches)' },
  { id: 'canada', name: 'Canada Passport', country: 'Canada', widthPx: 590, heightPx: 826, dimensionsDesc: '50 × 70 mm @ 300 DPI' },
  { id: 'australia', name: 'Australia Passport', country: 'Australia', widthPx: 413, heightPx: 531, dimensionsDesc: '35 × 45 mm @ 300 DPI' },
  { id: 'china', name: 'China Visa / Passport', country: 'China', widthPx: 390, heightPx: 567, dimensionsDesc: '33 × 48 mm @ 300 DPI' },
];

export function PassportPhotoResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PRESETS[0]);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
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
  };

  const handleDownload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      canvas.width = selectedPreset.widthPx;
      canvas.height = selectedPreset.heightPx;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context.');

      // Solid background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center crop-fit
      const targetRatio = canvas.width / canvas.height;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let renderW = canvas.width;
      let renderH = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        renderW = canvas.height * imgRatio;
        offsetX = (canvas.width - renderW) / 2;
      } else {
        renderH = canvas.width / imgRatio;
        offsetY = (canvas.height - renderH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

      canvas.toBlob((blob) => {
        setIsProcessing(false);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'passport-photo';
          downloadBlob(url, `${baseName}-${selectedPreset.id}.jpg`);
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        } else {
          setError('Failed to render passport photo.');
        }
      }, 'image/jpeg', 0.95);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Error processing passport photo.');
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
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
          accept="image/jpeg,image/png,image/webp"
          title="Select portrait photo to format for passport or visa"
          subtitle="Resize to official dimensions for US, EU, UK, Canada, India, and Australia with crisp 300 DPI compliance."
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

      {/* Preset Country Standards */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
          Select Passport / Visa Requirement
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESETS.map((p) => {
            const isSelected = selectedPreset.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPreset(p)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">{p.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{p.dimensionsDesc}</p>
                <p className="text-[11px] font-mono font-medium text-emerald-800 mt-0.5">{p.widthPx} × {p.heightPx} px</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background fill */}
      <div className="flex items-center gap-4 text-xs">
        <span className="font-semibold text-slate-700">Border / Fill Background:</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="passport-bg"
            checked={bgColor === '#ffffff'}
            onChange={() => setBgColor('#ffffff')}
            className="text-emerald-700"
          />
          <span>Pure White (#FFFFFF)</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="passport-bg"
            checked={bgColor === '#f8fafc'}
            onChange={() => setBgColor('#f8fafc')}
            className="text-emerald-700"
          />
          <span>Off-White / Light Gray</span>
        </label>
      </div>

      {/* Preview Container */}
      <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] min-h-[280px] flex items-center justify-center p-6">
        <div
          style={{
            aspectRatio: `${selectedPreset.widthPx} / ${selectedPreset.heightPx}`,
            maxHeight: '340px',
            backgroundColor: bgColor,
          }}
          className="relative rounded-lg shadow-md border-2 border-dashed border-emerald-400 overflow-hidden flex items-center justify-center"
        >
          <img
            src={previewUrl}
            alt="Passport crop preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white rounded text-[10px] font-mono">
            {selectedPreset.widthPx} × {selectedPreset.heightPx} px
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isProcessing}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          {isProcessing ? 'Processing locally...' : `Download ${selectedPreset.name} Photo`}
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Client-side processing: your photo is formatted locally in your browser memory without server uploads.</span>
      </div>
    </div>
  );
}
