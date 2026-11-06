import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ACHIEVEMENT_BADGES } from '../../data/mockData';
import {
  Trophy,
  Flame,
  Award,
  CheckCircle2,
  Atom,
  Languages,
  Binary,
  FlaskConical,
  Moon,
  Timer,
  Shield,
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

const badgeIcons: Record<string, React.FC<{ className?: string }>> = {
  Atom,
  Languages,
  Binary,
  FlaskConical,
  Moon,
  Timer,
};

export const RewardsQuestsHub: React.FC = () => {
  const {
    quests,
    claimQuestReward,
    leaderboardUsers,
    nickname,
    user,
    setActiveView,
    loginWithGoogle,
  } = useApp();

  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [levelTierFilter, setLevelTierFilter] = useState<'all' | 'high' | 'mid' | 'foundational'>('all');

  const gradeOptions = [
    { id: 'all', label: 'All Grades (1 - 13)' },
    { id: 'ol_core', label: 'O/L Focus (Gr. 10 - 11)' },
    ...Array.from({ length: 13 }, (_, i) => ({
      id: `Grade ${i + 1}`,
      label: `Grade ${i + 1}`,
    })),
  ];

  // Filter leaderboard based on Grade and Level Tier
  const filteredLeaderboard = leaderboardUsers.filter((candidate) => {
    // Grade filter
    if (gradeFilter === 'ol_core') {
      if (candidate.olGrade !== 'Grade 10' && candidate.olGrade !== 'Grade 11' && candidate.olGrade !== 'O/L Candidate') {
        return false;
      }
    } else if (gradeFilter !== 'all') {
      if (candidate.olGrade !== gradeFilter) return false;
    }

    // Level tier filter
    if (levelTierFilter === 'high' && candidate.level < 6) return false;
    if (levelTierFilter === 'mid' && (candidate.level < 4 || candidate.level > 5)) return false;
    if (levelTierFilter === 'foundational' && candidate.level > 3) return false;

    return true;
  });

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b theme-border">
        <div className="flex items-center gap-2 text-xs font-mono theme-text-muted mb-1">
          <Trophy className="w-3.5 h-3.5 theme-accent-text" />
          <span>Student Arena</span>
          <span aria-hidden="true">·</span>
          <span>Grade 1 - 13 Level-Based Leaderboard</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight theme-text-primary">
              Student Leaderboard & Specification Quests
            </h1>
            <p className="text-xs theme-text-secondary mt-1">
              Compete against candidates across Grade 1 through 13, advance through levels, and customize your nickname.
            </p>
          </div>

          <button
            onClick={() => setActiveView('settings')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded border theme-border theme-subtle theme-text-primary hover:opacity-85 text-xs font-mono transition-opacity cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Customize Nickname & Colors</span>
          </button>
        </div>
      </div>

      {/* Guest Sign-in Prompt Banner */}
      {!user && (
        <div className="p-4 rounded-lg border theme-border theme-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <div className="text-xs font-bold theme-text-primary font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 theme-accent-text" />
              <span>Connect Your Gmail Account</span>
            </div>
            <p className="text-xs theme-text-secondary font-sans">
              Sign in to secure your candidate nickname permanently on the live student leaderboard and cloud-save XP.
            </p>
          </div>

          <button
            onClick={loginWithGoogle}
            className="px-4 py-2 rounded theme-accent-btn font-mono text-xs font-semibold whitespace-nowrap transition-opacity cursor-pointer shadow-xs"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {/* Daily Quests Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold theme-text-primary tracking-tight">
              Daily Specification Quests
            </h2>
            <p className="text-xs font-mono theme-text-muted">Refreshes every 24 hours at 00:00 UTC</p>
          </div>
          <span className="text-xs font-mono theme-text-muted">
            {quests.filter((q) => q.claimed).length} of {quests.length} completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="rounded-lg border theme-border theme-card p-4 space-y-4 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="px-1.5 py-0.5 rounded border theme-border theme-subtle theme-accent-text font-bold">
                    +{quest.xpReward} XP
                  </span>
                  <span className="theme-text-muted tabular-nums">
                    {quest.currentCount}/{quest.targetCount}
                  </span>
                </div>

                <h3 className="text-sm font-semibold theme-text-primary">
                  {quest.title}
                </h3>
                <p className="text-xs theme-text-secondary mt-1 leading-relaxed">
                  {quest.description}
                </p>
              </div>

              <div>
                <div className="w-full h-1.5 theme-subtle rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full theme-accent-bar transition-all"
                    style={{
                      width: `${Math.min(100, (quest.currentCount / quest.targetCount) * 100)}%`,
                    }}
                  />
                </div>

                {quest.claimed ? (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-mono theme-text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Claimed</span>
                  </div>
                ) : quest.completed ? (
                  <button
                    onClick={() => claimQuestReward(quest.id)}
                    className="w-full py-1.5 rounded theme-accent-btn font-mono text-xs font-semibold transition-opacity cursor-pointer shadow-xs"
                  >
                    Claim +{quest.xpReward} XP
                  </button>
                ) : (
                  <div className="text-center py-1.5 text-xs font-mono theme-text-muted">
                    In Progress
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2-Column Split: Leaderboard on Left | Badges & Candidate Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Students Level-Based Leaderboard */}
        <section className="lg:col-span-8 rounded-lg border theme-border theme-card p-5 space-y-4 shadow-xs">
          <div className="space-y-3 pb-3 border-b theme-border">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 theme-accent-text" />
                <div>
                  <h3 className="text-sm font-bold theme-text-primary">
                    Leaderboard Rankings (Level & XP)
                  </h3>
                  <span className="text-xs font-mono theme-text-muted">
                    Showing candidates sorted by level & total XP
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono theme-text-muted">
                {filteredLeaderboard.length} Candidates
              </span>
            </div>

            {/* Filter Controls: Grade Dropdown & Level Tiers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Grade Selector */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="theme-text-muted">Grade Division:</span>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded border theme-border theme-input theme-text-primary font-semibold text-xs cursor-pointer focus:outline-none"
                >
                  {gradeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Tier Filter */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="theme-text-muted text-[11px]">Level:</span>
                <select
                  value={levelTierFilter}
                  onChange={(e) => setLevelTierFilter(e.target.value as any)}
                  className="px-2 py-1.5 rounded border theme-border theme-input theme-text-primary text-xs font-mono cursor-pointer focus:outline-none"
                >
                  <option value="all">All Levels (1 - 99)</option>
                  <option value="high">Level 6+ (Aspirants & Masters)</option>
                  <option value="mid">Level 4 - 5 (Intermediate)</option>
                  <option value="foundational">Level 1 - 3 (Foundations)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leaderboard Table Rows - Completely responsive with no horizontal overflow */}
          <div className="space-y-1.5">
            {filteredLeaderboard.map((candidate) => {
              const isUser = candidate.isCurrentUser;
              return (
                <div
                  key={candidate.rank + '-' + candidate.name}
                  className={`p-3 rounded border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 transition-colors ${
                    isUser
                      ? 'theme-accent-pill border-2 font-medium shadow-xs'
                      : 'border theme-border theme-subtle hover:opacity-85'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 text-center font-mono font-bold text-xs theme-text-muted tabular-nums shrink-0">
                      #{candidate.rank}
                    </span>

                    <div className="w-8 h-8 rounded border theme-border theme-card flex items-center justify-center font-mono font-bold text-xs theme-text-primary shrink-0">
                      {candidate.avatarSeed}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold font-mono theme-text-primary flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{candidate.name}</span>
                        {isUser && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] theme-accent-btn font-mono font-bold">
                            YOU
                          </span>
                        )}
                        <span className="text-[10px] font-mono theme-text-muted">
                          ({candidate.olGrade})
                        </span>
                      </div>
                      <div className="text-[11px] theme-text-muted font-mono truncate">
                        {candidate.badgeTitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono shrink-0 ml-auto sm:ml-0">
                    {/* Level Pill */}
                    <div className="px-2 py-0.5 rounded border theme-border theme-card font-bold theme-text-primary">
                      Lv.{candidate.level}
                    </div>

                    <div className="flex items-center gap-1 theme-text-secondary">
                      <Flame className="w-3.5 h-3.5 theme-accent-text" />
                      <span className="tabular-nums">{candidate.streak}d</span>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-bold tabular-nums theme-text-primary">
                        {candidate.xp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLeaderboard.length === 0 && (
              <div className="py-8 text-center text-xs font-mono theme-text-muted">
                No candidates currently match the selected grade division or level filter.
              </div>
            )}
          </div>
        </section>

        {/* Right: User Identity Card & Badges */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Candidate Card */}
          <div className="rounded-lg border theme-border theme-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b theme-border">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold theme-text-muted">
                <GraduationCap className="w-3.5 h-3.5 theme-accent-text" />
                <span>Your Candidate Card</span>
              </div>
              <button
                onClick={() => setActiveView('settings')}
                className="text-[11px] font-mono theme-accent-text hover:underline cursor-pointer font-semibold"
              >
                Edit
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono theme-text-muted">Nickname:</span>
                <span className="text-xs font-mono font-bold theme-text-primary">{nickname}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono theme-text-muted">Grade Division:</span>
                <span className="text-xs font-mono theme-text-secondary">Grade 11</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono theme-text-muted">Account:</span>
                <span className="text-xs font-mono theme-text-secondary">
                  {user ? user.email : 'Guest Session'}
                </span>
              </div>
            </div>
          </div>

          {/* Badges Gallery */}
          <div className="rounded-lg border theme-border theme-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b theme-border">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 theme-accent-text" />
                <h3 className="text-sm font-bold theme-text-primary">
                  Achievement Badges
                </h3>
              </div>
              <span className="text-xs font-mono theme-text-muted">
                {ACHIEVEMENT_BADGES.filter((b) => b.unlocked).length} / {ACHIEVEMENT_BADGES.length}
              </span>
            </div>

            <div className="space-y-2">
              {ACHIEVEMENT_BADGES.map((badge) => {
                const IconComp = badgeIcons[badge.icon] || Award;

                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded border flex items-start gap-3 transition-colors ${
                      badge.unlocked
                        ? 'border theme-border theme-subtle'
                        : 'border theme-border theme-card opacity-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                        badge.unlocked
                          ? 'theme-border theme-card theme-accent-text'
                          : 'theme-border theme-subtle opacity-40'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold theme-text-primary font-mono">
                          {badge.title}
                        </h4>
                        <span className="text-[10px] font-mono theme-text-muted">
                          {badge.unlocked ? `Unlocked` : `${badge.progressPercent}%`}
                        </span>
                      </div>

                      <p className="text-[11px] theme-text-secondary leading-tight">
                        {badge.description}
                      </p>

                      {!badge.unlocked && (
                        <div className="w-full h-1 theme-subtle rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full theme-accent-bar rounded-full"
                            style={{ width: `${badge.progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
