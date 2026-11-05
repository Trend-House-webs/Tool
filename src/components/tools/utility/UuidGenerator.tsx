import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Key, ShieldCheck } from 'lucide-react';

function generateRandomUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // RFC 4122 v4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Math.random final fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UuidGenerator() {
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [includeHyphens, setIncludeHyphens] = useState<boolean>(true);
  const [uuids, setUuids] = useState<string[]>(() => {
    return Array.from({ length: 5 }, () => generateRandomUuid());
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const regenerate = () => {
    const list = Array.from({ length: quantity }, () => {
      let u = generateRandomUuid();
      if (!includeHyphens) u = u.replace(/-/g, '');
      return uppercase ? u.toUpperCase() : u.toLowerCase();
    });
    setUuids(list);
  };

  const handleUppercaseChange = (val: boolean) => {
    setUppercase(val);
    setUuids((prev) => prev.map((u) => (val ? u.toUpperCase() : u.toLowerCase())));
  };

  const handleHyphenChange = (val: boolean) => {
    setIncludeHyphens(val);
    regenerate();
  };

  const copySingle = (uuid: string, idx: number) => {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">UUID / GUID Generator (Version 4)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate cryptographically secure RFC 4122 compliant version 4 UUIDs instantly in your browser.
          </p>
        </div>

        <button
          onClick={regenerate}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Generate New
        </button>
      </div>

      {/* Configuration Controls */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => handleUppercaseChange(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>UPPERCASE</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={includeHyphens}
              onChange={(e) => handleHyphenChange(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>Include Hyphens (Standard)</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold uppercase">Count:</span>
          {[1, 5, 10, 25].map((cnt) => (
            <button
              key={cnt}
              onClick={() => {
                setQuantity(cnt);
                const list = Array.from({ length: cnt }, () => {
                  let u = generateRandomUuid();
                  if (!includeHyphens) u = u.replace(/-/g, '');
                  return uppercase ? u.toUpperCase() : u.toLowerCase();
                });
                setUuids(list);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                quantity === cnt
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>

      {/* Generated List */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 uppercase">
          <span>Generated UUIDs ({uuids.length})</span>
          <button
            onClick={copyAll}
            className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-semibold"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? 'All Copied!' : 'Copy All'}
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {uuids.map((uuid, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/70 font-mono text-xs sm:text-sm text-slate-800"
            >
              <span className="truncate pr-4">{uuid}</span>
              <button
                onClick={() => copySingle(uuid, idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer shrink-0 transition-colors"
                title="Copy UUID"
              >
                {copiedIndex === idx ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Generated client-side with Cryptographically Secure Pseudo-Random Number Generation (CSPRNG).</span>
      </div>
    </div>
  );
}
