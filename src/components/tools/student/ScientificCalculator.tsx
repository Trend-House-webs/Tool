import React, { useState } from 'react';
import { RotateCcw, Delete, History, Check, Copy } from 'lucide-react';
import { safeEvaluateMath } from '../../../utils/safeMathEvaluator';

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.min(n, 170); i++) {
    res *= i;
  }
  return res;
}

export function ScientificCalculator() {
  const [display, setDisplay] = useState<string>('0');
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad'>('deg');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const appendChar = (char: string) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? char : prev + char));
  };

  const clearAll = () => {
    setDisplay('0');
  };

  const backspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const calculate = () => {
    try {
      const evaluated = safeEvaluateMath(display, { angleUnit });
      const formatted = Number(evaluated.toFixed(8)).toString();
      setHistory((prev) => [`${display} = ${formatted}`, ...prev.slice(0, 9)]);
      setDisplay(formatted);
    } catch {
      setDisplay('Error');
    }
  };

  const applyUnary = (fnName: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;

      let res = 0;
      if (fnName === 'sqrt') res = Math.sqrt(val);
      else if (fnName === 'sqr') res = val * val;
      else if (fnName === 'inv') res = 1 / val;
      else if (fnName === 'fact') res = factorial(Math.floor(val));
      else if (fnName === 'neg') res = -val;

      const formatted = Number(res.toFixed(8)).toString();
      setHistory((prev) => [`${fnName}(${val}) = ${formatted}`, ...prev.slice(0, 9)]);
      setDisplay(formatted);
    } catch {
      setDisplay('Error');
    }
  };

  const copyDisplay = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Scientific Calculator</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full scientific computation with trigonometry, logarithms, powers, and roots.
          </p>
        </div>

        {/* Deg / Rad toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setAngleUnit('deg')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              angleUnit === 'deg' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            DEG
          </button>
          <button
            onClick={() => setAngleUnit('rad')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              angleUnit === 'rad' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            RAD
          </button>
        </div>
      </div>

      {/* Calculator Display */}
      <div className="mb-4 p-4 rounded-2xl bg-slate-900 text-white font-mono text-right relative overflow-hidden">
        <div className="text-xs text-slate-400 min-h-4 mb-1">
          {history[0] ? history[0] : 'Ready'}
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold tracking-wider overflow-x-auto select-all py-1">
          {display}
        </div>
        <button
          onClick={copyDisplay}
          title="Copy result"
          className="absolute left-3 bottom-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-xs flex items-center gap-1 font-sans"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-2xs">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Calculator Keypad */}
      <div className="grid grid-cols-5 gap-2 text-sm font-semibold select-none">
        {/* Row 1: Sci functions */}
        <button onClick={() => appendChar('sin(')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">sin</button>
        <button onClick={() => appendChar('cos(')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">cos</button>
        <button onClick={() => appendChar('tan(')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">tan</button>
        <button onClick={() => appendChar('log(')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">log</button>
        <button onClick={() => appendChar('ln(')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">ln</button>

        {/* Row 2: Powers and roots */}
        <button onClick={() => appendChar('π')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">π</button>
        <button onClick={() => appendChar('e')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">e</button>
        <button onClick={() => appendChar('^')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">xʸ</button>
        <button onClick={() => applyUnary('sqr')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">x²</button>
        <button onClick={() => appendChar('sqrt(')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">√</button>

        {/* Row 3: Parentheses & Clears */}
        <button onClick={() => appendChar('(')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">(</button>
        <button onClick={() => appendChar(')')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">)</button>
        <button onClick={() => applyUnary('fact')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">n!</button>
        <button onClick={clearAll} className="p-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold cursor-pointer">AC</button>
        <button onClick={backspace} className="p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center cursor-pointer">
          <Delete className="w-4 h-4" />
        </button>

        {/* Row 4: Digits 7,8,9, Divide, Inv */}
        <button onClick={() => appendChar('7')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">7</button>
        <button onClick={() => appendChar('8')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">8</button>
        <button onClick={() => appendChar('9')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">9</button>
        <button onClick={() => appendChar('÷')} className="p-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-lg cursor-pointer">÷</button>
        <button onClick={() => applyUnary('inv')} className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">1/x</button>

        {/* Row 5: Digits 4,5,6, Multiply, Neg */}
        <button onClick={() => appendChar('4')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">4</button>
        <button onClick={() => appendChar('5')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">5</button>
        <button onClick={() => appendChar('6')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">6</button>
        <button onClick={() => appendChar('×')} className="p-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-lg cursor-pointer">×</button>
        <button onClick={() => applyUnary('neg')} className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">±</button>

        {/* Row 6: Digits 1,2,3, Subtract */}
        <button onClick={() => appendChar('1')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">1</button>
        <button onClick={() => appendChar('2')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">2</button>
        <button onClick={() => appendChar('3')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">3</button>
        <button onClick={() => appendChar('-')} className="p-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-lg cursor-pointer">−</button>
        <button onClick={() => appendChar('%')} className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">%</button>

        {/* Row 7: 0, Dot, Add, Equals (spans 2) */}
        <button onClick={() => appendChar('0')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">0</button>
        <button onClick={() => appendChar('.')} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-base cursor-pointer">.</button>
        <button onClick={() => appendChar('+')} className="p-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-lg cursor-pointer">+</button>
        <button onClick={calculate} className="col-span-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg transition-colors cursor-pointer shadow-xs">=</button>
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Recent Calculations
            </span>
            <button onClick={() => setHistory([])} className="hover:text-red-600 cursor-pointer font-normal">
              Clear history
            </button>
          </div>
          <div className="space-y-1 font-mono text-xs text-slate-600 max-h-28 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="p-1.5 rounded hover:bg-slate-50 flex items-center justify-between">
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
