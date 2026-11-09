import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AppView, ThemePalette } from '../../types';
import { calculateLevelAndProgress } from '../../utils/revisionMath';
import { formatTimerSeconds } from '../../utils/pomodoro';
import { Sun, Moon, Bot, Flame, Zap, SlidersHorizontal, User, Palette, Check, Timer } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    guiSettings,
    updateGuiSettings,
    toggleTheme,
    activeView,
    setActiveView,
    xp,
    streak,
    toggleOpencode,
    isOpencodeOpen,
    nickname,
    pomodoro,
  } = useApp();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteMenuRef = useRef<HTMLDivElement>(null);

  const levelInfo = calculateLevelAndProgress(xp);

  const navItems: { view: AppView; label: string }[] = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'vault', label: 'Revision Vault' },
    { view: 'feed', label: 'Student Feed' },
    { view: 'study_rooms', label: 'Study Rooms' },
    { view: 'pastpapers', label: 'Past Papers' },
    { view: 'lingua', label: 'LinguaTerminal' },
    { view: 'exam', label: 'Exam Arena' },
    { view: 'rewards', label: 'O/L Leaderboard' },
    { view: 'profile', label: 'Profile' },
    { view: 'settings', label: 'Settings' },
  ];

  const paletteList: { id: ThemePalette; label: string; desc: string }[] = [
    { id: 'monochrome', label: 'Standard Monochrome', desc: 'Minimalist black & white' },
    { id: 'high-contrast', label: 'High Contrast Ink', desc: 'Stark white & pitch black' },
    { id: 'nordic-slate', label: 'Nordic Slate', desc: 'Cool slate-navy tones' },
    { id: 'paper-ink', label: 'Paper & Ink Spec', desc: 'Warm exam parchment' },
    { id: 'warm-terminal', label: 'Warm Retro Terminal', desc: 'Amber terminal glow' },
  ];

  // Close palette dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteMenuRef.current && !paletteMenuRef.current.contains(event.target as Node)) {
        setIsPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b theme-border theme-card backdrop-blur-xs">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-none rounded-md"
            aria-label="All9s Home Dashboard"
          >
            <div className="w-8 h-8 rounded theme-accent-btn flex items-center justify-center font-mono font-bold text-sm tracking-tight shadow-xs">
              9s
            </div>
            <div>
              <span className="font-mono text-base sm:text-lg font-bold tracking-tight theme-text-primary">
                All9s
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-mono uppercase tracking-wider theme-text-muted">
                IGCSE
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (visible on wide screens xl: 1280px+) */}
        <nav className="hidden xl:flex items-center gap-1 shrink">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'theme-accent-btn font-bold shadow-xs'
                    : 'theme-text-secondary hover:theme-text-primary hover:opacity-100 opacity-80'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: HUD Status & Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Streak indicator */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-md border theme-border theme-subtle text-xs font-mono"
            title={`${streak} Day Revision Streak`}
          >
            <Flame className="w-3.5 h-3.5 theme-accent-text" />
            <span className="tabular-nums font-semibold theme-text-primary">{streak}d</span>
          </div>

          {/* XP & Level (hidden on small/tablet, visible on md+) */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border theme-border theme-subtle text-xs font-mono"
            title={`Level ${levelInfo.level} - ${xp.toLocaleString()} total XP`}
          >
            <Zap className="w-3.5 h-3.5 theme-accent-text" />
            <span className="tabular-nums font-semibold theme-text-primary">{xp.toLocaleString()} XP</span>
            <span className="opacity-40">·</span>
            <span className="theme-text-secondary">Lv.{levelInfo.level}</span>
          </div>

          {/* Quick Palette / Color Theme Dropdown */}
          <div className="relative" ref={paletteMenuRef}>
            <button
              onClick={() => setIsPaletteOpen((prev) => !prev)}
              aria-label="Select Color Theme Palette"
              title="Change Theme Palette"
              className={`p-1.5 rounded-md border theme-border hover:opacity-100 opacity-85 transition-opacity cursor-pointer flex items-center gap-1 text-xs font-mono ${
                isPaletteOpen ? 'theme-accent-btn' : 'theme-subtle theme-text-primary'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden 2xl:inline text-[11px] font-semibold capitalize">
                {guiSettings.palette.replace('-', ' ')}
              </span>
            </button>

            {isPaletteOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg border theme-border theme-card shadow-xl p-2 space-y-1 z-50 text-xs font-mono">
                <div className="px-2 py-1 text-[10px] uppercase font-bold theme-text-muted tracking-wider">
                  Color Themes & Palettes
                </div>
                {paletteList.map((p) => {
                  const isSelected = guiSettings.palette === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        updateGuiSettings({ palette: p.id });
                        setIsPaletteOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded text-left flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'theme-accent-btn font-bold'
                          : 'theme-text-primary hover:opacity-80 theme-subtle'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{p.label}</div>
                        <div className="text-[10px] opacity-75">{p.desc}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
                <div className="pt-1.5 border-t theme-border flex items-center justify-between px-2 text-[11px]">
                  <span className="theme-text-muted">Custom Accent:</span>
                  <button
                    onClick={() => {
                      setIsPaletteOpen(false);
                      setActiveView('settings');
                    }}
                    className="underline theme-text-primary cursor-pointer hover:opacity-80"
                  >
                    Open Picker →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme mode toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${guiSettings.themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
            title={`Toggle ${guiSettings.themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 rounded-md border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-80 transition-opacity cursor-pointer"
          >
            {guiSettings.themeMode === 'dark' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          {/* User Profile Button */}
          <button
            onClick={() => setActiveView('profile')}
            title="Candidate Profile & Settings"
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono transition-all cursor-pointer ${
              activeView === 'profile'
                ? 'theme-accent-btn font-bold shadow-xs'
                : 'theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-85'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[70px] sm:max-w-[95px] truncate font-semibold">{nickname}</span>
          </button>

          {/* Opencode AI Drawer & Pomodoro Button */}
          <button
            onClick={toggleOpencode}
            aria-label="Toggle Opencode AI Companion Drawer and Pomodoro Timer"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium font-mono transition-opacity cursor-pointer shadow-xs ${
              isOpencodeOpen
                ? 'opacity-85 theme-accent-btn'
                : 'theme-accent-btn'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Opencode</span>
            {pomodoro.isRunning && (
              <span className="flex items-center gap-1 text-[11px] font-bold tabular-nums pl-1 border-l border-current/30">
                <Timer className="w-3 h-3 animate-pulse" />
                <span>{formatTimerSeconds(pomodoro.remainingSeconds)}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-nav bar row for screens < xl (1280px) */}
      <div className="xl:hidden flex flex-wrap items-center justify-center gap-1 border-t theme-border px-2 py-1.5 theme-card">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                isActive
                  ? 'theme-accent-btn font-bold shadow-xs'
                  : 'theme-text-secondary hover:theme-text-primary hover:opacity-100 opacity-80'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
