import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectId, PomodoroMode } from '../../types';
import {
  SUBJECT_METADATA,
  formatTimerSeconds,
  formatDurationHuman,
  calculatePomodoroXp,
} from '../../utils/pomodoro';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Timer,
  Sparkles,
  BookOpen,
  Trash2,
} from 'lucide-react';

interface PomodoroTimerWidgetProps {
  onAskOpencodePrompt?: (prompt: string) => void;
}

export const PomodoroTimerWidget: React.FC<PomodoroTimerWidgetProps> = ({ onAskOpencodePrompt }) => {
  const {
    pomodoro,
    startPomodoroTimer,
    pausePomodoroTimer,
    resetPomodoroTimer,
    setPomodoroMode,
    setPomodoroSubject,
    completeCurrentPomodoroSession,
    clearPomodoroHistory,
    nickname,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'stats'>('timer');

  const currentSubject = SUBJECT_METADATA[pomodoro.subjectId] || SUBJECT_METADATA.physics;

  // Calculate elapsed progress percent (0 to 100)
  const elapsedSeconds = Math.max(0, pomodoro.durationSeconds - pomodoro.remainingSeconds);
  const progressPercent =
    pomodoro.durationSeconds > 0
      ? Math.min(100, Math.round((elapsedSeconds / pomodoro.durationSeconds) * 100))
      : 0;

  // Calculate total focus time across all subjects in seconds
  const totalFocusSeconds = Object.values(pomodoro.subjectStats).reduce((acc, val) => acc + (val || 0), 0);

  const subjectList: SubjectId[] = ['physics', 'chemistry', 'biology', 'maths', 'french', 'ict'];

  const modeOptions: { mode: PomodoroMode; label: string; defaultMins: number }[] = [
    { mode: 'focus', label: 'Focus', defaultMins: 25 },
    { mode: 'short_break', label: 'Short Break', defaultMins: 5 },
    { mode: 'long_break', label: 'Long Break', defaultMins: 15 },
  ];

  const presetDurations = [15, 25, 45, 60];

  const handleModeChange = (mode: PomodoroMode) => {
    setPomodoroMode(mode);
  };

  const handleCustomPreset = (mins: number) => {
    setPomodoroMode('focus', mins * 60);
  };

  const handleAskTutor = () => {
    if (onAskOpencodePrompt) {
      onAskOpencodePrompt(
        `I am starting my ${Math.round(pomodoro.durationSeconds / 60)}-minute revision session on ${currentSubject.name} (${currentSubject.code}). Can you give me the top 3 high-yield Edexcel IGCSE topics and common examiner traps to focus on?`
      );
    }
  };

  return (
    <div className="border-b theme-border theme-card transition-all">
      {/* Widget Header Strip */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b theme-border/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center border theme-border theme-subtle theme-text-primary">
            <Timer className="w-3 h-3 theme-accent-text" />
          </div>
          <span className="font-mono font-bold tracking-tight theme-text-primary">
            Pomodoro Focus Hub
          </span>
          {pomodoro.isRunning && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold theme-accent-pill animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              TICKING
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle between Timer & Subject Stats */}
          <button
            onClick={() => {
              setActiveTab((prev) => (prev === 'timer' ? 'stats' : 'timer'));
              if (isCollapsed) setIsCollapsed(false);
            }}
            title={activeTab === 'timer' ? 'View Subject Focus Stats' : 'Return to Timer'}
            className={`p-1 rounded border theme-border transition-colors cursor-pointer text-[11px] font-mono flex items-center gap-1 ${
              activeTab === 'stats' ? 'theme-accent-btn font-bold' : 'theme-subtle theme-text-secondary hover:theme-text-primary'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? 'Expand Pomodoro Study Timer' : 'Collapse Pomodoro Study Timer'}
            className="p-1 rounded border theme-border theme-subtle theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsed Minimalist HUD Bar */}
      {isCollapsed ? (
        <div className="px-4 py-2 flex items-center justify-between gap-3 text-xs font-mono theme-subtle">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border theme-border theme-card theme-text-primary">
              {currentSubject.short}
            </span>
            <span className="tabular-nums font-bold text-sm theme-text-primary">
              {formatTimerSeconds(pomodoro.remainingSeconds)}
            </span>
            <span className="text-[10px] theme-text-muted uppercase">
              ({pomodoro.mode.replace('_', ' ')})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {pomodoro.isRunning ? (
              <button
                onClick={pausePomodoroTimer}
                className="p-1 rounded theme-accent-btn cursor-pointer"
                title="Pause Timer"
              >
                <Pause className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={startPomodoroTimer}
                className="p-1 rounded theme-accent-btn cursor-pointer"
                title="Start Focus Timer"
              >
                <Play className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-[10px] theme-text-muted hover:theme-text-primary underline cursor-pointer ml-1"
            >
              Expand
            </button>
          </div>
        </div>
      ) : activeTab === 'stats' ? (
        /* Subject Focus Time Stats View */
        <div className="p-4 space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider theme-text-primary">
                Subject Focus Breakdown
              </h4>
              <p className="text-[11px] theme-text-muted">
                Persistent revision time tracked for {nickname}
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold theme-text-primary">
                {formatDurationHuman(totalFocusSeconds)}
              </span>
              <span className="block text-[10px] theme-text-muted">Total Focus</span>
            </div>
          </div>

          {/* Grid of Subjects with Focus Time */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {subjectList.map((subId) => {
              const meta = SUBJECT_METADATA[subId];
              const seconds = pomodoro.subjectStats[subId] || 0;
              const percent = totalFocusSeconds > 0 ? Math.round((seconds / totalFocusSeconds) * 100) : 0;
              const isCurrent = pomodoro.subjectId === subId;

              return (
                <div
                  key={subId}
                  onClick={() => setPomodoroSubject(subId)}
                  className={`p-2 rounded border transition-all cursor-pointer ${
                    isCurrent
                      ? 'theme-border border-2 theme-card'
                      : 'theme-border theme-subtle hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold theme-text-primary">{meta.name}</span>
                    <span className="font-mono text-[10px] theme-text-muted">{meta.code}</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between font-mono">
                    <span className="text-xs font-bold theme-text-primary">
                      {formatDurationHuman(seconds)}
                    </span>
                    <span className="text-[10px] theme-text-muted">{percent}%</span>
                  </div>
                  {/* Mini progress line */}
                  <div className="mt-1 h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full theme-accent-bar rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session History Summary */}
          <div className="pt-2 border-t theme-border flex items-center justify-between text-xs">
            <span className="theme-text-muted font-mono text-[11px]">
              Completed Cycles: <strong className="theme-text-primary">{pomodoro.completedSessions}</strong>
            </span>
            {totalFocusSeconds > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Reset all tracked subject focus study stats?')) {
                    clearPomodoroHistory();
                  }
                }}
                className="text-[10px] font-mono theme-text-muted hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset Subject Time Stats"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset Stats</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Expanded Full Pomodoro Timer View */
        <div className="p-4 space-y-3.5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-md border theme-border theme-subtle">
            {modeOptions.map((opt) => {
              const isActive = pomodoro.mode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  onClick={() => handleModeChange(opt.mode)}
                  className={`py-1 px-1.5 rounded text-[11px] font-mono transition-all cursor-pointer text-center ${
                    isActive
                      ? 'theme-accent-btn font-bold shadow-xs'
                      : 'theme-text-secondary hover:theme-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Subject Selector Pills (Only relevant in Focus mode) */}
          {pomodoro.mode === 'focus' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono theme-text-muted">
                <span>Subject Session:</span>
                <span className="font-semibold theme-text-primary">
                  {currentSubject.name} ({currentSubject.code})
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {subjectList.map((subId) => {
                  const meta = SUBJECT_METADATA[subId];
                  const isSelected = pomodoro.subjectId === subId;
                  return (
                    <button
                      key={subId}
                      onClick={() => setPomodoroSubject(subId)}
                      className={`px-1.5 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer text-center truncate ${
                        isSelected
                          ? 'theme-accent-btn font-bold shadow-xs'
                          : 'theme-border theme-subtle theme-text-secondary hover:theme-text-primary'
                      }`}
                    >
                      {meta.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Digital Monospace Countdown & Progress */}
          <div className="text-center py-2 px-3 rounded-lg border theme-border theme-subtle space-y-2">
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight tabular-nums theme-text-primary">
              {formatTimerSeconds(pomodoro.remainingSeconds)}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full theme-accent-bar rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono theme-text-muted">
              <span>Progress: {progressPercent}%</span>
              <span>
                {pomodoro.mode === 'focus' ? `+${calculatePomodoroXp(pomodoro.durationSeconds)} XP on finish` : 'Break Interval'}
              </span>
            </div>
          </div>

          {/* Focus Preset Duration Chips (when not running and in focus mode) */}
          {pomodoro.mode === 'focus' && !pomodoro.isRunning && (
            <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
              <span className="theme-text-muted text-[10px]">Quick Duration:</span>
              <div className="flex items-center gap-1">
                {presetDurations.map((mins) => {
                  const isCurrent = Math.round(pomodoro.durationSeconds / 60) === mins;
                  return (
                    <button
                      key={mins}
                      onClick={() => handleCustomPreset(mins)}
                      className={`px-2 py-0.5 rounded border text-[10px] transition-colors cursor-pointer ${
                        isCurrent
                          ? 'theme-accent-btn font-bold'
                          : 'theme-border theme-card theme-text-secondary hover:theme-text-primary'
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2 pt-0.5">
            {pomodoro.isRunning ? (
              <button
                onClick={pausePomodoroTimer}
                className="flex-1 py-2 rounded-md theme-accent-btn text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-opacity cursor-pointer shadow-xs"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Timer</span>
              </button>
            ) : (
              <button
                onClick={startPomodoroTimer}
                className="flex-1 py-2 rounded-md theme-accent-btn text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-opacity cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start {pomodoro.mode === 'focus' ? 'Focus Session' : 'Break'}</span>
              </button>
            )}

            <button
              onClick={resetPomodoroTimer}
              title="Reset Timer"
              aria-label="Reset Timer"
              className="p-2 rounded-md border theme-border theme-card theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {pomodoro.mode === 'focus' && (
              <button
                onClick={completeCurrentPomodoroSession}
                title="Complete & Log Session Now (+XP)"
                aria-label="Complete and Log Focus Session"
                className="px-2.5 py-2 rounded-md border theme-border theme-subtle hover:theme-card text-xs font-mono theme-text-primary flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 theme-accent-text" />
                <span className="hidden sm:inline">Log</span>
              </button>
            )}
          </div>

          {/* Quick AI Revision Prompt Trigger */}
          {pomodoro.mode === 'focus' && onAskOpencodePrompt && (
            <button
              onClick={handleAskTutor}
              className="w-full py-1.5 px-2 rounded border theme-border theme-subtle hover:theme-card text-[11px] font-mono theme-text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 theme-accent-text" />
              <span>Ask Opencode for {currentSubject.name} High-Yield Tips</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
