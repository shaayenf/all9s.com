import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PAST_PAPERS_CATALOG } from '../../data/mockData';
import { PastPaper } from '../../types';
import { formatExamTimer } from '../../utils/revisionMath';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  FileText,
  CheckCircle,
  Eye,
  EyeOff,
  Filter,
  PenTool,
  Sparkles,
  Bot,
} from 'lucide-react';

export const ExamSimulatorArena: React.FC = () => {
  const { activeExamPaperId, setActiveExamPaperId, triggerOpencodeWithPrompt, setActiveView } = useApp();

  // Filters for repository
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');

  // Simulator mode
  const [inSimulatorMode, setInSimulatorMode] = useState<boolean>(true);

  // Active paper
  const currentPaper: PastPaper =
    PAST_PAPERS_CATALOG.find((p) => p.id === activeExamPaperId) || PAST_PAPERS_CATALOG[0];

  // Timer state (seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(currentPaper.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Scratchpad state
  const [scratchpadText, setScratchpadText] = useState<string>(
    '# Candidate Rough Working & Calculation Space\nQ1(a): F = ma => a = F/m\nQ1(b): Thinking distance = 0.67s * 20 m/s = 13.4m\nQ2: Check units (convert kJ to J) -> E = 450,000 J'
  );

  // Formula sheet modal state
  const [showFormulaSheet, setShowFormulaSheet] = useState<boolean>(false);

  // Mark scheme toggle state
  const [showMarkScheme, setShowMarkScheme] = useState<boolean>(false);

  // Student answer state
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({
    'q1-a': 'v = u + at = 0 + (2.5 * 8) = 20 m/s',
    'q1-b': 'Resultant force F = 1200 N - 400 N = 800 N. Acceleration = 800 / 1000 = 0.8 m/s²',
  });

  // Timer interval
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, secondsRemaining]);

  const handleSelectPaper = (paper: PastPaper) => {
    setActiveExamPaperId(paper.id);
    setSecondsRemaining(paper.durationMinutes * 60);
    setIsTimerRunning(false);
    setShowMarkScheme(false);
  };

  const handleTimerToggle = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(currentPaper.durationMinutes * 60);
  };

  // Filtered papers
  const filteredPapers = PAST_PAPERS_CATALOG.filter((paper) => {
    if (filterSubject !== 'all' && paper.subjectId !== filterSubject) return false;
    if (filterYear !== 'all' && paper.year.toString() !== filterYear) return false;
    if (filterTier !== 'all' && paper.tier !== filterTier) return false;
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono theme-text-muted mb-1">
            <Timer className="w-3.5 h-3.5" />
            <span>Exam Simulator</span>
            <span aria-hidden="true">·</span>
            <span>Edexcel IGCSE Timed Papers</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold theme-text-primary tracking-tight">
            Exam Arena & Paper Repository
          </h1>
          <p className="text-xs theme-text-secondary mt-0.5">
            Full-exam split-screen workspace with countdown timer, scratchpad, and mark scheme verification
          </p>
        </div>

        {/* View mode toggle + PaperLords Hub link */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView('pastpapers')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border theme-border theme-card text-xs font-mono font-medium theme-text-primary hover:theme-accent-btn transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 opacity-70" />
            <span>PaperLords Archive</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-lg border theme-border theme-subtle">
            <button
              onClick={() => setInSimulatorMode(false)}
              className={`px-3 py-1 text-xs font-mono rounded transition-all cursor-pointer ${
                !inSimulatorMode
                  ? 'theme-accent-btn font-bold shadow-xs'
                  : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              Repository
            </button>
            <button
              onClick={() => setInSimulatorMode(true)}
              className={`px-3 py-1 text-xs font-mono rounded transition-all cursor-pointer ${
                inSimulatorMode
                  ? 'theme-accent-btn font-bold shadow-xs'
                  : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              Active Simulator
            </button>
          </div>
        </div>
      </div>

      {/* Mode A: Filterable Past Paper Repository */}
      {!inSimulatorMode && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-3.5 rounded-lg border theme-border theme-card flex flex-wrap items-center gap-3 text-xs font-mono shadow-xs">
            <div className="flex items-center gap-1.5 theme-text-muted">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Subject filter */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1 rounded border theme-border theme-input theme-text-primary focus:outline-none"
            >
              <option value="all">All Subjects</option>
              <option value="physics">Physics (4PH1)</option>
              <option value="chemistry">Chemistry (4CH1)</option>
              <option value="biology">Biology (4BI1)</option>
              <option value="maths">Mathematics A (4MA1)</option>
            </select>

            {/* Year filter */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-2.5 py-1 rounded border theme-border theme-input theme-text-primary focus:outline-none"
            >
              <option value="all">All Years</option>
              <option value="2025">2025 Series</option>
              <option value="2024">2024 Series</option>
              <option value="2023">2023 Series</option>
            </select>

            {/* Tier filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-2.5 py-1 rounded border theme-border theme-input theme-text-primary focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="Higher">Higher Tier</option>
              <option value="Foundation">Foundation Tier</option>
            </select>

            <span className="ml-auto theme-text-muted">
              {filteredPapers.length} papers
            </span>
          </div>

          {/* Paper Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="rounded-lg border theme-border theme-card p-4 space-y-3.5 hover:border-zinc-400 transition-colors flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono theme-text-muted mb-1.5">
                    <span className="font-bold theme-text-primary">{paper.code}</span>
                    <span>{paper.session} {paper.year}</span>
                  </div>

                  <h3 className="text-sm font-bold theme-text-primary">
                    {paper.subjectName} · {paper.paper}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-[11px] font-mono theme-text-secondary">
                    <span>{paper.tier} Tier</span>
                    <span aria-hidden="true">·</span>
                    <span>{paper.durationMinutes} mins</span>
                    <span aria-hidden="true">·</span>
                    <span>{paper.totalMarks} marks</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t theme-border flex items-center justify-between">
                  <div className="text-xs font-mono">
                    {paper.lastScore ? (
                      <span className="theme-text-primary font-semibold">
                        Score: {paper.lastScore}/{paper.totalMarks} ({Math.round((paper.lastScore / paper.totalMarks) * 100)}%)
                      </span>
                    ) : (
                      <span className="theme-text-muted">{paper.status}</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleSelectPaper(paper);
                      setInSimulatorMode(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded theme-accent-btn font-mono text-xs font-medium cursor-pointer shadow-xs"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Launch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode B: Full Split-Screen Exam Simulator */}
      {inSimulatorMode && (
        <div className="space-y-4">
          {/* Simulator Action HUD Bar */}
          <div className="rounded-lg border theme-border theme-card p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Paper Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border theme-border theme-subtle flex items-center justify-center theme-text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono theme-text-muted">
                  <span className="font-bold">{currentPaper.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentPaper.tier} Tier</span>
                </div>
                <h2 className="text-xs sm:text-sm font-bold theme-text-primary">
                  {currentPaper.subjectName} - {currentPaper.paper} ({currentPaper.session} {currentPaper.year})
                </h2>
              </div>
            </div>

            {/* Countdown Timer Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Timer Display */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded border theme-border theme-subtle font-mono">
                <Timer className="w-3.5 h-3.5 theme-accent-text" />
                <span className="text-sm font-bold tracking-wider tabular-nums theme-text-primary">
                  {formatExamTimer(secondsRemaining)}
                </span>
              </div>

              {/* Play / Pause */}
              <button
                onClick={handleTimerToggle}
                className="px-3 py-1 rounded theme-accent-btn font-mono text-xs font-medium cursor-pointer flex items-center gap-1 shadow-xs"
                title={isTimerRunning ? 'Pause Exam Timer' : 'Start Exam Timer'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>

              {/* Reset */}
              <button
                onClick={handleTimerReset}
                className="p-1.5 rounded border theme-border theme-subtle theme-text-muted hover:theme-text-primary cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Formula Sheet Popup Button */}
              <button
                onClick={() => setShowFormulaSheet(true)}
                className="px-2.5 py-1 rounded border theme-border theme-subtle theme-text-primary text-xs font-mono cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Formulae</span>
              </button>

              {/* Mark Scheme Toggle Button */}
              <button
                onClick={() => setShowMarkScheme((prev) => !prev)}
                className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer flex items-center gap-1 transition-all ${
                  showMarkScheme
                    ? 'theme-accent-btn font-bold shadow-xs'
                    : 'border theme-border theme-subtle theme-text-primary'
                }`}
              >
                {showMarkScheme ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span className="hidden sm:inline">Mark Scheme</span>
              </button>
            </div>
          </div>

          {/* Split-Screen Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Official Question Paper Viewport */}
            <div className="lg:col-span-7 rounded-lg border theme-border theme-card p-5 space-y-5 shadow-xs">
              {/* Question 1 Frame */}
              <div className="space-y-3.5 pb-5 border-b theme-border">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold theme-text-primary">Question 1</span>
                  <span className="theme-text-muted">[5 marks]</span>
                </div>

                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
                  A sports car of mass 1000 kg accelerates uniformly from rest along a horizontal test track.
                  The car reaches a velocity of 20 m/s after a time interval of 8.0 seconds.
                </p>

                {/* Sub-question (a) */}
                <div className="space-y-1.5 pl-3 border-l-2 theme-accent-border">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold theme-text-primary">(a) Calculate the acceleration of the sports car.</span>
                    <span className="theme-text-muted">[2 marks]</span>
                  </div>

                  <input
                    type="text"
                    value={studentAnswers['q1-a'] || ''}
                    onChange={(e) =>
                      setStudentAnswers({ ...studentAnswers, 'q1-a': e.target.value })
                    }
                    placeholder="Candidate response..."
                    className="w-full px-3 py-1.5 rounded border theme-border theme-input text-xs font-mono theme-text-primary focus:outline-none"
                  />
                </div>

                {/* Sub-question (b) */}
                <div className="space-y-1.5 pl-3 border-l-2 theme-accent-border pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold theme-text-primary">
                      (b) The engine produces a forward thrust of 1200 N. Calculate the opposing friction force.
                    </span>
                    <span className="theme-text-muted">[3 marks]</span>
                  </div>

                  <input
                    type="text"
                    value={studentAnswers['q1-b'] || ''}
                    onChange={(e) =>
                      setStudentAnswers({ ...studentAnswers, 'q1-b': e.target.value })
                    }
                    placeholder="Candidate response..."
                    className="w-full px-3 py-1.5 rounded border theme-border theme-input text-xs font-mono theme-text-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Question 2 Frame (Placeholder Shell) */}
              <div className="space-y-2 pb-5 border-b theme-border">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold theme-text-primary">Question 2</span>
                  <span className="theme-text-muted">[6 marks]</span>
                </div>

                <div className="p-3.5 rounded border border-dashed theme-border theme-subtle text-xs font-mono theme-text-muted">
                  [Question Slot 2]: Section 2 Mains Electricity, fuse ratings, and safety earthing.
                </div>
              </div>

              {/* Ask Opencode about this paper */}
              <button
                onClick={() =>
                  triggerOpencodeWithPrompt(
                    `In Edexcel IGCSE ${currentPaper.subjectName} ${currentPaper.paper}, how should a candidate maximize marks on multi-step mechanics questions?`
                  )
                }
                className="w-full py-2 rounded border theme-border theme-subtle theme-text-primary hover:opacity-85 text-xs font-mono transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Bot className="w-3.5 h-3.5 theme-accent-text" />
                <span>Ask Opencode to critique paper</span>
              </button>
            </div>

            {/* Right: Clean Scratchpad Working Area OR Toggleable Mark Scheme */}
            <div className="lg:col-span-5 space-y-3.5">
              {/* Mark Scheme Viewer Overlay/Tab */}
              {showMarkScheme ? (
                <div className="rounded-lg border theme-border theme-subtle p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider theme-text-primary">
                      Examiner Mark Scheme
                    </span>
                    <button
                      onClick={() => setShowMarkScheme(false)}
                      className="text-xs font-mono theme-text-muted hover:theme-text-primary cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>

                  <div className="space-y-3 text-xs font-mono theme-text-primary">
                    <div className="p-2.5 rounded theme-card border theme-border space-y-1">
                      <div className="font-semibold theme-text-primary">Q1(a) Marks:</div>
                      <div className="theme-text-secondary pl-2">
                        <div>• [M1] Substitution into a = (v - u) / t (20 / 8)</div>
                        <div>• [A1] Correct value 2.5 m/s²</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded theme-card border theme-border space-y-1">
                      <div className="font-semibold theme-text-primary">Q1(b) Marks:</div>
                      <div className="theme-text-secondary pl-2">
                        <div>• [M1] Resultant force: F = ma = 1000 × 2.5 = 2500 N</div>
                        <div>• [M1] Force balance: Forward Thrust - Friction = Resultant</div>
                        <div>• [A1] Resistance force with unit (N)</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Scratchpad Area */}
              <div className="rounded-lg border theme-border theme-card p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium uppercase tracking-wider theme-text-muted">
                    <PenTool className="w-3 h-3 theme-accent-text" />
                    <span>Candidate Scratchpad</span>
                  </div>
                  <span className="text-[10px] font-mono theme-text-muted">Auto-saved</span>
                </div>

                <textarea
                  value={scratchpadText}
                  onChange={(e) => setScratchpadText(e.target.value)}
                  rows={13}
                  className="w-full p-2.5 rounded border theme-border theme-input text-xs font-mono theme-text-primary leading-relaxed focus:outline-none resize-none"
                  placeholder="Jot down working out..."
                />

                <div className="flex items-center justify-between text-[11px] font-mono theme-text-muted">
                  <span>Lines: {scratchpadText.split('\n').length}</span>
                  <button
                    onClick={() => setScratchpadText('')}
                    className="hover:theme-text-primary cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formula Sheet Modal Dialog */}
      {showFormulaSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-lg border theme-border theme-card p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b theme-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 theme-accent-text" />
                <h3 className="text-sm font-bold theme-text-primary">
                  Edexcel IGCSE Formula Reference
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaSheet(false)}
                className="text-xs theme-text-muted hover:theme-text-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded border theme-border theme-subtle space-y-1">
                <div className="font-bold theme-text-primary">Kinematics & Motion</div>
                <div className="theme-text-secondary">• v = u + at</div>
                <div className="theme-text-secondary">• s = ½(u + v)t</div>
                <div className="theme-text-secondary">• v² = u² + 2as</div>
                <div className="theme-text-secondary">• a = (v - u) / t</div>
              </div>

              <div className="p-3 rounded border theme-border theme-subtle space-y-1">
                <div className="font-bold theme-text-primary">Forces & Momentum</div>
                <div className="theme-text-secondary">• F = m × a</div>
                <div className="theme-text-secondary">• W = m × g</div>
                <div className="theme-text-secondary">• p = m × v</div>
                <div className="theme-text-secondary">• F = (mv - mu) / t</div>
              </div>

              <div className="p-3 rounded border theme-border theme-subtle space-y-1">
                <div className="font-bold theme-text-primary">Electricity & Power</div>
                <div className="theme-text-secondary">• V = I × R</div>
                <div className="theme-text-secondary">• P = I × V = I² × R</div>
                <div className="theme-text-secondary">• E = I × V × t</div>
                <div className="theme-text-secondary">• Q = I × t</div>
              </div>

              <div className="p-3 rounded border theme-border theme-subtle space-y-1">
                <div className="font-bold theme-text-primary">Waves & Optics</div>
                <div className="theme-text-secondary">• v = f × λ</div>
                <div className="theme-text-secondary">• n = sin(i) / sin(r)</div>
                <div className="theme-text-secondary">• sin(c) = 1 / n</div>
                <div className="theme-text-secondary">• n = c / v</div>
              </div>
            </div>

            <div className="pt-1 text-right">
              <button
                onClick={() => setShowFormulaSheet(false)}
                className="px-4 py-1.5 rounded theme-accent-btn font-mono text-xs font-medium cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
