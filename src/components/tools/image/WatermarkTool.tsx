import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Stamp, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';

export function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState<string>('© ToolNest');
  const [fontSize, setFontSize] = useState<number>(36);
  const [opacity, setOpacity] = useState<number>(75);
  const [color, setColor] = useState<string>('#ffffff');
  const [position, setPosition] = useState<string>('bottom-right');
  const [watermarkedUrl, setWatermarkedUrl] = useState<string>('');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (watermarkedUrl) URL.revokeObjectURL(watermarkedUrl);
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
    if (watermarkedUrl) URL.revokeObjectURL(watermarkedUrl);

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw base image
      ctx.drawImage(img, 0, 0);

      if (watermarkText.trim()) {
        ctx.save();
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.globalAlpha = opacity / 100;
        ctx.fillStyle = color;

        // Shadow for high contrast on any photo
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const metrics = ctx.measureText(watermarkText);
        const textWidth = metrics.width;
        const padding = Math.max(20, fontSize * 0.8);

        let x = padding;
        let y = padding + fontSize;

        if (position.includes('center')) {
          x = (canvas.width - textWidth) / 2;
        } else if (position.includes('right')) {
          x = canvas.width - textWidth - padding;
        }

        if (position.startsWith('center')) {
          y = canvas.height / 2 + fontSize / 3;
        } else if (position.startsWith('bottom')) {
          y = canvas.height - padding;
        }

        ctx.fillText(watermarkText, x, y);
        ctx.restore();
      }

      canvas.toBlob((blob) => {
        if (blob) {
          if (watermarkedUrl) URL.revokeObjectURL(watermarkedUrl);
          setWatermarkedUrl(URL.createObjectURL(blob));
        }
      }, 'image/png');
    };
    img.src = previewUrl;
  }, [previewUrl, watermarkText, fontSize, opacity, color, position]);

  const handleDownload = () => {
    if (!watermarkedUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(watermarkedUrl, `${baseName}-watermarked.png`);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (watermarkedUrl) URL.revokeObjectURL(watermarkedUrl);
    setFile(null);
    setPreviewUrl('');
    setWatermarkedUrl('');
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
          title="Select an image to add a watermark"
          subtitle="Apply text watermark with custom placement, opacity, and styling"
        />
      </div>
    );
  }

  const positions = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-center', label: 'Top Center' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'center-left', label: 'Mid Left' },
    { id: 'center', label: 'Center' },
    { id: 'center-right', label: 'Mid Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 truncate max-w-sm">
            {file.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add custom copyright or creator mark directly in your browser.
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
        <div className="space-y-4 bg-slate-50/70 p-5 rounded-xl border border-slate-200/70">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Watermark Text
            </label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="e.g. © My Brand 2026"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Font Size</span>
                <span className="font-mono text-emerald-700">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Opacity</span>
                <span className="font-mono text-emerald-700">{opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 p-0.5 border border-slate-300 rounded cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setColor('#ffffff')}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setColor('#000000')}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Black
              </button>
              <button
                type="button"
                onClick={() => setColor('#2563eb')}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Blue
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Position Anchor
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {positions.map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setPosition(pos.id)}
                  className={`py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
                    position === pos.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={!watermarkedUrl}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download Watermarked Image
          </button>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center items-center bg-slate-100 rounded-xl p-4 border border-slate-200 overflow-hidden min-h-[300px]">
          {watermarkedUrl ? (
            <img
              src={watermarkedUrl}
              alt="Watermark preview"
              className="max-h-[360px] max-w-full object-contain rounded-lg shadow-xs"
            />
          ) : (
            <div className="text-slate-400 text-sm">Rendering preview...</div>
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
