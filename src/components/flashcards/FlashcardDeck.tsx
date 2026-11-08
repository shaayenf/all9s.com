import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectId } from '../../types';
import {
  Flashcard,
  DEFAULT_FLASHCARDS,
  getNextCardIndex,
  getPrevCardIndex,
  calculateMasteryPercent,
  filterCardsBySubject,
  shuffleCards,
  MasteryRating,
} from '../../utils/flashcards';
import {
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Award,
  Layers,
  Keyboard,
  Maximize2,
  Volume2,
} from 'lucide-react';

interface FlashcardDeckProps {
  customCards?: Flashcard[];
  initialSubjectId?: SubjectId | 'all';
  onCardMastered?: (card: Flashcard) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  customCards,
  initialSubjectId = 'all',
  onCardMastered,
}) => {
  const { addXp, activeSubjectId } = useApp();

  const allCards = customCards || DEFAULT_FLASHCARDS;
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>(() => {
    if (customCards && customCards.length > 0) {
      return customCards[0].subjectId || 'all';
    }
    return initialSubjectId === 'all' ? activeSubjectId : initialSubjectId;
  });
  const [deck, setDeck] = useState<Flashcard[]>(() => {
    const subj = customCards && customCards.length > 0 ? (customCards[0].subjectId || 'all') : (initialSubjectId === 'all' ? activeSubjectId : initialSubjectId);
    return filterCardsBySubject(allCards, subj);
  });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [ratings, setRatings] = useState<Record<string, MasteryRating>>({});
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  // Update deck when subject or source cards change
  useEffect(() => {
    if (customCards && customCards.length > 0) {
      const targetSubj = customCards[0].subjectId || 'all';
      setSelectedSubject(targetSubj);
      setDeck(filterCardsBySubject(customCards, targetSubj));
    } else {
      const filtered = filterCardsBySubject(allCards, selectedSubject);
      setDeck(filtered);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  }, [selectedSubject, customCards]);

  const activeCard = deck[currentIndex] || null;
  const mastery = calculateMasteryPercent(deck, ratings);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => getNextCardIndex(prev, deck.length));
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => getPrevCardIndex(prev, deck.length));
  }, [deck.length]);

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    setDeck(shuffleCards(deck));
    setCurrentIndex(0);
  };

  const handleReset = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(0);
    setRatings({});
  };

  const handleRateCard = useCallback(
    (rating: MasteryRating) => {
      if (!activeCard) return;

      setRatings((prev) => ({
        ...prev,
        [activeCard.id]: rating,
      }));

      // Award gamified XP based on confidence
      const xpRewards: Record<MasteryRating, number> = {
        1: 5,  // Again
        2: 10, // Hard
        3: 20, // Good
        4: 35, // Mastered
      };
      addXp(xpRewards[rating]);

      if (rating >= 3 && onCardMastered) {
        onCardMastered(activeCard);
      }

      // Automatically advance to next card after brief transition
      setTimeout(() => {
        handleNext();
      }, 200);
    },
    [activeCard, addXp, onCardMastered, handleNext]
  );

  // Global Keyboard Navigation Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleRateCard(1);
      } else if (e.key === '2') {
        e.preventDefault();
        handleRateCard(2);
      } else if (e.key === '3') {
        e.preventDefault();
        handleRateCard(3);
      } else if (e.key === '4') {
        e.preventDefault();
        handleRateCard(4);
      } else if (e.key.toLowerCase() === 's') {
        handleShuffle();
      } else if (e.key.toLowerCase() === 'h') {
        setShowHint((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleRateCard]);

  const subjectFilters: { id: SubjectId | 'all'; label: string }[] = [
    { id: 'all', label: 'All Subjects' },
    { id: 'physics', label: 'Physics' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'biology', label: 'Biology' },
    { id: 'maths', label: 'Maths A' },
    { id: 'french', label: 'French' },
    { id: 'ict', label: 'ICT' },
  ];

  if (!activeCard) {
    return (
      <div className="p-8 text-center rounded-xl border theme-border theme-card space-y-3">
        <Layers className="w-8 h-8 mx-auto opacity-50 theme-text-muted" />
        <h3 className="font-mono text-sm font-bold theme-text-primary">No Flashcards Available</h3>
        <p className="text-xs theme-text-muted">
          Try selecting another subject or create custom flashcards from your Revision Notebook.
        </p>
        <button
          onClick={() => setSelectedSubject('all')}
          className="px-4 py-2 rounded-md theme-accent-btn text-xs font-mono font-medium cursor-pointer"
        >
          View All Subjects
        </button>
      </div>
    );
  }

  const currentRating = ratings[activeCard.id];

  return (
    <div className="w-full space-y-4">
      {/* Deck Controls & Subject Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border theme-border theme-card">
        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1">
          {subjectFilters.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  isSelected
                    ? 'theme-accent-btn font-bold shadow-xs'
                    : 'theme-border theme-subtle theme-text-secondary hover:theme-text-primary border'
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* Deck Utilities */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={handleShuffle}
            title="Shuffle Deck (S)"
            aria-label="Shuffle Deck"
            className="p-1.5 rounded border theme-border theme-subtle hover:theme-card theme-text-primary transition-colors cursor-pointer flex items-center gap-1"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={handleReset}
            title="Reset Ratings & Start Over"
            aria-label="Reset Ratings"
            className="p-1.5 rounded border theme-border theme-subtle hover:theme-card theme-text-primary transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setShowKeyboardHelp((prev) => !prev)}
            title="Keyboard Shortcuts"
            aria-label="Toggle Keyboard Shortcuts"
            className={`p-1.5 rounded border theme-border transition-colors cursor-pointer flex items-center gap-1 ${
              showKeyboardHelp ? 'theme-accent-btn' : 'theme-subtle theme-text-primary'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keys</span>
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts reminder banner */}
      {showKeyboardHelp && (
        <div className="p-3 rounded-lg border theme-border theme-subtle text-xs font-mono flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded border theme-border theme-card">Space</kbd> Flip</span>
            <span><kbd className="px-1.5 py-0.5 rounded border theme-border theme-card">→</kbd> / <kbd className="px-1.5 py-0.5 rounded border theme-border theme-card">K</kbd> Next</span>
            <span><kbd className="px-1.5 py-0.5 rounded border theme-border theme-card">←</kbd> / <kbd className="px-1.5 py-0.5 rounded border theme-border theme-card">J</kbd> Prev</span>
            <span><kbd className="px-1.5 py-0.5 rounded border theme-border theme-card">1-4</kbd> Rate Confidence</span>
            <span><kbd className="px-1.5 py-0.5 rounded border theme-border theme-card">S</kbd> Shuffle</span>
          </div>
          <button
            onClick={() => setShowKeyboardHelp(false)}
            className="text-[11px] underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress & Deck Metric Bar */}
      <div className="flex items-center justify-between text-xs font-mono theme-text-muted px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold theme-text-primary">
            Card {currentIndex + 1} of {deck.length}
          </span>
          <span>·</span>
          <span className="uppercase text-[11px]">
            {activeCard.topic} {activeCard.specCode && `(${activeCard.specCode})`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Mastery:</span>
          <strong className="theme-text-primary font-bold">{mastery.percent}%</strong>
          <span className="text-[11px]">({mastery.masteredCount}/{mastery.total})</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full theme-accent-bar rounded-full transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / deck.length) * 100)}%` }}
        />
      </div>

      {/* The 3D Interactive Flippable Card Container */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard: ${isFlipped ? 'Definition' : 'Question'}. Click or press space to flip.`}
        className="w-full min-h-[300px] sm:min-h-[340px] cursor-pointer select-none perspective-[1200px] outline-none"
      >
        <div
          className={`relative w-full h-full min-h-[300px] sm:min-h-[340px] rounded-2xl border-2 transition-transform duration-500 transform-style-3d shadow-md ${
            isFlipped
              ? 'transform rotate-y-180 theme-card theme-border'
              : 'theme-card theme-border hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          {/* Card Front: Concept / Question */}
          <div
            className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-between backface-hidden ${
              isFlipped ? 'invisible' : 'visible'
            }`}
          >
            {/* Top metadata tags */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border theme-border theme-subtle theme-text-secondary">
                {activeCard.category.replace('_', ' ')}
              </span>

              {currentRating && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold theme-accent-pill">
                  {currentRating === 4
                    ? 'Mastered'
                    : currentRating === 3
                    ? 'Good'
                    : currentRating === 2
                    ? 'Reviewing'
                    : 'Learning'}
                </span>
              )}
            </div>

            {/* Central Concept */}
            <div className="my-auto py-4 text-center space-y-3">
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight theme-text-primary max-w-xl mx-auto leading-snug">
                {activeCard.front}
              </h2>

              {showHint && activeCard.hint && (
                <div className="inline-block p-2 rounded border theme-border theme-subtle text-xs font-mono theme-text-primary animate-fadeIn max-w-md">
                  💡 Hint: {activeCard.hint}
                </div>
              )}
            </div>

            {/* Bottom flip prompt & hint button */}
            <div className="flex items-center justify-between text-xs font-mono theme-text-muted pt-4 border-t theme-border/60">
              {activeCard.hint ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint((prev) => !prev);
                  }}
                  className="hover:theme-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint (H)'}</span>
                </button>
              ) : (
                <span />
              )}

              <span className="flex items-center gap-1 text-[11px] theme-accent-text font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Click or Space to Reveal Answer →</span>
              </span>
            </div>
          </div>

          {/* Card Back: Definition / Mark Scheme Answer (Rotated 180deg) */}
          <div
            className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-between transform rotate-y-180 backface-hidden ${
              isFlipped ? 'visible' : 'invisible'
            }`}
          >
            {/* Top metadata tags */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border theme-border theme-subtle theme-text-primary">
                Edexcel Mark Scheme Definition
              </span>
              <span className="text-[11px] font-mono theme-text-muted">
                {activeCard.subjectId.toUpperCase()}
              </span>
            </div>

            {/* Central Definition */}
            <div className="my-auto py-4 space-y-3">
              <div className="text-xs font-mono theme-text-muted uppercase tracking-wider">
                Target Concept: {activeCard.front}
              </div>
              <p className="text-sm sm:text-base leading-relaxed theme-text-primary font-medium">
                {activeCard.back}
              </p>
            </div>

            {/* Bottom Return Instruction */}
            <div className="flex items-center justify-between text-xs font-mono theme-text-muted pt-4 border-t theme-border/60">
              <span className="text-[11px]">Rate your recall below to save progress</span>
              <span className="theme-text-primary hover:underline cursor-pointer">
                Flip Back ↵
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Rating Buttons (Spaced Repetition Inspired) */}
      <div className="p-3.5 rounded-xl border theme-border theme-card space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="theme-text-muted font-semibold">How well did you know this?</span>
          <span className="theme-text-muted text-[10px]">Shortcuts: 1 · 2 · 3 · 4</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleRateCard(1)}
            className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              currentRating === 1
                ? 'theme-accent-btn shadow-xs'
                : 'theme-border theme-subtle hover:theme-card theme-text-primary'
            }`}
          >
            <span>[1] Again</span>
            <span className="text-[10px] opacity-75 font-normal">+5 XP · Repeat</span>
          </button>

          <button
            onClick={() => handleRateCard(2)}
            className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              currentRating === 2
                ? 'theme-accent-btn shadow-xs'
                : 'theme-border theme-subtle hover:theme-card theme-text-primary'
            }`}
          >
            <span>[2] Hard</span>
            <span className="text-[10px] opacity-75 font-normal">+10 XP · Review</span>
          </button>

          <button
            onClick={() => handleRateCard(3)}
            className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              currentRating === 3
                ? 'theme-accent-btn shadow-xs'
                : 'theme-border theme-subtle hover:theme-card theme-text-primary'
            }`}
          >
            <span>[3] Good</span>
            <span className="text-[10px] opacity-75 font-normal">+20 XP · Solid</span>
          </button>

          <button
            onClick={() => handleRateCard(4)}
            className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              currentRating === 4
                ? 'theme-accent-btn shadow-xs'
                : 'theme-border theme-subtle hover:theme-card theme-text-primary'
            }`}
          >
            <span>[4] Mastered</span>
            <span className="text-[10px] opacity-75 font-normal">+35 XP · Grade 9</span>
          </button>
        </div>
      </div>

      {/* Prev / Next Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={handlePrev}
          aria-label="Previous Flashcard"
          className="flex-1 py-2 px-4 rounded-lg border theme-border theme-subtle hover:theme-card theme-text-primary text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          onClick={handleFlip}
          className="py-2 px-6 rounded-lg theme-accent-btn text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <span>{isFlipped ? 'Show Term' : 'Reveal Definition'}</span>
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Flashcard"
          className="flex-1 py-2 px-4 rounded-lg border theme-border theme-subtle hover:theme-card theme-text-primary text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
