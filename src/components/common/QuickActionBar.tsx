import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatTimerSeconds } from '../../utils/pomodoro';
import { BookOpen, Gamepad2, Timer, Bot, Trophy, ArrowRight, SlidersHorizontal, User, Share2, FileText } from 'lucide-react';

export const QuickActionBar: React.FC = () => {
  const { setActiveView, toggleOpencode, pomodoro } = useApp();

  return (
    <div className="w-full mb-6 sm:mb-8">
      <div className="rounded-lg border theme-border theme-card p-3 sm:p-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full theme-accent-bar" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider theme-text-muted">
              Quick Actions
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveView('vault')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85 transition-opacity cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 opacity-70" />
              <span>Vault</span>
            </button>

            <button
              onClick={() => setActiveView('feed')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85 transition-opacity cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 opacity-70" />
              <span>Student Feed</span>
            </button>

            <button
              onClick={() => setActiveView('pastpapers')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85 transition-opacity cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 opacity-70" />
              <span>Past Papers</span>
            </button>

            <button
              onClick={() => setActiveView('lingua')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85 transition-opacity cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5 opacity-70" />
              <span>LinguaTerminal</span>
            </button>

            <button
              onClick={() => setActiveView('exam')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85 transition-opacity cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5 opacity-70" />
              <span>Exam Arena</span>
            </button>

            <button
              onClick={() => setActiveView('rewards')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85 transition-opacity cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 opacity-70" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveView('profile')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85 transition-opacity cursor-pointer"
            >
              <User className="w-3.5 h-3.5 opacity-70" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveView('settings')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85 transition-opacity cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
              <span>Settings</span>
            </button>

            <button
              onClick={toggleOpencode}
              className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-mono font-medium theme-accent-btn transition-opacity cursor-pointer shadow-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{pomodoro.isRunning ? `Focus: ${formatTimerSeconds(pomodoro.remainingSeconds)}` : 'Ask Opencode'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
