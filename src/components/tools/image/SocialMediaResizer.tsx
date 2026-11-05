import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Share2, ShieldCheck, Sliders, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';

interface SocialPreset {
  id: string;
  platform: string;
  name: string;
  width: number;
  height: number;
}

const PRESETS: SocialPreset[] = [
  { id: 'ig-square', platform: 'Instagram', name: 'Square Post', width: 1080, height: 1080 },
  { id: 'ig-portrait', platform: 'Instagram', name: 'Portrait Post', width: 1080, height: 1350 },
  { id: 'ig-landscape', platform: 'Instagram', name: 'Landscape Post', width: 1080, height: 566 },
  { id: 'fb-post', platform: 'Facebook', name: 'Feed Post', width: 1200, height: 630 },
  { id: 'yt-thumb', platform: 'YouTube', name: 'Video Thumbnail', width: 1280, height: 720 },
  { id: 'li-post', platform: 'LinkedIn', name: 'Shared Post', width: 1200, height: 627 },
  { id: 'tw-post', platform: 'X / Twitter', name: 'Feed Post', width: 1200, height: 675 },
  { id: 'ig-story', platform: 'Instagram', name: 'Story / Reel', width: 1080, height: 1920 },
];

export function SocialMediaResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(630);
  const [mode, setMode] = useState<'cover' | 'contain'>('cover');
  const [padColor, setPadColor] = useState<string>('#ffffff');
  const [renderedUrl, setRenderedUrl] = useState<string>('');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (renderedUrl) URL.revokeObjectURL(renderedUrl);
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
    if (renderedUrl) URL.revokeObjectURL(renderedUrl);

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const activeWidth = isCustom ? customWidth : (PRESETS.find((p) => p.id === selectedPresetId)?.width || 1080);
  const activeHeight = isCustom ? customHeight : (PRESETS.find((p) => p.id === selectedPresetId)?.height || 1080);

  useEffect(() => {
    if (!previewUrl || activeWidth <= 0 || activeHeight <= 0) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = activeWidth;
      canvas.height = activeHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const targetRatio = canvas.width / canvas.height;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      if (mode === 'cover') {
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > targetRatio) {
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        } else {
          drawHeight = canvas.width / imgRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        // Pad mode
        ctx.fillStyle = padColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let drawWidth = canvas.width;
        let drawHeight = canvas.height;

        if (imgRatio > targetRatio) {
          drawHeight = canvas.width / imgRatio;
        } else {
          drawWidth = canvas.height * imgRatio;
        }

        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          if (renderedUrl) URL.revokeObjectURL(renderedUrl);
          setRenderedUrl(URL.createObjectURL(blob));
        }
      }, 'image/jpeg', 0.92);
    };
    img.src = previewUrl;
  }, [previewUrl, activeWidth, activeHeight, mode, padColor]);

  const handleDownload = () => {
    if (!renderedUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    const tag = isCustom ? `custom-${activeWidth}x${activeHeight}` : selectedPresetId;
    downloadBlob(renderedUrl, `${baseName}-${tag}.jpg`);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (renderedUrl) URL.revokeObjectURL(renderedUrl);
    setFile(null);
    setPreviewUrl('');
    setRenderedUrl('');
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
          title="Select an image for social media resizing"
          subtitle="One-click presets for Instagram, Facebook, YouTube, LinkedIn, X/Twitter, or custom dimensions"
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
            Target Canvas: {activeWidth} × {activeHeight} px
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">Format Selection</label>
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-[11px] text-emerald-700 font-medium hover:underline cursor-pointer"
              >
                {isCustom ? 'Switch to Presets' : 'Custom Dimensions'}
              </button>
            </div>

            {isCustom ? (
              <div className="grid grid-cols-2 gap-2 p-3 bg-white border border-slate-200 rounded-lg">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Width (px)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(50, Number(e.target.value)))}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Height (px)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(50, Number(e.target.value)))}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="text-slate-500 mr-1.5">{preset.platform}:</span>
                        <span>{preset.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {preset.width}×{preset.height}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fit Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('cover')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  mode === 'cover' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cover / Fill
              </button>
              <button
                type="button"
                onClick={() => setMode('contain')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  mode === 'contain' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fit / Pad
              </button>
            </div>
          </div>

          {mode === 'contain' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Background Padding Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={padColor}
                  onChange={(e) => setPadColor(e.target.value)}
                  className="w-8 h-8 p-0.5 border border-slate-300 rounded cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setPadColor('#ffffff')}
                  className="px-2 py-1 text-xs bg-white border border-slate-200 rounded font-medium text-slate-700 cursor-pointer"
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => setPadColor('#000000')}
                  className="px-2 py-1 text-xs bg-white border border-slate-200 rounded font-medium text-slate-700 cursor-pointer"
                >
                  Black
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={!renderedUrl}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download {activeWidth}×{activeHeight} Image
          </button>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center items-center bg-slate-100 rounded-xl p-4 border border-slate-200 overflow-hidden min-h-[300px]">
          {renderedUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={renderedUrl}
                alt="Social media resized preview"
                className="max-h-[340px] max-w-full object-contain rounded-lg shadow-xs"
              />
              <span className="text-[11px] text-slate-400 mt-2">
                Output: {activeWidth} × {activeHeight} px ({mode === 'cover' ? 'Filled' : 'Padded'})
              </span>
            </div>
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
