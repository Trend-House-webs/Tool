import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, ShieldCheck, Crop as CropIcon, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';

export function CropImage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);

  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropW, setCropW] = useState<number>(100);
  const [cropH, setCropH] = useState<number>(100);
  const [aspectPreset, setAspectPreset] = useState<string>('free');

  const [croppedUrl, setCroppedUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initCropX: number; initCropY: number } | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
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
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      const w = Math.round(img.naturalWidth * 0.8);
      const h = Math.round(img.naturalHeight * 0.8);
      setCropW(w);
      setCropH(h);
      setCropX(Math.round((img.naturalWidth - w) / 2));
      setCropY(Math.round((img.naturalHeight - h) / 2));
    };
    img.src = url;
  };

  const applyPreset = (preset: string) => {
    setAspectPreset(preset);
    if (naturalWidth === 0 || naturalHeight === 0) return;

    if (preset === '1:1') {
      const size = Math.min(naturalWidth, naturalHeight);
      setCropW(size);
      setCropH(size);
      setCropX(Math.round((naturalWidth - size) / 2));
      setCropY(Math.round((naturalHeight - size) / 2));
    } else if (preset === '4:3') {
      let w = naturalWidth;
      let h = Math.round((w * 3) / 4);
      if (h > naturalHeight) {
        h = naturalHeight;
        w = Math.round((h * 4) / 3);
      }
      setCropW(w);
      setCropH(h);
      setCropX(Math.round((naturalWidth - w) / 2));
      setCropY(Math.round((naturalHeight - h) / 2));
    } else if (preset === '16:9') {
      let w = naturalWidth;
      let h = Math.round((w * 9) / 16);
      if (h > naturalHeight) {
        h = naturalHeight;
        w = Math.round((h * 16) / 9);
      }
      setCropW(w);
      setCropH(h);
      setCropX(Math.round((naturalWidth - w) / 2));
      setCropY(Math.round((naturalHeight - h) / 2));
    } else if (preset === '3:2') {
      let w = naturalWidth;
      let h = Math.round((w * 2) / 3);
      if (h > naturalHeight) {
        h = naturalHeight;
        w = Math.round((h * 3) / 2);
      }
      setCropW(w);
      setCropH(h);
      setCropX(Math.round((naturalWidth - w) / 2));
      setCropY(Math.round((naturalHeight - h) / 2));
    }
  };

  // Generate cropped preview
  useEffect(() => {
    if (!previewUrl || cropW <= 0 || cropH <= 0) return;

    const timer = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        canvas.toBlob((blob) => {
          if (blob) {
            if (croppedUrl) URL.revokeObjectURL(croppedUrl);
            setCroppedUrl(URL.createObjectURL(blob));
          }
        }, 'image/png');
      };
      img.src = previewUrl;
    }, 100);

    return () => clearTimeout(timer);
  }, [previewUrl, cropX, cropY, cropW, cropH]);

  const handleDownload = () => {
    if (!croppedUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(croppedUrl, `${baseName}-cropped.png`);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setFile(null);
    setPreviewUrl('');
    setCroppedUrl('');
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
          title="Select an image to crop"
          subtitle="Crop using standard aspect ratios (1:1, 4:3, 16:9, 3:2) or freeform"
        />
      </div>
    );
  }

  // Calculate percentage positions for visual crop overlay box
  const cropLeftPct = naturalWidth > 0 ? (cropX / naturalWidth) * 100 : 0;
  const cropTopPct = naturalHeight > 0 ? (cropY / naturalHeight) * 100 : 0;
  const cropWidthPct = naturalWidth > 0 ? (cropW / naturalWidth) * 100 : 100;
  const cropHeightPct = naturalHeight > 0 ? (cropH / naturalHeight) * 100 : 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 truncate max-w-sm">
            {file.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Original: {naturalWidth} × {naturalHeight} px · Cropped: {cropW} × {cropH} px
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
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Common Aspect Ratios
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'free', label: 'Freeform' },
                { id: '1:1', label: '1:1 Square' },
                { id: '4:3', label: '4:3 Standard' },
                { id: '16:9', label: '16:9 Wide' },
                { id: '3:2', label: '3:2 Photo' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    aspectPreset === p.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Crop Width (px)</label>
                <input
                  type="number"
                  min="10"
                  max={naturalWidth}
                  value={cropW}
                  onChange={(e) => setCropW(Math.min(naturalWidth, Math.max(10, Number(e.target.value))))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Crop Height (px)</label>
                <input
                  type="number"
                  min="10"
                  max={naturalHeight}
                  value={cropH}
                  onChange={(e) => setCropH(Math.min(naturalHeight, Math.max(10, Number(e.target.value))))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Offset X (Left)</label>
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, naturalWidth - cropW)}
                  value={cropX}
                  onChange={(e) => setCropX(Math.max(0, Math.min(naturalWidth - cropW, Number(e.target.value))))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Offset Y (Top)</label>
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, naturalHeight - cropH)}
                  value={cropY}
                  onChange={(e) => setCropY(Math.max(0, Math.min(naturalHeight - cropH, Number(e.target.value))))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={!croppedUrl}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download Cropped Image
          </button>
        </div>

        {/* Visual Crop Overlay Preview */}
        <div className="lg:col-span-2 flex flex-col bg-slate-100 rounded-xl p-4 border border-slate-200 overflow-hidden min-h-[360px] justify-center items-center">
          <div className="relative inline-block max-h-[340px] max-w-full">
            <img
              src={previewUrl}
              alt="Source preview"
              className="max-h-[340px] max-w-full object-contain rounded shadow-xs select-none pointer-events-none"
            />
            {/* Visual crop rectangle overlay */}
            <div
              className="absolute border-2 border-emerald-500 bg-emerald-600/10 pointer-events-none shadow-sm"
              style={{
                left: `${cropLeftPct}%`,
                top: `${cropTopPct}%`,
                width: `${cropWidthPct}%`,
                height: `${cropHeightPct}%`,
              }}
            >
              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-mono rounded">
                {cropW} × {cropH}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-600 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your files are processed in your browser and are not uploaded to our server.</span>
      </div>
    </div>
  );
}
