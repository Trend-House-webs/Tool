import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Sparkles, Sliders } from 'lucide-react';

export function TextCleaner() {
  const [inputText, setInputText] = useState<string>(
    '   This is   a messy  sample   text with    extra spaces.   \n\n\nIt contains multiple consecutive    blank lines.\n   <p>And some <b>HTML tags</b> that need cleaning!</p>   '
  );
  const [removeExtraSpaces, setRemoveExtraSpaces] = useState<boolean>(true);
  const [trimLines, setTrimLines] = useState<boolean>(true);
  const [removeBlankLines, setRemoveBlankLines] = useState<boolean>(true);
  const [stripHtml, setStripHtml] = useState<boolean>(false);
  const [joinIntoSingleLine, setJoinIntoSingleLine] = useState<boolean>(false);
  const [stripNonAscii, setStripNonAscii] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Apply cleaning transformations
  let cleaned = inputText;

  if (stripHtml) {
    cleaned = cleaned.replace(/<[^>]*>?/gm, '');
  }

  if (stripNonAscii) {
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
  }

  let lines = cleaned.split('\n');

  if (trimLines) {
    lines = lines.map((l) => l.trim());
  }

  if (removeBlankLines) {
    lines = lines.filter((l) => l.length > 0);
  }

  if (removeExtraSpaces) {
    lines = lines.map((l) => l.replace(/[ \t]+/g, ' '));
  }

  if (joinIntoSingleLine) {
    cleaned = lines.join(' ');
  } else {
    cleaned = lines.join('\n');
  }

  const copyCleaned = () => {
    navigator.clipboard.writeText(cleaned);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Text Cleaner & Whitespace Remover</h2>
          <p className="text-sm text-slate-500 mt-1">
            Remove redundant spaces, strip HTML tags, eliminate empty lines, and format messy text.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputText('')}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
          <button
            onClick={copyCleaned}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Cleaned Text'}
          </button>
        </div>
      </div>

      {/* Cleaning Options Toggles */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm">
        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
          <input
            type="checkbox"
            checked={removeExtraSpaces}
            onChange={(e) => setRemoveExtraSpaces(e.target.checked)}
            className="rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Remove Multiple Spaces</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
          <input
            type="checkbox"
            checked={trimLines}
            onChange={(e) => setTrimLines(e.target.checked)}
            className="rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Trim Line Start & End</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
          <input
            type="checkbox"
            checked={removeBlankLines}
            onChange={(e) => setRemoveBlankLines(e.target.checked)}
            className="rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Remove Empty Lines</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
          <input
            type="checkbox"
            checked={stripHtml}
            onChange={(e) => setStripHtml(e.target.checked)}
            className="rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Strip HTML Tags (&lt;tag&gt;)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
          <input
            type="checkbox"
            checked={joinIntoSingleLine}
            onChange={(e) => setJoinIntoSingleLine(e.target.checked)}
            className="rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Convert into Single Line</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
          <input
            type="checkbox"
            checked={stripNonAscii}
            onChange={(e) => setStripNonAscii(e.target.checked)}
            className="rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Strip Non-ASCII & Emojis</span>
        </label>
      </div>

      {/* Editor Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 px-1">
            <span>Original Text ({inputText.length} chars)</span>
          </div>
          <textarea
            rows={10}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full p-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-hidden focus:border-emerald-500 leading-relaxed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 px-1">
            <span>Cleaned Text ({cleaned.length} chars)</span>
            <span className="text-2xs text-slate-500 font-normal">
              {inputText.length > cleaned.length ? `Saved ${inputText.length - cleaned.length} chars` : ''}
            </span>
          </div>
          <textarea
            rows={10}
            readOnly
            value={cleaned}
            className="w-full p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 text-sm font-mono focus:outline-hidden leading-relaxed text-slate-800"
          />
        </div>
      </div>
    </div>
  );
}
