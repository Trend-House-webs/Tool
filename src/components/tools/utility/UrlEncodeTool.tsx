import React, { useState } from 'react';
import { Copy, Check, ArrowRightLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { SITE_URL } from '../../../config/site';

export function UrlEncodeTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeType, setEncodeType] = useState<'component' | 'full'>('component');
  const [inputVal, setInputVal] = useState<string>(`${SITE_URL}/search?q=free tools & mode=client-side`);
  const [outputVal, setOutputVal] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    setError(null);
    if (!inputVal.trim()) {
      setOutputVal('');
      return;
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeType === 'component' ? encodeURIComponent(inputVal) : encodeURI(inputVal);
        setOutputVal(encoded);
      } else {
        const decoded = encodeType === 'component' ? decodeURIComponent(inputVal) : decodeURI(inputVal);
        setOutputVal(decoded);
      }
    } catch (err: any) {
      setError('Malformed URI sequence. Check that percent-encoded characters (%XX) are valid hexadecimal.');
      setOutputVal('');
    }
  }, [inputVal, mode, encodeType]);

  const handleCopy = () => {
    if (!outputVal) return;
    navigator.clipboard.writeText(outputVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    setInputVal(outputVal);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-2 pb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('encode')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'encode' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            URL Encode
          </button>
          <button
            type="button"
            onClick={() => setMode('decode')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'decode' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            URL Decode
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="encode-type"
              checked={encodeType === 'component'}
              onChange={() => setEncodeType('component')}
              className="text-emerald-700"
            />
            <span>encodeURIComponent (Recommended)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="encode-type"
              checked={encodeType === 'full'}
              onChange={() => setEncodeType('full')}
              className="text-emerald-700"
            />
            <span>Full URI (encodeURI)</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
            <label htmlFor="url-input">{mode === 'encode' ? 'URL or Parameter to Encode' : 'Encoded String to Decode'}</label>
            <span className="font-mono text-slate-400 font-normal">{inputVal.length} chars</span>
          </div>
          <textarea
            id="url-input"
            rows={8}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={mode === 'encode' ? 'Paste query params or URL to encode...' : 'Paste %20 or percent-encoded URL to decode...'}
            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500 leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
            <label htmlFor="url-output">{mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwap}
                className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowRightLeft className="w-3 h-3" /> Swap
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!outputVal}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            id="url-output"
            rows={8}
            readOnly
            value={outputVal}
            placeholder="Result will appear here automatically..."
            className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-hidden leading-relaxed select-all"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Client-Side Processing. URL queries and strings are processed locally in your web browser.</span>
      </div>
    </div>
  );
}
