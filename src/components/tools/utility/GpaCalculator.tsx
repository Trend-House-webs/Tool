import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Calculator, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

type GradingScaleType = 'standard4' | 'extended43' | 'scale5';

const SCALES: Record<GradingScaleType, { name: string; max: number; points: Record<string, number> }> = {
  standard4: {
    name: 'Standard 4.0 Scale',
    max: 4.0,
    points: {
      'A+': 4.0,
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0,
    },
  },
  extended43: {
    name: 'Honors 4.33 Scale',
    max: 4.33,
    points: {
      'A+': 4.33,
      'A': 4.0,
      'A-': 3.67,
      'B+': 3.33,
      'B': 3.0,
      'B-': 2.67,
      'C+': 2.33,
      'C': 2.0,
      'C-': 1.67,
      'D+': 1.33,
      'D': 1.0,
      'F': 0.0,
    },
  },
  scale5: {
    name: '5.0 Scale (Weighted/High School)',
    max: 5.0,
    points: {
      'A+': 5.0,
      'A': 5.0,
      'A-': 4.7,
      'B+': 4.3,
      'B': 4.0,
      'B-': 3.7,
      'C+': 3.3,
      'C': 3.0,
      'C-': 2.7,
      'D+': 2.3,
      'D': 2.0,
      'F': 0.0,
    },
  },
};

const DEFAULT_COURSES: Course[] = [
  { id: '1', name: 'Calculus I', credits: 4, grade: 'A' },
  { id: '2', name: 'Computer Science 101', credits: 3, grade: 'A-' },
  { id: '3', name: 'Physics Mechanics', credits: 4, grade: 'B+' },
  { id: '4', name: 'Academic Writing', credits: 3, grade: 'A' },
];

export function GpaCalculator() {
  const [scaleKey, setScaleKey] = useState<GradingScaleType>('standard4');
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('toolnest_gpa_courses');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_COURSES;
  });

  const [priorCredits, setPriorCredits] = useState<string>('30');
  const [priorGpa, setPriorGpa] = useState<string>('3.50');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const currentScale = SCALES[scaleKey];

  useEffect(() => {
    try {
      localStorage.setItem('toolnest_gpa_courses', JSON.stringify(courses));
    } catch (e) {
      // ignore
    }
  }, [courses]);

  const addCourse = () => {
    const newCourse: Course = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Course ${courses.length + 1}`,
      credits: 3,
      grade: 'A',
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Semester GPA Calculation
  const totalCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const totalPoints = courses.reduce((sum, c) => {
    const pts = currentScale.points[c.grade] ?? 0;
    return sum + pts * (Number(c.credits) || 0);
  }, 0);
  const semesterGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  // Cumulative CGPA Calculation
  const numPriorCredits = parseFloat(priorCredits) || 0;
  const numPriorGpa = parseFloat(priorGpa) || 0;
  const priorTotalPoints = numPriorCredits * numPriorGpa;
  const overallCredits = numPriorCredits + totalCredits;
  const cumulativeGpa =
    overallCredits > 0 ? (priorTotalPoints + totalPoints) / overallCredits : 0;

  const resetCourses = () => {
    setCourses(DEFAULT_COURSES);
    setPriorCredits('0');
    setPriorGpa('0');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Top GPA Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200">
        <div className="p-5 bg-emerald-50/70 rounded-xl border border-emerald-200/70 text-center">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Semester GPA ({currentScale.name})
          </span>
          <div className="text-4xl font-extrabold font-mono text-emerald-700 mt-1">
            {semesterGpa.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on {totalCredits} semester credit hours · {totalPoints.toFixed(1)} grade points
          </p>
        </div>

        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Cumulative CGPA
          </span>
          <div className="text-4xl font-extrabold font-mono text-slate-800 mt-1">
            {cumulativeGpa.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Overall {overallCredits} credit hours (Prior + Current)
          </p>
        </div>
      </div>

      {/* Scale Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Grading Scale System
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SCALES) as GradingScaleType[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setScaleKey(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  scaleKey === key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {SCALES[key].name}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          {showExplanation ? 'Hide Formula' : 'How GPA is Calculated'}
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-xs sm:text-sm text-slate-700 space-y-2 animate-in fade-in">
          <p className="font-semibold text-emerald-950">Weighted GPA Calculation Formula:</p>
          <p className="font-mono bg-white p-2.5 rounded border border-emerald-200 text-slate-800">
            Semester GPA = ∑ (Course Credits × Grade Points) ÷ Total Credits
          </p>
          <p className="text-slate-600 leading-relaxed">
            For example: A 4-credit course with grade <strong>A (4.0)</strong> earns 16.0 points. A 3-credit course with grade <strong>B (3.0)</strong> earns 9.0 points. Total points = 25.0 / 7 credits = <strong>3.57 GPA</strong>.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Cumulative CGPA incorporates previous semesters: <span className="font-mono">(Prior Total Points + Current Points) ÷ Total Cumulative Credits</span>.
          </p>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Current Semester Courses</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addCourse}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Course
            </button>
            <button
              type="button"
              onClick={resetCourses}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Course Title</th>
                <th className="py-2.5 px-3 w-28">Credits</th>
                <th className="py-2.5 px-3 w-40">Grade</th>
                <th className="py-2.5 px-3 w-20 text-center">Points</th>
                <th className="py-2.5 px-3 w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => {
                const pts = currentScale.points[course.grade] ?? 0;
                const earned = pts * (Number(course.credits) || 0);
                return (
                  <tr key={course.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={course.credits}
                        onChange={(e) => updateCourse(course.id, 'credits', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={course.grade}
                        onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                      >
                        {Object.keys(currentScale.points).map((g) => (
                          <option key={g} value={g}>
                            {g} ({currentScale.points[g].toFixed(1)})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-xs text-slate-700">
                      {earned.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeCourse(course.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                        title="Remove course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cumulative CGPA Controls */}
      <div className="pt-6 border-t border-slate-200">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Prior Academic History (Optional for Cumulative CGPA)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Prior Total Credits Completed</label>
            <input
              type="number"
              min="0"
              value={priorCredits}
              onChange={(e) => setPriorCredits(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Prior Cumulative GPA</label>
            <input
              type="number"
              min="0"
              max={currentScale.max}
              step="0.01"
              value={priorGpa}
              onChange={(e) => setPriorGpa(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
