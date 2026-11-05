import React, { useState } from 'react';
import { Plus, Minus, X, Divide, RotateCcw, Copy, Check, ArrowRight } from 'lucide-react';

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

export function FractionCalculator() {
  const [num1, setNum1] = useState<number>(3);
  const [den1, setDen1] = useState<number>(4);
  const [op, setOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [num2, setNum2] = useState<number>(2);
  const [den2, setDen2] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute
  let rawNum = 0;
  let rawDen = 1;
  let stepText = '';

  const d1 = den1 === 0 ? 1 : den1;
  const d2 = den2 === 0 ? 1 : den2;

  if (op === '+') {
    rawNum = num1 * d2 + num2 * d1;
    rawDen = d1 * d2;
    stepText = `(${num1} × ${d2}) + (${num2} × ${d1}) = ${num1 * d2} + ${num2 * d1} = ${rawNum} over common denominator (${d1} × ${d2} = ${rawDen})`;
  } else if (op === '-') {
    rawNum = num1 * d2 - num2 * d1;
    rawDen = d1 * d2;
    stepText = `(${num1} × ${d2}) - (${num2} × ${d1}) = ${num1 * d2} - ${num2 * d1} = ${rawNum} over common denominator (${d1} × ${d2} = ${rawDen})`;
  } else if (op === '*') {
    rawNum = num1 * num2;
    rawDen = d1 * d2;
    stepText = `Multiply numerators: ${num1} × ${num2} = ${rawNum}. Multiply denominators: ${d1} × ${d2} = ${rawDen}.`;
  } else {
    // division
    rawNum = num1 * d2;
    rawDen = d1 * num2;
    stepText = `Multiply by reciprocal of second fraction: (${num1}/${d1}) × (${d2}/${num2}) = ${rawNum}/${rawDen}.`;
  }

  // Handle negatives in denominator
  if (rawDen < 0) {
    rawNum = -rawNum;
    rawDen = -rawDen;
  }

  const commonDivisor = gcd(rawNum, rawDen);
  const simpNum = rawNum / commonDivisor;
  const simpDen = rawDen / commonDivisor;

  // Mixed number
  const wholePart = Math.floor(Math.abs(simpNum) / simpDen);
  const remNum = Math.abs(simpNum) % simpDen;
  const isNegative = simpNum < 0;

  const decimalVal = simpDen !== 0 ? (simpNum / simpDen).toFixed(4).replace(/\.?0+$/, '') : 'Undefined';

  const copyResult = () => {
    const text = `${num1}/${d1} ${op} ${num2}/${d2} = ${simpNum}/${simpDen} (${decimalVal})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fraction Calculator with Steps</h2>
          <p className="text-sm text-slate-500 mt-1">
            Add, subtract, multiply, and divide fractions with automated step-by-step reduction and decimal conversion.
          </p>
        </div>

        <button
          onClick={() => {
            setNum1(1);
            setDen1(2);
            setNum2(1);
            setDen2(4);
            setOp('+');
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Interactive Fraction Inputs & Operator */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {/* Fraction 1 */}
        <div className="flex flex-col items-center w-20">
          <input
            type="number"
            value={num1}
            onChange={(e) => setNum1(Number(e.target.value))}
            className="w-full text-center px-2 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-lg focus:border-emerald-500 focus:outline-hidden"
          />
          <div className="w-full h-0.5 bg-slate-400 my-2" />
          <input
            type="number"
            value={den1}
            onChange={(e) => setDen1(Number(e.target.value) || 1)}
            className="w-full text-center px-2 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-lg focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Operators */}
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            {[
              { sign: '+', icon: Plus, label: 'Add' },
              { sign: '-', icon: Minus, label: 'Subtract' },
              { sign: '*', icon: X, label: 'Multiply' },
              { sign: '/', icon: Divide, label: 'Divide' },
            ].map(({ sign, icon: Icon, label }) => (
              <button
                key={sign}
                onClick={() => setOp(sign as any)}
                aria-label={label}
                className={`p-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  op === sign
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Fraction 2 */}
        <div className="flex flex-col items-center w-20">
          <input
            type="number"
            value={num2}
            onChange={(e) => setNum2(Number(e.target.value))}
            className="w-full text-center px-2 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-lg focus:border-emerald-500 focus:outline-hidden"
          />
          <div className="w-full h-0.5 bg-slate-400 my-2" />
          <input
            type="number"
            value={den2}
            onChange={(e) => setDen2(Number(e.target.value) || 1)}
            className="w-full text-center px-2 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-lg focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <span className="text-2xl font-bold text-slate-400">=</span>

        {/* Result Fraction Display */}
        <div className="flex flex-col items-center min-w-16">
          <div className="font-extrabold text-emerald-950 text-2xl px-2">{simpNum}</div>
          <div className="w-full h-1 bg-emerald-600 my-1 rounded-full" />
          <div className="font-extrabold text-emerald-950 text-2xl px-2">{simpDen}</div>
        </div>
      </div>

      {/* Solution Overview Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-emerald-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Simplest Fraction
            </span>
            <div className="text-3xl font-extrabold text-emerald-950 mt-1">
              {simpNum} / {simpDen}
            </div>
            <p className="text-2xs text-emerald-800/80 mt-1">
              GCD reduced by factor of {commonDivisor}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Mixed Number
            </span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">
              {wholePart > 0 && remNum > 0
                ? `${isNegative ? '-' : ''}${wholePart} ${remNum}/${simpDen}`
                : wholePart > 0 && remNum === 0
                ? `${isNegative ? '-' : ''}${wholePart}`
                : `${simpNum}/${simpDen}`}
            </div>
            <p className="text-2xs text-slate-500 mt-1">Whole & fractional parts</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Decimal Equivalent
            </span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">
              {decimalVal}
            </div>
            <p className="text-2xs text-slate-500 mt-1">Approximate decimal</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-emerald-200/60 flex items-center justify-between">
          <p className="text-xs text-slate-600 font-mono">
            {num1}/{d1} {op} {num2}/{d2} = {simpNum}/{simpDen}
          </p>
          <button
            onClick={copyResult}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Result'}
          </button>
        </div>
      </div>

      {/* Step by Step Explanation */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
        <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-2">
          Step-by-Step Calculation
        </h4>
        <p className="text-slate-700 mb-2 leading-relaxed">{stepText}</p>
        <p className="text-slate-600">
          Resulting unsimplified fraction: <span className="font-mono font-bold text-slate-800">{rawNum} / {rawDen}</span>.
          Dividing numerator and denominator by greatest common divisor (GCD = {commonDivisor}) yields{' '}
          <span className="font-mono font-bold text-emerald-800">{simpNum} / {simpDen}</span>.
        </p>
      </div>
    </div>
  );
}
