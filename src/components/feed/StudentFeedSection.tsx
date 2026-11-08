import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RevisionNotebookHub } from '../notebook/RevisionNotebookHub';
import { FlashcardDeck } from '../flashcards/FlashcardDeck';
import { Flashcard } from '../../utils/flashcards';
import {
  Share2,
  Users,
  Sparkles,
  BookOpen,
  Layers,
  ArrowLeft,
  Flame,
  Award,
} from 'lucide-react';

export const StudentFeedSection: React.FC = () => {
  const { nickname, olGrade, xp } = useApp();
  const [activeStudyCards, setActiveStudyCards] = useState<Flashcard[] | null>(null);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Section Header */}
      <div className="rounded-xl border theme-border theme-card p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono theme-text-secondary">
              <span className="px-2 py-0.5 rounded border theme-border theme-subtle font-semibold uppercase tracking-wider">
                Community Hub
              </span>
              <span aria-hidden="true">·</span>
              <span>All9s Student Feed</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold theme-text-primary">{olGrade}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight theme-text-primary flex items-center gap-2.5">
              <Share2 className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
              <span>Student Feed</span>
            </h1>

            <p className="text-sm font-sans theme-text-secondary max-w-2xl leading-relaxed">
              Explore shared revision notes, clone proven Grade 9 templates to your personal notebook,
              leave helpful peer comments, and turn any student's notes into rapid interactive flashcards.
            </p>
          </div>

          {/* Social Stats Strip */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2.5 rounded-lg border theme-border theme-subtle flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border theme-border theme-card flex items-center justify-center font-mono font-bold text-xs theme-text-primary">
                {nickname ? nickname.slice(0, 2).toUpperCase() : 'ME'}
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-bold theme-text-primary">{nickname || 'Candidate'}</div>
                <div className="text-[10px] theme-text-secondary flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Level {Math.max(1, Math.floor(xp / 1000) + 1)} · {xp} XP</span>
                </div>
              </div>
            </div>

            {activeStudyCards && (
              <button
                onClick={() => setActiveStudyCards(null)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold border theme-border theme-card theme-text-primary hover:theme-accent-btn transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Feed</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Flashcard Study View OR Full Interactive Feed Hub */}
      {activeStudyCards ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border theme-border theme-subtle text-xs font-mono">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span className="font-bold theme-text-primary">
                Interactive Study Session: {activeStudyCards.length} Flashcards
              </span>
            </div>
            <button
              onClick={() => setActiveStudyCards(null)}
              className="px-2.5 py-1 rounded border theme-border theme-card hover:opacity-100 opacity-80 cursor-pointer"
            >
              Exit to Student Feed
            </button>
          </div>

          <FlashcardDeck
            customCards={activeStudyCards}
            initialSubjectId={activeStudyCards[0]?.subjectId || 'all'}
          />
        </div>
      ) : (
        <RevisionNotebookHub
          onStudyFlashcards={(cards) => {
            setActiveStudyCards(cards);
          }}
        />
      )}
    </div>
  );
};
