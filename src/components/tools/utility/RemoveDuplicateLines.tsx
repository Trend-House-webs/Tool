import React, { useState } from 'react';
import { Copy, Check, Trash2, ArrowUpDown, ShieldCheck } from 'lucide-react';

const SAMPLE_LIST = `apple
banana
orange
apple
grape
banana
mango
orange
pineapple`;

export function RemoveDuplicateLines() {
  const [text, setText] = useState<string>(SAMPLE_LIST);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [trimWhitespace, setTrimWhitespace] = useState<boolean>(true);
  const [removeEmpty, setRemoveEmpty] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const processLines = (sortOrder?: 'asc' | 'desc') => {
    let lines = text.split(/\r?\n/);
    const initialCount = lines.length;

    if (trimWhitespace) {
      lines = lines.map((l) => l.trim());
    }
    if (removeEmpty) {
      lines = lines.filter((l) => l.length > 0);
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      }
    }

    if (sortOrder === 'asc') {
      uniqueLines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    } else if (sortOrder === 'desc') {
      uniqueLines.sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' }));
    }

    setText(uniqueLines.join('\n'));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalLines = text ? text.split(/\r?\n/).length : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Controls toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => processLines()}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Remove Duplicates
          </button>
          <button
            type="button"
            onClick={() => processLines('asc')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Dedupe & Sort (A-Z)
          </button>
          <button
            type="button"
            onClick={() => processLines('desc')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Dedupe & Sort (Z-A)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => setText('')}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-600 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Case Sensitive Comparison</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(e) => setTrimWhitespace(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Trim Whitespace</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeEmpty}
            onChange={(e) => setRemoveEmpty(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Remove Empty Lines</span>
        </label>
      </div>

      {/* Main Textarea */}
      <div>
        <textarea
          rows={11}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lines of text, emails, lists, or URLs to deduplicate..."
          className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 leading-relaxed"
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>Current Lines: <strong className="font-mono text-slate-800">{totalLines}</strong></span>
        <span>Processed locally in your browser</span>
      </div>
    </div>
  );
}
