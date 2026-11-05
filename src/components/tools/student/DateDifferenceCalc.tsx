import React, { useState } from 'react';
import { Calendar, Clock, Copy, Check } from 'lucide-react';

export function DateDifferenceCalc() {
  const today = new Date().toISOString().split('T')[0];
  const [startDateStr, setStartDateStr] = useState<string>('2026-01-01');
  const [endDateStr, setEndDateStr] = useState<string>(today);
  const [includeEndDay, setIncludeEndDay] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const calculateDifference = () => {
    if (!startDateStr || !endDateStr) return null;

    const d1 = new Date(startDateStr + 'T00:00:00');
    const d2 = new Date(endDateStr + 'T00:00:00');

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const start = d1 <= d2 ? d1 : d2;
    const end = d1 <= d2 ? d2 : d1;
    const isReversed = d1 > d2;

    const timeDiff = end.getTime() - start.getTime();
    let totalDays = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    if (includeEndDay) totalDays += 1;

    // Calculate years, months, days
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonthDays;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (includeEndDay) {
      days += 1;
    }

    // Business days (weekdays vs weekends)
    let businessDays = 0;
    let weekendDays = 0;
    const cur = new Date(start);
    const limit = new Date(end);
    if (!includeEndDay) {
      limit.setDate(limit.getDate() - 1);
    }

    while (cur <= limit) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      } else {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    const totalWeeks = (totalDays / 7).toFixed(1);
    const totalHours = totalDays * 24;

    return {
      totalDays,
      years,
      months,
      days,
      totalWeeks,
      totalHours,
      businessDays,
      weekendDays,
      isReversed,
    };
  };

  const diff = calculateDifference();

  const handleCopy = () => {
    if (!diff) return;
    navigator.clipboard.writeText(`${diff.totalDays} days (${diff.years} years, ${diff.months} months, ${diff.days} days)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="diff-start-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Start Date
            </label>
            <input
              id="diff-start-date"
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="diff-end-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
              End Date
            </label>
            <input
              id="diff-end-date"
              type="date"
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={includeEndDay}
            onChange={(e) => setIncludeEndDay(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span>Include end date in calculation (+1 day)</span>
        </label>

        {diff && (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 text-center space-y-2">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Total Difference
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-700">
                {diff.totalDays.toLocaleString()} <span className="text-xl sm:text-2xl font-sans font-medium text-slate-600">days</span>
              </div>
              <p className="text-xs text-slate-600">
                Equivalent to <strong className="text-slate-900">{diff.years} years, {diff.months} months, and {diff.days} days</strong>
              </p>

              <div className="mt-4 pt-4 border-t border-emerald-200/80 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Result'}
                </button>
              </div>
            </div>

            {/* Time Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">Working Days</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-1">{diff.businessDays}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">Weekend Days</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-1">{diff.weekendDays}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">Total Weeks</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-1">{diff.totalWeeks}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">Total Hours</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-1">{diff.totalHours.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
