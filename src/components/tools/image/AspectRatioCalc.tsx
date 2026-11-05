import React, { useState } from 'react';
import { Copy, Check, Scaling, ArrowRightLeft } from 'lucide-react';

export function AspectRatioCalc() {
  const [calcMode, setCalcMode] = useState<'findDim' | 'findRatio'>('findDim');

  // Mode 1: Given ratio W:H and one dimension, calculate the other
  const [ratioW, setRatioW] = useState<string>('16');
  const [ratioH, setRatioH] = useState<string>('9');
  const [knownW, setKnownW] = useState<string>('1920');
  const [knownH, setKnownH] = useState<string>('1080');
  const [solveFor, setSolveFor] = useState<'height' | 'width'>('height');

  // Mode 2: Given W & H, find reduced ratio
  const [customW, setCustomW] = useState<string>('2560');
  const [customH, setCustomH] = useState<string>('1440');

  const [copied, setCopied] = useState<boolean>(false);

  // Common presets
  const presets = [
    { label: '16:9 (Widescreen HD/4K)', w: '16', h: '9' },
    { label: '9:16 (TikTok / Reels / Shorts)', w: '9', h: '16' },
    { label: '4:3 (Standard Photo/Tablet)', w: '4', h: '3' },
    { label: '1:1 (Square / Instagram)', w: '1', h: '1' },
    { label: '21:9 (Ultrawide Cinema)', w: '21', h: '9' },
    { label: '3:2 (35mm DSLR Classic)', w: '3', h: '2' },
  ];

  // Calculations
  const rW = parseFloat(ratioW) || 1;
  const rH = parseFloat(ratioH) || 1;
  const kW = parseFloat(knownW) || 0;
  const kH = parseFloat(knownH) || 0;

  const calculatedHeight = Math.round((kW * rH) / rW);
  const calculatedWidth = Math.round((kH * rW) / rH);

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const cW = Math.max(1, parseInt(customW, 10) || 1);
  const cH = Math.max(1, parseInt(customH, 10) || 1);
  const divisor = gcd(cW, cH);
  const reducedRatio = `${cW / divisor}:${cH / divisor}`;
  const decimalRatio = (cW / cH).toFixed(3);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Mode Switcher */}
      <div className="flex border-b border-slate-200 gap-2 pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setCalcMode('findDim')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            calcMode === 'findDim'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Calculate Missing Dimension (W × H)
        </button>
        <button
          type="button"
          onClick={() => setCalcMode('findRatio')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            calcMode === 'findRatio'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Find Aspect Ratio from Pixels
        </button>
      </div>

      {calcMode === 'findDim' ? (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Common Aspect Ratios
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((p) => {
                const isActive = ratioW === p.w && ratioH === p.h;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setRatioW(p.w);
                      setRatioH(p.h);
                    }}
                    className={`p-2 rounded-lg text-xs text-left border transition-colors cursor-pointer ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-mono font-bold block">{p.w}:{p.h}</span>
                    <span className="text-[10px] text-slate-500 truncate block">{p.label.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ratio Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ratio-w" className="block text-xs font-semibold text-slate-700 mb-1">Ratio Width</label>
              <input
                id="ratio-w"
                type="number"
                step="any"
                value={ratioW}
                onChange={(e) => setRatioW(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-center"
              />
            </div>
            <div>
              <label htmlFor="ratio-h" className="block text-xs font-semibold text-slate-700 mb-1">Ratio Height</label>
              <input
                id="ratio-h"
                type="number"
                step="any"
                value={ratioH}
                onChange={(e) => setRatioH(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-center"
              />
            </div>
          </div>

          {/* Solve For Radio */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <span>Known Value:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="solve-type"
                checked={solveFor === 'height'}
                onChange={() => setSolveFor('height')}
                className="text-emerald-700"
              />
              <span>Enter Width → Get Height</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="solve-type"
                checked={solveFor === 'width'}
                onChange={() => setSolveFor('width')}
                className="text-emerald-700"
              />
              <span>Enter Height → Get Width</span>
            </label>
          </div>

          {/* Known Input & Result */}
          {solveFor === 'height' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label htmlFor="known-w" className="block text-xs font-semibold text-slate-700 mb-1">Enter Width (px)</label>
                <input
                  id="known-w"
                  type="number"
                  value={knownW}
                  onChange={(e) => setKnownW(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold"
                  placeholder="e.g. 1920"
                />
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase">Calculated Height</span>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-1">{calculatedHeight} px</p>
                <p className="text-xs text-slate-500 mt-0.5">{knownW} × {calculatedHeight} ({ratioW}:{ratioH})</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label htmlFor="known-h" className="block text-xs font-semibold text-slate-700 mb-1">Enter Height (px)</label>
                <input
                  id="known-h"
                  type="number"
                  value={knownH}
                  onChange={(e) => setKnownH(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold"
                  placeholder="e.g. 1080"
                />
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase">Calculated Width</span>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-1">{calculatedWidth} px</p>
                <p className="text-xs text-slate-500 mt-0.5">{calculatedWidth} × {knownH} ({ratioW}:{ratioH})</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MODE 2: Find Ratio from Pixels */
        <div className="max-w-xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="custom-w" className="block text-xs font-semibold text-slate-700 mb-1">Image Width (px)</label>
              <input
                id="custom-w"
                type="number"
                value={customW}
                onChange={(e) => setCustomW(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold"
                placeholder="2560"
              />
            </div>
            <div>
              <label htmlFor="custom-h" className="block text-xs font-semibold text-slate-700 mb-1">Image Height (px)</label>
              <input
                id="custom-h"
                type="number"
                value={customH}
                onChange={(e) => setCustomH(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold"
                placeholder="1440"
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simplified Aspect Ratio</span>
            <div className="text-4xl font-extrabold font-mono text-emerald-700">
              {reducedRatio}
            </div>
            <p className="text-xs text-slate-600">
              Decimal ratio: <strong className="font-mono text-slate-800">{decimalRatio}:1</strong>
            </p>

            <button
              type="button"
              onClick={() => handleCopy(reducedRatio)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
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
