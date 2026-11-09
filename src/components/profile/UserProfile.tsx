import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS } from '../../data/mockData';
import { SubjectId } from '../../types';
import {
  User,
  ShieldCheck,
  Trophy,
  Zap,
  Flame,
  RotateCcw,
  LogOut,
  SlidersHorizontal,
  Bot,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Users,
  Sparkles,
} from 'lucide-react';
import { PIXEL_BADGES } from '../../data/badgesData';
import { PixelBadge } from './PixelBadge';
import { StudentDirectoryModal } from './StudentDirectoryModal';

export const UserProfile: React.FC = () => {
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
    level,
    levelTitle,
    xp,
    streak,
    leaderboardUsers,
    resetToLevelOne,
    setActiveView,
    toggleOpencode,
    pomodoro,
    completedCheckpoints,
  } = useApp();

  const [inputNickname, setInputNickname] = useState(nickname);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [subjectSaved, setSubjectSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isStudentDirectoryOpen, setIsStudentDirectoryOpen] = useState(false);

  // Find user's live rank on leaderboard
  const userRankEntry = leaderboardUsers.find((u) => u.isCurrentUser || u.name === nickname);
  const userRank = userRankEntry ? userRankEntry.rank : 1;

  // Solved papers info from localStorage
  const solvedPapersInfo = (() => {
    try {
      const saved = localStorage.getItem('all9s_paperlords_solved');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  })();

  const solvedCount = Object.keys(solvedPapersInfo).length;
  const hasPerfectScore = Object.values(solvedPapersInfo).some((p: any) => p.score && p.score >= 100);

  const totalFocusMinutes = Math.floor(
    Object.values(pomodoro?.subjectStats || {}).reduce((acc: number, val: any) => acc + (typeof val === 'number' ? val : 0), 0) / 60
  );

  const getBadgeCurrentValue = (badgeId: string): number => {
    switch (badgeId) {
      case 'streak_10':
        return streak;
      case 'perfect_score':
        return hasPerfectScore ? 1 : 0;
      case 'subject_master':
        return completedCheckpoints?.size || 0;
      case 'pomodoro_centurion':
        return totalFocusMinutes;
      case 'speed_solver':
        return solvedCount;
      case 'vault_pioneer':
        return completedCheckpoints?.size || 0;
      case 'community_scholar':
        return 1;
      case 'room_host':
        return 1;
      case 'diamond_tier':
        return level;
      default:
        return 0;
    }
  };

  const isBadgeUnlocked = (badgeId: string): boolean => {
    switch (badgeId) {
      case 'streak_10':
        return streak >= 10;
      case 'perfect_score':
        return hasPerfectScore;
      case 'subject_master':
        return (completedCheckpoints?.size || 0) >= 6;
      case 'pomodoro_centurion':
        return totalFocusMinutes >= 100;
      case 'speed_solver':
        return solvedCount >= 1;
      case 'vault_pioneer':
        return (completedCheckpoints?.size || 0) >= 4;
      case 'community_scholar':
        return true;
      case 'room_host':
        return true;
      case 'diamond_tier':
        return level >= 2;
      default:
        return false;
    }
  };

  const XP_FOR_NEXT = 1000;
  const currentLevelProgress = xp % XP_FOR_NEXT;
  const progressPercent = Math.min(100, Math.round((currentLevelProgress / XP_FOR_NEXT) * 100));

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputNickname.trim().length >= 2) {
      try {
        await setNickname(inputNickname.trim());
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (err) {
        setSaveStatus('error');
      }
    }
  };

  const handleResetLevel = async () => {
    await resetToLevelOne();
    setShowResetConfirm(false);
  };

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

  return (
    <div className="max-w-6xl w-full mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="pb-4 border-b theme-border">
        <div className="flex items-center gap-2 text-xs font-mono theme-text-muted mb-1">
          <User className="w-3.5 h-3.5 theme-accent-text" />
          <span>Candidate Dossier</span>
          <span aria-hidden="true">·</span>
          <span>Firebase Auth & Profile Identity Configuration</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight theme-text-primary">
              Student Profile & Leaderboard Identity
            </h1>
            <p className="text-xs theme-text-secondary mt-1">
              Configure your Google account link, customize the nickname visible to other candidates, and inspect your level metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsStudentDirectoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded theme-accent-btn text-xs font-mono font-semibold transition-opacity cursor-pointer shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Search Friends</span>
            </button>
            <button
              onClick={() => setActiveView('rewards')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border theme-border theme-subtle theme-text-primary hover:opacity-85 text-xs font-mono transition-opacity cursor-pointer shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border theme-border theme-subtle theme-text-primary hover:opacity-85 text-xs font-mono transition-opacity cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>GUI Colors</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Auth & Identity) | Right Column (Leaderboard & Progression) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Google Auth & Nickname Editor */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Google Account Connection Card */}
          <section className="rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 theme-accent-text" />
                <h2 className="text-base font-bold theme-text-primary">
                  Google Account (Firebase Auth)
                </h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Connected
              </span>
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-3.5 rounded border theme-border theme-subtle">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || nickname}
                      className="w-12 h-12 rounded-full border theme-border object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full theme-accent-btn flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                      {nickname.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold theme-text-primary font-mono truncate">
                      {user.displayName || nickname}
                    </div>
                    <div className="text-xs theme-text-muted font-mono truncate">{user.email}</div>
                    <div className="text-[10px] theme-text-muted font-mono mt-0.5">
                      UID: {user.uid.slice(0, 16)}...
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    title="Sign Out of Session"
                    className="p-2 rounded border theme-border theme-card hover:opacity-75 transition-opacity cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 theme-text-muted" />
                  </button>
                </div>

                <div className="text-[11px] font-mono theme-text-secondary leading-relaxed">
                  Your revision progress and level ranking are stored under your Google credentials in Firestore.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs theme-text-secondary leading-relaxed">
                  Sign in with Google to synchronize your revision progress to the persistent student leaderboard.
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
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </section>

          {/* 2. Custom Display Nickname & O/L Tier */}
          <section className="rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
            <div className="pb-3 border-b theme-border">
              <h2 className="text-base font-bold theme-text-primary">
                Custom Display Nickname
              </h2>
              <p className="text-xs theme-text-muted font-mono mt-0.5">
                Linked directly to the student leaderboard and AI companion dialogues
              </p>
            </div>

            <form onSubmit={handleSaveNickname} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold theme-text-primary mb-1.5">
                  Display Nickname (2 - 24 characters)
                </label>
                <div className="flex gap-2">
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
                    {saveStatus === 'saved' ? 'Saved!' : 'Save Nickname'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold theme-text-primary mb-1.5">
                  Student Grade Bracket
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gradeOptions.map((grade) => (
                    <button
                      type="button"
                      key={grade}
                      onClick={() => setOlGrade(grade)}
                      className={`px-3 py-2 rounded border text-xs font-mono transition-all cursor-pointer text-center ${
                        olGrade === grade
                          ? 'theme-accent-btn font-bold shadow-xs'
                          : 'border theme-border theme-subtle theme-text-secondary hover:opacity-85'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Live Nickname Previews */}
            <div className="p-3.5 rounded border theme-border theme-subtle space-y-2">
              <span className="text-[10px] font-mono uppercase theme-text-muted font-semibold block">
                How other players and Opencode AI see your nickname:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded theme-card border theme-border">
                  <span className="text-[10px] theme-text-muted block mb-0.5">Leaderboard Row:</span>
                  <div className="flex items-center gap-1.5 font-bold theme-text-primary">
                    <span>{nickname}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded theme-subtle font-normal">
                      {olGrade}
                    </span>
                    <span className="text-[10px] theme-text-muted font-normal">· Lv.{level}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded theme-card border theme-border">
                  <span className="text-[10px] theme-text-muted block mb-0.5">AI Companion Address:</span>
                  <div className="text-[11px] theme-text-secondary italic">
                    &quot;Welcome back, {nickname}!&quot;
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Primary Timetable Subject Section (11A Gateway College Roster) */}
          <section className="rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 theme-accent-text" />
                <div>
                  <h2 className="text-base font-bold theme-text-primary">
                    Primary Revision Subject
                  </h2>
                  <p className="text-xs theme-text-muted font-mono mt-0.5">
                    11A Gateway College Timetable Courses (22 available)
                  </p>
                </div>
              </div>

              {subjectSaved && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Updated!
                </span>
              )}
            </div>

            <p className="text-xs theme-text-secondary leading-relaxed">
              Your primary subject sets the default syllabus vault, formula sheets, past paper collections, and Opencode tutoring mode. You can switch to any timetable subject anytime:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border theme-border rounded bg-zinc-950/20">
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
                    className={`p-2.5 rounded border text-left font-mono transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'theme-accent-btn shadow-xs ring-1 ring-white/20'
                        : 'theme-card border-zinc-800/80 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
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
                      <span>{sub.department}</span>
                      {sub.room && <span>{sub.room}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Leaderboard Data & Level Progression */}
        <div className="lg:col-span-5 space-y-6">
          {/* Level Progression & Reset */}
          <section className="rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
            <div className="pb-3 border-b theme-border">
              <h2 className="text-base font-bold theme-text-primary">
                Leaderboard Performance & Level
              </h2>
              <p className="text-xs theme-text-muted font-mono mt-0.5">
                Real-time metrics published to the candidates leaderboard
              </p>
            </div>

            {/* Level & Rank Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded border theme-border theme-subtle space-y-1">
                <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
                  <span>Current Level</span>
                  <Zap className="w-3.5 h-3.5 theme-accent-text" />
                </div>
                <div className="text-xl font-bold font-mono theme-text-primary">
                  Level {level}
                </div>
                <div className="text-[11px] font-mono theme-text-secondary">{levelTitle}</div>
              </div>

              <div className="p-3.5 rounded border theme-border theme-subtle space-y-1">
                <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
                  <span>Rank</span>
                  <Trophy className="w-3.5 h-3.5 theme-accent-text" />
                </div>
                <div className="text-xl font-bold font-mono theme-text-primary">
                  #{userRank}
                </div>
                <div className="text-[11px] font-mono theme-text-muted">
                  of {leaderboardUsers.length} Candidates
                </div>
              </div>
            </div>

            {/* XP Progression to next level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="theme-text-secondary">Total Revision XP:</span>
                <span className="font-bold theme-text-primary tabular-nums">
                  {xp.toLocaleString()} XP
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="theme-text-muted">Next Level Target:</span>
                <span className="theme-text-muted tabular-nums">
                  {currentLevelProgress} / {XP_FOR_NEXT} XP ({progressPercent}%)
                </span>
              </div>

              <div className="w-full h-2 theme-subtle rounded-full overflow-hidden">
                <div
                  className="h-full theme-accent-bar rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Streak Indicator */}
            <div className="p-3 rounded border theme-border theme-subtle flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 theme-text-primary">
                <Flame className="w-4 h-4 theme-accent-text" />
                <span>Revision Streak</span>
              </div>
              <span className="font-bold theme-text-primary">{streak} days active</span>
            </div>

            {/* Start from scratch / Reset to Level 1 action */}
            <div className="pt-2 border-t theme-border">
              {showResetConfirm ? (
                <div className="p-3 rounded border border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-700 dark:text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Reset to Level 1 (0 XP)?</span>
                  </div>
                  <p className="text-[11px] theme-text-secondary font-sans">
                    This resets your revision XP back to Level 1 so you can begin the syllabus completely from scratch.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleResetLevel}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1 rounded border theme-border theme-subtle theme-text-primary font-mono text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-mono theme-text-muted hover:theme-text-primary transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Start from scratch (Reset to Level 1)</span>
                </button>
              )}
            </div>
          </section>

          {/* Quick AI Companion launch */}
          <section className="rounded-lg border theme-border theme-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono font-bold theme-text-primary">
              <Bot className="w-4 h-4 theme-accent-text" />
              <span>Opencode AI Tutor Companion</span>
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed font-sans">
              Opencode is calibrated for your candidate profile. It personalizes mark-scheme insights and step-by-step problem derivations using your nickname.
            </p>
            <button
              onClick={toggleOpencode}
              className="w-full py-2 rounded theme-accent-btn font-mono text-xs font-semibold cursor-pointer shadow-xs"
            >
              Ask Opencode as {nickname}
            </button>
          </section>
        </div>
      </div>

      {/* 3. Pixel-Art Badges & Achievements System */}
      <section className="rounded-xl border theme-border theme-card p-6 space-y-6 shadow-xs font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b theme-border gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border theme-border theme-subtle flex items-center justify-center font-bold text-base theme-accent-text">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold theme-text-primary tracking-tight">
                  Badges & Pixel-Art Achievements
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold">
                  8-Bit Retro Spec
                </span>
              </div>
              <p className="text-xs theme-text-muted mt-0.5">
                Unlock collectible pixel milestones by maintaining revision streaks, scoring perfect papers, and mastering syllabus modules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-lg border theme-border theme-subtle text-xs">
              <span className="theme-text-muted">Unlocked: </span>
              <span className="font-bold theme-text-primary">
                {PIXEL_BADGES.filter((b) => isBadgeUnlocked(b.id)).length} / {PIXEL_BADGES.length}
              </span>
            </div>
            <button
              onClick={() => setIsStudentDirectoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border theme-border theme-subtle text-xs font-semibold theme-text-secondary hover:theme-text-primary cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Compare with Friends</span>
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PIXEL_BADGES.map((badge) => {
            const unlocked = isBadgeUnlocked(badge.id);
            const val = getBadgeCurrentValue(badge.id);

            return (
              <PixelBadge
                key={badge.id}
                badge={badge}
                isUnlocked={unlocked}
                currentValue={val}
              />
            );
          })}
        </div>
      </section>

      {/* Student Directory & Friend Search Modal */}
      <StudentDirectoryModal
        isOpen={isStudentDirectoryOpen}
        onClose={() => setIsStudentDirectoryOpen(false)}
      />
    </div>
  );
};
