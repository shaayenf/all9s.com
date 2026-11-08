import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ThemePalette, FontSizeOption, SubjectId } from '../../types';
import { SUBJECTS } from '../../data/mockData';
import {
  SlidersHorizontal,
  User,
  LogOut,
  Palette,
  Check,
  Type,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    loginWithGoogle,
    logout,
    nickname,
    setNickname,
    olGrade,
    setOlGrade,
    primarySubjectId,
    setPrimarySubject,
    guiSettings,
    updateGuiSettings,
    level,
    xp,
    streak,
  } = useApp();

  const [inputNickname, setInputNickname] = useState(nickname);
  const [nicknameSaved, setNicknameSaved] = useState(false);
  const [subjectSaved, setSubjectSaved] = useState(false);
  const [customHex, setCustomHex] = useState(guiSettings.accentColor);

  const palettes: { id: ThemePalette; name: string; desc: string; sampleBg: string; sampleBorder: string }[] = [
    {
      id: 'monochrome',
      name: 'Standard Monochrome (Default)',
      desc: 'Crisp black and white minimalism with neutral zinc borders',
      sampleBg: '#09090b',
      sampleBorder: '#27272a',
    },
    {
      id: 'high-contrast',
      name: 'High Contrast Ink',
      desc: 'Deepest pitch-black background with razor-sharp stark white borders',
      sampleBg: '#000000',
      sampleBorder: '#ffffff',
    },
    {
      id: 'nordic-slate',
      name: 'Nordic Slate',
      desc: 'Cool slate-navy tones with soft matte finishes for long study sessions',
      sampleBg: '#0f172a',
      sampleBorder: '#334155',
    },
    {
      id: 'paper-ink',
      name: 'Paper & Ink Spec',
      desc: 'Warm examination parchment tones with dark charcoal ink styling',
      sampleBg: '#1c1917',
      sampleBorder: '#44403c',
    },
    {
      id: 'warm-terminal',
      name: 'Warm Retro Terminal',
      desc: 'Classic hacker terminal ambiance with warm amber-white luminescence',
      sampleBg: '#13141a',
      sampleBorder: '#fbbf24',
    },
  ];

  const presetAccents = [
    { label: 'Monochrome', hex: '#ffffff' },
    { label: 'Solar Amber', hex: '#f59e0b' },
    { label: 'Emerald Mint', hex: '#10b981' },
    { label: 'Cobalt Blue', hex: '#3b82f6' },
    { label: 'Crimson Rose', hex: '#f43f5e' },
    { label: 'Electric Cyan', hex: '#06b6d4' },
    { label: 'Royal Violet', hex: '#8b5cf6' },
  ];

  const fontOptions: { id: FontSizeOption; label: string; desc: string }[] = [
    { id: 'compact', label: 'Compact (14px)', desc: 'High information density for split-screen exam mode' },
    { id: 'standard', label: 'Standard (16px)', desc: 'Balanced default sizing for desktop and tablet' },
    { id: 'large', label: 'Large (18px)', desc: 'Increased legibility and relaxed reading distance' },
  ];

  const gradeOptions = [
    'Grade 10',
    'Grade 11',
    'Grade 12',
    'Grade 13',
    'Grade 9',
    'Grade 8',
    'Grade 7',
    'O/L Candidate',
  ];

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputNickname.trim().length >= 2) {
      await setNickname(inputNickname.trim());
      setNicknameSaved(true);
      setTimeout(() => setNicknameSaved(false), 2000);
    }
  };

  const handleApplyCustomHex = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex) || hex === '#ffffff') {
      updateGuiSettings({ accentColor: hex });
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="pb-4 border-b theme-border">
        <div className="flex items-center gap-2 text-xs font-mono theme-text-muted mb-1">
          <SlidersHorizontal className="w-3.5 h-3.5 theme-accent-text" />
          <span>System Preferences</span>
          <span aria-hidden="true">·</span>
          <span>Profile, Colors & GUI Configuration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight theme-text-primary">
          Account & GUI Settings
        </h1>
        <p className="text-xs theme-text-secondary mt-1">
          Manage your Google account sign-in, customize your public candidate nickname, and configure the visual theme & colors.
        </p>
      </div>

      {/* 1. Account & Gmail Login Section */}
      <section className="rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b theme-border">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 theme-accent-text" />
            <div>
              <h2 className="text-base font-bold theme-text-primary">
                Google Account & Identity
              </h2>
              <p className="text-xs theme-text-muted font-mono">
                Cloud sync for leaderboard, revision XP, and nickname
              </p>
            </div>
          </div>

          {user && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Gmail</span>
            </span>
          )}
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded border theme-border theme-subtle">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google Profile'}
                  className="w-10 h-10 rounded-full border theme-border object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full theme-accent-btn flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                  {user.email?.slice(0, 2).toUpperCase() || 'GL'}
                </div>
              )}

              <div>
                <div className="text-sm font-semibold theme-text-primary font-mono flex items-center gap-2">
                  <span>{user.displayName || nickname}</span>
                </div>
                <div className="text-xs theme-text-muted font-mono">{user.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border theme-border theme-card hover:opacity-80 text-xs font-mono theme-text-secondary cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs theme-text-secondary leading-relaxed">
              Sign in with your Gmail account to sync your revision progress across devices, save your customized nickname permanently to the public student leaderboard, and allow the Opencode AI companion to remember your learning history.
            </p>

            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-2 px-4 py-2 rounded theme-accent-btn font-mono text-xs font-semibold cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google (Gmail)</span>
            </button>
          </div>
        )}
      </section>

      {/* 2. Custom Nickname & Student Profile Section */}
      <section className="rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
        <div className="pb-3 border-b theme-border">
          <h2 className="text-base font-bold theme-text-primary">
            Candidate Nickname & Grade Bracket
          </h2>
          <p className="text-xs theme-text-muted font-mono mt-0.5">
            Your public identifier on the leaderboard and how Opencode addresses you
          </p>
        </div>

        <form onSubmit={handleSaveNickname} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold theme-text-primary mb-1.5">
              Candidate Nickname
            </label>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
                maxLength={24}
                placeholder="e.g. Alex_PhysicsPro"
                className="flex-1 px-3 py-2 rounded border theme-border theme-input text-xs font-mono theme-text-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={inputNickname.trim().length < 2 || inputNickname === nickname}
                className="px-4 py-2 rounded theme-accent-btn font-mono text-xs font-semibold disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {nicknameSaved ? 'Saved!' : 'Save Nickname'}
              </button>
            </div>
            <p className="text-[11px] theme-text-muted mt-1.5 font-mono">
              2 to 24 characters. Shown on leaderboards and used in Opencode AI tutor dialogues.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold theme-text-primary mb-1.5">
              Student Grade Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl">
              {gradeOptions.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setOlGrade(g)}
                  className={`px-3 py-2 rounded border text-xs font-mono transition-all cursor-pointer text-center ${
                    olGrade === g
                      ? 'theme-accent-btn font-bold shadow-xs'
                      : 'border theme-border theme-subtle theme-text-secondary hover:opacity-85'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Live Identity Preview Box */}
        <div className="p-3.5 rounded border theme-border theme-subtle space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono theme-text-muted font-semibold">
            <Sparkles className="w-3.5 h-3.5 theme-accent-text" />
            <span>Live Identity Preview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded theme-card border theme-border">
              <span className="text-[10px] uppercase theme-text-muted block mb-1">On Leaderboard:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold theme-text-primary">{nickname}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded theme-subtle theme-text-secondary">
                  {olGrade}
                </span>
                <span className="text-[10px] theme-text-muted">· Lv.{level}</span>
              </div>
            </div>

            <div className="p-2.5 rounded theme-card border theme-border">
              <span className="text-[10px] uppercase theme-text-muted block mb-1">AI Tutor Address:</span>
              <p className="theme-text-secondary italic text-[11px]">
                &quot;Welcome back, {nickname}! Ready to master kinematics today?&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2b. Primary Timetable Subject Picker (11A Gateway College Roster) */}
      <section className="rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b theme-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 theme-accent-text" />
            <div>
              <h2 className="text-base font-bold theme-text-primary">
                Primary Timetable Subject (11A Roster)
              </h2>
              <p className="text-xs theme-text-muted font-mono mt-0.5">
                Switch your primary revision subject anytime across all 22 subjects from the 11A timetable
              </p>
            </div>
          </div>

          {subjectSaved && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Subject Updated!
            </span>
          )}
        </div>

        <p className="text-xs theme-text-secondary">
          Changing your primary subject automatically redirects your workspace, past papers, formula sheets, and Opencode AI prompts to that subject.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SUBJECTS.map((sub) => {
            const isSelected = (primarySubjectId || 'physics') === sub.id;
            return (
              <button
                type="button"
                key={sub.id}
                onClick={async () => {
                  await setPrimarySubject(sub.id as SubjectId);
                  setSubjectSaved(true);
                  setTimeout(() => setSubjectSaved(false), 2000);
                }}
                className={`p-3 rounded border text-left font-mono transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'theme-accent-btn shadow-xs ring-1 ring-white/20'
                    : 'theme-card border-zinc-800/80 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="text-xs font-bold truncate">
                    {sub.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-black/30 text-white' : 'theme-subtle theme-text-muted'
                  }`}>
                    {sub.code}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] opacity-80 pt-1 border-t border-white/10">
                  <span>Teacher: {sub.teacher || sub.department}</span>
                  {sub.room && <span>{sub.room}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Webpage & GUI Appearance Customizer (Full Color System) */}
      <section className="rounded-lg border theme-border theme-card p-6 space-y-6 shadow-xs">
        <div className="pb-3 border-b theme-border">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 theme-accent-text" />
            <h2 className="text-base font-bold theme-text-primary">
              Webpage & GUI Color Customizer
            </h2>
          </div>
          <p className="text-xs theme-text-muted font-mono mt-0.5">
            Configure theme mode, color palettes, custom accent highlights, and typography scale
          </p>
        </div>

        {/* Dark / Light Mode Switch */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-semibold theme-text-primary">
            Base Theme Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <button
              onClick={() => updateGuiSettings({ themeMode: 'dark' })}
              className={`p-3 rounded border flex items-center justify-center gap-2 text-xs font-mono transition-all cursor-pointer ${
                guiSettings.themeMode === 'dark'
                  ? 'theme-accent-btn font-bold shadow-xs'
                  : 'border theme-border theme-subtle theme-text-secondary hover:opacity-85'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Exam Terminal</span>
            </button>
            <button
              onClick={() => updateGuiSettings({ themeMode: 'light' })}
              className={`p-3 rounded border flex items-center justify-center gap-2 text-xs font-mono transition-all cursor-pointer ${
                guiSettings.themeMode === 'light'
                  ? 'theme-accent-btn font-bold shadow-xs'
                  : 'border theme-border theme-subtle theme-text-secondary hover:opacity-85'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Minimalist</span>
            </button>
          </div>
        </div>

        {/* Color Palette Themes */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-semibold theme-text-primary">
            Aesthetic Palette Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {palettes.map((p) => {
              const isSelected = guiSettings.palette === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => updateGuiSettings({ palette: p.id })}
                  className={`p-3 rounded border text-left text-xs font-mono transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'theme-accent-pill border-2 font-semibold shadow-xs'
                      : 'border theme-border theme-subtle hover:opacity-85'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-black/30 dark:border-white/30 shrink-0"
                        style={{ backgroundColor: p.sampleBorder }}
                      />
                      <span className="font-bold theme-text-primary">{p.name}</span>
                    </div>
                    <div className="text-[11px] theme-text-muted leading-tight">{p.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 theme-accent-text shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Accent Color Highlight */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono font-semibold theme-text-primary mb-1">
              Custom GUI Accent Color
            </label>
            <p className="text-[11px] theme-text-muted font-mono">
              Applies immediately to buttons, progress bars, active tabs, and highlights across the entire site
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {presetAccents.map((acc) => {
              const isActive = guiSettings.accentColor.toLowerCase() === acc.hex.toLowerCase();
              return (
                <button
                  key={acc.hex}
                  onClick={() => handleApplyCustomHex(acc.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono transition-all cursor-pointer ${
                    isActive
                      ? 'theme-accent-btn font-bold shadow-xs'
                      : 'border theme-border theme-subtle theme-text-secondary hover:opacity-85'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/30 dark:border-white/30 shrink-0"
                    style={{ backgroundColor: acc.hex }}
                  />
                  <span>{acc.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Hex Color Input */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-mono theme-text-muted">Custom Hex:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customHex.startsWith('#') ? customHex : '#ffffff'}
                onChange={(e) => handleApplyCustomHex(e.target.value)}
                className="w-8 h-8 rounded border theme-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={customHex}
                onChange={(e) => handleApplyCustomHex(e.target.value)}
                placeholder="#ffffff"
                maxLength={7}
                className="w-24 px-2.5 py-1.5 rounded border theme-border theme-input text-xs font-mono theme-text-primary uppercase focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live GUI Palette & Accent Test Workbench */}
        <div className="p-4 rounded border theme-border theme-subtle space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-semibold theme-text-primary">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 theme-accent-text" />
              <span>Live GUI Elements Preview with Current Theme</span>
            </span>
            <span className="text-[10px] theme-accent-text font-bold">
              Active: {guiSettings.palette} ({guiSettings.themeMode})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sample Button */}
            <div className="p-3 rounded theme-card border theme-border space-y-2 text-center">
              <span className="text-[10px] font-mono theme-text-muted block">Primary Button</span>
              <button className="w-full py-1.5 rounded theme-accent-btn font-mono text-xs font-bold shadow-xs">
                Active Accent
              </button>
            </div>

            {/* Sample Progress */}
            <div className="p-3 rounded theme-card border theme-border space-y-2">
              <span className="text-[10px] font-mono theme-text-muted block">Level Progression Bar</span>
              <div className="w-full h-2 theme-subtle rounded-full overflow-hidden">
                <div className="h-full theme-accent-bar rounded-full w-3/4" />
              </div>
              <div className="text-[10px] font-mono theme-text-secondary text-right">75% Complete</div>
            </div>

            {/* Sample Badge */}
            <div className="p-3 rounded theme-card border theme-border space-y-2 text-center">
              <span className="text-[10px] font-mono theme-text-muted block">Active Pill & Badge</span>
              <div className="inline-block px-3 py-1 rounded theme-accent-pill text-xs font-mono font-bold">
                Level 5 · Diamond
              </div>
            </div>
          </div>
        </div>

        {/* Font Size Option */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Type className="w-3.5 h-3.5 theme-accent-text" />
            <label className="block text-xs font-mono font-semibold theme-text-primary">
              GUI Typography Scaling
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {fontOptions.map((f) => (
              <button
                key={f.id}
                onClick={() => updateGuiSettings({ fontSize: f.id })}
                className={`p-2.5 rounded border text-left text-xs font-mono transition-all cursor-pointer ${
                  guiSettings.fontSize === f.id
                    ? 'theme-accent-btn font-bold shadow-xs'
                    : 'border theme-border theme-subtle theme-text-secondary hover:opacity-85'
                }`}
              >
                <div className="font-semibold">{f.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
