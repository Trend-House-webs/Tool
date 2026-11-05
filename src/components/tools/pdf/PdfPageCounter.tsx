import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileText, RefreshCw, ShieldCheck, AlertCircle, Copy, Check, Hash } from 'lucide-react';
import { formatBytes, validatePdfFile } from '../../../utils/fileHelpers';

interface PageDimension {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  widthInches: number;
  heightInches: number;
  widthMm: number;
  heightMm: number;
  orientation: 'Portrait' | 'Landscape' | 'Square';
}

interface PdfInspectionResult {
  fileName: string;
  fileSizeBytes: number;
  pageCount: number;
  author?: string;
  title?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pageDimensions: PageDimension[];
}

export function PdfPageCounter() {
  const [result, setResult] = useState<PdfInspectionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const val = validatePdfFile(file, 100);
    if (!val.valid) {
      setErrorMessage(val.error || 'Please select a valid PDF file.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPages();
      const pageCount = pages.length;

      const dimensions: PageDimension[] = pages.slice(0, 10).map((page, idx) => {
        const { width, height } = page.getSize();
        const widthInches = Number((width / 72).toFixed(2));
        const heightInches = Number((height / 72).toFixed(2));
        const widthMm = Math.round(widthInches * 25.4);
        const heightMm = Math.round(heightInches * 25.4);

        let orientation: 'Portrait' | 'Landscape' | 'Square' = 'Portrait';
        if (width > height) orientation = 'Landscape';
        else if (width === height) orientation = 'Square';

        return {
          pageNumber: idx + 1,
          widthPt: Math.round(width),
          heightPt: Math.round(height),
          widthInches,
          heightInches,
          widthMm,
          heightMm,
          orientation,
        };
      });

      const title = doc.getTitle();
      const author = doc.getAuthor();
      const creator = doc.getCreator();
      const producer = doc.getProducer();
      const creationDate = doc.getCreationDate() ? doc.getCreationDate()?.toLocaleString() : undefined;
      const modificationDate = doc.getModificationDate() ? doc.getModificationDate()?.toLocaleString() : undefined;

      setResult({
        fileName: file.name,
        fileSizeBytes: file.size,
        pageCount,
        title,
        author,
        creator,
        producer,
        creationDate,
        modificationDate,
        pageDimensions: dimensions,
      });
    } catch {
      setErrorMessage('Could not parse PDF. The document may be password-protected or have damaged tables.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyVal = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">PDF Page Counter & Size Inspector</h2>
        <p className="text-sm text-slate-500 mt-1">
          Instantly determine the exact page count, dimensions (points, inches, mm), and file size of any PDF file.
        </p>
      </div>

      {!result ? (
        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer relative mb-6">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFile(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Hash className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {isLoading ? 'Counting pages & analyzing...' : 'Click or drop a PDF file to count pages'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports any PDF document regardless of size. Local client-side inspection.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 mb-6">
          {/* Top Key Metric Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Total Pages</p>
              <p className="text-3xl font-extrabold text-emerald-950 mt-1">{result.pageCount}</p>
              <p className="text-2xs text-emerald-700/80 mt-1">
                {result.pageCount === 1 ? 'Single-page document' : `Multi-page document (${result.pageCount} pages)`}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">File Size</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatBytes(result.fileSizeBytes)}</p>
              <p className="text-2xs text-slate-500 mt-1">
                Average {(result.fileSizeBytes / (result.pageCount || 1) / 1024).toFixed(1)} KB per page
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Page 1 Dimensions</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {result.pageDimensions[0] ? `${result.pageDimensions[0].widthMm} × ${result.pageDimensions[0].heightMm} mm` : 'N/A'}
              </p>
              <p className="text-2xs text-slate-500 mt-1">
                {result.pageDimensions[0] ? `${result.pageDimensions[0].orientation} (${result.pageDimensions[0].widthInches} × ${result.pageDimensions[0].heightInches} in)` : ''}
              </p>
            </div>
          </div>

          {/* Document Properties Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Document Details
              </span>
              <button
                onClick={() => setResult(null)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Check another file
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50">
                <span className="text-slate-500 font-medium">File Name</span>
                <span className="col-span-2 text-slate-800 font-mono break-all">{result.fileName}</span>
              </div>
              {result.title && (
                <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50">
                  <span className="text-slate-500 font-medium">PDF Title</span>
                  <span className="col-span-2 text-slate-800">{result.title}</span>
                </div>
              )}
              {result.author && (
                <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50">
                  <span className="text-slate-500 font-medium">Author</span>
                  <span className="col-span-2 text-slate-800">{result.author}</span>
                </div>
              )}
              {result.producer && (
                <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50">
                  <span className="text-slate-500 font-medium">Producer / Software</span>
                  <span className="col-span-2 text-slate-800">{result.producer}</span>
                </div>
              )}
              {result.creationDate && (
                <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50">
                  <span className="text-slate-500 font-medium">Created On</span>
                  <span className="col-span-2 text-slate-800">{result.creationDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Security Guarantee */}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-200 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Client-Side Processing. The file is read locally using your browser JavaScript engine without server file upload.</span>
      </div>
    </div>
  );
}
