import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Calculator, Target, CheckCircle2 } from 'lucide-react';

interface GradeRow {
  id: string;
  name: string;
  grade: number; // percentage
  weight: number; // percentage
}

export function GradeCalculator() {
  const [activeTab, setActiveTab] = useState<'currentGrade' | 'finalGrade'>('currentGrade');

  // State for weighted grade calculator
  const [rows, setRows] = useState<GradeRow[]>([
    { id: '1', name: 'Homework & Assignments', grade: 92, weight: 20 },
    { id: '2', name: 'Quizzes', grade: 88, weight: 15 },
    { id: '3', name: 'Midterm Exam', grade: 84, weight: 25 },
    { id: '4', name: 'Class Project', grade: 95, weight: 15 },
  ]);

  // State for final exam target calculator
  const [currentGradeInput, setCurrentGradeInput] = useState<number>(83);
  const [targetGradeInput, setTargetGradeInput] = useState<number>(90);
  const [finalWeightInput, setFinalWeightInput] = useState<number>(25);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now().toString(), name: `Assessment ${prev.length + 1}`, grade: 85, weight: 10 },
    ]);
  };

  const updateRow = (id: string, field: 'name' | 'grade' | 'weight', val: string | number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === 'name') return { ...r, name: String(val) };
        const num = Number(val);
        return { ...r, [field]: isNaN(num) ? 0 : num };
      })
    );
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Calculations for current weighted grade
  const totalWeight = rows.reduce((sum, r) => sum + (r.weight || 0), 0);
  const weightedSum = rows.reduce((sum, r) => sum + (r.grade || 0) * ((r.weight || 0) / 100), 0);
  const calculatedCurrentGrade = totalWeight > 0 ? (weightedSum / (totalWeight / 100)) : 0;

  const getLetterGrade = (pct: number) => {
    if (pct >= 93) return { letter: 'A', gpa: '4.0', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (pct >= 90) return { letter: 'A-', gpa: '3.7', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (pct >= 87) return { letter: 'B+', gpa: '3.3', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct >= 83) return { letter: 'B', gpa: '3.0', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct >= 80) return { letter: 'B-', gpa: '2.7', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct >= 77) return { letter: 'C+', gpa: '2.3', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (pct >= 73) return { letter: 'C', gpa: '2.0', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (pct >= 70) return { letter: 'C-', gpa: '1.7', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (pct >= 60) return { letter: 'D', gpa: '1.0', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { letter: 'F', gpa: '0.0', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const currentLetter = getLetterGrade(calculatedCurrentGrade);

  // Calculation for final exam target
  // Target = (Current * (100 - FinalWeight) + FinalScore * FinalWeight) / 100
  // FinalScore * FinalWeight = Target * 100 - Current * (100 - FinalWeight)
  // FinalScore = (Target * 100 - Current * (100 - FinalWeight)) / FinalWeight
  const currentWeightFrac = (100 - finalWeightInput) / 100;
  const finalWeightFrac = finalWeightInput / 100;
  const neededScore =
    finalWeightFrac > 0
      ? (targetGradeInput - currentGradeInput * currentWeightFrac) / finalWeightFrac
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Grade & Final Exam Calculator</h2>
          <p className="text-sm text-slate-500 mt-1">
            Calculate your weighted course grade or figure out what score you need on your final exam.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('currentGrade')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'currentGrade' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Weighted Grade
          </button>
          <button
            onClick={() => setActiveTab('finalGrade')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'finalGrade' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Final Exam Target
          </button>
        </div>
      </div>

      {activeTab === 'currentGrade' ? (
        <div>
          {/* Result Banner */}
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                Current Weighted Grade
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-950 mt-1">
                {calculatedCurrentGrade.toFixed(2)}%
              </div>
              <p className="text-xs text-emerald-800/80 mt-1">
                Total weight accounted for: {totalWeight.toFixed(0)}%
                {totalWeight !== 100 && (
                  <span className="text-amber-700 ml-1">
                    (Weights do not sum to 100%, grade is normalized)
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-end">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Letter Grade
              </div>
              <div
                className={`text-2xl font-black px-4 py-2 rounded-xl border flex items-center gap-2 ${currentLetter.color}`}
              >
                <span>{currentLetter.letter}</span>
                <span className="text-sm font-semibold opacity-80">({currentLetter.gpa} GPA)</span>
              </div>
            </div>
          </div>

          {/* Table of assignments */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto mb-4">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Assessment / Category</th>
                  <th className="px-4 py-3">Grade (%)</th>
                  <th className="px-4 py-3">Weight (%)</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="150"
                        value={row.grade || ''}
                        onChange={(e) => updateRow(row.id, 'grade', e.target.value)}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={row.weight || ''}
                        onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 1}
                        aria-label="Remove row"
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
            onClick={addRow}
            className="px-4 py-2 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 text-emerald-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Assessment
          </button>
        </div>
      ) : (
        /* Final Exam Target Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Current Class Grade (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentGradeInput}
                onChange={(e) => setCurrentGradeInput(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
              <p className="text-2xs text-slate-500 mt-1">Your current average before final</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Target Desired Grade (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetGradeInput}
                onChange={(e) => setTargetGradeInput(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
              <p className="text-2xs text-slate-500 mt-1">e.g. 90% for an A, 80% for a B</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Final Exam Weight (%)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={finalWeightInput}
                onChange={(e) => setFinalWeightInput(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
              <p className="text-2xs text-slate-500 mt-1">Worth as a percentage of overall grade</p>
            </div>
          </div>

          {/* Target Result Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-emerald-200 text-center sm:text-left flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Score Needed on Final Exam
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-950 mt-2">
                {neededScore.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                {neededScore <= 100
                  ? neededScore <= 0
                    ? 'You have already secured your target grade even with a 0 on the final!'
                    : `You need at least ${neededScore.toFixed(1)}% on the final to finish with a ${targetGradeInput}%.`
                  : `You need over 100% (${neededScore.toFixed(1)}%). Extra credit will be required.`}
              </p>
            </div>

            <div className="flex gap-2">
              {[80, 85, 90, 93].map((tgt) => (
                <button
                  key={tgt}
                  onClick={() => setTargetGradeInput(tgt)}
                  className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-xs font-semibold text-emerald-800 cursor-pointer"
                >
                  Target {tgt}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
