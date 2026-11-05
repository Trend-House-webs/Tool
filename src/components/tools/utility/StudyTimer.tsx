import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, Settings, Sliders } from 'lucide-react';

export function StudyTimer() {
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak' | 'custom'>('pomodoro');
  const [customWorkMin, setCustomWorkMin] = useState<number>(30);
  const [customBreakMin, setCustomBreakMin] = useState<number>(10);
  const [isCustomBreak, setIsCustomBreak] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const getDuration = (m: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom', customBreakState = false) => {
    if (m === 'pomodoro') return 25 * 60;
    if (m === 'shortBreak') return 5 * 60;
    if (m === 'longBreak') return 15 * 60;
    if (m === 'custom') {
      return (customBreakState ? customBreakMin : customWorkMin) * 60;
    }
    return 25 * 60;
  };

  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  // Play synthetic pleasant chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, delay: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur);
      };

      playTone(523.25, 0, 0.4); // C5
      playTone(659.25, 0.2, 0.4); // E5
      playTone(783.99, 0.4, 0.6); // G5
      playTone(1046.50, 0.6, 0.9); // C6
    } catch (e) {
      console.log('Audio playback prevented', e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setIsPaused(false);
      playChime();
      if (mode === 'pomodoro' || (mode === 'custom' && !isCustomBreak)) {
        setCompletedSessions((c) => c + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, isCustomBreak, soundEnabled]);

  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom') => {
    setMode(newMode);
    setIsRunning(false);
    setIsPaused(false);
    setIsCustomBreak(false);
    setTimeLeft(getDuration(newMode, false));
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(getDuration(mode, isCustomBreak));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalDuration = getDuration(mode, isCustomBreak);
  const progressPercent = Math.max(0, Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Mode Switcher */}
        <div className="flex flex-wrap justify-center p-1 bg-slate-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => switchMode('pomodoro')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'pomodoro' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('shortBreak')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'shortBreak' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('longBreak')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'longBreak' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Long Break (15m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('custom')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'custom' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Duration Inputs */}
        {mode === 'custom' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Work Duration (min)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customWorkMin}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setCustomWorkMin(val);
                    if (!isCustomBreak && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Break Duration (min)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customBreakMin}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setCustomBreakMin(val);
                    if (isCustomBreak && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-600">Current Phase:</span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomBreak(false);
                    setIsRunning(false);
                    setIsPaused(false);
                    setTimeLeft(customWorkMin * 60);
                  }}
                  className={`px-2 py-0.5 text-xs rounded cursor-pointer ${
                    !isCustomBreak ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Work Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomBreak(true);
                    setIsRunning(false);
                    setIsPaused(false);
                    setTimeLeft(customBreakMin * 60);
                  }}
                  className={`px-2 py-0.5 text-xs rounded cursor-pointer ${
                    isCustomBreak ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Break Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Big Clock Display */}
        <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
            {timeFormatted}
          </div>

          <p className="text-xs font-medium text-slate-500 mt-2 uppercase tracking-wider">
            {mode === 'pomodoro' || (mode === 'custom' && !isCustomBreak) ? 'Focus Session' : 'Rest Break'}
            {isPaused && <span className="text-amber-600 font-bold ml-1.5">(Paused)</span>}
          </p>

          <div className="h-2 w-full bg-slate-200 rounded-full mt-6 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRunning && !isPaused && (
            <button
              type="button"
              onClick={startTimer}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-5 h-5" /> Start
            </button>
          )}

          {isRunning && (
            <button
              type="button"
              onClick={pauseTimer}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base bg-amber-600 hover:bg-amber-700 shadow-sm transition-all cursor-pointer"
            >
              <Pause className="w-5 h-5" /> Pause
            </button>
          )}

          {!isRunning && isPaused && (
            <button
              type="button"
              onClick={resumeTimer}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-5 h-5" /> Resume
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Session Stats */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Completed Pomodoros: <strong className="text-slate-800 font-mono">{completedSessions}</strong>
          </span>
          <span>Web Audio Bell notification</span>
        </div>
      </div>
    </div>
  );
}
