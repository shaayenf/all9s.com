import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectId, PaperLordsPaper, PaperLordsQuestion } from '../../types';
import { PAPERLORDS_PAPERS } from '../../data/paperlordsData';
import {
  FileText,
  Search,
  ExternalLink,
  Timer,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Eye,
  EyeOff,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const PastPapersSection: React.FC = () => {
  const { setActiveView, setActiveExamPaperId, addXp, activeSubjectId } = useApp();

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected paper for deep inspect modal / drawer
  const [inspectPaper, setInspectPaper] = useState<PaperLordsPaper | null>(null);
  const [revealedMarkSchemes, setRevealedMarkSchemes] = useState<Record<string, boolean>>({});

  // Solved papers tracker (stored in localStorage)
  const [solvedPapers, setSolvedPapers] = useState<Record<string, { solved: boolean; score?: number }>>(() => {
    try {
      const saved = localStorage.getItem('all9s_paperlords_solved');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      'pl-maths-2024-june-1h': { solved: true, score: 94 },
      'pl-phys-2024-june-2p': { solved: true, score: 62 },
    };
  });

  // Score input modal state
  const [scoringPaperId, setScoringPaperId] = useState<string | null>(null);
  const [inputScore, setInputScore] = useState<string>('');

  const subjectsList: { id: SubjectId | 'all'; label: string; code: string }[] = [
    { id: 'all', label: 'All Subjects', code: 'IGCSE' },
    { id: 'physics', label: 'Physics', code: '4PH1' },
    { id: 'chemistry', label: 'Chemistry', code: '4CH1' },
    { id: 'biology', label: 'Biology', code: '4BI1' },
    { id: 'maths', label: 'Mathematics A', code: '4MA1' },
    { id: 'french', label: 'French', code: '4FR1' },
    { id: 'ict', label: 'Information & Tech', code: '4IT1' },
  ];

  const yearsList = ['all', '2024', '2023', '2022', '2021', '2020', '2019'];

  const filteredPapers = PAPERLORDS_PAPERS.filter((paper) => {
    if (selectedSubject !== 'all' && paper.subjectId !== selectedSubject) return false;
    if (selectedYear !== 'all' && paper.year.toString() !== selectedYear) return false;
    if (selectedTier !== 'all' && paper.tier !== selectedTier) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = paper.paperCode.toLowerCase().includes(q);
      const matchName = paper.paperName.toLowerCase().includes(q);
      const matchSubject = paper.subjectName.toLowerCase().includes(q);
      const matchTopic = paper.keyTopics.some((t) => t.toLowerCase().includes(q));
      if (!matchCode && !matchName && !matchSubject && !matchTopic) return false;
    }

    return true;
  });

  const handleToggleSolved = (paperId: string, totalMarks: number) => {
    const isCurrentlySolved = solvedPapers[paperId]?.solved;
    if (isCurrentlySolved) {
      const updated = { ...solvedPapers };
      delete updated[paperId];
      setSolvedPapers(updated);
      localStorage.setItem('all9s_paperlords_solved', JSON.stringify(updated));
    } else {
      setScoringPaperId(paperId);
      setInputScore(Math.round(totalMarks * 0.85).toString());
    }
  };

  const handleSaveScore = (paperId: string) => {
    const numericScore = parseInt(inputScore, 10);
    const updated = {
      ...solvedPapers,
      [paperId]: {
        solved: true,
        score: !isNaN(numericScore) ? numericScore : undefined,
      },
    };
    setSolvedPapers(updated);
    localStorage.setItem('all9s_paperlords_solved', JSON.stringify(updated));
    setScoringPaperId(null);
    setInputScore('');
    addXp(150); // Award XP for finishing a past paper
  };

  const handleLaunchSimulator = (paper: PaperLordsPaper) => {
    // Map to exam paper ID if compatible
    setActiveExamPaperId('pp-phys-2025-1h');
    setActiveView('exam');
  };

  const totalSolvedCount = Object.values(solvedPapers).filter((p) => p.solved).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="rounded-xl border theme-border theme-card p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono theme-text-secondary">
              <span className="px-2 py-0.5 rounded border theme-border theme-subtle font-semibold uppercase tracking-wider">
                Official Exam Archive
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-bold theme-text-primary">PaperLords Integration</span>
              <span aria-hidden="true">·</span>
              <span>Pearson Edexcel IGCSE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight theme-text-primary flex items-center gap-2.5">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
              <span>Past Papers Archive</span>
            </h1>

            <p className="text-sm font-sans theme-text-secondary max-w-2xl leading-relaxed">
              Access the complete Edexcel IGCSE past paper archive powered by PaperLords standards.
              Filter official Question Papers (QP), step-by-step Mark Schemes (MS), Examiner Reports (ER),
              and Grade 9 boundaries across all 6 core subjects.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2.5 rounded-lg border theme-border theme-subtle font-mono text-left">
              <div className="text-[10px] uppercase tracking-wider theme-text-secondary">Papers Available</div>
              <div className="text-base font-bold theme-text-primary">{PAPERLORDS_PAPERS.length} Papers</div>
            </div>

            <div className="px-3.5 py-2.5 rounded-lg border theme-border theme-subtle font-mono text-left">
              <div className="text-[10px] uppercase tracking-wider theme-text-secondary">Solved by You</div>
              <div className="text-base font-bold text-emerald-500">{totalSolvedCount} Solved</div>
            </div>

            <a
              href="https://paperlords.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-mono font-semibold border theme-border theme-card hover:theme-accent-btn transition-colors cursor-pointer"
            >
              <span>PaperLords.org</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border theme-border theme-card p-4 sm:p-5 space-y-4">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-mono font-semibold theme-text-secondary shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Subject:</span>
          </span>
          {subjectsList.map((subj) => (
            <button
              key={subj.id}
              onClick={() => setSelectedSubject(subj.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === subj.id
                  ? 'theme-accent-btn font-bold shadow-xs'
                  : 'border theme-border theme-subtle theme-text-secondary hover:theme-text-primary'
              }`}
            >
              {subj.label} ({subj.code})
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Search + Year + Tier */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t theme-border">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary opacity-60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. 4PH1/1P), topic (Electrolysis, Circle Theorems), or year..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border theme-border theme-subtle text-xs font-mono theme-text-primary focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs theme-text-secondary hover:theme-text-primary cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year selector */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono theme-text-secondary">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border theme-border theme-subtle text-xs font-mono theme-text-primary bg-transparent cursor-pointer"
              >
                <option value="all">All Years</option>
                {yearsList.filter((y) => y !== 'all').map((y) => (
                  <option key={y} value={y} className="theme-card">
                    {y} Series
                  </option>
                ))}
              </select>
            </div>

            {/* Tier selector */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono theme-text-secondary">Tier:</span>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border theme-border theme-subtle text-xs font-mono theme-text-primary bg-transparent cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="Higher" className="theme-card">Higher Tier</option>
                <option value="Foundation" className="theme-card">Foundation Tier</option>
                <option value="Standard" className="theme-card">Standard (Single Tier)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Papers Repository List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono theme-text-secondary px-1">
          <span>
            Showing <strong className="theme-text-primary">{filteredPapers.length}</strong> official past papers
          </span>
          {selectedSubject !== 'all' && (
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedYear('all');
                setSelectedTier('all');
                setSearchQuery('');
              }}
              className="hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {filteredPapers.length === 0 ? (
          <div className="rounded-xl border theme-border theme-card p-12 text-center space-y-3">
            <FileText className="w-8 h-8 mx-auto opacity-40 theme-text-secondary" />
            <h3 className="text-base font-mono font-semibold theme-text-primary">No Matching Past Papers Found</h3>
            <p className="text-xs font-sans theme-text-secondary max-w-md mx-auto">
              No papers matched your search criteria. Try selecting another subject or clearing your search query.
            </p>
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedYear('all');
                setSelectedTier('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold border theme-border theme-subtle hover:theme-accent-btn cursor-pointer"
            >
              View All 6 Subjects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPapers.map((paper) => {
              const isSolved = solvedPapers[paper.id]?.solved;
              const userScore = solvedPapers[paper.id]?.score;

              return (
                <div
                  key={paper.id}
                  className={`rounded-xl border transition-all duration-200 p-5 space-y-4 flex flex-col justify-between ${
                    isSolved
                      ? 'theme-card border-emerald-500/40'
                      : 'theme-card theme-border hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Code + Year + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono theme-text-secondary mb-1">
                          <span className="font-bold theme-text-primary px-2 py-0.5 rounded border theme-border theme-subtle">
                            {paper.paperCode}
                          </span>
                          <span>{paper.subjectName}</span>
                          <span>·</span>
                          <span>{paper.year} {paper.session}</span>
                          {paper.isRegional && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-bold">
                              Regional (R)
                            </span>
                          )}
                        </div>
                        <h2 className="text-base font-mono font-bold theme-text-primary leading-snug">
                          {paper.paperName}
                        </h2>
                      </div>

                      {/* Solved Status Badge */}
                      {isSolved && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{userScore ? `${userScore}/${paper.totalMarks}` : 'Solved'}</span>
                        </span>
                      )}
                    </div>

                    {/* Paper Specification Specs: Duration + Marks + Grade 9 threshold */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg border theme-border theme-subtle text-xs font-mono text-center">
                      <div>
                        <div className="text-[10px] uppercase theme-text-secondary">Duration</div>
                        <div className="font-bold theme-text-primary">{paper.durationMinutes}m</div>
                      </div>
                      <div className="border-x theme-border">
                        <div className="text-[10px] uppercase theme-text-secondary">Marks</div>
                        <div className="font-bold theme-text-primary">{paper.totalMarks} Total</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase theme-text-secondary">Grade 9 Cut</div>
                        <div className="font-bold text-amber-500">
                          {paper.gradeBoundaries ? `${paper.gradeBoundaries.grade9}+` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Key Syllabus Topics Tags */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider theme-text-secondary">
                        Key Exam Topics Tested:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {paper.keyTopics.map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-mono border theme-border theme-subtle theme-text-primary"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Examiner Warning Highlight */}
                    {paper.examinerWarnings && paper.examinerWarnings.length > 0 && (
                      <div className="p-2.5 rounded-lg border theme-border bg-amber-500/5 text-xs font-sans text-amber-500 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                        <span className="text-[11px] leading-relaxed">
                          <strong>Examiner Trap:</strong> {paper.examinerWarnings[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t theme-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInspectPaper(paper)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border theme-border theme-subtle hover:theme-text-primary cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 opacity-70" />
                        <span>Inspect & MS</span>
                      </button>

                      <button
                        onClick={() => handleToggleSolved(paper.id, paper.totalMarks)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                          isSolved
                            ? 'border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10'
                            : 'theme-border theme-subtle hover:theme-text-primary'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSolved ? 'Marked Solved' : 'Log Solved'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={paper.paperlordsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border theme-border theme-subtle hover:theme-text-primary opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        title="Open in PaperLords Archive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleLaunchSimulator(paper)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold theme-accent-btn shadow-xs cursor-pointer"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Exam Sim</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Score Logging Modal */}
      {scoringPaperId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-xl border theme-border theme-card p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-mono font-bold theme-text-primary">Record Your Exam Score</h3>
              </div>
              <button
                onClick={() => setScoringPaperId(null)}
                className="text-xs font-mono theme-text-secondary hover:theme-text-primary cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs font-sans theme-text-secondary">
              Enter the marks you scored on this paper to track your Grade 9 progress. Finishing an exam paper awards
              <strong> +150 XP</strong>.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-mono theme-text-secondary">Marks Scored:</label>
              <input
                type="number"
                value={inputScore}
                onChange={(e) => setInputScore(e.target.value)}
                placeholder="e.g. 88"
                className="w-full px-3 py-2 rounded-lg border theme-border theme-subtle font-mono text-sm theme-text-primary focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setScoringPaperId(null)}
                className="px-3 py-1.5 rounded-lg border theme-border theme-subtle text-xs font-mono theme-text-secondary cursor-pointer"
              >
                Skip Score
              </button>
              <button
                onClick={() => handleSaveScore(scoringPaperId)}
                className="px-4 py-1.5 rounded-lg theme-accent-btn text-xs font-mono font-bold cursor-pointer"
              >
                Save & Claim +150 XP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Paper & Mark Scheme Breakdown Modal */}
      {inspectPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-xl border theme-border theme-card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b theme-border pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono theme-text-secondary mb-1">
                  <span className="font-bold theme-text-primary px-2 py-0.5 rounded border theme-border theme-subtle">
                    {inspectPaper.paperCode}
                  </span>
                  <span>{inspectPaper.subjectName}</span>
                  <span>·</span>
                  <span>{inspectPaper.year} {inspectPaper.session}</span>
                </div>
                <h3 className="text-lg font-mono font-bold theme-text-primary">
                  {inspectPaper.paperName}
                </h3>
              </div>

              <button
                onClick={() => setInspectPaper(null)}
                className="px-2.5 py-1.5 rounded-lg border theme-border theme-subtle text-xs font-mono theme-text-secondary hover:theme-text-primary cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>

            {/* Grade Boundaries Strip */}
            {inspectPaper.gradeBoundaries && (
              <div className="p-3.5 rounded-lg border theme-border theme-subtle space-y-2">
                <div className="text-xs font-mono font-semibold theme-text-primary flex items-center justify-between">
                  <span>Official Grade Boundaries ({inspectPaper.totalMarks} Total Marks)</span>
                  <span className="text-[11px] text-amber-500 font-bold">PaperLords Verified</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center font-mono text-xs">
                  <div className="p-2 rounded border theme-border theme-card">
                    <div className="text-[10px] theme-text-secondary font-bold">Grade 9</div>
                    <div className="text-sm font-bold text-amber-500">{inspectPaper.gradeBoundaries.grade9} marks</div>
                  </div>
                  <div className="p-2 rounded border theme-border theme-card">
                    <div className="text-[10px] theme-text-secondary font-bold">Grade 8</div>
                    <div className="text-sm font-bold theme-text-primary">{inspectPaper.gradeBoundaries.grade8} marks</div>
                  </div>
                  <div className="p-2 rounded border theme-border theme-card">
                    <div className="text-[10px] theme-text-secondary font-bold">Grade 7</div>
                    <div className="text-sm font-bold theme-text-primary">{inspectPaper.gradeBoundaries.grade7} marks</div>
                  </div>
                  <div className="p-2 rounded border theme-border theme-card">
                    <div className="text-[10px] theme-text-secondary font-bold">Grade 6</div>
                    <div className="text-sm font-bold theme-text-secondary">{inspectPaper.gradeBoundaries.grade6} marks</div>
                  </div>
                  <div className="p-2 rounded border theme-border theme-card">
                    <div className="text-[10px] theme-text-secondary font-bold">Grade 4</div>
                    <div className="text-sm font-bold theme-text-secondary">{inspectPaper.gradeBoundaries.grade4} marks</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Questions & Step-by-Step Mark Scheme */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold theme-text-primary flex items-center gap-1.5">
                <FileText className="w-4 h-4 opacity-70" />
                <span>Selected Questions & Official Mark Scheme Breakdown:</span>
              </h4>

              {inspectPaper.sampleQuestions.map((q, idx) => {
                const isRevealed = !!revealedMarkSchemes[`${inspectPaper.id}-${q.number}`];

                return (
                  <div key={idx} className="rounded-lg border theme-border theme-subtle p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b theme-border pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs theme-text-primary">{q.number}</span>
                        <span className="text-[11px] font-mono theme-text-secondary px-2 py-0.5 rounded border theme-border theme-card">
                          {q.topic}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold theme-text-primary">[{q.marks} Marks]</span>
                    </div>

                    <p className="text-xs font-sans theme-text-primary leading-relaxed whitespace-pre-line">
                      {q.questionText}
                    </p>

                    {/* Toggle Mark Scheme */}
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          setRevealedMarkSchemes((prev) => ({
                            ...prev,
                            [`${inspectPaper.id}-${q.number}`]: !prev[`${inspectPaper.id}-${q.number}`],
                          }))
                        }
                        className="flex items-center gap-1.5 text-xs font-mono theme-text-secondary hover:theme-text-primary cursor-pointer"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isRevealed ? 'Hide Official Mark Scheme' : 'Reveal Mark Scheme & Guidance'}</span>
                      </button>

                      {isRevealed && (
                        <div className="mt-2.5 p-3 rounded-lg border theme-border theme-card space-y-2 animate-fadeIn">
                          <div className="text-[11px] font-mono font-bold text-emerald-500 uppercase">
                            Official Edexcel Mark Scheme Criteria:
                          </div>
                          <ul className="space-y-1 text-xs font-sans theme-text-primary">
                            {q.markSchemePoints.map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2">
                                <span className="text-emerald-500 font-mono font-bold">✓</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>

                          {q.examinerTip && (
                            <div className="pt-2 border-t theme-border text-[11px] font-sans text-amber-500 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{q.examinerTip}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t theme-border">
              <a
                href={inspectPaper.paperlordsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold border theme-border theme-subtle hover:theme-accent-btn cursor-pointer"
              >
                <span>Download Full PDF on PaperLords</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  setInspectPaper(null);
                  handleLaunchSimulator(inspectPaper);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold theme-accent-btn shadow-xs cursor-pointer"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Open in Split-Screen Exam Arena</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
