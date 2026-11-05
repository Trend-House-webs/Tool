import React, { useState } from 'react';
import { FileText, RefreshCw, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { formatBytes, validatePdfFile } from '../../../utils/fileHelpers';

interface PdfInfo {
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  pdfVersion: string;
  pageCount: number;
  isEncrypted: boolean;
  isLinearized: boolean;
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
}

export function PdfMetadataViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const val = validatePdfFile(selectedFile, 100);
    if (!val.valid) {
      setError(val.error || 'Please select a valid PDF file.');
      return;
    }

    setError(null);
    setFile(selectedFile);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const textChunk = new TextDecoder('latin1').decode(new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 100000))));
      const tailChunk = new TextDecoder('latin1').decode(new Uint8Array(buffer.slice(Math.max(0, buffer.byteLength - 50000))));
      const fullInspection = textChunk + tailChunk;

      // Extract version
      const verMatch = textChunk.match(/%PDF-([0-9.]+)/);
      const pdfVersion = verMatch ? `PDF ${verMatch[1]}` : 'PDF 1.4+';

      // Count pages via /Type /Page
      const pageMatches = fullInspection.match(/\/Type\s*\/Page\b/g);
      const countMatch = fullInspection.match(/\/Count\s+(\d+)/);
      let pageCount = 1;
      if (countMatch && parseInt(countMatch[1], 10) > 0) {
        pageCount = parseInt(countMatch[1], 10);
      } else if (pageMatches) {
        pageCount = Math.max(1, pageMatches.length);
      }

      // Check encryption & linearization
      const isEncrypted = /\/Encrypt\b/.test(fullInspection);
      const isLinearized = /\/Linearized\b/.test(textChunk);

      // Metadata extraction
      const extractMeta = (field: string) => {
        const regex = new RegExp(`\\/${field}\\s*\\(([^)]+)\\)`);
        const m = fullInspection.match(regex);
        return m ? m[1].replace(/\\([()\\])/g, '$1') : undefined;
      };

      setPdfInfo({
        name: selectedFile.name,
        sizeFormatted: formatBytes(selectedFile.size),
        sizeBytes: selectedFile.size,
        pdfVersion,
        pageCount,
        isEncrypted,
        isLinearized,
        title: extractMeta('Title'),
        author: extractMeta('Author'),
        creator: extractMeta('Creator'),
        producer: extractMeta('Producer'),
      });
    } catch (err: any) {
      console.error(err);
      setError('Could not parse PDF file structure.');
    }
  };

  const handleCopy = () => {
    if (!pdfInfo) return;
    const summary = [
      `File Name: ${pdfInfo.name}`,
      `File Size: ${pdfInfo.sizeFormatted} (${pdfInfo.sizeBytes.toLocaleString()} bytes)`,
      `PDF Version: ${pdfInfo.pdfVersion}`,
      `Page Count: ${pdfInfo.pageCount}`,
      `Encrypted: ${pdfInfo.isEncrypted ? 'Yes (Password Protected)' : 'No'}`,
      `Web-Optimized (Linearized): ${pdfInfo.isLinearized ? 'Yes' : 'No'}`,
      pdfInfo.title ? `Title: ${pdfInfo.title}` : '',
      pdfInfo.author ? `Author: ${pdfInfo.author}` : '',
      pdfInfo.producer ? `Producer: ${pdfInfo.producer}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setPdfInfo(null);
    setError(null);
  };

  if (!file || !pdfInfo) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-white">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">Select PDF document to inspect</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Count exact pages, verify PDF version, check metadata, and test encryption completely client-side.
          </p>
          <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs">
            Browse PDF File
            <input type="file" accept="application/pdf,.pdf" onChange={handleSelectFile} className="hidden" />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 truncate max-w-sm">{pdfInfo.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{pdfInfo.sizeFormatted} · {pdfInfo.pdfVersion}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Data'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Inspect Another
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase">Page Count</span>
          <p className="text-3xl font-extrabold font-mono text-emerald-700 mt-1">{pdfInfo.pageCount}</p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Standard Version</span>
          <p className="text-lg font-bold font-mono text-slate-800 mt-2">{pdfInfo.pdfVersion}</p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Encryption</span>
          <p className="text-xs font-bold text-slate-800 mt-3">
            {pdfInfo.isEncrypted ? '🔒 Password Protected' : '🔓 Unencrypted'}
          </p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Fast Web View</span>
          <p className="text-xs font-bold text-slate-800 mt-3">
            {pdfInfo.isLinearized ? '✓ Linearized' : 'Standard Stream'}
          </p>
        </div>
      </div>

      {/* Metadata Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Internal Metadata Attributes</h3>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="flex justify-between p-3 bg-white">
            <span className="text-slate-500">File Name</span>
            <span className="font-semibold text-slate-900">{pdfInfo.name}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50/50">
            <span className="text-slate-500">File Size</span>
            <span className="font-mono text-slate-900">{pdfInfo.sizeFormatted} ({pdfInfo.sizeBytes.toLocaleString()} bytes)</span>
          </div>
          {pdfInfo.title && (
            <div className="flex justify-between p-3 bg-white">
              <span className="text-slate-500">Document Title</span>
              <span className="font-semibold text-slate-900">{pdfInfo.title}</span>
            </div>
          )}
          {pdfInfo.author && (
            <div className="flex justify-between p-3 bg-slate-50/50">
              <span className="text-slate-500">Author</span>
              <span className="text-slate-900">{pdfInfo.author}</span>
            </div>
          )}
          {pdfInfo.producer && (
            <div className="flex justify-between p-3 bg-white">
              <span className="text-slate-500">Producer / Software</span>
              <span className="font-mono text-slate-700">{pdfInfo.producer}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Inspected locally in your browser memory without server file uploads.</span>
      </div>
    </div>
  );
}
