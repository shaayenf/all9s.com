import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaderboardUser, SubjectId } from '../../types';
import { PIXEL_BADGES } from '../../data/badgesData';
import { PixelBadge } from './PixelBadge';
import { SUBJECTS } from '../../data/mockData';
import {
  Search,
  User,
  X,
  Trophy,
  Flame,
  Award,
  Video,
  UserPlus,
  UserCheck,
  BookOpen,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface StudentDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudyRoomForSubject?: (subjectId: SubjectId) => void;
}

export const StudentDirectoryModal: React.FC<StudentDirectoryModalProps> = ({
  isOpen,
  onClose,
  onOpenStudyRoomForSubject,
}) => {
  const { leaderboardUsers, nickname, level, xp, streak, olGrade, primarySubjectId, setActiveView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [inspectedStudent, setInspectedStudent] = useState<LeaderboardUser | null>(null);

  // Bookmarked / Friend IDs (saved in localStorage)
  const [friendIds, setFriendIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('all9s_friend_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set(['user-1', 'user-3']);
  });

  const toggleFriend = (id: string) => {
    setFriendIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('all9s_friend_ids', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Enriched list of students (including current user)
  const allStudents: LeaderboardUser[] = useMemo(() => {
    const list = [...leaderboardUsers];
    const exists = list.some((u) => u.isCurrentUser || u.name === nickname);
    if (!exists) {
      list.unshift({
        id: 'current-user-local',
        rank: 1,
        name: nickname,
        avatarSeed: nickname.slice(0, 2).toUpperCase(),
        xp: xp,
        streak: streak,
        level: level,
        olGrade: olGrade,
        league: 'Diamond',
        badgeTitle: 'Grade 9 Candidate',
        isCurrentUser: true,
      });
    }
    return list;
  }, [leaderboardUsers, nickname, xp, streak, level, olGrade]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      if (selectedGrade !== 'all' && student.olGrade !== selectedGrade) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesGrade = student.olGrade.toLowerCase().includes(q);
        const matchesBadge = student.badgeTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesGrade && !matchesBadge) return false;
      }

      return true;
    });
  }, [allStudents, searchQuery, selectedGrade]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border theme-border theme-card shadow-2xl overflow-hidden font-mono">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded theme-accent-btn flex items-center justify-center font-bold text-sm shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold theme-text-primary tracking-tight">
                Candidate Directory & Friend Search
              </h2>
              <p className="text-xs theme-text-muted">
                Search up fellow students, inspect badges & dossiers, and invite friends to study rooms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border theme-border theme-subtle theme-text-secondary hover:theme-text-primary cursor-pointer"
            aria-label="Close friend directory"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b theme-border space-y-3 bg-zinc-950/20">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search up a friend by candidate nickname (e.g. Kavindu, Alex, Dinum, Sarah)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border theme-border theme-input theme-text-primary focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] theme-text-muted">Grade:</span>
              {['all', 'Grade 11', 'Grade 10', 'Grade 12', 'O/L Candidate'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                    selectedGrade === g
                      ? 'theme-accent-btn font-bold shadow-xs'
                      : 'border theme-border theme-subtle theme-text-secondary hover:theme-text-primary'
                  }`}
                >
                  {g === 'all' ? 'All Grades' : g}
                </button>
              ))}
            </div>

            <div className="text-[11px] theme-text-muted">
              {filteredStudents.length} candidates found
            </div>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStudents.map((student) => {
              const sId = student.id || student.name;
              const isFriend = friendIds.has(sId);
              const isSelf = student.isCurrentUser || student.name === nickname;

              return (
                <div
                  key={sId}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                    isSelf
                      ? 'border-zinc-700 bg-zinc-900/60 ring-1 ring-white/10'
                      : 'theme-card border-zinc-800/80 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full theme-accent-btn flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {student.avatarSeed || student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs theme-text-primary truncate">
                            {student.name}
                          </span>
                          {isSelf && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold theme-accent-btn">
                              You
                            </span>
                          )}
                          {isFriend && !isSelf && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold border border-pink-500/30 text-pink-400 bg-pink-500/10">
                              Buddy
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] theme-text-muted mt-0.5 flex items-center gap-1.5">
                          <span>{student.olGrade}</span>
                          <span>·</span>
                          <span className="text-amber-400 font-semibold">{student.badgeTitle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold theme-text-primary tabular-nums">
                        Lv.{student.level}
                      </div>
                      <div className="text-[10px] theme-text-muted tabular-nums">
                        {student.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>

                  {/* Badges preview row */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[10px] theme-text-muted">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="font-semibold text-white">{student.streak}d streak</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>{student.league}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => toggleFriend(sId)}
                          className={`p-1.5 rounded border text-[11px] transition-colors cursor-pointer ${
                            isFriend
                              ? 'border-pink-500/40 bg-pink-500/10 text-pink-400'
                              : 'border-zinc-800 theme-subtle theme-text-secondary hover:theme-text-primary'
                          }`}
                          title={isFriend ? 'Remove from Study Buddies' : 'Add to Study Buddies'}
                        >
                          {isFriend ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setInspectedStudent(student)}
                        className="px-2.5 py-1 rounded text-[11px] border theme-border theme-subtle theme-text-primary hover:opacity-100 opacity-90 cursor-pointer"
                      >
                        View Dossier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <User className="w-8 h-8 mx-auto theme-text-muted opacity-40" />
              <div className="text-xs font-bold theme-text-primary">No candidates matched &quot;{searchQuery}&quot;</div>
              <p className="text-[11px] theme-text-muted max-w-sm mx-auto">
                Check spelling or clear the grade filter to find other O/L revision candidates.
              </p>
            </div>
          )}
        </div>

        {/* Inspected Student Dossier Modal */}
        {inspectedStudent && (
          <div className="absolute inset-0 z-50 bg-black/90 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between animate-fadeIn font-mono">
            <div className="space-y-6">
              {/* Top Dossier Bar */}
              <div className="flex items-center justify-between pb-4 border-b theme-border">
                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <Award className="w-4 h-4 theme-accent-text" />
                  <span>Candidate Dossier: {inspectedStudent.name}</span>
                </div>

                <button
                  onClick={() => setInspectedStudent(null)}
                  className="p-1.5 rounded-lg border theme-border theme-subtle theme-text-secondary hover:theme-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Identity Header */}
              <div className="p-4 rounded-xl border theme-border theme-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full theme-accent-btn flex items-center justify-center font-bold text-xl shadow-md">
                    {inspectedStudent.avatarSeed || inspectedStudent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold theme-text-primary">
                        {inspectedStudent.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold">
                        Verified Candidate
                      </span>
                    </div>
                    <div className="text-xs theme-text-muted mt-0.5">
                      {inspectedStudent.olGrade} · {inspectedStudent.badgeTitle} · {inspectedStudent.league} League
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      setActiveView('study_rooms');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded theme-accent-btn text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Study Together</span>
                  </button>

                  <button
                    onClick={() => {
                      const inspId = inspectedStudent.id || inspectedStudent.name;
                      toggleFriend(inspId);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                      friendIds.has(inspectedStudent.id || inspectedStudent.name)
                        ? 'border-pink-500/40 bg-pink-500/10 text-pink-400'
                        : 'theme-border theme-subtle theme-text-primary'
                    }`}
                  >
                    {friendIds.has(inspectedStudent.id || inspectedStudent.name) ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Buddy Saved</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Study Buddy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border theme-border theme-subtle">
                  <div className="text-[10px] uppercase theme-text-muted">Student Level</div>
                  <div className="text-lg font-bold theme-text-primary mt-0.5">Level {inspectedStudent.level}</div>
                </div>
                <div className="p-3 rounded-lg border theme-border theme-subtle">
                  <div className="text-[10px] uppercase theme-text-muted">Total Revision XP</div>
                  <div className="text-lg font-bold theme-text-primary mt-0.5">{inspectedStudent.xp.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border theme-border theme-subtle">
                  <div className="text-[10px] uppercase theme-text-muted">Daily Streak</div>
                  <div className="text-lg font-bold text-orange-400 mt-0.5">{inspectedStudent.streak} Days</div>
                </div>
                <div className="p-3 rounded-lg border theme-border theme-subtle">
                  <div className="text-[10px] uppercase theme-text-muted">Leaderboard Rank</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">#{inspectedStudent.rank}</div>
                </div>
              </div>

              {/* Pixel-Art Badges & Achievements Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b theme-border">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 theme-accent-text" />
                    <h4 className="text-sm font-bold theme-text-primary">
                      Pixel-Art Achievements & Badges ({PIXEL_BADGES.filter((_, i) => i <= 3).length} Unlocked)
                    </h4>
                  </div>
                  <span className="text-[10px] theme-text-muted">
                    Official Grade 9 Milestones
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PIXEL_BADGES.map((badge, idx) => {
                    const isUnlocked = idx <= 3 || (idx === 4 && inspectedStudent.level >= 2);
                    const mockVal = isUnlocked ? badge.targetValue : Math.floor(badge.targetValue * 0.4);

                    return (
                      <PixelBadge
                        key={badge.id}
                        badge={badge}
                        isUnlocked={isUnlocked}
                        currentValue={mockVal}
                        size="sm"
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t theme-border flex items-center justify-between">
              <span className="text-[11px] theme-text-muted">
                All9s Student Dossier · Peer Study Network
              </span>
              <button
                onClick={() => setInspectedStudent(null)}
                className="px-4 py-1.5 rounded border theme-border theme-subtle text-xs font-semibold theme-text-primary cursor-pointer"
              >
                Back to Directory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
