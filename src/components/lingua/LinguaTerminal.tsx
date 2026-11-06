import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FRENCH_VOCAB_PAIRS } from '../../data/mockData';
import { VocabPair } from '../../types';
import { checkPairMatch, calculateStreakMultiplier } from '../../utils/revisionMath';
import {
  Heart,
  Flame,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Gamepad2,
} from 'lucide-react';

interface GameItem {
  uid: string;
  pairId: string;
  text: string;
  lang: 'fr' | 'en';
}

export const LinguaTerminal: React.FC = () => {
  const { streak, hearts, decrementHeart, refillHearts, addXp } = useApp();
  const [activeTab, setActiveTab] = useState<'pairs' | 'quiz'>('pairs');

  // Matching game state
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [wrongPairIds, setWrongPairIds] = useState<Set<string>>(new Set());
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);
  const [roundScore, setRoundScore] = useState<number>(0);

  // Quiz game state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState<boolean>(false);

  const streakMultiplier = calculateStreakMultiplier(streak);

  // Initialize matching game with 6 pairs
  const initializeMatchingGame = () => {
    const activePairs = FRENCH_VOCAB_PAIRS.slice(0, 6);
    const frenchItems: GameItem[] = activePairs.map((p) => ({
      uid: `fr-${p.id}`,
      pairId: p.id,
      text: p.french,
      lang: 'fr',
    }));
    const englishItems: GameItem[] = activePairs.map((p) => ({
      uid: `en-${p.id}`,
      pairId: p.id,
      text: p.english,
      lang: 'en',
    }));

    // Deterministic shuffle
    const shuffled = [...frenchItems, ...englishItems].sort(() => Math.random() - 0.5);
    setGameItems(shuffled);
    setSelectedItem(null);
    setMatchedPairIds(new Set());
    setWrongPairIds(new Set());
    setRoundCompleted(false);
  };

  useEffect(() => {
    initializeMatchingGame();
  }, []);

  const handleItemClick = (item: GameItem) => {
    if (matchedPairIds.has(item.pairId) || hearts <= 0 || roundCompleted) return;

    if (!selectedItem) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.uid === item.uid) {
      setSelectedItem(null);
      return;
    }

    // Check if match
    const isMatch = checkPairMatch(
      { id: selectedItem.pairId, lang: selectedItem.lang },
      { id: item.pairId, lang: item.lang },
      FRENCH_VOCAB_PAIRS
    );

    if (isMatch) {
      const newMatched = new Set(matchedPairIds);
      newMatched.add(item.pairId);
      setMatchedPairIds(newMatched);
      setSelectedItem(null);
      const earnedXp = Math.round(20 * streakMultiplier);
      addXp(earnedXp);
      setRoundScore((prev) => prev + earnedXp);

      if (newMatched.size === 6) {
        setRoundCompleted(true);
        addXp(100); // Completion bonus
      }
    } else {
      // Wrong match
      setWrongPairIds(new Set([selectedItem.uid, item.uid]));
      decrementHeart();
      setTimeout(() => {
        setWrongPairIds(new Set());
        setSelectedItem(null);
      }, 700);
    }
  };

  // Quiz state logic
  const currentQuizPair = FRENCH_VOCAB_PAIRS[quizIndex % FRENCH_VOCAB_PAIRS.length];
  const quizOptions = [
    currentQuizPair.english,
    'the castle',
    'to improve',
    'however',
  ].filter((v, i, a) => a.indexOf(v) === i);

  const handleQuizSubmit = (opt: string) => {
    setSelectedQuizOption(opt);
    setQuizAnswerChecked(true);
    if (opt === currentQuizPair.english) {
      addXp(25);
    } else {
      decrementHeart();
    }
  };

  const handleNextQuiz = () => {
    setQuizIndex((prev) => prev + 1);
    setSelectedQuizOption(null);
    setQuizAnswerChecked(false);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* HUD Header: Game Title, Hearts & Streak Boost */}
      <div className="rounded-lg border theme-border theme-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono theme-text-muted mb-1">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Language Terminal</span>
            <span aria-hidden="true">·</span>
            <span>Edexcel French (4FR1)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold theme-text-primary tracking-tight">
            LinguaTerminal Arena
          </h1>
          <p className="text-xs theme-text-secondary mt-0.5">
            Vocabulary acquisition with heart limits, multipliers, and matching blitzes
          </p>
        </div>

        {/* HUD Counters */}
        <div className="flex items-center gap-3">
          {/* Heart / Life Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border theme-border theme-subtle">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((h) => (
                <Heart
                  key={h}
                  className={`w-3.5 h-3.5 transition-all ${
                    h <= hearts
                      ? 'theme-accent-text fill-current'
                      : 'opacity-30'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-semibold theme-text-primary tabular-nums">
              {hearts}/5
            </span>
            {hearts < 5 && (
              <button
                onClick={refillHearts}
                className="text-[10px] font-mono theme-accent-text hover:underline cursor-pointer font-bold"
                title="Refill all hearts"
              >
                Refill
              </button>
            )}
          </div>

          {/* Streak Boost Multiplier */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border theme-border theme-subtle text-xs font-mono theme-text-primary">
            <Flame className="w-3.5 h-3.5 theme-accent-text" />
            <span className="font-semibold tabular-nums">{streakMultiplier}x Boost</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b theme-border pb-2">
        <button
          onClick={() => setActiveTab('pairs')}
          className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
            activeTab === 'pairs'
              ? 'theme-accent-btn font-bold shadow-xs'
              : 'theme-text-secondary hover:theme-text-primary hover:opacity-100 opacity-80'
          }`}
        >
          Matching Pairs Blitz
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
            activeTab === 'quiz'
              ? 'theme-accent-btn font-bold shadow-xs'
              : 'theme-text-secondary hover:theme-text-primary hover:opacity-100 opacity-80'
          }`}
        >
          Multiple Choice Flash
        </button>
      </div>

      {/* Mode 1: Matching Pairs Grid */}
      {activeTab === 'pairs' && (
        <div className="space-y-5">
          {hearts <= 0 ? (
            <div className="rounded-lg border theme-border theme-card p-8 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-full border theme-border theme-subtle flex items-center justify-center mx-auto theme-accent-text">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold theme-text-primary">
                  Hearts Depleted
                </h3>
                <p className="text-xs theme-text-secondary mt-0.5">
                  Refill your hearts to continue the vocabulary session.
                </p>
              </div>
              <button
                onClick={refillHearts}
                className="px-4 py-2 rounded theme-accent-btn font-mono text-xs font-medium cursor-pointer shadow-xs"
              >
                Refill 5 Hearts
              </button>
            </div>
          ) : roundCompleted ? (
            <div className="rounded-lg border theme-border theme-card p-8 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-full border theme-border theme-subtle flex items-center justify-center mx-auto theme-accent-text">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold theme-text-primary">
                  Round Cleared
                </h3>
                <p className="text-xs theme-text-secondary mt-0.5">
                  All 6 pairs matched. +100 bonus XP logged to your streak.
                </p>
              </div>
              <button
                onClick={initializeMatchingGame}
                className="px-4 py-2 rounded theme-accent-btn font-mono text-xs font-medium cursor-pointer flex items-center gap-2 mx-auto shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Next Round</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs font-mono theme-text-muted mb-2.5">
                <span>Select a French word and pair it with its English translation</span>
                <span className="font-semibold theme-text-primary">
                  {matchedPairIds.size} / 6 pairs
                </span>
              </div>

              {/* 12-Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gameItems.map((item) => {
                  const isMatched = matchedPairIds.has(item.pairId);
                  const isSelected = selectedItem?.uid === item.uid;
                  const isWrong = wrongPairIds.has(item.uid);

                  return (
                    <button
                      key={item.uid}
                      disabled={isMatched}
                      onClick={() => handleItemClick(item)}
                      className={`h-24 p-3 rounded font-mono text-xs transition-all cursor-pointer border flex flex-col items-center justify-center text-center shadow-xs ${
                        isMatched
                          ? 'theme-subtle opacity-40 cursor-default'
                          : isWrong
                          ? 'border-red-500 text-red-500 line-through'
                          : isSelected
                          ? 'theme-accent-btn font-bold ring-2 ring-offset-2'
                          : 'theme-card theme-border theme-text-primary hover:opacity-85'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider mb-1 opacity-70">
                        {item.lang === 'fr' ? 'Français' : 'English'}
                      </span>
                      <span className="font-semibold text-sm">{item.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-mono theme-text-muted">
                <button
                  onClick={initializeMatchingGame}
                  className="flex items-center gap-1 hover:theme-text-primary cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reshuffle</span>
                </button>
                <span>Mismatches deduct 1 heart</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Multiple Choice Flash Arena */}
      {activeTab === 'quiz' && (
        <div className="max-w-lg mx-auto rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>Question #{quizIndex + 1}</span>
            <span>Category: {currentQuizPair.category}</span>
          </div>

          <div className="text-center py-5 border-y theme-border">
            <span className="text-[10px] font-mono uppercase theme-text-muted tracking-wider">Translate to English</span>
            <h3 className="text-2xl font-bold font-mono theme-text-primary mt-1">
              &quot;{currentQuizPair.french}&quot;
            </h3>
          </div>

          <div className="space-y-2">
            {quizOptions.map((opt, i) => {
              const isSelected = selectedQuizOption === opt;
              const isCorrect = quizAnswerChecked && opt === currentQuizPair.english;
              const isWrong = quizAnswerChecked && isSelected && opt !== currentQuizPair.english;

              return (
                <button
                  key={i}
                  disabled={quizAnswerChecked}
                  onClick={() => handleQuizSubmit(opt)}
                  className={`w-full p-3 rounded font-mono text-xs text-left transition-all cursor-pointer border flex items-center justify-between ${
                    isCorrect
                      ? 'theme-accent-btn font-bold'
                      : isWrong
                      ? 'border-red-500 text-red-500 line-through'
                      : isSelected
                      ? 'theme-accent-btn font-semibold'
                      : 'theme-border theme-subtle theme-text-primary hover:opacity-85'
                  }`}
                >
                  <span>{opt}</span>
                  {isCorrect && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {quizAnswerChecked && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono theme-text-secondary">
                {selectedQuizOption === currentQuizPair.english ? 'Correct (+25 XP)' : 'Incorrect'}
              </span>
              <button
                onClick={handleNextQuiz}
                className="px-4 py-1.5 rounded theme-accent-btn font-mono text-xs font-medium cursor-pointer shadow-xs"
              >
                Next Word →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
