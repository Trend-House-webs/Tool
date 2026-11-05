import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, ShieldCheck } from 'lucide-react';
import { validateImageFile } from '../../../utils/fileHelpers';

interface ImageDropzoneProps {
  onImageSelected: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  onMultipleImagesSelected?: (files: File[]) => void;
  title?: string;
  subtitle?: string;
}

export function ImageDropzone({
  onImageSelected,
  accept = 'image/jpeg,image/png,image/webp,image/gif,image/bmp',
  multiple = false,
  onMultipleImagesSelected,
  title = 'Select an image to start',
  subtitle = 'Drag & drop image here or click to browse (JPG, PNG, WebP)',
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setErrorMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple && onMultipleImagesSelected) {
        const rawFiles = Array.from(e.dataTransfer.files);
        const validFiles: File[] = [];
        for (const f of rawFiles) {
          const val = validateImageFile(f);
          if (val.valid) validFiles.push(f);
        }
        if (validFiles.length > 0) {
          onMultipleImagesSelected(validFiles);
        } else {
          setErrorMessage('No valid image files found in drop.');
        }
      } else {
        const file = e.dataTransfer.files[0];
        const val = validateImageFile(file);
        if (val.valid) {
          onImageSelected(file);
        } else {
          setErrorMessage(val.error || 'Invalid image file.');
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files.length > 0) {
      if (multiple && onMultipleImagesSelected) {
        const rawFiles = Array.from(e.target.files);
        const validFiles: File[] = [];
        for (const f of rawFiles) {
          const val = validateImageFile(f);
          if (val.valid) validFiles.push(f);
        }
        if (validFiles.length > 0) {
          onMultipleImagesSelected(validFiles);
        } else {
          setErrorMessage('Please select valid image files.');
        }
      } else {
        const file = e.target.files[0];
        const val = validateImageFile(file);
        if (val.valid) {
          onImageSelected(file);
        } else {
          setErrorMessage(val.error || 'Invalid image file.');
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`group relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-white ${
          isDragOver
            ? 'border-emerald-600 bg-emerald-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            className="mt-2 inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors pointer-events-none"
          >
            Choose File{multiple ? 's' : ''}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Explicit Privacy Banner */}
      <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-600 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your files are processed in your browser and are not uploaded to our server.</span>
      </div>
    </div>
  );
}
