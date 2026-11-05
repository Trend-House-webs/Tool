import React, { useState } from 'react';
import { Copy, Check, TrendingUp, RefreshCw } from 'lucide-react';

export function PercentageIncreaseCalc() {
  const [initialVal, setInitialVal] = useState<string>('80');
  const [finalVal, setFinalVal] = useState<string>('120');
  const [copied, setCopied] = useState<boolean>(false);

  const v1 = parseFloat(initialVal);
  const v2 = parseFloat(finalVal);

  const isValid = !isNaN(v1) && !isNaN(v2) && v1 !== 0;
  const difference = v2 - v1;
  const percentIncrease = isValid ? (difference / Math.abs(v1)) * 100 : 0;
  const multiplier = isValid ? (v2 / v1).toFixed(3) : '0';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${percentIncrease.toFixed(2)}%`);
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
            <label htmlFor="init-val" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Initial / Starting Value (V₁)
            </label>
            <input
              id="init-val"
              type="number"
              step="any"
              value={initialVal}
              onChange={(e) => setInitialVal(e.target.value)}
              placeholder="e.g. 80"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="final-val" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Final / New Value (V₂)
            </label>
            <input
              id="final-val"
              type="number"
              step="any"
              value={finalVal}
              onChange={(e) => setFinalVal(e.target.value)}
              placeholder="e.g. 120"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Result Card */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {percentIncrease >= 0 ? 'Percentage Increase' : 'Percentage Decrease'}
          </span>
          <div
            className={`text-4xl sm:text-5xl font-extrabold font-mono ${
              percentIncrease >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {percentIncrease >= 0 ? '+' : ''}
            {isFinite(percentIncrease) ? percentIncrease.toFixed(2) : '0'}%
          </div>

          <p className="text-xs text-slate-600 pt-1">
            Absolute change: <strong className="font-mono text-slate-800">{difference >= 0 ? `+${difference}` : difference}</strong> · Growth factor: <strong className="font-mono text-slate-800">{multiplier}×</strong>
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

        {/* Step-by-Step Mathematical Explanation */}
        <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-xs sm:text-sm text-slate-700 space-y-2">
          <p className="font-semibold text-emerald-950">Step-by-Step Calculation Breakdown:</p>
          <div className="font-mono text-xs bg-white p-3 rounded-lg border border-emerald-200 space-y-1 text-slate-800">
            <p>1. Difference = Final (V₂) - Initial (V₁) = {v2 || 0} - {v1 || 0} = {difference || 0}</p>
            <p>2. Divide by Initial = {difference || 0} ÷ {v1 || 1} = {(difference / (v1 || 1)).toFixed(4)}</p>
            <p>3. Multiply by 100 = <strong>{percentIncrease.toFixed(2)}%</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
