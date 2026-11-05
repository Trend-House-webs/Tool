import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, downloadBlob, formatBytes } from '../../../utils/fileHelpers';

export function RotateFlipImage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
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
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const rotateCw = () => setRotation((prev) => (prev + 90) % 360);
  const rotateCcw = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const toggleFlipH = () => setFlipH((prev) => !prev);
  const toggleFlipV = () => setFlipV((prev) => !prev);

  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isSideways = rotation === 90 || rotation === 270;

      canvas.width = isSideways ? img.naturalHeight : img.naturalWidth;
      canvas.height = isSideways ? img.naturalWidth : img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          if (renderedUrl) URL.revokeObjectURL(renderedUrl);
          setRenderedUrl(URL.createObjectURL(blob));
        }
      }, 'image/png');
    };
    img.src = previewUrl;
  }, [previewUrl, rotation, flipH, flipV]);

  const handleDownload = () => {
    if (!renderedUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(renderedUrl, `${baseName}-transformed.png`);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (renderedUrl) URL.revokeObjectURL(renderedUrl);
    setFile(null);
    setPreviewUrl('');
    setRenderedUrl('');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
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
          title="Select an image to rotate or flip"
          subtitle="Rotate 90 degrees or mirror image horizontally/vertically"
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
            Rotation: {rotation}° · {flipH ? 'Flipped Horizontal' : 'Normal'} · {flipV ? 'Flipped Vertical' : ''}
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
              Rotate Controls
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={rotateCcw}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium rounded-lg text-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-emerald-700" />
                90° Left
              </button>
              <button
                type="button"
                onClick={rotateCw}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium rounded-lg text-slate-800 transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4 text-emerald-700" />
                90° Right
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Flip Controls
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleFlipH}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 border text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  flipH ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
                Flip Horizontal
              </button>
              <button
                type="button"
                onClick={toggleFlipV}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 border text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  flipV ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
                Flip Vertical
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRotation(0);
              setFlipH(false);
              setFlipV(false);
            }}
            className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            Reset Orientation
          </button>

          <button
            onClick={handleDownload}
            disabled={!renderedUrl}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download Transformed Image
          </button>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center items-center bg-slate-100 rounded-xl p-4 border border-slate-200 overflow-hidden min-h-[300px]">
          {renderedUrl ? (
            <img
              src={renderedUrl}
              alt="Transformed output"
              className="max-h-[360px] max-w-full object-contain rounded-lg shadow-xs"
            />
          ) : (
            <div className="text-slate-400 text-sm">Rendering...</div>
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
