import React, { useState, useEffect } from 'react';
import { Download, Trash2, ArrowUp, ArrowDown, Plus, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageDropzone } from './ImageDropzone';
import { validateImageFile, formatBytes, downloadBlob } from '../../../utils/fileHelpers';
import { createImagesPdf } from '../../../utils/pdfGenerator';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export function ImageToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [margin, setMargin] = useState<number>(10);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  const handleAddFiles = (files: File[]) => {
    setError(null);
    const validItems: ImageItem[] = [];
    for (const file of files) {
      const val = validateImageFile(file);
      if (val.valid) {
        validItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    }

    if (validItems.length > 0) {
      setImages((prev) => [...prev, ...validItems]);
    } else {
      setError('Please select valid image files.');
    }
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
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

      const url = URL.createObjectURL(pdfBlob);
      downloadBlob(url, 'toolnest-images.pdf');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error('PDF generation error', err);
      setError(err?.message || 'Error generating PDF in browser');
    } finally {
      setIsGenerating(false);
    }
  };

  if (images.length === 0) {
    return (
      <ImageDropzone
        multiple
        onMultipleImagesSelected={handleAddFiles}
        onImageSelected={(f) => handleAddFiles([f])}
        title="Select images to combine into PDF"
        subtitle="Combine JPG, PNG, or WebP images into a multi-page PDF document"
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {images.length} Image{images.length > 1 ? 's' : ''} in Document
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag, reorder, or adjust margins before compiling your PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Add More Images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleAddFiles(Array.from(e.target.files));
              }}
            />
          </label>
          <button
            onClick={() => {
              images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
              setImages([]);
            }}
            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="space-y-5 bg-slate-50/70 p-5 rounded-xl border border-slate-200/70">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Page Orientation
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-lg">
              <button
                type="button"
                onClick={() => setOrientation('p')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  orientation === 'p' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation('l')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  orientation === 'l' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paper Format
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-lg">
              <button
                type="button"
                onClick={() => setPageSize('a4')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  pageSize === 'a4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => setPageSize('letter')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  pageSize === 'letter' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                US Letter
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Page Margins
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/60 rounded-lg">
              <button
                type="button"
                onClick={() => setMargin(0)}
                className={`py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  margin === 0 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => setMargin(10)}
                className={`py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  margin === 10 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10mm
              </button>
              <button
                type="button"
                onClick={() => setMargin(20)}
                className={`py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  margin === 20 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                20mm
              </button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Total Pages:</span>
              <span className="font-semibold text-slate-900">{images.length}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Format:</span>
              <span className="text-slate-900">{pageSize.toUpperCase()} ({orientation === 'p' ? 'Portrait' : 'Landscape'})</span>
            </div>
          </div>

          <button
            onClick={generatePdf}
            disabled={isGenerating || images.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Compiling PDF...' : 'Download PDF Document'}
          </button>
        </div>

        {/* Image Pages Grid */}
        <div className="lg:col-span-2 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {images.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.file.name}</p>
                  <p className="text-xs text-slate-400">Page {index + 1} · {formatBytes(item.file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200/50 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200/50 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 cursor-pointer"
                  title="Remove page"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-600 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your files are processed in your browser and are not uploaded to our server.</span>
      </div>
    </div>
  );
}
