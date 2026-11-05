import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, Key, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';

export function PasswordGen() {
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let numberChars = '0123456789';
    let symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (excludeAmbiguous) {
      // Exclude easily confused characters like l, 1, I, O, 0
      lowerChars = lowerChars.replace(/[ilo]/g, '');
      upperChars = upperChars.replace(/[IO]/g, '');
      numberChars = numberChars.replace(/[01]/g, '');
      symbolChars = symbolChars.replace(/[|`]/g, '');
    }

    let charPool = '';
    const guaranteed: string[] = [];

    const getRandomChar = (str: string) => {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return str[arr[0] % str.length];
    };

    if (includeLower && lowerChars) {
      charPool += lowerChars;
      guaranteed.push(getRandomChar(lowerChars));
    }
    if (includeUpper && upperChars) {
      charPool += upperChars;
      guaranteed.push(getRandomChar(upperChars));
    }
    if (includeNumbers && numberChars) {
      charPool += numberChars;
      guaranteed.push(getRandomChar(numberChars));
    }
    if (includeSymbols && symbolChars) {
      charPool += symbolChars;
      guaranteed.push(getRandomChar(symbolChars));
    }

    if (!charPool) {
      setPassword('');
      return;
    }

    const remainingLength = Math.max(0, length - guaranteed.length);
    const randomChars: string[] = [];
    const randomBuffer = new Uint32Array(remainingLength);
    window.crypto.getRandomValues(randomBuffer);

    for (let i = 0; i < remainingLength; i++) {
      randomChars.push(charPool[randomBuffer[i] % charPool.length]);
    }

    const allChars = [...guaranteed, ...randomChars];
    // Secure Fisher-Yates shuffle
    for (let i = allChars.length - 1; i > 0; i--) {
      const jBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(jBuffer);
      const j = jBuffer[0] % (i + 1);
      const temp = allChars[i];
      allChars[i] = allChars[j];
      allChars[j] = temp;
    }

    setPassword(allChars.join(''));
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Evaluate password entropy and strength
  const getStrength = () => {
    let poolSize = 0;
    if (includeLower) poolSize += 26;
    if (includeUpper) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 30;

    const entropy = length * (poolSize > 0 ? Math.log2(poolSize) : 0);

    if (entropy < 40) return { label: 'Weak', color: 'bg-rose-500 text-rose-700', pct: 25 };
    if (entropy < 65) return { label: 'Moderate', color: 'bg-amber-500 text-amber-700', pct: 55 };
    if (entropy < 90) return { label: 'Strong', color: 'bg-emerald-600 text-emerald-800', pct: 85 };
    return { label: 'Very Strong', color: 'bg-emerald-600 text-emerald-700', pct: 100 };
  };

  const strength = getStrength();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Output display */}
        <div className="relative p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-lg sm:text-2xl font-bold tracking-wider text-slate-900 break-all select-all">
              {password || 'Select at least one character type'}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={generatePassword}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
                title="Regenerate password"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!password}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Strength bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Security Strength: <strong className={strength.color.split(' ')[1]}>{strength.label}</strong></span>
              <span className="font-mono">{length} characters</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength.color.split(' ')[0]}`}
                style={{ width: `${strength.pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
            <label htmlFor="pass-length">Password Length: <span className="font-mono text-emerald-700 text-sm font-bold">{length}</span></label>
            <span className="text-slate-400 font-normal">Recommended: 16–32</span>
          </div>
          <input
            id="pass-length"
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-hidden"
          />
        </div>

        {/* Character Set Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={includeUpper}
              onChange={(e) => setIncludeUpper(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>Uppercase Letters (A-Z)</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={includeLower}
              onChange={(e) => setIncludeLower(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>Lowercase Letters (a-z)</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>Special Symbols (!@#$%)</span>
          </label>
          <label className="sm:col-span-2 flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span>Avoid Ambiguous Characters (e.g. 1, l, I, 0, O)</span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Generated locally with the browser Web Crypto API (`window.crypto`) without transmitting inputs or passwords to a server.</span>
        </div>
      </div>
    </div>
  );
}
