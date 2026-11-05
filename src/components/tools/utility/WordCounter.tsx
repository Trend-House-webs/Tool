import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  FileText,
  Upload,
  Download,
  Target,
  Clock,
  Mic,
  Save,
  Trash2,
  Sliders,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Filter,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Link } from '../../../context/RouterContext';

const SAMPLE_TEXT = `Technology has profoundly altered the modern landscape of education and knowledge dissemination. Through digital connectivity, students and researchers worldwide access comprehensive libraries, interactive computational models, and peer-reviewed literature in seconds. As digital tools become more refined, lightweight browser applications play an essential role in everyday productivity, facilitating calculation, document transformation, and focus without cumbersome software installations.`;

// Comprehensive list of standard English stop words for optional filtering in frequency analysis
const ENGLISH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each',
  'few', 'for', 'from', 'further',
  'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
  'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
]);

// Helper to count syllables in an English word using phonetic heuristic rules
function countSyllablesInWord(rawWord: string): number {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;

  // Strip trailing silent 'e', 'ed', or 'es'
  let cleaned = word
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');

  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  const count = matches ? matches.length : 1;
  return Math.max(1, count);
}

const AUTOSAVE_STORAGE_KEY = 'toolnest_wordcounter_autosave_text';
const AUTOSAVE_FLAG_KEY = 'toolnest_wordcounter_autosave_enabled';

export function WordCounter() {
  // Task 1: Initial state is clean and empty
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Task 2: Custom Word Goal Tracker
  const [wordGoal, setWordGoal] = useState<number | ''>('');
  const [showGoalTracker, setShowGoalTracker] = useState<boolean>(false);

  // Task 3: Character Limit Controls
  const [charLimit, setCharLimit] = useState<number | ''>('');
  const [showCharLimit, setShowCharLimit] = useState<boolean>(false);

  // Task 5: Custom Reading and Speaking Speeds
  const [readingWpm, setReadingWpm] = useState<number>(225);
  const [speakingWpm, setSpeakingWpm] = useState<number>(130);
  const [showSpeedControls, setShowSpeedControls] = useState<boolean>(false);

  // Task 6: Local Browser Autosave
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(false);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);

  // Task 8: Word Frequency Options
  const [filterStopWords, setFilterStopWords] = useState<boolean>(true);
  const [frequencySort, setFrequencySort] = useState<'frequency' | 'alphabetical'>('frequency');
  const [freqFilterQuery, setFreqFilterQuery] = useState<string>('');
  const [showAllFrequencies, setShowAllFrequencies] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize autosave from localStorage safely on client mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const flag = window.localStorage.getItem(AUTOSAVE_FLAG_KEY);
        if (flag === 'true') {
          setAutosaveEnabled(true);
          const savedText = window.localStorage.getItem(AUTOSAVE_STORAGE_KEY);
          if (savedText && savedText.trim().length > 0) {
            setText(savedText);
            setLastSavedNotice('Restored from local browser storage');
          }
        }
      }
    } catch {
      // Storage unavailable or blocked (e.g. strict private mode)
    }
  }, []);

  // Update localStorage when text changes if autosave is enabled
  useEffect(() => {
    if (!autosaveEnabled) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (text) {
          window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, text);
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSavedNotice(`Autosaved locally at ${time}`);
        } else {
          window.localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
          setLastSavedNotice(null);
        }
      }
    } catch {
      setLastSavedNotice('Storage full or blocked');
    }
  }, [text, autosaveEnabled]);

  const toggleAutosave = () => {
    const nextState = !autosaveEnabled;
    setAutosaveEnabled(nextState);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(AUTOSAVE_FLAG_KEY, String(nextState));
        if (nextState && text) {
          window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, text);
          setLastSavedNotice('Autosave enabled (stored locally)');
        } else if (!nextState) {
          window.localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
          setLastSavedNotice(null);
        }
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleClearSavedStorage = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
        setLastSavedNotice('Local storage cleared');
        setTimeout(() => setLastSavedNotice(null), 3000);
      }
    } catch {
      // Ignore
    }
  };

  // Primary Metrics
  const trimmed = text.trim();
  const rawWords = useMemo(() => {
    if (!trimmed) return [];
    return trimmed.split(/\s+/).filter((w) => w.length > 0);
  }, [trimmed]);

  const words = rawWords.length;
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = useMemo(() => text.replace(/\s+/g, '').length, [text]);

  const sentences = useMemo(() => {
    if (!trimmed) return 0;
    const matches = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g);
    return (matches && matches.length > 0) ? matches.length : (words > 0 ? 1 : 0);
  }, [trimmed, words]);

  const paragraphs = useMemo(() => {
    if (!trimmed) return 0;
    return text.split(/\n+/).filter((p) => p.trim().length > 0).length;
  }, [text, trimmed]);

  const lines = useMemo(() => {
    if (!trimmed) return 0;
    return text.split(/\r\n|\r|\n/).length;
  }, [text, trimmed]);

  // Average Calculations
  const avgSentenceLength = sentences > 0 ? (words / sentences).toFixed(1) : '0';
  const avgWordLength = words > 0 ? (charactersWithoutSpaces / words).toFixed(1) : '0';

  // Task 4: Readability Calculation (Flesch Reading Ease for English)
  const { fleschScore, fleschLevel, fleschDescription, hasEnoughForReadability } = useMemo(() => {
    if (words < 10 || sentences < 1) {
      return {
        fleschScore: null,
        fleschLevel: 'Need more text',
        fleschDescription: 'Enter at least 10 words and 1 complete sentence with terminal punctuation (. ! ?) to calculate an English readability score.',
        hasEnoughForReadability: false,
      };
    }

    let totalSyllables = 0;
    for (const w of rawWords) {
      totalSyllables += countSyllablesInWord(w);
    }

    const asl = words / sentences; // Average Sentence Length
    const asw = totalSyllables / words; // Average Syllables per Word

    // 206.835 - 1.015 * ASL - 84.6 * ASW
    const rawScore = 206.835 - (1.015 * asl) - (84.6 * asw);
    const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

    let level = 'Standard / Plain English';
    let desc = 'Readable by an average 8th to 9th grade student. Conversational and ideal for general blog posts, web pages, and consumer articles.';

    if (clampedScore >= 90) {
      level = 'Very Easy (5th Grade)';
      desc = 'Extremely simple sentence structure and basic vocabulary. Easily understood by an average 11-year-old student.';
    } else if (clampedScore >= 80) {
      level = 'Easy (6th Grade)';
      desc = 'Casual conversational English. Clear, fast reading suitable for mass-market fiction and informal emails.';
    } else if (clampedScore >= 70) {
      level = 'Fairly Easy (7th Grade)';
      desc = 'Accessible prose with standard everyday vocabulary. Ideal for news articles, essays, and general guides.';
    } else if (clampedScore >= 60) {
      level = 'Standard (8th–9th Grade)';
      desc = 'Plain English standard. Understandable by most secondary school students and general adult audiences.';
    } else if (clampedScore >= 50) {
      level = 'Fairly Difficult (10th–12th Grade)';
      desc = 'High school reading level. Contains longer compound sentences and specialized vocabulary.';
    } else if (clampedScore >= 30) {
      level = 'Difficult (College Level)';
      desc = 'Academic undergraduate level. Dense sentence construction with polysyllabic terminology.';
    } else {
      level = 'Very Difficult (Graduate / Professional)';
      desc = 'Advanced academic, scientific, or legal literature requiring university-level comprehension.';
    }

    return {
      fleschScore: clampedScore,
      fleschLevel: level,
      fleschDescription: desc,
      hasEnoughForReadability: true,
    };
  }, [words, sentences, rawWords]);

  // Task 5: Dynamic Reading and Speaking Times
  const readingSeconds = words > 0 ? Math.ceil((words / Math.max(1, readingWpm)) * 60) : 0;
  const readingMin = Math.floor(readingSeconds / 60);
  const readingSec = readingSeconds % 60;
  const readingDisplay = words > 0 ? `${readingMin}m ${readingSec}s` : '0m 0s';

  const speakingSeconds = words > 0 ? Math.ceil((words / Math.max(1, speakingWpm)) * 60) : 0;
  const speakingMin = Math.floor(speakingSeconds / 60);
  const speakingSec = speakingSeconds % 60;
  const speakingDisplay = words > 0 ? `${speakingMin}m ${speakingSec}s` : '0m 0s';

  // Task 8: Robust Word Frequency Calculation
  const { frequencyList, totalUniqueWords, lexicalDensity } = useMemo(() => {
    if (!trimmed) {
      return { frequencyList: [], totalUniqueWords: 0, lexicalDensity: 0 };
    }

    // Tokenize text into words, retaining internal hyphens and apostrophes (e.g. "state-of-the-art", "don't")
    const tokens = trimmed
      .toLowerCase()
      .match(/\b[a-z0-9]+(?:[''-][a-z0-9]+)*\b/g) || [];

    const freqMap: Record<string, number> = {};
    for (const t of tokens) {
      // Skip numbers alone from frequency table to focus on words
      if (/^\d+$/.test(t)) continue;
      if (filterStopWords && ENGLISH_STOP_WORDS.has(t)) continue;
      freqMap[t] = (freqMap[t] || 0) + 1;
    }

    const uniqueCount = Object.keys(freqMap).length;
    const density = words > 0 ? Math.round((uniqueCount / words) * 100) : 0;

    let entries = Object.entries(freqMap).map(([word, count]) => ({
      word,
      count,
      percent: words > 0 ? ((count / words) * 100).toFixed(1) : '0',
    }));

    if (freqFilterQuery.trim()) {
      const q = freqFilterQuery.toLowerCase().trim();
      entries = entries.filter((e) => e.word.includes(q));
    }

    if (frequencySort === 'frequency') {
      entries.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
    } else {
      entries.sort((a, b) => a.word.localeCompare(b.word));
    }

    return {
      frequencyList: entries,
      totalUniqueWords: uniqueCount,
      lexicalDensity: density,
    };
  }, [trimmed, filterStopWords, frequencySort, freqFilterQuery, words]);

  // Task 2: Goal Calculations
  const numericGoal = typeof wordGoal === 'number' && wordGoal > 0 ? wordGoal : null;
  const goalProgress = numericGoal ? Math.min(100, Math.round((words / numericGoal) * 100)) : 0;
  const remainingGoalWords = numericGoal ? numericGoal - words : null;
  const isGoalReached = numericGoal ? words >= numericGoal : false;

  // Task 3: Character Limit Calculations
  const numericCharLimit = typeof charLimit === 'number' && charLimit > 0 ? charLimit : null;
  const charLimitProgress = numericCharLimit ? Math.min(100, Math.round((charactersWithSpaces / numericCharLimit) * 100)) : 0;
  const remainingChars = numericCharLimit ? numericCharLimit - charactersWithSpaces : null;
  const isCharLimitReached = numericCharLimit ? charactersWithSpaces >= numericCharLimit : false;
  const isCharLimitOver = numericCharLimit ? charactersWithSpaces > numericCharLimit : false;

  // Actions
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (autosaveEnabled) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setFileError(null);
  };

  // Task 7: TXT Import
  const handleImportTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Verify it is a text file
    if (!file.name.endsWith('.txt') && file.type && !file.type.startsWith('text/')) {
      setFileError('Please select a valid plain text (.txt) file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setText(content);
        setFileError(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setFileError('Failed to read the selected text file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Task 7: TXT Export
  const handleExportTxt = () => {
    if (!text) return;
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `toolnest-word-count-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setFileError('Could not export text file in this browser environment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Workspace Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        {/* Metric Cards Row (Responsive Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-center">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Words</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-1">{words}</p>
            <span className="text-2xs text-emerald-600 block mt-0.5">{words === 1 ? '1 word' : `${words} words`}</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Characters</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-800 mt-1">{charactersWithSpaces}</p>
            <span className="text-2xs text-slate-500 block mt-0.5">With spaces</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">No Spaces</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-800 mt-1">{charactersWithoutSpaces}</p>
            <span className="text-2xs text-slate-500 block mt-0.5">Visible characters</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Sentences</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-800 mt-1">{sentences}</p>
            <span className="text-2xs text-slate-500 block mt-0.5">Avg {avgSentenceLength} w/s</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Paragraphs</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-800 mt-1">{paragraphs}</p>
            <span className="text-2xs text-slate-500 block mt-0.5">{lines} total lines</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Read Time</span>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-800 mt-2">{readingDisplay}</p>
            <span className="text-2xs text-slate-500 block mt-0.5">Est. @ {readingWpm} WPM</span>
          </div>
        </div>

        {/* Task 2 & 3: Goal & Limit Progress Meters (When configured) */}
        {(numericGoal || numericCharLimit) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            {/* Word Goal Progress */}
            {numericGoal && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-700" />
                    Word Goal: {words} / {numericGoal} words
                  </span>
                  <span className={`font-mono font-bold ${isGoalReached ? 'text-emerald-600' : 'text-emerald-700'}`}>
                    {goalProgress}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={words}
                  aria-valuemin={0}
                  aria-valuemax={numericGoal}
                  aria-label="Word Goal Progress"
                  className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${isGoalReached ? 'bg-emerald-500' : 'bg-emerald-600'}`}
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-2xs text-slate-500">
                  <span>
                    {isGoalReached ? (
                      <strong className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 inline" /> Goal Achieved! ({words - numericGoal >= 0 ? `${words - numericGoal} words over target` : '100%'})
                      </strong>
                    ) : (
                      `${remainingGoalWords} words remaining`
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWordGoal('')}
                    className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    Reset Goal
                  </button>
                </div>
              </div>
            )}

            {/* Character Limit Progress */}
            {numericCharLimit && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Char Limit: {charactersWithSpaces} / {numericCharLimit} chars
                  </span>
                  <span className={`font-mono font-bold ${isCharLimitOver ? 'text-rose-600' : isCharLimitReached ? 'text-amber-600' : 'text-slate-700'}`}>
                    {charLimitProgress}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={charactersWithSpaces}
                  aria-valuemin={0}
                  aria-valuemax={numericCharLimit}
                  aria-label="Character Limit Progress"
                  className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isCharLimitOver ? 'bg-rose-500' : isCharLimitReached ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${charLimitProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-2xs text-slate-500">
                  <span>
                    {isCharLimitOver ? (
                      <span className="text-rose-600 font-semibold">
                        Over limit by {charactersWithSpaces - numericCharLimit} characters
                      </span>
                    ) : isCharLimitReached ? (
                      <span className="text-amber-700 font-semibold">Maximum limit reached</span>
                    ) : (
                      `${remainingChars} characters remaining`
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCharLimit('')}
                    className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    Reset Limit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error notification banner if file read fails */}
        {fileError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Main Textarea */}
        <div className="relative">
          <textarea
            rows={11}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to count words, characters, sentences, paragraphs, and analyze readability... Or click 'Load Sample' below to explore with sample writing."
            aria-label="Text to count and analyze"
            className="w-full p-4 text-base text-slate-800 bg-slate-50/60 border border-slate-300 rounded-2xl focus:bg-white focus:outline-hidden focus:border-emerald-500 leading-relaxed font-sans placeholder:text-slate-400"
          />

          {/* Quick empty state prompt if no text */}
          {!text && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
              <span className="text-2xs text-slate-400 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                Zero server uploads · Private in-browser counting
              </span>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Copy text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Load sample prose to test calculations"
            >
              Load Sample
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={!text}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Clear text editor and reset statistics"
            >
              <RotateCcw className="w-3 h-3" />
              Clear Text
            </button>

            {/* Task 7: TXT File Import & Export Actions */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportTxt}
              accept=".txt,text/plain"
              className="hidden"
              id="txt-file-input"
            />
            <label
              htmlFor="txt-file-input"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Import plain .txt file from your computer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Import .TXT
            </label>

            <button
              type="button"
              onClick={handleExportTxt}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Download text as a .txt file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export .TXT
            </button>
          </div>

          {/* Quick Tools Drawer Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGoalTracker((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                showGoalTracker || numericGoal ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Goal Tracker
            </button>

            <button
              type="button"
              onClick={() => setShowCharLimit((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                showCharLimit || numericCharLimit ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Char Limit
            </button>

            <button
              type="button"
              onClick={() => setShowSpeedControls((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                showSpeedControls ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Pacing Speed
            </button>
          </div>
        </div>

        {/* Task 2: Goal Tracker Drawer */}
        {showGoalTracker && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-700" />
                Custom Word Goal Target
              </span>
              <span className="text-2xs text-slate-500">Track target quotas for essays, articles, or assignments</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="custom-word-goal" className="text-xs text-slate-600 font-medium">
                  Target Words:
                </label>
                <input
                  id="custom-word-goal"
                  type="number"
                  min="1"
                  step="25"
                  value={wordGoal}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : '';
                    setWordGoal(val !== '' && !isNaN(val) && val > 0 ? val : '');
                  }}
                  placeholder="e.g. 500"
                  className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-2xs text-slate-600">
                <span className="text-slate-400">Presets:</span>
                {[250, 500, 750, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWordGoal(preset)}
                    className={`px-2 py-1 rounded-md border text-2xs font-mono transition-colors cursor-pointer ${
                      wordGoal === preset ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset}w
                  </button>
                ))}
                {wordGoal !== '' && (
                  <button
                    type="button"
                    onClick={() => setWordGoal('')}
                    className="ml-2 text-rose-600 hover:underline text-2xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task 3: Character Limit Drawer */}
        {showCharLimit && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800">
                Custom Character Ceiling / Limit
              </span>
              <span className="text-2xs text-slate-500">Monitor character quotas for forms, abstracts, and posts</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="custom-char-limit" className="text-xs text-slate-600 font-medium">
                  Max Characters:
                </label>
                <input
                  id="custom-char-limit"
                  type="number"
                  min="1"
                  step="10"
                  value={charLimit}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : '';
                    setCharLimit(val !== '' && !isNaN(val) && val > 0 ? val : '');
                  }}
                  placeholder="e.g. 280"
                  className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-2xs text-slate-600">
                <span className="text-slate-400">Presets:</span>
                {[160, 280, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCharLimit(preset)}
                    className={`px-2 py-1 rounded-md border text-2xs font-mono transition-colors cursor-pointer ${
                      charLimit === preset ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset}c
                  </button>
                ))}
                {charLimit !== '' && (
                  <button
                    type="button"
                    onClick={() => setCharLimit('')}
                    className="ml-2 text-rose-600 hover:underline text-2xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <p className="text-2xs text-slate-500 italic">
              Note: Character counts reflect standard UTF-16 string length. Specific external platforms may calculate emoji clusters or URL characters using specialized multi-byte weights.
            </p>
          </div>
        )}

        {/* Task 5: Custom Reading and Speaking Speed Drawer */}
        {showSpeedControls && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-700" />
                Configurable Reading & Speaking Rates
              </span>
              <span className="text-2xs text-slate-500">Benchmark speed assumptions in words per minute (WPM)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    Reading Speed
                  </span>
                  <span className="font-mono text-emerald-700">{readingWpm} WPM</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="450"
                  step="25"
                  value={readingWpm}
                  onChange={(e) => setReadingWpm(parseInt(e.target.value, 10))}
                  aria-label="Reading speed in words per minute"
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-2xs text-slate-500">
                  <span>Slow (150)</span>
                  <button
                    type="button"
                    onClick={() => setReadingWpm(225)}
                    className="text-emerald-700 hover:underline"
                  >
                    Default (225)
                  </button>
                  <span>Fast (350)</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    Speaking Duration
                  </span>
                  <span className="font-mono text-emerald-600">{speakingWpm} WPM</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="240"
                  step="10"
                  value={speakingWpm}
                  onChange={(e) => setSpeakingWpm(parseInt(e.target.value, 10))}
                  aria-label="Speaking pace in words per minute"
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-2xs text-slate-500">
                  <span>Deliberate (100)</span>
                  <button
                    type="button"
                    onClick={() => setSpeakingWpm(130)}
                    className="text-emerald-600 hover:underline"
                  >
                    Default (130)
                  </button>
                  <span>Rapid (180)</span>
                </div>
              </div>
            </div>

            <p className="text-2xs text-slate-500">
              Durations are calculated estimations for planning. Actual silent reading and oral presentation delivery vary according to vocabulary difficulty, audience comprehension, and pauses.
            </p>
          </div>
        )}

        {/* Task 6: Local Browser Autosave Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-2xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autosaveEnabled}
                onChange={toggleAutosave}
                className="w-3.5 h-3.5 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Save className="w-3 h-3 text-slate-500" />
                Browser Local Autosave
              </span>
            </label>
            {autosaveEnabled && lastSavedNotice && (
              <span className="text-emerald-700 font-medium">· {lastSavedNotice}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {autosaveEnabled && (
              <button
                type="button"
                onClick={handleClearSavedStorage}
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Wipe saved draft from this device's browser memory"
              >
                <Trash2 className="w-3 h-3" />
                Erase Saved Storage
              </button>
            )}
            <span className="text-slate-400">
              Speaking time estimate: <strong className="text-slate-700 font-semibold">{speakingDisplay}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Task 4: Readability & Prose Analytics Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              English Readability & Text Structure
            </h3>
            <p className="text-2xs text-slate-500 mt-0.5">
              Flesch Reading Ease score and structural statistics (estimated for English prose)
            </p>
          </div>
          {hasEnoughForReadability && fleschScore !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-700 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                Score: {fleschScore} / 100
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
              Avg. Sentence Length
            </span>
            <p className="text-lg font-bold font-mono text-slate-800">
              {avgSentenceLength} <span className="text-xs font-normal text-slate-500">words/sentence</span>
            </p>
            <span className="text-2xs text-slate-500 block">
              {sentences > 0 && parseFloat(avgSentenceLength) > 25
                ? 'Sentences are on the longer side; consider breaking them up.'
                : 'Balanced sentence flow.'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
              Avg. Word Length
            </span>
            <p className="text-lg font-bold font-mono text-slate-800">
              {avgWordLength} <span className="text-xs font-normal text-slate-500">characters/word</span>
            </p>
            <span className="text-2xs text-slate-500 block">
              Excludes spaces and whitespace formatting.
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
              Lexical Richness
            </span>
            <p className="text-lg font-bold font-mono text-slate-800">
              {lexicalDensity}% <span className="text-xs font-normal text-slate-500">unique words</span>
            </p>
            <span className="text-2xs text-slate-500 block">
              {totalUniqueWords} unique terms in document.
            </span>
          </div>
        </div>

        {/* Flesch Reading Ease Explanation */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Readability Benchmark:</span>
              <span className="text-emerald-800">{fleschLevel}</span>
            </span>
            {fleschScore !== null && (
              <span className="text-2xs text-slate-500">Flesch Reading Ease Formula</span>
            )}
          </div>
          <p className="leading-relaxed text-slate-600 text-xs">
            {fleschDescription}
          </p>
          <p className="text-2xs text-slate-400 italic pt-1 border-t border-emerald-100/80">
            * Note: The Flesch Reading Ease formula is modeled specifically on English syllable and sentence structures. It provides an estimate and does not evaluate semantic nuance, non-English typography, or specialized industry jargon.
          </p>
        </div>
      </div>

      {/* Task 8: Word Frequency & Document Text Statistics Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-700" />
              Document Word Frequency & Text Statistics
            </h3>
            <p className="text-2xs text-slate-500 mt-0.5">
              Occurrence counts and repetition density across your writing (document statistics, not SEO ranking signals)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-2xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterStopWords}
                onChange={(e) => setFilterStopWords(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-700 rounded border-slate-300"
              />
              <span>Filter Stop Words</span>
            </label>

            <select
              value={frequencySort}
              onChange={(e) => setFrequencySort(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-2xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="frequency">Sort: Most Frequent</option>
              <option value="alphabetical">Sort: A to Z</option>
            </select>
          </div>
        </div>

        {/* Search filter for word frequency table */}
        {frequencyList.length > 5 && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={freqFilterQuery}
              onChange={(e) => setFreqFilterQuery(e.target.value)}
              placeholder="Filter words..."
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-2xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 w-full sm:w-60"
            />
            {freqFilterQuery && (
              <button
                type="button"
                onClick={() => setFreqFilterQuery('')}
                className="text-2xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Frequency Table */}
        {frequencyList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            {trimmed
              ? 'No matching words found for current filters.'
              : 'Enter or paste text above to see word frequency distribution and repetition statistics.'}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {(showAllFrequencies ? frequencyList : frequencyList.slice(0, 15)).map((item) => (
                <div
                  key={item.word}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800 truncate pr-2" title={item.word}>
                    {item.word}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 text-2xs font-mono">
                    <span className="font-bold text-emerald-700">{item.count}×</span>
                    <span className="text-slate-400">({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>

            {frequencyList.length > 15 && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllFrequencies((prev) => !prev)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  {showAllFrequencies ? 'Show Top 15 Words' : `View All ${frequencyList.length} Unique Words`}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-2xs text-slate-400 pt-2 border-t border-slate-100">
          * Note: Word frequency analysis processes whitespace-delimited Latin and standard Unicode words, preserving internal hyphens (e.g., &quot;well-known&quot;) and apostrophes. Continuous non-Latin scripts (such as Chinese or Japanese) are not segmented by word boundary.
        </p>
      </div>

      {/* Task 9: Comprehensive Educational SEO Content Section */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Free Online Word Counter for Essays and Documents
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            ToolNest&apos;s free online word counter is an accurate, real-time writing analysis utility designed for students, educators, authors, translators, and digital professionals. Whether you are drafting a university assignment, pacing an oral conference presentation, or verifying manuscript lengths, our word count checker provides instantaneous counts for words, characters (with and without spaces), sentences, and paragraphs as you type.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              Check Word Count and Character Count
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Different academic institutions, publishers, and platforms enforce distinct measuring standards. While college professors often assign strict essay word limits (such as a 1,000-word limit), translation agencies and copywriters frequently quote based on character counts. ToolNest calculates both metrics simultaneously:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Characters (With Spaces):</strong> Measures every keystroke in your document, including spaces, tabs, and newlines. Essential for publishing formats and post character ceilings.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Characters (No Spaces):</strong> Strips all whitespace to isolate visible letters, digits, and punctuation glyphs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Strict Platform Limits:</strong> If you are drafting copy for social media or SEO meta tags with visual progress bars, try our specialized <Link to="/tools/character-counter" className="text-emerald-700 font-semibold hover:underline">Character Counter</Link>.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              How to Count Words in a Paragraph
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Counting words in an individual paragraph or subsection is simple:
            </p>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-700 list-decimal list-inside">
              <li>Copy the target paragraph from your word processor or document editor.</li>
              <li>Paste the text directly into the ToolNest Word Counter workspace.</li>
              <li>Instantly read the exact word count, sentence count, and estimated reading time on the top metric cards.</li>
              <li>To check sentence structure, grammatical pacing, and run-on sentences, inspect our companion <Link to="/tools/sentence-counter" className="text-emerald-700 font-semibold hover:underline">Sentence Counter</Link>.</li>
              <li>Before counting, if your copied paragraph contains irregular whitespace or double tabs, clean it with our <Link to="/tools/text-cleaner" className="text-emerald-700 font-semibold hover:underline">Text Cleaner</Link>.</li>
            </ol>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            How Word Counting Works
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The ToolNest counting engine runs directly inside your web browser. When you paste or type text, the algorithm:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-800">1. Whitespace Splitting</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trims outer spacing and splits characters on whitespace boundaries (<code className="font-mono text-2xs bg-slate-200/70 px-1 py-0.5 rounded">/\s+/</code>). Words separated by regular spaces, non-breaking spaces, tabs, or newlines register as separate words.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-800">2. Hyphenated Compounds</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hyphenated terms (like <em>well-known</em> or <em>state-of-the-art</em>) count as a single word unless spaces surround the hyphens, matching the standard counting rules of Microsoft Word and Google Docs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-800">3. Reading & Speaking Time</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Silent reading is estimated at 225 WPM by default, while speaking duration defaults to 130 WPM. To model slower or faster reading speeds, explore our dedicated <Link to="/tools/reading-time-calculator" className="text-emerald-700 font-semibold hover:underline">Reading Time Calculator</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
