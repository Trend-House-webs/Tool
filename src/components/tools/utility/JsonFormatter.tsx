import React, { useState } from 'react';
import { Copy, Check, Download, AlertCircle, CheckCircle2, Code2, Sparkles } from 'lucide-react';
import { downloadBlob } from '../../../utils/fileHelpers';

const SAMPLE_JSON = `{
  "platform": "ToolNest",
  "tagline": "Everyday Tools. One Simple Place.",
  "features": [
    "Client-Side Execution",
    "No Accounts",
    "Lightning Fast"
  ],
  "stats": {
    "toolsAvailable": 40,
    "privacyCompliant": true
  }
}`;

export function JsonFormatter() {
  const [inputVal, setInputVal] = useState<string>(SAMPLE_JSON);
  const [indent, setIndent] = useState<number>(2);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formatJson = (spaces: number) => {
    try {
      const parsed = JSON.parse(inputVal);
      setValidationError(null);
      setInputVal(JSON.stringify(parsed, null, spaces));
    } catch (err: any) {
      setValidationError(err?.message || 'Invalid JSON syntax.');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(inputVal);
      setValidationError(null);
      setInputVal(JSON.stringify(parsed));
    } catch (err: any) {
      setValidationError(err?.message || 'Invalid JSON syntax.');
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(inputVal);
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err?.message || 'Invalid JSON syntax.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadBlob(new Blob([inputVal], { type: 'application/json' }), 'formatted.json');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => formatJson(indent)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Format / Beautify
          </button>
          <button
            type="button"
            onClick={minifyJson}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Minify / Compact
          </button>
          <select
            value={indent}
            onChange={(e) => {
              const sp = Number(e.target.value);
              setIndent(sp);
              formatJson(sp);
            }}
            className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            <option value={2}>2 Spaces Indent</option>
            <option value={4}>4 Spaces Indent</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            type="button"
            onClick={() => setInputVal(SAMPLE_JSON)}
            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Sample
          </button>
          <button
            type="button"
            onClick={() => setInputVal('')}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-600 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Validation Status Indicator */}
      {validationError ? (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">JSON Syntax Error:</strong>
            <span className="font-mono text-[11px]">{validationError}</span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Valid JSON Syntax</span>
        </div>
      )}

      {/* Main Editor Textarea */}
      <div className="relative">
        <textarea
          rows={14}
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            try {
              if (e.target.value.trim()) {
                JSON.parse(e.target.value);
                setValidationError(null);
              }
            } catch (err: any) {
              setValidationError(err?.message || 'Invalid syntax');
            }
          }}
          placeholder="Paste or write JSON here to format and validate..."
          className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm rounded-2xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed selection:bg-emerald-600 selection:text-white"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
