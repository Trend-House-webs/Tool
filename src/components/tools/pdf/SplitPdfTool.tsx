import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, RefreshCw, ShieldCheck, AlertCircle, FileText, CheckCircle2, Scissors } from 'lucide-react';
import { formatBytes, validatePdfFile } from '../../../utils/fileHelpers';

export function SplitPdfTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [pageRangeInput, setPageRangeInput] = useState<string>('1');
  const [splitMode, setSplitMode] = useState<'custom' | 'evenOdd'>('custom');
  const [evenOddChoice, setEvenOddChoice] = useState<'odd' | 'even'>('odd');
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
      setPageRangeInput(pages > 1 ? `1-${Math.min(pages, 3)}` : '1');
    } catch {
      setErrorMessage('Failed to read PDF structure. The file might be corrupted or password protected.');
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

  const handleSplit = async () => {
    if (!selectedFile || !totalPages) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    try {
      let pageIndicesToExtract: number[] = [];

      if (splitMode === 'custom') {
        const targetPages = parsePageNumbers(pageRangeInput, totalPages);
        if (targetPages.length === 0) {
          throw new Error(`Please specify valid pages between 1 and ${totalPages}. Example: 1-3, 5`);
        }
        pageIndicesToExtract = targetPages.map((p) => p - 1); // 0-indexed
      } else {
        // Even or Odd
        for (let i = 0; i < totalPages; i++) {
          const pageNumber = i + 1;
          if (evenOddChoice === 'odd' && pageNumber % 2 !== 0) {
            pageIndicesToExtract.push(i);
          } else if (evenOddChoice === 'even' && pageNumber % 2 === 0) {
            pageIndicesToExtract.push(i);
          }
        }
        if (pageIndicesToExtract.length === 0) {
          throw new Error(`No ${evenOddChoice} pages found in this document.`);
        }
      }

      const buffer = await selectedFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const copiedPages = await newDoc.copyPages(srcDoc, pageIndicesToExtract);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const newPdfBytes = await newDoc.save();
      const blob = new Blob([newPdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const baseName = selectedFile.name.replace(/\.pdf$/i, '');
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${baseName}-extracted-${pageIndicesToExtract.length}pages.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

      setSuccessMessage(
        `Successfully extracted ${pageIndicesToExtract.length} pages into a new PDF (${formatBytes(blob.size)})!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during PDF extraction.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Split & Extract PDF Pages</h2>
        <p className="text-sm text-slate-500 mt-1">
          Extract specific pages or page ranges from a PDF file. Fast, client-side, with in-browser processing.
        </p>
      </div>

      {/* File Upload Zone */}
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
              <Scissors className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Click or drag & drop a PDF file here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select a PDF document to split or extract pages from
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
          {/* Split Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              Extraction Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSplitMode('custom')}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer text-left ${
                  splitMode === 'custom'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Custom Range or Pages
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  e.g., 1-3, 5, 7
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('evenOdd')}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer text-left ${
                  splitMode === 'evenOdd'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Even / Odd Pages
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Extract only odd or even pages
                </span>
              </button>
            </div>
          </div>

          {/* Mode Configuration */}
          {splitMode === 'custom' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Pages to Extract (1 to {totalPages})
              </label>
              <input
                type="text"
                value={pageRangeInput}
                onChange={(e) => setPageRangeInput(e.target.value)}
                placeholder={`e.g. 1-${Math.min(totalPages, 5)}, 7`}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-2xs text-slate-500 mt-1">
                Enter single page numbers or ranges separated by commas. Example: <code className="bg-slate-100 px-1 py-0.5 rounded">1-3, 5, 8</code>
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Select Pages
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="evenOdd"
                    checked={evenOddChoice === 'odd'}
                    onChange={() => setEvenOddChoice('odd')}
                    className="text-emerald-700 focus:ring-emerald-500"
                  />
                  <span>Odd pages only (1, 3, 5...)</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="evenOdd"
                    checked={evenOddChoice === 'even'}
                    onChange={() => setEvenOddChoice('even')}
                    className="text-emerald-700 focus:ring-emerald-500"
                  />
                  <span>Even pages only (2, 4, 6...)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Files processed locally in browser. No data ever leaves your computer.</span>
        </div>

        <button
          onClick={handleSplit}
          disabled={!selectedFile || !totalPages || isProcessing}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <span>Extracting Pages...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Extract & Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
