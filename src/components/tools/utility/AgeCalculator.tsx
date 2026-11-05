import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles, AlertCircle } from 'lucide-react';

export function AgeCalculator() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [birthDateStr, setBirthDateStr] = useState<string>('2000-01-15');
  const [targetDateStr, setTargetDateStr] = useState<string>(todayStr);

  const calculateAge = () => {
    if (!birthDateStr || !targetDateStr) return null;

    const birth = new Date(birthDateStr + 'T00:00:00');
    const target = new Date(targetDateStr + 'T00:00:00');

    if (isNaN(birth.getTime()) || isNaN(target.getTime())) {
      return null;
    }

    if (birth > target) {
      return { isFuture: true };
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffTime = target.getTime() - birth.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bornDayName = daysOfWeek[birth.getDay()];

    let nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    const m = birth.getMonth() + 1;
    const d = birth.getDate();
    let zodiac = 'Aries';
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) zodiac = 'Aquarius ♒';
    else if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) zodiac = 'Pisces ♓';
    else if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) zodiac = 'Aries ♈';
    else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) zodiac = 'Taurus ♉';
    else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) zodiac = 'Gemini ♊';
    else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) zodiac = 'Cancer ♋';
    else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) zodiac = 'Leo ♌';
    else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) zodiac = 'Virgo ♍';
    else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) zodiac = 'Libra ♎';
    else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) zodiac = 'Scorpio ♏';
    else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) zodiac = 'Sagittarius ♐';
    else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) zodiac = 'Capricorn ♑';

    return {
      isFuture: false,
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      bornDayName,
      daysToNextBday,
      zodiac,
    };
  };

  const results = calculateAge();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDateStr}
              max={todayStr}
              onChange={(e) => setBirthDateStr(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Age as of Date (Today)
            </label>
            <input
              type="date"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {results && results.isFuture ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Future Date Selected</p>
              <p className="mt-0.5">The selected birth date is in the future relative to the comparison date. Please select a past or present date to calculate chronological age.</p>
            </div>
          </div>
        ) : results ? (
          <div className="space-y-6 pt-4">
            {/* Primary Age Display */}
            <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 text-center">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Chronological Age
              </span>
              <div className="flex flex-wrap items-baseline justify-center gap-3 mt-3">
                <div>
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-700">
                    {results.years}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-600 ml-1 font-medium">years</span>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-800">
                    {results.months}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-600 ml-1 font-medium">months</span>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-800">
                    {results.days}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-600 ml-1 font-medium">days</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Born on a <span className="font-semibold text-slate-800">{results.bornDayName}</span> · Zodiac: <span className="font-semibold text-slate-800">{results.zodiac}</span>
              </p>
            </div>

            {/* Next Birthday & Milestones */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">Next Birthday</span>
                <p className="text-lg font-bold font-mono text-emerald-700 mt-1">
                  {results.daysToNextBday} <span className="text-xs font-normal text-slate-500">days</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">Total Days</span>
                <p className="text-lg font-bold font-mono text-slate-800 mt-1">
                  {results.totalDays?.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">Total Weeks</span>
                <p className="text-lg font-bold font-mono text-slate-800 mt-1">
                  {results.totalWeeks?.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">Total Hours</span>
                <p className="text-lg font-bold font-mono text-slate-800 mt-1">
                  {results.totalHours?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm">
            Select your birth date above to compute your exact age.
          </div>
        )}
      </div>
    </div>
  );
}
