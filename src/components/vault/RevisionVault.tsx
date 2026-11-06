import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS, SUBJECT_SPECIFICATIONS } from '../../data/mockData';
import { SubjectId, SpecSubtopic } from '../../types';
import { FlashcardDeck } from '../flashcards/FlashcardDeck';
import { RevisionNotebookHub } from '../notebook/RevisionNotebookHub';
import { Flashcard } from '../../utils/flashcards';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Bot,
  Lightbulb,
  Check,
  RotateCcw,
  Layers,
  FileText,
  Share2,
} from 'lucide-react';

export const RevisionVault: React.FC = () => {
  const {
    activeSubjectId,
    setActiveSubjectId,
    triggerOpencodeWithPrompt,
    completedCheckpoints,
    toggleCheckpointCompleted,
    addXp,
  } = useApp();

  const currentSubject = SUBJECTS.find((s) => s.id === activeSubjectId) || SUBJECTS[0];
  const modules = SUBJECT_SPECIFICATIONS[activeSubjectId] || SUBJECT_SPECIFICATIONS['physics'] || [];

  // Collapsible module states
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'phys-mod-1': true,
    'chem-mod-1': true,
  });

  // Selected subtopic
  const defaultSubtopic = modules[0]?.subtopics[0] || null;
  const [selectedSubtopic, setSelectedSubtopic] = useState<SpecSubtopic | null>(defaultSubtopic);

  // Checkpoint Quiz interactive states
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

  // Vault mode tab: 'spec' | 'flashcards' | 'notebook'
  const [vaultTab, setVaultTab] = useState<'spec' | 'flashcards' | 'notebook'>('spec');
  const [customFlashcards, setCustomFlashcards] = useState<Flashcard[] | undefined>(undefined);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSelectSubtopic = (subtopic: SpecSubtopic) => {
    setSelectedSubtopic(subtopic);
    setSelectedQuizOption(null);
    setIsAnswerRevealed(false);
  };

  const handleCheckpointSubmit = () => {
    if (selectedQuizOption === null) return;
    setIsAnswerRevealed(true);
    if (selectedSubtopic?.checkpointQuestion) {
      const isCorrect = selectedQuizOption === selectedSubtopic.checkpointQuestion.correctIndex;
      if (isCorrect) {
        addXp(30);
      }
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header & Subject Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono theme-text-muted mb-1">
            <span>Revision Vault</span>
            <span aria-hidden="true">·</span>
            <span>Edexcel IGCSE Specification Tree</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold theme-text-primary tracking-tight">
            Specification Revision Vault
          </h1>
          <p className="text-xs theme-text-secondary mt-0.5">
            Structured syllabus navigation, core equations, examiner notes, and checkpoint quizzes
          </p>
        </div>

        {/* Subject switcher tabs - NO horizontal scroll, wraps gracefully */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg border theme-border theme-subtle">
          {SUBJECTS.map((sub) => {
            const isActive = sub.id === activeSubjectId;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveSubjectId(sub.id);
                  const newMods = SUBJECT_SPECIFICATIONS[sub.id] || SUBJECT_SPECIFICATIONS['physics'] || [];
                  setSelectedSubtopic(newMods[0]?.subtopics[0] || null);
                  setSelectedQuizOption(null);
                  setIsAnswerRevealed(false);
                }}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'theme-accent-btn font-bold shadow-xs'
                    : 'theme-text-secondary hover:theme-text-primary hover:opacity-100 opacity-80'
                }`}
              >
                {sub.name} ({sub.code})
              </button>
            );
          })}
        </div>
      </div>

      {/* Vault Mode Tabs: Spec Vault | Interactive Flashcards | Gemini Notebook & Social Feed */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border theme-border theme-subtle">
        <button
          onClick={() => setVaultTab('spec')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            vaultTab === 'spec'
              ? 'theme-accent-btn font-bold shadow-xs'
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Specification Vault</span>
        </button>

        <button
          onClick={() => {
            setCustomFlashcards(undefined);
            setVaultTab('flashcards');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            vaultTab === 'flashcards'
              ? 'theme-accent-btn font-bold shadow-xs'
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Interactive Flashcards (Keyboard Navigation)</span>
        </button>

        <button
          onClick={() => setVaultTab('notebook')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            vaultTab === 'notebook'
              ? 'theme-accent-btn font-bold shadow-xs'
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Gemini Notebook & Student Feed (Share, Like & Fork)</span>
        </button>
      </div>

      {/* Conditional Views based on active tab */}
      {vaultTab === 'flashcards' ? (
        <FlashcardDeck
          customCards={customFlashcards}
          initialSubjectId={customFlashcards && customFlashcards[0] ? customFlashcards[0].subject : activeSubjectId}
        />
      ) : vaultTab === 'notebook' ? (
        <RevisionNotebookHub
          onStudyFlashcards={(cards) => {
            setCustomFlashcards(cards);
            setVaultTab('flashcards');
          }}
        />
      ) : (
        /* Main Vault 2-Column Split: Spec Tree Sidebar + Note & Quiz Viewer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Collapsible Specification Navigation Tree */}
          <div className="lg:col-span-4 rounded-lg border theme-border theme-card p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b theme-border">
            <span className="text-xs font-mono font-medium uppercase tracking-wider theme-text-muted flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Specification Modules</span>
            </span>
            <span className="text-xs font-mono theme-accent-text font-bold">
              {currentSubject.code}
            </span>
          </div>

          <div className="space-y-2">
            {modules.map((mod) => {
              const isExpanded = !!expandedModules[mod.id];
              return (
                <div
                  key={mod.id}
                  className="rounded border theme-border theme-subtle overflow-hidden"
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono theme-text-muted font-bold">
                        §{mod.sectionNumber}
                      </span>
                      <span className="text-xs font-semibold theme-text-primary">
                        {mod.title}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 theme-text-muted" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 theme-text-muted" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-1.5 pt-0 space-y-0.5">
                      {mod.subtopics.map((sub) => {
                        const isSelected = selectedSubtopic?.id === sub.id;
                        const isCheckpointDone =
                          sub.checkpointQuestion && completedCheckpoints.has(sub.checkpointQuestion.id);

                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSelectSubtopic(sub)}
                            className={`w-full px-2.5 py-1.5 rounded text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'theme-accent-btn font-semibold shadow-xs'
                                : 'theme-text-secondary hover:theme-text-primary hover:opacity-100 opacity-80'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono text-[10px] opacity-75 shrink-0">
                                {sub.specCode}
                              </span>
                              <span className="truncate">{sub.title}</span>
                            </div>

                            {isCheckpointDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full theme-accent-bar shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Revision Note Viewer & Checkpoint Quiz Sandbox */}
        <div className="lg:col-span-8 space-y-5">
          {selectedSubtopic ? (
            <div className="rounded-lg border theme-border theme-card p-6 space-y-5 shadow-xs">
              {/* Note Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b theme-border">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono theme-text-muted">
                    <span>Reference: {selectedSubtopic.specCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedSubtopic.durationMinutes} min revision module</span>
                  </div>
                  <h2 className="text-lg font-bold theme-text-primary mt-0.5">
                    {selectedSubtopic.title}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    triggerOpencodeWithPrompt(
                      `Break down Edexcel IGCSE ${currentSubject.name} topic "${selectedSubtopic.title}" (${selectedSubtopic.specCode}) step-by-step with exam tips.`
                    )
                  }
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium theme-accent-btn transition-opacity cursor-pointer shadow-xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Explain with Opencode</span>
                </button>
              </div>

              {/* Core Equations Deck (if any) */}
              {selectedSubtopic.keyEquations && selectedSubtopic.keyEquations.length > 0 && (
                <div className="rounded-lg border theme-border theme-subtle p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 theme-accent-text" />
                      <span>Key Edexcel Formulae</span>
                    </span>
                    <span className="text-[11px] font-mono theme-text-muted">Paper 1 & 2 Core</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedSubtopic.keyEquations.map((eq, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded border theme-border theme-card text-xs font-mono theme-text-primary"
                      >
                        <span className="font-semibold">{eq}</span>
                        <button
                          onClick={() => triggerOpencodeWithPrompt(`Derive and explain the formula "${eq}" for Edexcel IGCSE`)}
                          className="text-[10px] theme-accent-text hover:underline cursor-pointer font-bold"
                        >
                          Derive
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Diagram Placeholder Frame */}
              <div className="rounded-lg border border-dashed theme-border theme-subtle p-5 flex flex-col items-center justify-center text-center space-y-1.5">
                <FileText className="w-5 h-5 theme-accent-text" />
                <h4 className="text-xs font-bold theme-text-primary">
                  Interactive Diagram & Derivation Sandbox
                </h4>
                <p className="text-[11px] theme-text-secondary max-w-md">
                  [Diagram Component Container]: Renders vector graphs, velocity-time plots, and circuit schematics.
                </p>
              </div>

              {/* Examiner Tips Callout */}
              {selectedSubtopic.examinerTips && selectedSubtopic.examinerTips.length > 0 && (
                <div className="rounded-lg border theme-border theme-subtle p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold theme-text-primary uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 theme-accent-text" />
                    <span>Examiner Insights & Common Traps</span>
                  </div>
                  <ul className="space-y-1 text-xs theme-text-secondary pl-4 list-disc">
                    {selectedSubtopic.examinerTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Note Content Shell */}
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-bold theme-text-primary uppercase font-mono tracking-wide">
                  Structured Specification Notes Layout
                </h3>
                <div className="p-3.5 rounded-lg border theme-border theme-subtle text-xs theme-text-secondary font-mono leading-relaxed">
                  {selectedSubtopic.notesPlaceholder}
                </div>
              </div>

              {/* Interactive Checkpoint Quiz Card */}
              {selectedSubtopic.checkpointQuestion && (
                <div className="rounded-lg border theme-border theme-card p-4 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider theme-text-primary">
                      Topic Checkpoint Self-Assessment
                    </span>

                    <span className="text-xs font-mono theme-accent-text font-bold">
                      +40 XP
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium theme-text-primary">
                    {selectedSubtopic.checkpointQuestion.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-1.5">
                    {selectedSubtopic.checkpointQuestion.options.map((opt, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      const isCorrect =
                        isAnswerRevealed && idx === selectedSubtopic.checkpointQuestion?.correctIndex;
                      const isWrong =
                        isAnswerRevealed &&
                        isSelected &&
                        idx !== selectedSubtopic.checkpointQuestion?.correctIndex;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!isAnswerRevealed) setSelectedQuizOption(idx);
                          }}
                          className={`w-full p-2.5 rounded text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between border ${
                            isCorrect
                              ? 'theme-accent-btn font-bold'
                              : isWrong
                              ? 'border-red-500 text-red-500 line-through'
                              : isSelected
                              ? 'theme-accent-btn font-semibold shadow-xs'
                              : 'theme-border theme-subtle theme-text-primary hover:opacity-80'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit / Reveal actions */}
                  <div className="flex items-center justify-between pt-1">
                    {!isAnswerRevealed ? (
                      <button
                        onClick={handleCheckpointSubmit}
                        disabled={selectedQuizOption === null}
                        className="px-4 py-2 rounded theme-accent-btn disabled:opacity-40 font-mono text-xs font-semibold transition-opacity cursor-pointer shadow-xs"
                      >
                        Submit Checkpoint Answer
                      </button>
                    ) : (
                      <div className="w-full space-y-2.5">
                        <div className="p-3 rounded border theme-border theme-subtle text-xs theme-text-secondary font-mono">
                          {selectedSubtopic.checkpointQuestion.explanation}
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedQuizOption(null);
                              setIsAnswerRevealed(false);
                            }}
                            className="flex items-center gap-1.5 text-xs font-mono theme-text-muted hover:theme-text-primary cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                          </button>

                          <button
                            onClick={() =>
                              toggleCheckpointCompleted(selectedSubtopic.checkpointQuestion!.id)
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                              completedCheckpoints.has(selectedSubtopic.checkpointQuestion!.id)
                                ? 'theme-accent-btn font-bold'
                                : 'border theme-border theme-subtle theme-text-primary hover:opacity-80'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {completedCheckpoints.has(selectedSubtopic.checkpointQuestion!.id)
                                ? 'Mastered'
                                : 'Mark Mastered'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border theme-border theme-card p-12 text-center theme-text-muted text-xs font-mono">
              Select a specification subtopic on the left to inspect revision notes.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};

