import React, { useState } from 'react';
import { Copy, Check, Calculator, RefreshCw } from 'lucide-react';

export function PercentageCalculator() {
  const [activeTab, setActiveTab] = useState<'mode1' | 'mode2' | 'mode3'>('mode1');
  const [copied, setCopied] = useState<boolean>(false);

  // Mode 1: What is X% of Y?
  const [p1, setP1] = useState<string>('20');
  const [v1, setV1] = useState<string>('150');

  // Mode 2: X is what % of Y?
  const [p2, setP2] = useState<string>('45');
  const [v2, setV2] = useState<string>('180');

  // Mode 3: Percentage increase / decrease from X to Y
  const [p3, setP3] = useState<string>('120');
  const [v3, setV3] = useState<string>('150');

  // Calculation 1
  const numP1 = parseFloat(p1) || 0;
  const numV1 = parseFloat(v1) || 0;
  const result1 = (numP1 / 100) * numV1;

  // Calculation 2
  const numP2 = parseFloat(p2) || 0;
  const numV2 = parseFloat(v2) || 0;
  const result2 = numV2 !== 0 ? (numP2 / numV2) * 100 : 0;

  // Calculation 3
  const numP3 = parseFloat(p3) || 0;
  const numV3 = parseFloat(v3) || 0;
  const diff3 = numV3 - numP3;
  const result3 = numP3 !== 0 ? (diff3 / numP3) * 100 : 0;
  const isIncrease = diff3 >= 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
      {/* Mode selection tabs */}
      <div className="flex border-b border-slate-200 gap-2 pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('mode1')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'mode1'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          What is X% of Y?
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mode2')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'mode2'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          X is what % of Y?
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mode3')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'mode3'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          % Increase / Decrease
        </button>
      </div>

      <div className="mt-8 max-w-xl mx-auto">
        {/* MODE 1 */}
        {activeTab === 'mode1' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={p1}
                    onChange={(e) => setP1(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
                    placeholder="e.g. 20"
                  />
                  <span className="absolute right-3 top-3.5 text-slate-400 font-mono text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Of Value (Y)
                </label>
                <input
                  type="number"
                  step="any"
                  value={v1}
                  onChange={(e) => setV1(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  placeholder="e.g. 150"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Result</span>
              <div className="text-4xl font-bold font-mono text-emerald-700 mt-2">
                {Number.isInteger(result1) ? result1 : result1.toFixed(4).replace(/\.?0+$/, '')}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {p1}% of {v1} = <span className="font-semibold text-slate-800">{result1}</span>
              </p>

              <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy(result1.toString())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Result'}
                </button>
                <button
                  type="button"
                  onClick={() => { setP1('0'); setV1('0'); }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2 */}
        {activeTab === 'mode2' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Part Value (X)
                </label>
                <input
                  type="number"
                  step="any"
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  placeholder="e.g. 45"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total / Whole (Y)
                </label>
                <input
                  type="number"
                  step="any"
                  value={v2}
                  onChange={(e) => setV2(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  placeholder="e.g. 180"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Percentage</span>
              <div className="text-4xl font-bold font-mono text-emerald-700 mt-2">
                {result2.toFixed(2).replace(/\.?0+$/, '')}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {p2} is <span className="font-semibold text-slate-800">{result2.toFixed(2)}%</span> of {v2}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy(`${result2.toFixed(2)}%`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Result'}
                </button>
                <button
                  type="button"
                  onClick={() => { setP2('0'); setV2('0'); }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3 */}
        {activeTab === 'mode3' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Value (From)
                </label>
                <input
                  type="number"
                  step="any"
                  value={p3}
                  onChange={(e) => setP3(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  placeholder="e.g. 120"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Final Value (To)
                </label>
                <input
                  type="number"
                  step="any"
                  value={v3}
                  onChange={(e) => setV3(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  placeholder="e.g. 150"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {isIncrease ? 'Percentage Increase' : 'Percentage Decrease'}
              </span>
              <div
                className={`text-4xl font-bold font-mono mt-2 ${
                  isIncrease ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isIncrease ? '+' : ''}
                {result3.toFixed(2)}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Difference of {diff3 > 0 ? `+${diff3}` : diff3} from {p3} to {v3}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy(`${result3.toFixed(2)}%`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Result'}
                </button>
                <button
                  type="button"
                  onClick={() => { setP3('0'); setV3('0'); }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
