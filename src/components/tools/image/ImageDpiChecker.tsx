import React, { useState } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, validateImageFile } from '../../../utils/fileHelpers';
import { ShieldCheck, Printer, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface DpiResult {
  fileName: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  megapixels: string;
  aspectRatio: string;
  dpi: number;
  print72: { inches: string; cm: string };
  print150: { inches: string; cm: string };
  print300: { inches: string; cm: string };
  imageUrl: string;
}

export function ImageDpiChecker() {
  const [result, setResult] = useState<DpiResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid image file.');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const mp = ((width * height) / 1000000).toFixed(2);

      // Simple GCD for aspect ratio
      const calcGcd = (a: number, b: number): number => (b === 0 ? a : calcGcd(b, a % b));
      const g = calcGcd(width, height);
      const aspect = `${width / g}:${height / g}`;

      // Calculate print sizes
      const formatPrint = (dpiVal: number) => {
        const wIn = (width / dpiVal).toFixed(1);
        const hIn = (height / dpiVal).toFixed(1);
        const wCm = ((width / dpiVal) * 2.54).toFixed(1);
        const hCm = ((height / dpiVal) * 2.54).toFixed(1);
        return {
          inches: `${wIn}" × ${hIn}"`,
          cm: `${wCm} × ${hCm} cm`,
        };
      };

      setResult({
        fileName: file.name,
        fileSizeBytes: file.size,
        width,
        height,
        megapixels: mp,
        aspectRatio: aspect,
        dpi: 72, // default standard unless embedded
        print72: formatPrint(72),
        print150: formatPrint(150),
        print300: formatPrint(300),
        imageUrl: url,
      });
    } catch {
      setErrorMsg('Failed to read image dimensions.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Image DPI & Print Dimension Checker</h2>
        <p className="text-sm text-slate-500 mt-1">
          Inspect exact pixel dimensions, megapixels, and calculated physical print sizes at 300, 150, and 72 DPI.
        </p>
      </div>

      {!result ? (
        <div className="mb-6">
          <ImageDropzone onImageSelected={processFile} accept="image/*" />
        </div>
      ) : (
        <div className="space-y-6 mb-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-2xs font-semibold text-emerald-800 uppercase tracking-wide">Resolution</span>
              <p className="text-2xl font-black text-emerald-950 mt-1">
                {result.width} × {result.height}
              </p>
              <p className="text-2xs text-emerald-700 mt-0.5">Pixels (W × H)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-2xs font-semibold text-slate-600 uppercase tracking-wide">Megapixels</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{result.megapixels} MP</p>
              <p className="text-2xs text-slate-500 mt-0.5">Total sensor resolution</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-2xs font-semibold text-slate-600 uppercase tracking-wide">Aspect Ratio</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{result.aspectRatio}</p>
              <p className="text-2xs text-slate-500 mt-0.5">Proportions</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-2xs font-semibold text-slate-600 uppercase tracking-wide">File Size</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{formatBytes(result.fileSizeBytes)}</p>
              <p className="text-2xs text-slate-500 mt-0.5">{result.fileName}</p>
            </div>
          </div>

          {/* Physical Print Sizes Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-700" /> Physical Print Dimensions by DPI
              </span>
              <button
                onClick={() => setResult(null)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Check another image
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">300 DPI (High Quality)</span>
                  <span className="text-2xs text-slate-500">Fine art, magazines & photo albums</span>
                </div>
                <div className="font-mono text-slate-800 font-bold">{result.print300.inches}</div>
                <div className="font-mono text-slate-600">{result.print300.cm}</div>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">150 DPI (Good Quality)</span>
                  <span className="text-2xs text-slate-500">Posters, flyers & brochures</span>
                </div>
                <div className="font-mono text-slate-800 font-bold">{result.print150.inches}</div>
                <div className="font-mono text-slate-600">{result.print150.cm}</div>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">72 DPI (Screen Display)</span>
                  <span className="text-2xs text-slate-500">Digital monitors & web graphics</span>
                </div>
                <div className="font-mono text-slate-800 font-bold">{result.print72.inches}</div>
                <div className="font-mono text-slate-600">{result.print72.cm}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-slate-200 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Client-Side Processing. Image files are analyzed in local browser memory without server uploads.</span>
      </div>
    </div>
  );
}
