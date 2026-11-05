import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function PomodoroTimerTool() {
  const [phase, setPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);

  const getDuration = (p: 'work' | 'shortBreak' | 'longBreak') => {
    if (p === 'work') return 25 * 60;
    if (p === 'shortBreak') return 5 * 60;
    return 15 * 60;
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playChime();
      if (phase === 'work') {
        const nextCount = completedPomodoros + 1;
        setCompletedPomodoros(nextCount);
        if (nextCount % 4 === 0) {
          setPhase('longBreak');
          setTimeLeft(15 * 60);
        } else {
          setPhase('shortBreak');
          setTimeLeft(5 * 60);
        }
      } else {
        setPhase('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, phase, completedPomodoros, soundEnabled]);

  const switchPhase = (p: 'work' | 'shortBreak' | 'longBreak') => {
    setPhase(p);
    setIsRunning(false);
    setTimeLeft(getDuration(p));
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(phase));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const total = getDuration(phase);
  const progressPercent = Math.max(0, Math.min(100, ((total - timeLeft) / total) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Phase Selectors */}
        <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => switchPhase('work')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              phase === 'work' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            type="button"
            onClick={() => switchPhase('shortBreak')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              phase === 'shortBreak' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            type="button"
            onClick={() => switchPhase('longBreak')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              phase === 'longBreak' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Clock Display */}
        <div className="py-8 px-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {phase === 'work' ? '🎯 Focused Work Session' : '☕ Rest Break'}
          </span>
          <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
            {timeFormatted}
          </div>

          <div className="h-2 w-full bg-slate-200 rounded-full mt-6 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                phase === 'work' ? 'bg-emerald-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start Focus'}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl transition-colors cursor-pointer ${
              soundEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
            }`}
            title={soundEnabled ? 'Audio chime enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Pomodoro Streak tracker */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-600">Completed Sessions Today:</span>
          <div className="flex items-center gap-1.5 font-bold font-mono text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{completedPomodoros}</span>
            <span className="text-slate-400 font-normal">({completedPomodoros * 25} min focus)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
