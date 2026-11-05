import React, { useState } from 'react';
import { Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react';

export function RandomStringGenerator() {
  const [length, setLength] = useState<number>(32);
  const [count, setCount] = useState<number>(5);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSpecial, setUseSpecial] = useState<boolean>(false);
  const [customCharset, setCustomCharset] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [strings, setStrings] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const generateStrings = () => {
    let charset = '';
    if (useCustom && customCharset) {
      charset = customCharset;
    } else {
      if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (useNumbers) charset += '0123456789';
      if (useSpecial) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (!charset) {
      charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    }

    const results: string[] = [];
    const array = new Uint32Array(length);

    for (let c = 0; c < count; c++) {
      crypto.getRandomValues(array);
      let str = '';
      for (let i = 0; i < length; i++) {
        str += charset[array[i] % charset.length];
      }
      results.push(str);
    }

    setStrings(results);
  };

  // Generate on initial load
  React.useEffect(() => {
    generateStrings();
  }, []);

  const copySingle = (str: string, idx: number) => {
    navigator.clipboard.writeText(str);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(strings.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Random String & Token Generator</h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate cryptographically secure random alphanumeric strings, API tokens, and secret keys.
          </p>
        </div>

        <button
          onClick={generateStrings}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Generate
        </button>
      </div>

      {/* Controls */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-4">
        {/* Sliders for length and count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>String Length: {length} chars</span>
            </div>
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Quantity: {count} strings</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>

        {/* Charset checkboxes */}
        <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={useUpper}
              disabled={useCustom}
              onChange={(e) => setUseUpper(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>A-Z (Uppercase)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={useLower}
              disabled={useCustom}
              onChange={(e) => setUseLower(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>a-z (Lowercase)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={useNumbers}
              disabled={useCustom}
              onChange={(e) => setUseNumbers(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>0-9 (Numbers)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={useSpecial}
              disabled={useCustom}
              onChange={(e) => setUseSpecial(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>Symbols (!@#$%)</span>
          </label>
        </div>
      </div>

      {/* Output strings */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 uppercase">
          <span>Results ({strings.length})</span>
          <button
            onClick={copyAll}
            className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-semibold"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? 'All Copied!' : 'Copy All'}
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {strings.map((str, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/70 font-mono text-xs sm:text-sm text-slate-800"
            >
              <span className="truncate pr-4 select-all">{str}</span>
              <button
                onClick={() => copySingle(str, idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer shrink-0 transition-colors"
                title="Copy string"
              >
                {copiedIdx === idx ? (
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
