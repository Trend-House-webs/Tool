import React, { useState } from 'react';
import { Copy, Check, Calculator } from 'lucide-react';

export function AverageCalc() {
  const [inputStr, setInputStr] = useState<string>('12, 18, 25, 32, 18, 45, 50, 18, 62');
  const [copied, setCopied] = useState<boolean>(false);

  // Parse numbers
  const numbers = inputStr
    .split(/[\s,;\n]+/)
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));

  const count = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = count > 0 ? sum / count : 0;

  // Median
  const sorted = [...numbers].sort((a, b) => a - b);
  let median = 0;
  if (count > 0) {
    const mid = Math.floor(count / 2);
    median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // Mode
  const freq: Record<number, number> = {};
  numbers.forEach((n) => {
    freq[n] = (freq[n] || 0) + 1;
  });
  let maxFreq = 0;
  let modes: number[] = [];
  Object.entries(freq).forEach(([n, f]) => {
    if (f > maxFreq) {
      maxFreq = f;
      modes = [parseFloat(n)];
    } else if (f === maxFreq) {
      modes.push(parseFloat(n));
    }
  });
  const modeStr = count > 0 && maxFreq > 1 ? modes.join(', ') : 'No unique mode';

  // Range & Min/Max
  const min = count > 0 ? sorted[0] : 0;
  const max = count > 0 ? sorted[count - 1] : 0;
  const range = max - min;

  const handleCopy = () => {
    const summary = `Mean: ${mean.toFixed(2)}, Median: ${median}, Mode: ${modeStr}, Count: ${count}, Sum: ${sum}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <label htmlFor="numbers-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Enter Numbers (Separated by commas, spaces, or lines)
          </label>
          <textarea
            id="numbers-input"
            rows={3}
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            placeholder="e.g. 10, 15, 20, 25, 30"
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Primary Average Display */}
        <div className="p-6 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-center space-y-1">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Arithmetic Mean (Average)
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-700">
            {count > 0 ? (Number.isInteger(mean) ? mean : mean.toFixed(4).replace(/\.?0+$/, '')) : '0'}
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Calculated from <strong className="font-mono text-slate-800">{count}</strong> values with total sum of <strong className="font-mono text-slate-800">{sum}</strong>
          </p>
        </div>

        {/* Statistical Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-500">Median</span>
            <p className="text-lg font-bold font-mono text-slate-800 mt-1">{median}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-500">Mode</span>
            <p className="text-sm font-bold font-mono text-slate-800 mt-1.5 truncate">{modeStr}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-500">Range (Max - Min)</span>
            <p className="text-lg font-bold font-mono text-slate-800 mt-1">{range}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-500">Min / Max</span>
            <p className="text-xs font-bold font-mono text-slate-800 mt-2">{min} / {max}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Statistics'}
          </button>
          <button
            type="button"
            onClick={() => setInputStr('')}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
