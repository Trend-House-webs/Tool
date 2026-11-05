import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, Trash2, ArrowUp, ArrowDown, Plus, ShieldCheck, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { formatBytes, validatePdfFile } from '../../../utils/fileHelpers';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
}

export function MergePdfTool() {
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; size: number; totalPages: number } | null>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setSuccessInfo(null);

    const newItems: PdfFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const val = validatePdfFile(file, 100);
      if (!val.valid) {
        setErrorMessage(val.error || `"${file.name}" is not a valid PDF file.`);
        continue;
      }

      // Read page count using pdf-lib
      let pageCount: number | null = null;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        pageCount = doc.getPageCount();
      } catch {
        pageCount = null;
      }

      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        pageCount,
      });
    }

    setPdfFiles((prev) => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pdfFiles.length) return;

    setPdfFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIndex];
      copy[newIndex] = temp;
      return copy;
    });
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setErrorMessage('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      for (const item of pdfFiles) {
        const fileBuffer = await item.file.arrayBuffer();
        const pdfToCopy = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdfToCopy, pdfToCopy.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        totalPages += copiedPages.length;
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `merged-document-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

      setSuccessInfo({
        name: link.download,
        size: blob.size,
        totalPages,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to merge PDF files. Some files may be password protected or corrupted.';
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalInputPages = pdfFiles.reduce((acc, f) => acc + (f.pageCount || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Merge PDF Files</h2>
        <p className="text-sm text-slate-500 mt-1">
          Combine multiple PDF documents into one single file directly in your browser. Reorder files before merging.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer relative mb-6">
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click or drag & drop PDF files here
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Add 2 or more PDF documents to merge into a single file
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successInfo && (
        <div className="p-4 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <p className="font-semibold">PDFs merged successfully!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Downloaded: {successInfo.name} ({formatBytes(successInfo.size)}, {successInfo.totalPages} total pages).
            </p>
          </div>
        </div>
      )}

      {/* File List */}
      {pdfFiles.length > 0 && (
        <div className="mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>FILES TO MERGE ({pdfFiles.length}) — {totalInputPages} TOTAL PAGES</span>
            <button
              onClick={() => setPdfFiles([])}
              className="text-red-500 hover:text-red-700 cursor-pointer font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {pdfFiles.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <FileText className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-xs sm:text-sm max-w-xs sm:max-w-md">
                      {item.name}
                    </p>
                    <p className="text-2xs sm:text-xs text-slate-500">
                      {formatBytes(item.size)} {item.pageCount ? `· ${item.pageCount} ${item.pageCount === 1 ? 'page' : 'pages'}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveFile(idx, 'up')}
                    disabled={idx === 0}
                    aria-label="Move up"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveFile(idx, 'down')}
                    disabled={idx === pdfFiles.length - 1}
                    aria-label="Move down"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    aria-label="Remove"
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Documents are processed directly in your browser without server uploads.</span>
        </div>

        <button
          onClick={handleMerge}
          disabled={pdfFiles.length < 2 || isProcessing}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <span>Merging PDF Files...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Merge & Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
