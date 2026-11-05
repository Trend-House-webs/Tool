import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Hash, DollarSign } from 'lucide-react';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES_WESTERN = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];

function convertUnderThousand(num: number): string {
  if (num === 0) return '';
  if (num < 20) return ONES[num];
  if (num < 100) {
    const rem = num % 10;
    return TENS[Math.floor(num / 10)] + (rem ? '-' + ONES[rem] : '');
  }
  const rem = num % 100;
  return ONES[Math.floor(num / 100)] + ' hundred' + (rem ? ' and ' + convertUnderThousand(rem) : '');
}

function numberToWesternWords(num: number): string {
  if (num === 0) return 'zero';
  if (num < 0) return 'negative ' + numberToWesternWords(-num);

  const parts: string[] = [];
  let scaleIndex = 0;
  let remaining = Math.floor(num);

  while (remaining > 0 && scaleIndex < SCALES_WESTERN.length) {
    const chunk = remaining % 1000;
    if (chunk !== 0) {
      const chunkStr = convertUnderThousand(chunk);
      const scaleStr = SCALES_WESTERN[scaleIndex];
      parts.unshift(scaleStr ? `${chunkStr} ${scaleStr}` : chunkStr);
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex++;
  }

  return parts.join(' ');
}

function convertDecimalToWords(decStr: string): string {
  if (!decStr) return '';
  const digits = decStr.split('').map((d) => ONES[parseInt(d, 10)] || 'zero');
  return 'point ' + digits.join(' ');
}

// Indian numbering (Lakhs and Crores)
function numberToIndianWords(num: number): string {
  if (num === 0) return 'zero';
  if (num < 0) return 'negative ' + numberToIndianWords(-num);

  let n = Math.floor(num);
  const parts: string[] = [];

  const hundred = n % 1000;
  if (hundred !== 0) {
    parts.unshift(convertUnderThousand(hundred));
  }
  n = Math.floor(n / 1000);

  const thousand = n % 100;
  if (thousand !== 0) {
    parts.unshift(`${convertUnderThousand(thousand)} thousand`);
  }
  n = Math.floor(n / 100);

  const lakh = n % 100;
  if (lakh !== 0) {
    parts.unshift(`${convertUnderThousand(lakh)} lakh`);
  }
  n = Math.floor(n / 100);

  const crore = n;
  if (crore !== 0) {
    parts.unshift(`${numberToWesternWords(crore)} crore`);
  }

  return parts.join(' ');
}

export function NumberToWords() {
  const [inputVal, setInputVal] = useState<string>('2450.50');
  const [caseFormat, setCaseFormat] = useState<'title' | 'upper' | 'lower'>('title');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const numVal = parseFloat(inputVal) || 0;
  const parts = inputVal.split('.');
  const integerPart = Math.abs(parseInt(parts[0] || '0', 10));
  const decimalDigits = parts[1] || '';

  // 1. Standard Western Words
  const westernBase = numberToWesternWords(integerPart);
  const westernDecimal = decimalDigits ? ' ' + convertDecimalToWords(decimalDigits) : '';
  const standardResult = (numVal < 0 ? 'negative ' : '') + westernBase + westernDecimal;

  // 2. Check / Dollar Format
  const cents = decimalDigits ? parseInt(decimalDigits.slice(0, 2).padEnd(2, '0'), 10) : 0;
  const currencyResult = `${westernBase} dollars and ${cents}/100 cents`;

  // 3. Indian Lakh / Crore Format
  const indianBase = numberToIndianWords(integerPart);
  const indianResult = (numVal < 0 ? 'negative ' : '') + indianBase + westernDecimal;

  const applyCase = (str: string) => {
    if (caseFormat === 'upper') return str.toUpperCase();
    if (caseFormat === 'lower') return str.toLowerCase();
    // Title Case
    return str.replace(/\b[a-z]/g, (c) => c.toUpperCase());
  };

  const copyVal = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Number to Words Converter</h2>
          <p className="text-sm text-slate-500 mt-1">
            Convert numeric figures into English words, bank check currency format, and Indian lakhs/crores.
          </p>
        </div>

        {/* Case Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          {(['title', 'upper', 'lower'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setCaseFormat(fmt)}
              className={`px-2.5 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                caseFormat === fmt ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              {fmt} Case
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
          Enter Any Number
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value.replace(/[^0-9.-]/g, ''))}
            placeholder="e.g. 154000 or 2500000"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-lg font-mono font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2 mt-2">
          {['1000', '25000', '100000', '1500000', '99999.99'].map((preset) => (
            <button
              key={preset}
              onClick={() => setInputVal(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-4">
        {/* Output 1: Standard English Words */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Standard English (International)
            </span>
            <button
              onClick={() => copyVal(applyCase(standardResult), 'standard')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'standard' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'standard' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {applyCase(standardResult)}
          </p>
        </div>

        {/* Output 2: Currency / Bank Check Format */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Check Writing & Currency Format
            </span>
            <button
              onClick={() => copyVal(applyCase(currencyResult), 'currency')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'currency' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'currency' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed">
            {applyCase(currencyResult)}
          </p>
        </div>

        {/* Output 3: Indian System (Lakhs & Crores) */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Indian System (Lakhs & Crores)
            </span>
            <button
              onClick={() => copyVal(applyCase(indianResult), 'indian')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'indian' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'indian' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-base font-semibold text-slate-800 leading-relaxed">
            {applyCase(indianResult)}
          </p>
        </div>
      </div>
    </div>
  );
}
