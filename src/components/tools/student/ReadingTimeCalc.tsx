import React, { useState } from 'react';
import { Clock, BookOpen, Mic, Copy, Check } from 'lucide-react';

export function ReadingTimeCalc() {
  const [text, setText] = useState<string>(
    'The pursuit of focused knowledge acquisition requires deliberate cognitive habits and structured reading practices. When students and researchers approach technical literature, comprehension speeds naturally vary depending upon vocabulary density, subject familiarity, and reading purpose. By analyzing word counts and estimated durations, authors can structure presentations, articles, and lectures with realistic pacing and optimal audience retention.'
  );
  const [customWpm, setCustomWpm] = useState<number>(225);
  const [copied, setCopied] = useState<boolean>(false);

  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const characterCount = text.length;

  const calcDuration = (wpm: number) => {
    const totalSeconds = Math.round((wordCount / wpm) * 60);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const slowReading = calcDuration(150);
  const averageReading = calcDuration(225);
  const fastReading = calcDuration(300);
  const speakingPace = calcDuration(130);
  const customDuration = calcDuration(customWpm);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${wordCount} words · Reading time: ~${averageReading} · Speaking time: ~${speakingPace}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Primary Reading Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase">Average Reading</span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-1">{averageReading}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">225 words/min</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Speech / Speaking</span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">{speakingPace}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">130 words/min</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Word Count</span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">{wordCount}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{characterCount} characters</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Fast Skim</span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">{fastReading}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">300 words/min</span>
        </div>
      </div>

      {/* Main Textarea */}
      <div>
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write your essay, article, speech, or chapter here..."
          className="w-full p-4 text-base text-slate-800 bg-slate-50/60 border border-slate-300 rounded-2xl focus:bg-white focus:outline-hidden focus:border-emerald-500 leading-relaxed font-sans"
        />
      </div>

      {/* Controls & Custom WPM */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <label htmlFor="custom-wpm" className="font-semibold text-slate-700">Custom Reading Speed (WPM):</label>
          <input
            id="custom-wpm"
            type="number"
            min="50"
            max="1000"
            value={customWpm}
            onChange={(e) => setCustomWpm(Math.max(10, Number(e.target.value)))}
            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-center"
          />
          <span className="font-mono text-emerald-700 font-bold">→ {customDuration}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>
          <button
            type="button"
            onClick={() => setText('')}
            className="px-3 py-1.5 text-slate-500 hover:text-red-600 cursor-pointer"
          >
            Clear Text
          </button>
        </div>
      </div>
    </div>
  );
}
