import React from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS } from '../../data/mockData';
import { SubjectId } from '../../types';
import { calculateLevelAndProgress, calculateStreakMultiplier } from '../../utils/revisionMath';
import {
  Flame,
  Award,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Atom,
  FlaskConical,
  Dna,
  Binary,
  Languages,
  Terminal as TerminalIcon,
  Play,
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Atom,
  FlaskConical,
  Dna,
  Binary,
  Languages,
  Terminal: TerminalIcon,
};

export const DashboardHub: React.FC = () => {
  const { xp, streak, setActiveView, setActiveSubjectId, quests, claimQuestReward, nickname, olGrade, primarySubjectId } = useApp();
  const levelInfo = calculateLevelAndProgress(xp);
  const streakMultiplier = calculateStreakMultiplier(streak);

  const handleResumeSubject = (subjectId: SubjectId) => {
    setActiveSubjectId(subjectId);
    setActiveView('vault');
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Top Hero Banner: Minimalist Stats & Level Progression */}
      <div className="rounded-xl border theme-border theme-card p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono theme-text-muted">
              <span className="font-semibold uppercase tracking-wider">Candidate Terminal</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">EDX-2026-999</span>
              <span aria-hidden="true">·</span>
              <span className="theme-text-primary font-bold">{olGrade}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold theme-text-primary tracking-tight">
              Welcome back, {nickname}.
            </h1>

            <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed max-w-xl">
              Targeting Grade 9s across all 6 Edexcel IGCSE papers. Review your kinematics checkpoints, practice French vocabulary, or compete on the O/L leaderboard.
            </p>

            {/* Level & XP Meter */}
            <div className="pt-2 space-y-2">
              <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded border theme-border theme-subtle theme-text-primary font-semibold">
                    Level {levelInfo.level}
                  </span>
                  <span className="font-medium theme-text-secondary">{levelInfo.title}</span>
                </div>
                <span className="theme-text-muted tabular-nums">
                  {levelInfo.currentLevelXp} / {levelInfo.xpNeededForNextLevel} XP ({levelInfo.progressPercent}%)
                </span>
              </div>

              {/* Progress bar with dynamic accent color */}
              <div className="w-full h-2 rounded-full theme-subtle overflow-hidden">
                <div
                  className="h-full rounded-full theme-accent-bar transition-all duration-300"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Highlights & Streak Box */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Streak Card */}
            <div className="rounded-lg border theme-border theme-subtle p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider theme-text-muted font-medium">
                  Active Streak
                </span>
                <Flame className="w-4 h-4 theme-accent-text" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono theme-text-primary tabular-nums">
                  {streak}
                </span>
                <span className="text-xs theme-text-muted">days</span>
              </div>
              <div className="text-[11px] theme-text-muted font-mono">
                {streakMultiplier}x XP Boost active
              </div>
            </div>

            {/* Exam Countdown Card */}
            <div className="rounded-lg border theme-border theme-subtle p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider theme-text-muted font-medium">
                  Countdown
                </span>
                <Calendar className="w-4 h-4 theme-accent-text" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono theme-text-primary tabular-nums">
                  184
                </span>
                <span className="text-xs theme-text-muted">days</span>
              </div>
              <div className="text-[11px] theme-text-muted font-mono">
                May 2027 Series
              </div>
            </div>

            {/* Target Grade Badge */}
            <div className="sm:col-span-2 rounded-lg border theme-border theme-card p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border theme-border theme-subtle flex items-center justify-center theme-text-primary">
                  <Award className="w-4 h-4 theme-accent-text" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide theme-text-muted">
                    Target Standard
                  </div>
                  <div className="text-xs font-bold theme-text-primary">
                    Straight 9s (A** Level)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveView('rewards')}
                className="text-xs font-mono theme-text-secondary hover:theme-text-primary flex items-center gap-1 cursor-pointer"
              >
                <span>Quests</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Edexcel Subjects Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <span>Edexcel IGCSE Subjects</span>
              <span className="text-xs font-mono theme-text-muted font-normal">
                ({SUBJECTS.length} Subjects · Gateway College 11A Timetable)
              </span>
            </h2>
            <p className="text-xs theme-text-secondary">
              Syllabus specifications, checkpoint questions, past papers, and examiner notes
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setActiveView('pastpapers')}
              className="text-xs font-mono theme-text-secondary hover:theme-text-primary flex items-center gap-1 cursor-pointer"
            >
              <span>PaperLords Past Papers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveView('vault')}
              className="text-xs font-mono theme-text-secondary hover:theme-text-primary flex items-center gap-1 cursor-pointer"
            >
              <span>Open Vault</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SUBJECTS.map((subject) => {
            const IconComponent = iconMap[subject.iconName] || Atom;
            const isPrimary = subject.id === primarySubjectId;

            return (
              <div
                key={subject.id}
                className={`rounded-lg border theme-border theme-card p-4 hover:border-zinc-400 transition-colors flex flex-col justify-between shadow-xs ${
                  isPrimary ? 'ring-1 ring-white/30' : ''
                }`}
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded border theme-border theme-subtle flex items-center justify-center theme-text-primary">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono theme-text-muted">
                          <span className="font-bold theme-text-primary">{subject.code}</span>
                          <span aria-hidden="true">·</span>
                          <span>{subject.department}</span>
                          {isPrimary && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold theme-accent-btn">
                              Primary
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold theme-text-primary">
                          {subject.name}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-semibold theme-text-primary tabular-nums">
                      {subject.progressPercent}%
                    </span>
                  </div>

                  {/* Teacher & Room pill */}
                  {(subject.teacher || subject.room) && (
                    <div className="flex items-center justify-between text-[10px] font-mono theme-text-muted px-2 py-1 rounded theme-subtle mb-3">
                      <span>{subject.teacher ? `Teacher: ${subject.teacher}` : ''}</span>
                      <span>{subject.room || ''}</span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full theme-subtle overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full theme-accent-bar transition-all duration-300"
                      style={{ width: `${subject.progressPercent}%` }}
                    />
                  </div>

                  {/* Last Topic */}
                  <div className="space-y-0.5 mb-3 text-xs">
                    <span className="text-[10px] theme-text-muted font-mono">Current Module:</span>
                    <p className="font-medium theme-text-secondary truncate text-[11px]" title={subject.lastTopic}>
                      {subject.lastTopic}
                    </p>
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-2.5 border-t theme-border flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] theme-text-muted">
                    {subject.completedModules}/{subject.totalModules} modules
                  </span>

                  <button
                    onClick={() => handleResumeSubject(subject.id)}
                    className="flex items-center gap-1 px-3 py-1 rounded text-xs theme-accent-btn font-medium transition-opacity cursor-pointer shadow-xs"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Daily Quests Mini Deck */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold theme-text-primary tracking-tight flex items-center gap-2">
            <span>Daily Quests</span>
            <span className="text-xs font-mono theme-text-muted font-normal">
              (Bonus XP)
            </span>
          </h2>
          <button
            onClick={() => setActiveView('rewards')}
            className="text-xs font-mono theme-text-secondary hover:theme-text-primary cursor-pointer"
          >
            All Badges →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="rounded-lg border theme-border theme-card p-3.5 space-y-3 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="theme-accent-text font-bold">+{quest.xpReward} XP</span>
                  <span className="theme-text-muted">
                    {quest.currentCount}/{quest.targetCount}
                  </span>
                </div>
                <h4 className="text-xs font-bold theme-text-primary">{quest.title}</h4>
                <p className="text-[11px] theme-text-secondary line-clamp-2 mt-0.5">
                  {quest.description}
                </p>
              </div>

              <div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full theme-subtle overflow-hidden mb-2.5">
                  <div
                    className="h-full theme-accent-bar rounded-full transition-all"
                    style={{ width: `${Math.min(100, (quest.currentCount / quest.targetCount) * 100)}%` }}
                  />
                </div>

                {quest.claimed ? (
                  <div className="flex items-center justify-center gap-1.5 py-1 text-xs font-mono theme-text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Claimed</span>
                  </div>
                ) : quest.completed ? (
                  <button
                    onClick={() => claimQuestReward(quest.id)}
                    className="w-full py-1.5 rounded theme-accent-btn font-mono text-xs font-bold transition-opacity cursor-pointer shadow-xs"
                  >
                    Claim +{quest.xpReward} XP
                  </button>
                ) : (
                  <div className="text-center py-1 text-xs font-mono theme-text-muted">
                    In Progress
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
