import React, { useState } from 'react';
import { Copy, Check, Type, AlertCircle } from 'lucide-react';

export function CharacterCounter() {
  const [text, setText] = useState<string>('Simple, fast, free tools for everyday tasks. Designed to run completely client-side in your modern web browser.');
  const [copied, setCopied] = useState<boolean>(false);
  const [customLimit, setCustomLimit] = useState<string>('280');
  const [enableLimit, setEnableLimit] = useState<boolean>(true);

  const charCount = text.length;
  const charNoSpaces = text.replace(/\s+/g, '').length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;
  const byteSize = new Blob([text]).size;

  const maxLimitNum = parseInt(customLimit, 10) || 0;
  const charsRemaining = maxLimitNum - charCount;
  const isOverLimit = enableLimit && maxLimitNum > 0 && charCount > maxLimitNum;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toUppercase = () => setText(text.toUpperCase());
  const toLowercase = () => setText(text.toLowerCase());
  const toTitleCase = () => {
    setText(
      text.replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()
      )
    );
  };
  const trimSpaces = () => setText(text.replace(/\s+/g, ' ').trim());

  const presets = [
    { label: 'X / Twitter', limit: '280' },
    { label: 'SMS (1 Segment)', limit: '160' },
    { label: 'SEO Title', limit: '60' },
    { label: 'Meta Description', limit: '160' },
    { label: 'Instagram Bio', limit: '150' },
    { label: 'LinkedIn Post', limit: '3000' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className={`p-3 border rounded-xl text-center transition-colors ${
          isOverLimit ? 'bg-red-50 border-red-300' : 'bg-emerald-50/70 border-emerald-200/60'
        }`}>
          <span className="text-[11px] font-semibold text-emerald-800 uppercase">Characters</span>
          <p className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${isOverLimit ? 'text-red-600' : 'text-emerald-700'}`}>
            {charCount}
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">No Spaces</span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">{charNoSpaces}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Words</span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">{wordCount}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Lines</span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">{lineCount}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Size (Bytes)</span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">{byteSize}</p>
        </div>
      </div>

      {/* Optional Character Limit Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={enableLimit}
              onChange={(e) => setEnableLimit(e.target.checked)}
              className="accent-emerald-600 rounded cursor-pointer"
            />
            Maximum Character Limit:
          </label>
          <input
            type="number"
            min="1"
            max="100000"
            disabled={!enableLimit}
            value={customLimit}
            onChange={(e) => setCustomLimit(e.target.value)}
            className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-slate-900 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setEnableLimit(true);
                setCustomLimit(p.limit);
              }}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700 cursor-pointer"
            >
              {p.label} ({p.limit})
            </button>
          ))}
        </div>
      </div>

      {/* Limit Status Indicator */}
      {enableLimit && maxLimitNum > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className={isOverLimit ? 'text-red-600 font-bold flex items-center gap-1' : 'text-slate-600'}>
              {isOverLimit && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
              {isOverLimit
                ? `Exceeded limit by ${Math.abs(charsRemaining)} characters!`
                : `${charsRemaining} characters remaining`}
            </span>
            <span className="font-mono text-slate-500">
              {charCount} / {maxLimitNum}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverLimit ? 'bg-red-500' : (charCount / maxLimitNum) > 0.85 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, (charCount / maxLimitNum) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div>
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to count characters and inspect limits..."
          className={`w-full p-4 text-base text-slate-800 bg-slate-50/60 border rounded-2xl focus:bg-white focus:outline-hidden leading-relaxed font-sans ${
            isOverLimit ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-emerald-500'
          }`}
        />
      </div>

      {/* Transformers */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toUppercase}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            UPPERCASE
          </button>
          <button
            type="button"
            onClick={toLowercase}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            lowercase
          </button>
          <button
            type="button"
            onClick={toTitleCase}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Title Case
          </button>
          <button
            type="button"
            onClick={trimSpaces}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Clean Spaces
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          <button
            type="button"
            onClick={() => setText('')}
            className="px-3 py-1.5 text-slate-500 hover:text-red-600 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
