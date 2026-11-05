import React, { useState } from 'react';
import { Copy, Check, ArrowRightLeft, FileText, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import { downloadBlob } from '../../../utils/fileHelpers';

export function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputVal, setInputVal] = useState<string>('ToolNest — Everyday Tools. One Simple Place.');
  const [outputVal, setOutputVal] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // UTF-8 safe Base64 encoding
  const utf8ToBase64 = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e: any) {
      throw new Error('Encoding failed: ' + e.message);
    }
  };

  // UTF-8 safe Base64 decoding
  const base64ToUtf8 = (str: string) => {
    try {
      const binary = atob(str.replace(/\s+/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    } catch (e: any) {
      throw new Error('Invalid Base64 string. Please check that your input contains valid Base64 characters.');
    }
  };

  React.useEffect(() => {
    setError(null);
    if (!inputVal.trim()) {
      setOutputVal('');
      return;
    }

    try {
      if (mode === 'encode') {
        setOutputVal(utf8ToBase64(inputVal));
      } else {
        setOutputVal(base64ToUtf8(inputVal));
      }
    } catch (err: any) {
      setError(err?.message || 'Conversion error');
      setOutputVal('');
    }
  }, [inputVal, mode]);

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
      <div className="flex border-b border-slate-200 gap-2 pb-4">
        <button
          type="button"
          onClick={() => setMode('encode')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'encode' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Encode to Base64
        </button>
        <button
          type="button"
          onClick={() => setMode('decode')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'decode' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Decode from Base64
        </button>
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
            <label htmlFor="base64-input">{mode === 'encode' ? 'Plain Text to Encode' : 'Base64 String to Decode'}</label>
            <span className="font-mono text-slate-400 font-normal">{inputVal.length} chars</span>
          </div>
          <textarea
            id="base64-input"
            rows={8}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste plain text here...' : 'Paste Base64 encoded string here...'}
            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500 leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
            <label htmlFor="base64-output">{mode === 'encode' ? 'Base64 Result' : 'Decoded Plain Text'}</label>
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
            id="base64-output"
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
        <span>Client-Side Processing. Strings are encoded and decoded locally using browser Web APIs.</span>
      </div>
    </div>
  );
}
