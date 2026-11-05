import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Copy, Check, Calculator, Award } from 'lucide-react';

interface SemesterRow {
  id: string;
  name: string;
  gpa: number;
  credits: number;
}

export function CgpaCalculator() {
  const [scale, setScale] = useState<4 | 5 | 10>(4);
  const [semesters, setSemesters] = useState<SemesterRow[]>([
    { id: '1', name: 'Semester 1', gpa: 3.8, credits: 16 },
    { id: '2', name: 'Semester 2', gpa: 3.6, credits: 15 },
    { id: '3', name: 'Semester 3', gpa: 3.9, credits: 18 },
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  const addSemester = () => {
    setSemesters((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Semester ${prev.length + 1}`,
        gpa: scale === 4 ? 3.5 : scale === 5 ? 4.2 : 8.5,
        credits: 15,
      },
    ]);
  };

  const updateSemester = (id: string, field: 'name' | 'gpa' | 'credits', value: string | number) => {
    setSemesters((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        if (field === 'name') return { ...row, name: String(value) };
        const num = Number(value);
        return { ...row, [field]: isNaN(num) ? 0 : num };
      })
    );
  };

  const removeSemester = (id: string) => {
    if (semesters.length <= 1) return;
    setSemesters((prev) => prev.filter((r) => r.id !== id));
  };

  const resetAll = () => {
    setSemesters([
      { id: '1', name: 'Semester 1', gpa: 3.8, credits: 16 },
      { id: '2', name: 'Semester 2', gpa: 3.6, credits: 15 },
    ]);
  };

  // Calculations
  const totalCredits = semesters.reduce((sum, s) => sum + (s.credits || 0), 0);
  const totalQualityPoints = semesters.reduce((sum, s) => sum + (s.gpa || 0) * (s.credits || 0), 0);
  const calculatedCgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  // Percentage equivalents based on scale
  let percentageEquivalent = 0;
  if (scale === 4) {
    percentageEquivalent = (calculatedCgpa / 4) * 100;
  } else if (scale === 5) {
    percentageEquivalent = (calculatedCgpa / 5) * 100;
  } else {
    // 10-point scale commonly uses (CGPA * 9.5) or (CGPA / 10 * 100)
    percentageEquivalent = calculatedCgpa * 9.5;
  }

  const getAcademicStanding = (cgpa: number, maxScale: number) => {
    const ratio = cgpa / maxScale;
    if (ratio >= 0.9) return { label: 'Summa Cum Laude / Outstanding', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (ratio >= 0.8) return { label: 'Magna Cum Laude / Excellent', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (ratio >= 0.7) return { label: 'First Class / Very Good', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (ratio >= 0.6) return { label: 'Second Class / Good', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Satisfactory / Passing', color: 'text-slate-700 bg-slate-50 border-slate-200' };
  };

  const standing = getAcademicStanding(calculatedCgpa, scale);

  const copySummary = () => {
    const lines = [
      `ToolNest CGPA Report (${scale}.0 Scale)`,
      `Cumulative CGPA: ${calculatedCgpa.toFixed(2)} / ${scale}.00`,
      `Total Credit Hours: ${totalCredits}`,
      `Estimated Percentage: ${percentageEquivalent.toFixed(1)}%`,
      `Academic Standing: ${standing.label}`,
      '',
      'Semester Breakdown:',
      ...semesters.map((s) => `• ${s.name}: GPA ${s.gpa.toFixed(2)} (${s.credits} credits)`),
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cumulative GPA (CGPA) Calculator</h2>
          <p className="text-sm text-slate-500 mt-1">
            Calculate your cumulative grade point average across all college or university semesters.
          </p>
        </div>

        {/* Scale Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <span className="px-2 text-slate-500">Scale:</span>
          {([4, 5, 10] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                scale === s ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              {s}.0
            </button>
          ))}
        </div>
      </div>

      {/* Main Result Card */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-emerald-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Cumulative CGPA
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-950 mt-1">
              {calculatedCgpa.toFixed(2)}
              <span className="text-lg font-normal text-emerald-700/70"> / {scale}.0</span>
            </div>
            <p className="text-2xs text-emerald-800/80 mt-1">
              Quality Points: {totalQualityPoints.toFixed(1)}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Total Credits Earned
            </span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">
              {totalCredits} <span className="text-sm font-normal text-slate-500">Credit Hours</span>
            </div>
            <p className="text-2xs text-slate-500 mt-1">Across {semesters.length} semesters</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Estimated Percentage
            </span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">
              {percentageEquivalent.toFixed(1)}%
            </div>
            <p className="text-2xs text-slate-500 mt-1">Standard academic conversion</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${standing.color}`}>
              {standing.label}
            </span>
          </div>

          <button
            onClick={copySummary}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Summary Report'}
          </button>
        </div>
      </div>

      {/* Semesters Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Semester Breakdown
          </h3>
          <button
            onClick={resetAll}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Semester / Term</th>
                <th className="px-4 py-3">GPA / SGPA (0 - {scale})</th>
                <th className="px-4 py-3">Credit Hours</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {semesters.map((sem, idx) => (
                <tr key={sem.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={sem.name}
                      onChange={(e) => updateSemester(sem.id, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={scale}
                      value={sem.gpa || ''}
                      onChange={(e) => updateSemester(sem.id, 'gpa', e.target.value)}
                      className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="40"
                      value={sem.credits || ''}
                      onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => removeSemester(sem.id)}
                      disabled={semesters.length <= 1}
                      aria-label="Remove semester"
                      className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={addSemester}
          className="mt-3 px-4 py-2 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 text-emerald-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Another Semester
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-800">Formula: </span>
        <code className="font-mono bg-slate-200/70 px-1 py-0.5 rounded text-emerald-800">
          CGPA = Σ(Semester GPA × Semester Credits) ÷ Total Credits
        </code>
      </div>
    </div>
  );
}
