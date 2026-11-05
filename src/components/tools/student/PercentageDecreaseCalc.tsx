import React, { useState } from 'react';
import { Copy, Check, TrendingDown } from 'lucide-react';

export function PercentageDecreaseCalc() {
  const [initialVal, setInitialVal] = useState<string>('150');
  const [finalVal, setFinalVal] = useState<string>('90');
  const [copied, setCopied] = useState<boolean>(false);

  const v1 = parseFloat(initialVal);
  const v2 = parseFloat(finalVal);

  const isValid = !isNaN(v1) && !isNaN(v2) && v1 !== 0;
  const reduction = v1 - v2;
  const percentDecrease = isValid ? (reduction / Math.abs(v1)) * 100 : 0;
  const remainingFactor = isValid ? ((v2 / v1) * 100).toFixed(1) : '0';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${percentDecrease.toFixed(2)}%`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInitialVal('');
    setFinalVal('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dec-init-val" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Original / Starting Value (V₁)
            </label>
            <input
              id="dec-init-val"
              type="number"
              step="any"
              value={initialVal}
              onChange={(e) => setInitialVal(e.target.value)}
              placeholder="e.g. 150"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="dec-final-val" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reduced / Discounted Value (V₂)
            </label>
            <input
              id="dec-final-val"
              type="number"
              step="any"
              value={finalVal}
              onChange={(e) => setFinalVal(e.target.value)}
              placeholder="e.g. 90"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Result Card */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Percentage Decrease / Discount
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-rose-600">
            -{isFinite(percentDecrease) ? percentDecrease.toFixed(2) : '0'}%
          </div>

          <p className="text-xs text-slate-600 pt-1">
            Total reduction: <strong className="font-mono text-slate-800">-{reduction}</strong> · Remaining value: <strong className="font-mono text-slate-800">{remainingFactor}%</strong> of original
          </p>

          <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Result'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Mathematical Breakdown */}
        <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-xs sm:text-sm text-slate-700 space-y-2">
          <p className="font-semibold text-emerald-950">Step-by-Step Percentage Decrease Formula:</p>
          <div className="font-mono text-xs bg-white p-3 rounded-lg border border-emerald-200 space-y-1 text-slate-800">
            <p>1. Reduction = Starting (V₁) - New (V₂) = {v1 || 0} - {v2 || 0} = {reduction || 0}</p>
            <p>2. Divide by Starting = {reduction || 0} ÷ {v1 || 1} = {(reduction / (v1 || 1)).toFixed(4)}</p>
            <p>3. Multiply by 100 = <strong>{percentDecrease.toFixed(2)}% reduction</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
