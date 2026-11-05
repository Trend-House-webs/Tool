import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, Calendar, RefreshCw } from 'lucide-react';

export function TimestampConverter() {
  const [currentSec, setCurrentSec] = useState<number>(Math.floor(Date.now() / 1000));
  const [inputTimestamp, setInputTimestamp] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [inputDate, setInputDate] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse input timestamp
  const tsNum = parseFloat(inputTimestamp) || 0;
  // If timestamp has > 11 digits, assume milliseconds
  const isMs = tsNum > 99999999999;
  const parsedDate = new Date(isMs ? tsNum : tsNum * 1000);
  const isValidDate = !isNaN(parsedDate.getTime()) && tsNum > 0;

  // Convert Date picker to timestamp
  const dateObj = new Date(inputDate);
  const calculatedSec = !isNaN(dateObj.getTime()) ? Math.floor(dateObj.getTime() / 1000) : 0;
  const calculatedMs = !isNaN(dateObj.getTime()) ? dateObj.getTime() : 0;

  // Relative time string
  const getRelativeTime = (d: Date) => {
    const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    const diffHr = Math.round(diffMin / 60);
    if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour');
    const diffDays = Math.round(diffHr / 24);
    return rtf.format(diffDays, 'day');
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
          <h2 className="text-xl font-bold text-slate-900">Unix Timestamp Converter</h2>
          <p className="text-sm text-slate-500 mt-1">
            Convert epoch timestamps (seconds & milliseconds) to human-readable dates and vice-versa.
          </p>
        </div>
      </div>

      {/* Current Live Epoch Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Current Unix Epoch Time
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-1">
            {currentSec}
          </div>
          <p className="text-2xs text-slate-400 mt-0.5">Seconds since Jan 01 1970 (UTC)</p>
        </div>

        <button
          onClick={() => copyVal(currentSec.toString(), 'live')}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedKey === 'live' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copiedKey === 'live' ? 'Copied' : 'Copy Timestamp'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Timestamp to Human Date */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" /> Convert Timestamp to Date
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter Unix Timestamp (Seconds or Milliseconds)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputTimestamp}
                onChange={(e) => setInputTimestamp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 1700000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
              <button
                onClick={() => setInputTimestamp(currentSec.toString())}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shrink-0 cursor-pointer"
              >
                Now
              </button>
            </div>
          </div>

          {isValidDate ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">UTC Date & Time</span>
                <span className="font-mono text-slate-800 font-bold">{parsedDate.toUTCString()}</span>
              </div>
              <div className="p-3 bg-white flex items-center justify-between">
                <span className="text-slate-500 font-medium">Local Browser Time</span>
                <span className="font-mono text-slate-800 font-bold">{parsedDate.toString()}</span>
              </div>
              <div className="p-3 bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">ISO 8601 Format</span>
                <span className="font-mono text-slate-800">{parsedDate.toISOString()}</span>
              </div>
              <div className="p-3 bg-white flex items-center justify-between">
                <span className="text-slate-500 font-medium">Relative Time</span>
                <span className="font-semibold text-emerald-700">{getRelativeTime(parsedDate)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-red-500">Please enter a valid numeric Unix timestamp.</p>
          )}
        </div>

        {/* Right: Date to Timestamp */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" /> Convert Date to Timestamp
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Date & Time (Local)
            </label>
            <input
              type="datetime-local"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium block">Seconds (Unix Epoch)</span>
                <span className="font-mono text-emerald-950 font-extrabold text-base">{calculatedSec}</span>
              </div>
              <button
                onClick={() => copyVal(calculatedSec.toString(), 'sec')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'sec' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'sec' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-3 bg-white flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium block">Milliseconds (JS Date.now())</span>
                <span className="font-mono text-slate-800 font-bold">{calculatedMs}</span>
              </div>
              <button
                onClick={() => copyVal(calculatedMs.toString(), 'ms')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'ms' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'ms' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
