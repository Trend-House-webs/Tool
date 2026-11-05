import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Dices } from 'lucide-react';

export function RandomNumberGen() {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(1);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [results, setResults] = useState<number[]>([42]);
  const [copied, setCopied] = useState<boolean>(false);

  const generate = () => {
    const minVal = Math.min(min, max);
    const maxVal = Math.max(min, max);
    const range = maxVal - minVal + 1;

    let targetCount = Math.max(1, Math.min(1000, count));
    if (!allowDuplicates && targetCount > range) {
      targetCount = range;
    }

    const picked: number[] = [];
    const used = new Set<number>();

    const getRandomInt = () => {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return minVal + (buf[0] % range);
    };

    while (picked.length < targetCount) {
      const n = getRandomInt();
      if (allowDuplicates || !used.has(n)) {
        used.add(n);
        picked.push(n);
      }
    }

    if (sortOrder === 'asc') picked.sort((a, b) => a - b);
    if (sortOrder === 'desc') picked.sort((a, b) => b - a);

    setResults(picked);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Results Banner */}
        <div className="p-6 bg-slate-50 border border-slate-200/90 rounded-2xl text-center space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Random Number Result
          </span>

          {results.length === 1 ? (
            <div className="text-5xl sm:text-6xl font-extrabold font-mono text-emerald-700">
              {results[0]}
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap justify-center gap-2">
              {results.map((n, i) => (
                <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded font-mono font-bold text-sm">
                  {n}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Dices className="w-4 h-4" />
              Generate Again
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="rand-min" className="block text-xs font-semibold text-slate-700 mb-1">Minimum (From)</label>
            <input
              id="rand-min"
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-center"
            />
          </div>

          <div>
            <label htmlFor="rand-max" className="block text-xs font-semibold text-slate-700 mb-1">Maximum (To)</label>
            <input
              id="rand-max"
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-center"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="rand-count" className="block text-xs font-semibold text-slate-700 mb-1">Quantity to Pick</label>
            <input
              id="rand-count"
              type="number"
              min="1"
              max="500"
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-center"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-700 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDuplicates}
              onChange={(e) => setAllowDuplicates(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>Allow Duplicate Numbers</span>
          </label>

          <div className="flex items-center gap-2">
            <span>Sort Output:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
            >
              <option value="none">Original Random</option>
              <option value="asc">Ascending (Low to High)</option>
              <option value="desc">Descending (High to Low)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
