import React, { useState } from 'react';
import { Copy, Check, Type, Sparkles } from 'lucide-react';

export function TextCaseConverter() {
  const [text, setText] = useState<string>('ToolNest provides fast, free, client-side everyday utilities.');
  const [copied, setCopied] = useState<boolean>(false);

  const toUppercase = () => setText(text.toUpperCase());
  const toLowercase = () => setText(text.toLowerCase());

  const toTitleCase = () => {
    setText(
      text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const toSentenceCase = () => {
    setText(
      text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
    );
  };

  const toCamelCase = () => {
    const words = text.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/);
    if (words.length === 0) return;
    const camel = words[0].toLowerCase() + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    setText(camel);
  };

  const toSnakeCase = () => {
    const snake = text
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
    setText(snake);
  };

  const toKebabCase = () => {
    const kebab = text
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    setText(kebab);
  };

  const toPascalCase = () => {
    const words = text.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/);
    const pascal = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    setText(pascal);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toSentenceCase}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Sentence case
        </button>
        <button
          type="button"
          onClick={toTitleCase}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Title Case
        </button>
        <button
          type="button"
          onClick={toUppercase}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          UPPERCASE
        </button>
        <button
          type="button"
          onClick={toLowercase}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          lowercase
        </button>
        <button
          type="button"
          onClick={toCamelCase}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer"
        >
          camelCase
        </button>
        <button
          type="button"
          onClick={toSnakeCase}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer"
        >
          snake_case
        </button>
        <button
          type="button"
          onClick={toKebabCase}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer"
        >
          kebab-case
        </button>
        <button
          type="button"
          onClick={toPascalCase}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer"
        >
          PascalCase
        </button>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write text here to convert its case..."
          className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-base text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 leading-relaxed font-sans"
        />
      </div>

      {/* Footer bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          <span>Words: <strong className="text-slate-800">{text.trim() ? text.trim().split(/\s+/).length : 0}</strong></span>
          <span>Characters: <strong className="text-slate-800">{text.length}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          <button
            type="button"
            onClick={() => setText('')}
            className="px-3 py-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
