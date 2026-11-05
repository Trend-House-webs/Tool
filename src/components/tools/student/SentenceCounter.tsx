import React, { useState } from 'react';
import { Copy, Check, RotateCcw, AlignLeft, BookOpen, Clock, FileText } from 'lucide-react';

export function SentenceCounter() {
  const [text, setText] = useState<string>(
    'ToolNest provides private, fast, client-side tools for everyday tasks. Everything runs directly in your browser without uploading files to remote servers. This ensures your documents, photos, and calculations remain completely confidential.'
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Analysis computations
  const trimmed = text.trim();
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, '').length;

  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

  // Sentences split by ., !, ? followed by space or end
  const sentencesList = trimmed
    ? trimmed
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];
  const sentences = sentencesList.length;

  // Paragraphs
  const paragraphs = trimmed
    ? trimmed
        .split(/\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0).length
    : 0;

  // Average sentence length
  const avgSentenceLength = sentences > 0 ? (words / sentences).toFixed(1) : '0';
  const avgWordLength = words > 0 ? (charactersNoSpaces / words).toFixed(1) : '0';

  // Reading time (assume 200 WPM)
  const readingMinutes = Math.ceil(words / 200);

  // Simple syllable count approximation
  const countSyllables = (word: string) => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const totalSyllables = trimmed
    ? trimmed
        .split(/\s+/)
        .reduce((sum, w) => sum + countSyllables(w), 0)
    : 0;

  // Flesch Reading Ease: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  let fleschScore = 0;
  if (words > 0 && sentences > 0) {
    fleschScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words)
        )
      )
    );
  }

  const getFleschDescription = (score: number) => {
    if (score >= 90) return { label: 'Very Easy (5th Grade)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 80) return { label: 'Easy (6th Grade)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 70) return { label: 'Fairly Easy (7th Grade)', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (score >= 60) return { label: 'Standard Plain English (8th-9th Grade)', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (score >= 50) return { label: 'Fairly Difficult (High School)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (score >= 30) return { label: 'Difficult (College)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Very Difficult (Graduate)', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const readability = getFleschDescription(fleschScore);

  const copyStats = () => {
    const stats = `Sentence Count: ${sentences}\nWord Count: ${words}\nParagraphs: ${paragraphs}\nCharacters: ${characters}\nAverage Sentence Length: ${avgSentenceLength} words\nFlesch Reading Ease: ${fleschScore} (${readability.label})`;
    navigator.clipboard.writeText(stats);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sentence Counter & Text Analyzer</h2>
          <p className="text-sm text-slate-500 mt-1">
            Count sentences, paragraphs, average length, and analyze reading readability level in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setText('')}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
          <button
            onClick={copyStats}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Stats' : 'Copy Stats'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Sentences</p>
          <p className="text-3xl font-extrabold text-emerald-950 mt-1">{sentences}</p>
          <p className="text-2xs text-emerald-700 mt-0.5">Based on punctuation</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Words</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{words}</p>
          <p className="text-2xs text-slate-500 mt-0.5">~{readingMinutes} min read</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Paragraphs</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{paragraphs}</p>
          <p className="text-2xs text-slate-500 mt-0.5">Line blocks</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Characters</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{characters}</p>
          <p className="text-2xs text-slate-500 mt-0.5">{charactersNoSpaces} without spaces</p>
        </div>
      </div>

      {/* Text Area */}
      <div className="mb-6">
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your essay, article, or document here to count sentences and analyze flow..."
          className="w-full p-4 rounded-2xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed font-sans"
        />
      </div>

      {/* Readability & Averages Card */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Readability & Sentence Metrics
          </span>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${readability.color}`}>
              Score: {fleschScore}/100 — {readability.label}
            </span>
            <span className="text-xs text-slate-600">
              Avg <strong className="text-slate-800">{avgSentenceLength}</strong> words/sentence
            </span>
            <span className="text-xs text-slate-600">
              Avg <strong className="text-slate-800">{avgWordLength}</strong> chars/word
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
