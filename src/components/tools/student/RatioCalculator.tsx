import React, { useState } from 'react';
import { RotateCcw, Copy, Check, ArrowRightLeft, Equal } from 'lucide-react';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function RatioCalculator() {
  const [activeTab, setActiveTab] = useState<'solve' | 'simplify'>('solve');

  // Solve Proportion: A : B = C : D
  const [a, setA] = useState<string>('16');
  const [b, setB] = useState<string>('9');
  const [c, setC] = useState<string>('1920');
  const [d, setD] = useState<string>(''); // empty means solve for D
  const [targetVar, setTargetVar] = useState<'A' | 'B' | 'C' | 'D'>('D');

  // Simplify Ratio: X : Y
  const [simpX, setSimpX] = useState<number>(1920);
  const [simpY, setSimpY] = useState<number>(1080);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute solved value
  let solvedVal = 0;
  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  const numC = parseFloat(c) || 0;
  const numD = parseFloat(d) || 0;

  if (targetVar === 'D' && numA !== 0) {
    solvedVal = (numB * numC) / numA;
  } else if (targetVar === 'C' && numB !== 0) {
    solvedVal = (numA * numD) / numB;
  } else if (targetVar === 'B' && numC !== 0) {
    solvedVal = (numA * numD) / numC;
  } else if (targetVar === 'A' && numD !== 0) {
    solvedVal = (numB * numC) / numD;
  }

  // Compute simplified ratio
  const g = gcd(Math.round(simpX), Math.round(simpY)) || 1;
  const simplifiedX = simpX / g;
  const simplifiedY = simpY / g;
  const decimalRatio = simpY !== 0 ? (simpX / simpY).toFixed(3) : '0';

  const copyResult = () => {
    const text =
      activeTab === 'solve'
        ? `${targetVar} = ${solvedVal}`
        : `${simpX}:${simpY} = ${simplifiedX}:${simplifiedY} (${decimalRatio}:1)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ratio & Proportion Calculator</h2>
          <p className="text-sm text-slate-500 mt-1">
            Solve for unknown values in proportions (A : B = C : D) or simplify ratios to their lowest terms.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('solve')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'solve' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Solve Proportion (A:B = C:D)
          </button>
          <button
            onClick={() => setActiveTab('simplify')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'simplify' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Simplify Ratio
          </button>
        </div>
      </div>

      {activeTab === 'solve' ? (
        <div>
          {/* Unknown Selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Select Variable to Solve For
            </label>
            <div className="flex gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setTargetVar(v)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    targetVar === v
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Solve for {v}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Equation Inputs */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-2xs font-bold text-slate-500 mb-1">A</span>
                <input
                  type="number"
                  value={targetVar === 'A' ? '' : a}
                  disabled={targetVar === 'A'}
                  onChange={(e) => setA(e.target.value)}
                  placeholder={targetVar === 'A' ? '?' : 'A'}
                  className={`w-20 text-center py-2 px-1 rounded-xl border text-sm font-bold ${
                    targetVar === 'A'
                      ? 'bg-emerald-100/60 border-emerald-400 text-emerald-900 placeholder-blue-600 font-extrabold'
                      : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <span className="text-xl font-bold text-slate-400 pt-4">:</span>

              <div className="flex flex-col items-center">
                <span className="text-2xs font-bold text-slate-500 mb-1">B</span>
                <input
                  type="number"
                  value={targetVar === 'B' ? '' : b}
                  disabled={targetVar === 'B'}
                  onChange={(e) => setB(e.target.value)}
                  placeholder={targetVar === 'B' ? '?' : 'B'}
                  className={`w-20 text-center py-2 px-1 rounded-xl border text-sm font-bold ${
                    targetVar === 'B'
                      ? 'bg-emerald-100/60 border-emerald-400 text-emerald-900 placeholder-blue-600 font-extrabold'
                      : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>

            <span className="text-2xl font-bold text-slate-400 pt-4">=</span>

            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-2xs font-bold text-slate-500 mb-1">C</span>
                <input
                  type="number"
                  value={targetVar === 'C' ? '' : c}
                  disabled={targetVar === 'C'}
                  onChange={(e) => setC(e.target.value)}
                  placeholder={targetVar === 'C' ? '?' : 'C'}
                  className={`w-20 text-center py-2 px-1 rounded-xl border text-sm font-bold ${
                    targetVar === 'C'
                      ? 'bg-emerald-100/60 border-emerald-400 text-emerald-900 placeholder-blue-600 font-extrabold'
                      : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <span className="text-xl font-bold text-slate-400 pt-4">:</span>

              <div className="flex flex-col items-center">
                <span className="text-2xs font-bold text-slate-500 mb-1">D</span>
                <input
                  type="number"
                  value={targetVar === 'D' ? '' : d}
                  disabled={targetVar === 'D'}
                  onChange={(e) => setD(e.target.value)}
                  placeholder={targetVar === 'D' ? '?' : 'D'}
                  className={`w-20 text-center py-2 px-1 rounded-xl border text-sm font-bold ${
                    targetVar === 'D'
                      ? 'bg-emerald-100/60 border-emerald-400 text-emerald-900 placeholder-blue-600 font-extrabold'
                      : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Solved Output Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                Solution ({targetVar})
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-950 mt-1">
                {targetVar} = {Number.isInteger(solvedVal) ? solvedVal : solvedVal.toFixed(2)}
              </div>
              <p className="text-xs text-emerald-800/80 mt-1">
                Cross multiplication: {targetVar === 'D' ? `D = (B × C) ÷ A` : targetVar === 'C' ? `C = (A × D) ÷ B` : targetVar === 'B' ? `B = (A × D) ÷ C` : `A = (B × C) ÷ D`}
              </p>
            </div>

            <button
              onClick={copyResult}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Solution'}
            </button>
          </div>
        </div>
      ) : (
        /* Simplify Tab */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                First Term (A)
              </label>
              <input
                type="number"
                value={simpX}
                onChange={(e) => setSimpX(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-lg font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Second Term (B)
              </label>
              <input
                type="number"
                value={simpY}
                onChange={(e) => setSimpY(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-lg font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Simplified Result */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                Simplified Ratio
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-950 mt-1">
                {simplifiedX} : {simplifiedY}
              </div>
              <p className="text-xs text-emerald-800/80 mt-1">
                Both terms divided by greatest common factor ({g}). Decimal: {decimalRatio} : 1.
              </p>
            </div>

            <button
              onClick={copyResult}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Ratio'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
