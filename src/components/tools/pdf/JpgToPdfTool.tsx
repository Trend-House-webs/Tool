import React, { useState } from 'react';
import { Download, Trash2, ArrowUp, ArrowDown, Plus, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageDropzone } from '../image/ImageDropzone';
import { validateImageFile, formatBytes, downloadBlob } from '../../../utils/fileHelpers';
import { createImagesPdf } from '../../../utils/pdfGenerator';

interface UploadedJpg {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

export function JpgToPdfTool() {
  const [images, setImages] = useState<UploadedJpg[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [margin, setMargin] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFiles = (file: File) => {
    setError(null);
    const val = validateImageFile(file);
    if (!val.valid) {
      setError(val.error || 'Invalid file format.');
      return;
    }

    const newImg: UploadedJpg = {
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    };
    setImages((prev) => [...prev, newImg]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setImages(copy);
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    setError(null);

    try {
      const pdfBlob = await createImagesPdf(images, {
        pageSize,
        orientation,
        marginMm: margin,
      });

      downloadBlob(pdfBlob, 'converted-document.pdf');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to generate PDF document.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Convert JPG Photos to High-Quality PDF
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {images.length} {images.length === 1 ? 'image' : 'images'} queued · Client-side PDF 1.4 compilation
          </p>
        </div>
        {images.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropzone */}
      <ImageDropzone
        onImageSelected={handleSelectFiles}
        accept="image/jpeg,image/jpg"
        title="Add JPG / JPEG images to convert"
        subtitle="Upload one or multiple photos to merge into a single PDF document."
      />

      {/* Document Layout Options */}
      {images.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Page Layout Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label htmlFor="jpg-page-size" className="block font-semibold text-slate-700 mb-1">Standard Page Size</label>
              <select
                id="jpg-page-size"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                <option value="a4">A4 (210 × 297 mm)</option>
                <option value="letter">US Letter (8.5 × 11 in)</option>
              </select>
            </div>
            <div>
              <label htmlFor="jpg-orientation" className="block font-semibold text-slate-700 mb-1">Orientation</label>
              <select
                id="jpg-orientation"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'p' | 'l')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                <option value="p">Portrait (Vertical)</option>
                <option value="l">Landscape (Horizontal)</option>
              </select>
            </div>
            <div>
              <label htmlFor="jpg-margin" className="block font-semibold text-slate-700 mb-1">Margin ({margin} mm)</label>
              <select
                id="jpg-margin"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                <option value={0}>No Margin (Edge-to-Edge)</option>
                <option value={5}>Compact (5 mm)</option>
                <option value={10}>Standard (10 mm)</option>
                <option value={20}>Wide (20 mm)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Queued Images List */}
      {images.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Document Pages ({images.length})
          </span>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {images.map((img, idx) => (
              <div key={img.id} className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-slate-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <img src={img.previewUrl} alt="" className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{img.name}</p>
                    <p className="text-[11px] text-slate-500">{formatBytes(img.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveImage(idx, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => moveImage(idx, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="p-1 text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action CTA */}
      {images.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={generatePdf}
            disabled={isGenerating}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Compiling PDF locally...' : `Download PDF (${images.length} ${images.length === 1 ? 'Page' : 'Pages'})`}
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Client-side processing: your photos are compiled directly in browser memory without server uploads.</span>
      </div>
    </div>
  );
}
