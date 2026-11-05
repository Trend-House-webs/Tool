import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Download, RefreshCw, ShieldCheck, AlertCircle, FileText, CheckCircle2, RotateCw } from 'lucide-react';
import { formatBytes, validatePdfFile } from '../../../utils/fileHelpers';

export function RotatePdfTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [targetScope, setTargetScope] = useState<'all' | 'custom'>('all');
  const [customPagesInput, setCustomPagesInput] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const val = validatePdfFile(file, 100);
    if (!val.valid) {
      setErrorMessage(val.error || 'Please select a valid PDF file.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedFile(file);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPageCount();
      setTotalPages(pages);
      setCustomPagesInput(`1${pages > 1 ? `-${Math.min(pages, 2)}` : ''}`);
    } catch {
      setErrorMessage('Failed to read PDF structure. The file might be password protected or corrupted.');
      setTotalPages(null);
    }
  };

  const parsePageNumbers = (input: string, max: number): number[] => {
    const pagesSet = new Set<number>();
    const parts = input.split(',').map((s) => s.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let p = Math.max(1, start); p <= Math.min(max, end); p++) {
            pagesSet.add(p);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= max) {
          pagesSet.add(p);
        }
      }
    }

    return Array.from(pagesSet).sort((a, b) => a - b);
  };

  const handleRotate = async () => {
    if (!selectedFile || !totalPages) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      let targetIndices: number[] = [];
      if (targetScope === 'all') {
        targetIndices = pages.map((_, i) => i);
      } else {
        const parsed = parsePageNumbers(customPagesInput, totalPages);
        if (parsed.length === 0) {
          throw new Error(`Please specify valid pages between 1 and ${totalPages}.`);
        }
        targetIndices = parsed.map((p) => p - 1);
      }

      targetIndices.forEach((idx) => {
        const page = pages[idx];
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + rotationAngle) % 360;
        page.setRotation(degrees(newRotation));
      });

      const rotatedBytes = await pdfDoc.save();
      const blob = new Blob([rotatedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const baseName = selectedFile.name.replace(/\.pdf$/i, '');
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${baseName}-rotated-${rotationAngle}deg.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

      setSuccessMessage(
        `Successfully rotated ${targetIndices.length} ${targetIndices.length === 1 ? 'page' : 'pages'} by ${rotationAngle}° (${formatBytes(blob.size)})!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while rotating the PDF.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Rotate PDF Pages</h2>
        <p className="text-sm text-slate-500 mt-1">
          Permanently rotate PDF pages 90, 180, or 270 degrees clockwise. Perfect for fixing scanned documents and sideways orientation.
        </p>
      </div>

      {/* Upload Box */}
      {!selectedFile ? (
        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer relative mb-6">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <RotateCw className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Click or drag & drop a PDF file here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select a PDF document to rotate
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatBytes(selectedFile.size)} · {totalPages ? `${totalPages} total pages` : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null);
              setTotalPages(null);
              setSuccessMessage(null);
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Choose another file
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {selectedFile && totalPages && (
        <div className="space-y-6 mb-6">
          {/* Rotation Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              Rotation Direction
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { angle: 90, label: '90° Clockwise', sub: 'Rotate Right' },
                { angle: 180, label: '180° Flip', sub: 'Upside Down' },
                { angle: 270, label: '270° (90° Left)', sub: 'Rotate Left' },
              ].map((opt) => (
                <button
                  key={opt.angle}
                  type="button"
                  onClick={() => setRotationAngle(opt.angle)}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer text-center ${
                    rotationAngle === opt.angle
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                  <span className="block text-2xs font-normal text-slate-500 mt-0.5">
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scope Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              Apply Rotation To
            </label>
            <div className="flex flex-wrap gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="targetScope"
                  checked={targetScope === 'all'}
                  onChange={() => setTargetScope('all')}
                  className="text-emerald-700 focus:ring-emerald-500"
                />
                <span>All pages in document ({totalPages} pages)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="targetScope"
                  checked={targetScope === 'custom'}
                  onChange={() => setTargetScope('custom')}
                  className="text-emerald-700 focus:ring-emerald-500"
                />
                <span>Specific pages only</span>
              </label>
            </div>

            {targetScope === 'custom' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customPagesInput}
                  onChange={(e) => setCustomPagesInput(e.target.value)}
                  placeholder={`e.g. 1, 3, 5-${Math.min(totalPages, 7)}`}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-2xs text-slate-500 mt-1">
                  Enter comma-separated page numbers or ranges between 1 and {totalPages}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Client-side processing: your document is rotated directly in browser memory without server uploads.</span>
        </div>

        <button
          onClick={handleRotate}
          disabled={!selectedFile || !totalPages || isProcessing}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <span>Rotating PDF...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Rotate & Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
