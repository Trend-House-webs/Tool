import React, { useState } from 'react';
import { Copy, Check, GraduationCap, Plus, Trash2 } from 'lucide-react';

interface SubjectEntry {
  id: string;
  name: string;
  obtained: number;
  total: number;
}

export function MarksPercentageCalc() {
  const [mode, setMode] = useState<'single' | 'multi'>('single');

  // Single mode
  const [obtainedMarks, setObtainedMarks] = useState<string>('442');
  const [maxMarks, setMaxMarks] = useState<string>('500');

  // Multi subject mode
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { id: '1', name: 'Mathematics', obtained: 92, total: 100 },
    { id: '2', name: 'Physics', obtained: 85, total: 100 },
    { id: '3', name: 'Chemistry', obtained: 88, total: 100 },
    { id: '4', name: 'English', obtained: 90, total: 100 },
    { id: '5', name: 'Computer Science', obtained: 95, total: 100 },
  ]);

  const [copied, setCopied] = useState<boolean>(false);

  // Single calculation
  const sObtained = parseFloat(obtainedMarks) || 0;
  const sTotal = parseFloat(maxMarks) || 1;
  const singlePct = sTotal > 0 ? (sObtained / sTotal) * 100 : 0;

  // Multi calculation
  const multiObtained = subjects.reduce((sum, s) => sum + (Number(s.obtained) || 0), 0);
  const multiTotal = subjects.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const multiPct = multiTotal > 0 ? (multiObtained / multiTotal) * 100 : 0;

  const currentPct = mode === 'single' ? singlePct : multiPct;
  const currentObtained = mode === 'single' ? sObtained : multiObtained;
  const currentTotal = mode === 'single' ? sTotal : multiTotal;

  // Determine letter grade
  const getGradeInfo = (pct: number) => {
    if (pct >= 90) return { grade: 'A+ (Outstanding)', gpa: '4.0 / 10.0', status: 'Passed with Distinction' };
    if (pct >= 80) return { grade: 'A (Excellent)', gpa: '3.7 / 9.0', status: 'Passed with Honors' };
    if (pct >= 70) return { grade: 'B (Very Good)', gpa: '3.0 / 8.0', status: 'Passed First Class' };
    if (pct >= 60) return { grade: 'C (Good)', gpa: '2.5 / 7.0', status: 'Passed Second Class' };
    if (pct >= 50) return { grade: 'D (Pass)', gpa: '2.0 / 6.0', status: 'Passed' };
    if (pct >= 40) return { grade: 'E (Barely Passed)', gpa: '1.0 / 5.0', status: 'Passing Minimum' };
    return { grade: 'F (Failed)', gpa: '0.0 / 0.0', status: 'Needs Improvement / Re-examination' };
  };

  const gradeInfo = getGradeInfo(currentPct);

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { id: Math.random().toString(36).substring(2, 9), name: `Subject ${subjects.length + 1}`, obtained: 80, total: 100 },
    ]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof SubjectEntry, val: any) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentPct.toFixed(2)}% (Grade ${gradeInfo.grade})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200 gap-2 pb-4">
        <button
          type="button"
          onClick={() => setMode('single')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'single' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Total Score Calculation
        </button>
        <button
          type="button"
          onClick={() => setMode('multi')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'multi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Subject-by-Subject Marks
        </button>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {mode === 'single' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="marks-obtained" className="block text-xs font-semibold text-slate-700 mb-1.5">Marks Obtained</label>
              <input
                id="marks-obtained"
                type="number"
                step="any"
                value={obtainedMarks}
                onChange={(e) => setObtainedMarks(e.target.value)}
                placeholder="442"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="marks-total" className="block text-xs font-semibold text-slate-700 mb-1.5">Maximum Total Marks</label>
              <input
                id="marks-total"
                type="number"
                step="any"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="500"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        ) : (
          /* Multi subject list */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">Subjects List</span>
              <button
                type="button"
                onClick={addSubject}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subject
              </button>
            </div>

            <div className="space-y-2">
              {subjects.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                  <input
                    type="number"
                    value={sub.obtained}
                    onChange={(e) => updateSubject(sub.id, 'obtained', parseFloat(e.target.value) || 0)}
                    placeholder="Marks"
                    className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center"
                  />
                  <span className="text-slate-400 text-xs">/</span>
                  <input
                    type="number"
                    value={sub.total}
                    onChange={(e) => updateSubject(sub.id, 'total', parseFloat(e.target.value) || 100)}
                    placeholder="Total"
                    className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center"
                  />
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Banner */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Exam Marks Percentage</span>
          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-700">
            {isFinite(currentPct) ? currentPct.toFixed(2) : '0'}%
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto pt-2 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Assigned Grade</span>
              <strong className="text-slate-900 font-semibold">{gradeInfo.grade}</strong>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Status</span>
              <strong className="text-emerald-700 font-semibold">{gradeInfo.status}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-500 pt-1">
            Total Scored: <strong className="font-mono text-slate-800">{currentObtained}</strong> out of <strong className="font-mono text-slate-800">{currentTotal}</strong> marks
          </p>

          <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-3">
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
      </div>
    </div>
  );
}
