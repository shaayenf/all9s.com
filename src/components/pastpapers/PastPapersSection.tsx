import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectId, PaperLordsPaper } from '../../types';
import { PAPERLORDS_PAPERS } from '../../data/paperlordsData';
import {
  OFFICIAL_PAPERLORDS_IGCSE_URL,
  getPaperLordsUrl,
  calculatePaperScore,
  filterPaperLordsPapers,
  formatPeerReviewMessage,
} from '../../utils/paperlords';
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
  Sparkles,
  Camera,
  Upload,
  X,
  ZoomIn,
  Play,
  RotateCw,
  CheckSquare,
  Square,
  Share2,
  Bot,
  HelpCircle,
  Video,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

export const PastPapersSection: React.FC = () => {
  const { setActiveView, addXp, nickname } = useApp();

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // In-App Examination & Working Workspace Modal
  const [activeSolvingPaper, setActiveSolvingPaper] = useState<PaperLordsPaper | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Embedded PaperLords in-app modal viewer
  const [embeddedViewerPaper, setEmbeddedViewerPaper] = useState<PaperLordsPaper | null>(null);

  // Handwritten Working Photos per question (paperId-qNum -> base64 data URL)
  const [workingPhotos, setWorkingPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('all9s_handwritten_photos');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Photo rotations (paperId-qNum -> degrees 0, 90, 180, 270)
  const [photoRotations, setPhotoRotations] = useState<Record<string, number>>({});

  // Typed working notes per question (paperId-qNum -> string)
  const [typedNotes, setTypedNotes] = useState<Record<string, string>>({});

  // Assistance feedback state (paperId-qNum -> simulated feedback)
  const [assistanceFeedback, setAssistanceFeedback] = useState<Record<string, string>>({});
  const [isRequestingFeedback, setIsRequestingFeedback] = useState<boolean>(false);
  const [sharedToRoomNotice, setSharedToRoomNotice] = useState<string | null>(null);

  // Self-marked checkboxes per question mark scheme point: key is `${paperId}-${qNum}-${pointIndex}` -> boolean
  const [checkedPoints, setCheckedPoints] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('all9s_mark_criteria_checked');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Revealed Mark Schemes toggle in in-app solver
  const [revealedMarkSchemes, setRevealedMarkSchemes] = useState<Record<string, boolean>>({});

  // Fullscreen photo modal
  const [zoomedPhotoUrl, setZoomedPhotoUrl] = useState<string | null>(null);

  // File input ref for camera/photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Score input modal state for manual logging
  const [scoringPaperId, setScoringPaperId] = useState<string | null>(null);
  const [inputScore, setInputScore] = useState<string>('');

  const subjectsList: { id: SubjectId | 'all'; label: string; code: string }[] = [
    { id: 'all', label: 'All Subjects', code: 'IGCSE' },
    { id: 'maths', label: 'Mathematics A', code: '4MA1' },
    { id: 'physics', label: 'Physics', code: '4PH1' },
    { id: 'chemistry', label: 'Chemistry', code: '4CH1' },
    { id: 'biology', label: 'Biology', code: '4BI1' },
    { id: 'human_biology', label: 'Human Biology', code: '4HB1' },
    { id: 'further_pure_maths', label: 'Further Pure Maths', code: '4PM1' },
    { id: 'commerce', label: 'Commerce', code: '4CM1' },
    { id: 'business_studies', label: 'Business Studies', code: '4BS1' },
    { id: 'accounting', label: 'Accounting', code: '4AC1' },
    { id: 'economics', label: 'Economics', code: '4EC1' },
    { id: 'computer_science', label: 'Computer Science', code: '4CP0' },
    { id: 'english_literature', label: 'English Literature', code: '4ET1' },
    { id: 'english_language', label: 'English Language A', code: '4EA1' },
    { id: 'history', label: 'History', code: '4HI1' },
    { id: 'geography', label: 'Geography', code: '4GE1' },
    { id: 'french', label: 'French', code: '4FR1' },
    { id: 'ict', label: 'Information & Tech', code: '4IT1' },
  ];

  const yearsList = ['all', '2024', '2023', '2022', '2021', '2020', '2019'];

  const filteredPapers = filterPaperLordsPapers(PAPERLORDS_PAPERS, {
    subjectId: selectedSubject,
    year: selectedYear,
    tier: selectedTier,
    searchQuery: searchQuery,
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
    addXp(150);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, paperId: string, qNum: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        const key = `${paperId}-${qNum}`;
        const updated = { ...workingPhotos, [key]: result };
        setWorkingPhotos(updated);
        try {
          localStorage.setItem('all9s_handwritten_photos', JSON.stringify(updated));
        } catch {
          // ignore quota limits
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotatePhoto = (paperId: string, qNum: string) => {
    const key = `${paperId}-${qNum}`;
    const current = photoRotations[key] || 0;
    const next = (current + 90) % 360;
    setPhotoRotations({ ...photoRotations, [key]: next });
  };

  const handleRemovePhoto = (paperId: string, qNum: string) => {
    const key = `${paperId}-${qNum}`;
    const updated = { ...workingPhotos };
    delete updated[key];
    setWorkingPhotos(updated);
    localStorage.setItem('all9s_handwritten_photos', JSON.stringify(updated));
  };

  const handleToggleMarkCriterion = (paperId: string, qNum: string, pointIndex: number) => {
    const key = `${paperId}-${qNum}-${pointIndex}`;
    const nextVal = !checkedPoints[key];
    const updated = { ...checkedPoints, [key]: nextVal };
    setCheckedPoints(updated);
    localStorage.setItem('all9s_mark_criteria_checked', JSON.stringify(updated));
  };

  const handleRequestAIAssistance = (paper: PaperLordsPaper, questionIndex: number) => {
    const q = paper.sampleQuestions[questionIndex];
    if (!q) return;

    setIsRequestingFeedback(true);
    const key = `${paper.id}-${q.number}`;

    setTimeout(() => {
      let advice = `Examiner Analysis for ${paper.paperCode} ${q.number} (${q.topic}):\n`;
      advice += `• Method Marks: Ensure equations (e.g. ${q.markSchemePoints[0] || 'stated formula'}) are written clearly before substituting numbers.\n`;
      advice += `• Accuracy & Units: Full marks require precise values and standard SI units.\n`;
      if (q.examinerTip) {
        advice += `• Trap Alert: ${q.examinerTip}\n`;
      }
      advice += `• Self-Check: Compare your handwritten steps on the left with the official mark scheme criteria on the right.`;

      setAssistanceFeedback((prev) => ({ ...prev, [key]: advice }));
      setIsRequestingFeedback(false);
    }, 450);
  };

  const handleShareToStudyRoom = (paper: PaperLordsPaper, questionIndex: number) => {
    const q = paper.sampleQuestions[questionIndex];
    if (!q) return;

    const userNote = typedNotes[`${paper.id}-${q.number}`];
    const shareMessage = formatPeerReviewMessage(
      nickname || 'Candidate',
      paper.paperCode,
      q.number,
      q.topic,
      userNote
    );

    // Save to study messages in localStorage for peer discussion
    try {
      const savedMessages = localStorage.getItem('all9s_study_messages');
      const messagesMap = savedMessages ? JSON.parse(savedMessages) : {};
      const targetRoomId = `room-${paper.subjectId}` || 'room-physics';
      const roomMsgs = messagesMap[targetRoomId] || [];

      roomMsgs.push({
        id: `msg-${Date.now()}`,
        roomId: targetRoomId,
        senderId: 'current-user',
        senderName: nickname || 'Candidate',
        senderGrade: 'Grade 11',
        text: shareMessage,
        attachmentUrl: workingPhotos[`${paper.id}-${q.number}`] || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: 0,
      });

      messagesMap[targetRoomId] = roomMsgs;
      localStorage.setItem('all9s_study_messages', JSON.stringify(messagesMap));

      setSharedToRoomNotice(`Shared to ${paper.subjectName} Study Room! Classmates can view your working and discuss in the room chat.`);
      setTimeout(() => setSharedToRoomNotice(null), 4000);
    } catch {
      // ignore
    }
  };

  const handleFinishAndSavePaper = (paper: PaperLordsPaper) => {
    const scoreResult = calculatePaperScore(paper, checkedPoints);
    const updated = {
      ...solvedPapers,
      [paper.id]: {
        solved: true,
        score: scoreResult.earned,
      },
    };
    setSolvedPapers(updated);
    localStorage.setItem('all9s_paperlords_solved', JSON.stringify(updated));
    addXp(150);
    setActiveSolvingPaper(null);
  };

  const totalSolvedCount = Object.values(solvedPapers).filter((p) => p.solved).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn font-mono">
      {/* Top Banner & Header */}
      <div className="rounded-xl border theme-border theme-card p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs theme-text-secondary">
              <span className="px-2 py-0.5 rounded border theme-border theme-subtle font-semibold uppercase tracking-wider">
                Official PaperLords Integration
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-bold theme-text-primary">Direct Edexcel IGCSE Repository</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-500 font-semibold">Zero 404 Guarantee</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight theme-text-primary flex items-center gap-2.5">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
              <span>Past Papers & Marking Assistance</span>
            </h1>

            <p className="text-sm font-sans theme-text-secondary max-w-2xl leading-relaxed">
              Access the complete Edexcel IGCSE past paper archive directly via the official repository at{' '}
              <a
                href={OFFICIAL_PAPERLORDS_IGCSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold text-emerald-400 hover:underline inline-flex items-center gap-0.5"
              >
                paperlords.org/igcse
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
              . Work through full exam papers, upload photos of your handwritten solutions, and self-mark against official criteria.
            </p>
          </div>

          {/* Quick Metrics Strip & Direct Repository Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2.5 rounded-lg border theme-border theme-subtle text-left">
              <div className="text-[10px] uppercase tracking-wider theme-text-secondary">Archive Subjects</div>
              <div className="text-base font-bold theme-text-primary">{subjectsList.length - 1} Subjects</div>
            </div>

            <div className="px-3.5 py-2.5 rounded-lg border theme-border theme-subtle text-left">
              <div className="text-[10px] uppercase tracking-wider theme-text-secondary">Completed Papers</div>
              <div className="text-base font-bold text-emerald-500">{totalSolvedCount} Solved</div>
            </div>

            <a
              href={OFFICIAL_PAPERLORDS_IGCSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold theme-accent-btn cursor-pointer shadow-xs"
              title="Open Official PaperLords IGCSE Repository in clean new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open PaperLords IGCSE (New Tab)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border theme-border theme-card p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Subject Pills (All Timetable Subjects including Mathematics, Physics, Chemistry, Biology, French, ICT, Commerce, English Literature) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-semibold theme-text-secondary shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Subject:</span>
          </span>
          {subjectsList.map((subj) => {
            const count =
              subj.id === 'all'
                ? PAPERLORDS_PAPERS.length
                : PAPERLORDS_PAPERS.filter((p) => p.subjectId === subj.id).length;

            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubject(subj.id)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSubject === subj.id
                    ? 'theme-accent-btn font-bold shadow-xs'
                    : 'border theme-border theme-subtle theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <span>{subj.label}</span>
                <span className="text-[10px] opacity-75">[{subj.code}]</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Row: Search + Year + Tier + Direct Links */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t theme-border">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary opacity-60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (4MA1, 4PH1, 4CM1, 4ET1, 4IT1), topic, or paper name..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border theme-border theme-subtle text-xs theme-text-primary focus:outline-hidden"
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
              <span className="text-[11px] theme-text-secondary">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border theme-border theme-subtle text-xs theme-text-primary bg-transparent cursor-pointer"
              >
                <option value="all">All Series</option>
                {yearsList
                  .filter((y) => y !== 'all')
                  .map((y) => (
                    <option key={y} value={y} className="theme-card">
                      {y} Series
                    </option>
                  ))}
              </select>
            </div>

            {/* Tier selector */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] theme-text-secondary">Tier:</span>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border theme-border theme-subtle text-xs theme-text-primary bg-transparent cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="Higher" className="theme-card">Higher Tier</option>
                <option value="Foundation" className="theme-card">Foundation Tier</option>
                <option value="Standard" className="theme-card">Standard (Single Tier)</option>
              </select>
            </div>

            <a
              href={OFFICIAL_PAPERLORDS_IGCSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border theme-border theme-subtle text-xs font-semibold theme-text-primary hover:theme-accent-btn flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>PaperLords.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Papers Repository List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs theme-text-secondary px-1">
          <span>
            Showing <strong className="theme-text-primary">{filteredPapers.length}</strong> official past papers with direct PaperLords integration
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
            <h3 className="text-base font-semibold theme-text-primary">No Matching Past Papers Found</h3>
            <p className="text-xs font-sans theme-text-secondary max-w-md mx-auto">
              No papers matched your search criteria. You can search directly on the official repository at PaperLords IGCSE.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedSubject('all');
                  setSelectedYear('all');
                  setSelectedTier('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border theme-border theme-subtle hover:theme-accent-btn cursor-pointer"
              >
                Reset Filters
              </button>
              <a
                href={OFFICIAL_PAPERLORDS_IGCSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold theme-accent-btn flex items-center gap-1 cursor-pointer"
              >
                <span>Browse PaperLords IGCSE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
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
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] theme-text-secondary mb-1">
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
                        <h2 className="text-base font-bold theme-text-primary leading-snug">
                          {paper.paperName}
                        </h2>
                      </div>

                      {/* Solved Status Badge */}
                      {isSolved && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{userScore !== undefined ? `${userScore}/${paper.totalMarks}` : 'Solved'}</span>
                        </span>
                      )}
                    </div>

                    {/* Paper Specification Specs: Duration + Marks + Grade 9 threshold */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg border theme-border theme-subtle text-xs text-center">
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
                      <div className="text-[10px] uppercase tracking-wider theme-text-secondary">
                        Key Exam Topics Tested:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {paper.keyTopics.map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] border theme-border theme-subtle theme-text-primary"
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

                  {/* Actions Bar: Direct PaperLords Link & Companion Photo Upload Workspace */}
                  <div className="pt-3 border-t theme-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Direct PaperLords Link: opens official repository in clean new tab */}
                      <a
                        href={getPaperLordsUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold theme-accent-btn shadow-xs cursor-pointer"
                        title="View & Download PDF on PaperLords IGCSE (guaranteed clean link, no 404)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in PaperLords</span>
                      </a>

                      {/* Companion Photo Upload & Marking Modal Button */}
                      <button
                        onClick={() => {
                          setActiveSolvingPaper(paper);
                          setActiveQuestionIndex(0);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border theme-border theme-subtle hover:theme-text-primary cursor-pointer"
                        title="Upload photos of handwritten solutions and self-mark with Edexcel criteria"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Working & Mark</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* In-app iframe fallback viewer option */}
                      <button
                        onClick={() => setEmbeddedViewerPaper(paper)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border theme-border theme-subtle text-xs hover:theme-text-primary opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        title="Open in-app preview viewer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span className="hidden sm:inline text-[11px]">In-App Frame</span>
                      </button>

                      {/* Quick Score Logger */}
                      <button
                        onClick={() => handleToggleSolved(paper.id, paper.totalMarks)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          isSolved
                            ? 'border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10'
                            : 'theme-border theme-subtle hover:theme-text-primary'
                        }`}
                        title="Record your exam score"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSolved ? 'Logged' : 'Quick Log'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================== IN-APP EMBEDDED PAPERLORDS VIEWER MODAL ===================== */}
      {embeddedViewerPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="rounded-xl border theme-border theme-card w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header with Direct Link Out */}
            <div className="p-4 border-b theme-border flex items-center justify-between gap-4 bg-zinc-950/60 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs theme-text-secondary">
                  <span className="font-bold theme-text-primary px-2 py-0.5 rounded border theme-border theme-subtle">
                    {embeddedViewerPaper.paperCode}
                  </span>
                  <span>{embeddedViewerPaper.subjectName}</span>
                  <span>·</span>
                  <span className="text-emerald-400">PaperLords IGCSE Repository</span>
                </div>
                <h3 className="text-sm font-bold theme-text-primary">
                  Official Paper Repository Viewer
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getPaperLordsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg theme-accent-btn text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Open in New Browser Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setEmbeddedViewerPaper(null)}
                  className="p-1.5 rounded-lg border theme-border theme-subtle text-xs theme-text-secondary hover:theme-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Seamless In-App Iframe with Automatic Direct Access Fallback Banner */}
            <div className="p-2.5 bg-zinc-900/40 border-b theme-border text-xs text-zinc-300 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>
                  Browsing <strong>https://www.paperlords.org/igcse</strong>. Search for &quot;<strong>{embeddedViewerPaper.subjectName}</strong>&quot; ({embeddedViewerPaper.subjectCode}).
                </span>
              </div>
              <a
                href={getPaperLordsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>If blocked by browser security, click to open directly</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex-1 w-full bg-zinc-950 relative">
              <iframe
                src={getPaperLordsUrl()}
                title="PaperLords Official IGCSE Repository"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===================== PHOTO UPLOAD & MARKING ASSISTANCE WORKSPACE MODAL ===================== */}
      {activeSolvingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="rounded-xl border theme-border theme-card w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-4 bg-zinc-950/40 shrink-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs theme-text-secondary">
                  <span className="px-2 py-0.5 rounded border theme-border theme-subtle font-bold theme-text-primary">
                    {activeSolvingPaper.paperCode}
                  </span>
                  <span>{activeSolvingPaper.subjectName}</span>
                  <span>·</span>
                  <span>{activeSolvingPaper.year} {activeSolvingPaper.session}</span>
                  <span>·</span>
                  <span>{activeSolvingPaper.tier} Tier</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold theme-text-primary">
                  {activeSolvingPaper.paperName} — Solution Photo Upload & Marking Companion
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct PaperLords Anchor Button: Allows student to view the question paper PDF in new tab while marking in All9s */}
                <a
                  href={getPaperLordsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg theme-accent-btn text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Open PaperLords IGCSE in new tab to read full question paper PDF"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>PaperLords (New Tab)</span>
                </a>

                <button
                  onClick={() => setActiveSolvingPaper(null)}
                  className="p-1.5 rounded-lg border theme-border theme-subtle text-xs theme-text-secondary hover:theme-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exam Specification Instructions Banner */}
            <div className="px-5 py-2.5 border-b theme-border bg-zinc-900/30 text-[11px] theme-text-secondary flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span>⏱ <strong>Time:</strong> {activeSolvingPaper.durationMinutes} mins</span>
                <span>📝 <strong>Total Marks:</strong> {activeSolvingPaper.totalMarks}</span>
                <span>⭐ <strong>Grade 9 Boundary:</strong> {activeSolvingPaper.gradeBoundaries?.grade9} marks</span>
              </div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                <span>Snap or upload handwritten solutions to compare with official mark scheme criteria</span>
              </div>
            </div>

            {/* Shared to Room Success Notification */}
            {sharedToRoomNotice && (
              <div className="px-5 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-xs text-emerald-400 font-sans flex items-center justify-between animate-fadeIn shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sharedToRoomNotice}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveSolvingPaper(null);
                    setActiveView('study_rooms');
                  }}
                  className="underline font-bold hover:text-white cursor-pointer ml-3 shrink-0"
                >
                  Go to Study Room →
                </button>
              </div>
            )}

            {/* Questions Tab Switcher */}
            <div className="flex items-center gap-1.5 px-5 py-2 border-b theme-border overflow-x-auto bg-zinc-950/20 shrink-0">
              <span className="text-[11px] uppercase font-bold theme-text-muted shrink-0 mr-1">Questions:</span>
              {activeSolvingPaper.sampleQuestions.map((q, idx) => {
                const hasPhoto = Boolean(workingPhotos[`${activeSolvingPaper.id}-${q.number}`]);
                const isSelected = activeQuestionIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'theme-accent-btn shadow-xs'
                        : 'border theme-border theme-subtle theme-text-secondary hover:theme-text-primary'
                    }`}
                  >
                    <span>{q.number}</span>
                    <span className="text-[10px] opacity-75">[{q.marks}m]</span>
                    {hasPhoto && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Photo working attached" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Question Main Workspace (Scrollable) */}
            {activeSolvingPaper.sampleQuestions[activeQuestionIndex] && (() => {
              const currentQ = activeSolvingPaper.sampleQuestions[activeQuestionIndex];
              const qKey = `${activeSolvingPaper.id}-${currentQ.number}`;
              const attachedPhoto = workingPhotos[qKey];
              const photoRotation = photoRotations[qKey] || 0;
              const isMarkSchemeRevealed = !!revealedMarkSchemes[qKey];
              const feedback = assistanceFeedback[qKey];

              // Marks earned for this question
              let qEarnedMarks = 0;
              currentQ.markSchemePoints.forEach((_, pIdx) => {
                if (checkedPoints[`${activeSolvingPaper.id}-${currentQ.number}-${pIdx}`]) {
                  qEarnedMarks++;
                }
              });
              const cappedMarks = Math.min(qEarnedMarks, currentQ.marks);

              return (
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* Question Prompt Card */}
                  <div className="rounded-xl border theme-border theme-subtle p-5 space-y-3 bg-zinc-900/40">
                    <div className="flex items-center justify-between border-b theme-border pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm theme-text-primary px-2.5 py-1 rounded theme-accent-btn">
                          Question {currentQ.number}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded border theme-border theme-card font-semibold">
                          {currentQ.topic}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-400">
                        Total: {currentQ.marks} Marks
                      </span>
                    </div>

                    <p className="text-sm font-sans theme-text-primary leading-relaxed whitespace-pre-line">
                      {currentQ.questionText}
                    </p>
                  </div>

                  {/* Split Workspace: Left (Handwritten Solution Photo & Assistance) | Right (Mark Scheme & Marking) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Handwritten Photo Upload & Companion Assistance */}
                    <div className="lg:col-span-6 rounded-xl border theme-border theme-card p-4 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b theme-border">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 theme-accent-text" />
                          <h4 className="text-xs font-bold theme-text-primary uppercase tracking-wider">
                            Handwritten Solution Photo
                          </h4>
                        </div>
                        <span className="text-[10px] theme-text-muted">Camera Snapshot / Upload</span>
                      </div>

                      {/* Photo preview or upload prompt */}
                      {attachedPhoto ? (
                        <div className="space-y-3">
                          <div className="relative rounded-lg border theme-border overflow-hidden bg-black/60 group">
                            <img
                              src={attachedPhoto}
                              alt="Handwritten Working"
                              style={{ transform: `rotate(${photoRotation}deg)` }}
                              className="w-full max-h-72 object-contain mx-auto transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => setZoomedPhotoUrl(attachedPhoto)}
                                className="px-3 py-1.5 rounded-lg theme-accent-btn text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                                <span>Zoom</span>
                              </button>
                              <button
                                onClick={() => handleRotatePhoto(activeSolvingPaper.id, currentQ.number)}
                                className="px-3 py-1.5 rounded-lg border theme-border theme-subtle text-xs font-bold flex items-center gap-1 cursor-pointer"
                                title="Rotate photo 90 degrees"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>Rotate</span>
                              </button>
                              <button
                                onClick={() => handleRemovePhoto(activeSolvingPaper.id, currentQ.number)}
                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <button
                              onClick={() => setZoomedPhotoUrl(attachedPhoto)}
                              className="text-xs theme-accent-text hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>Enlarge Photo to Full View</span>
                            </button>

                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs theme-text-secondary hover:theme-text-primary underline cursor-pointer"
                            >
                              Replace Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed theme-border rounded-xl p-6 text-center space-y-3">
                          <div className="w-10 h-10 rounded-full theme-subtle flex items-center justify-center mx-auto theme-text-primary">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold theme-text-primary">
                              Photograph Your Handwritten Solution
                            </div>
                            <p className="text-[11px] font-sans theme-text-secondary max-w-xs mx-auto mt-1">
                              Solved this question on paper? Take a picture with your camera or upload the photo to check your working step-by-step.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-lg theme-accent-btn text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select / Take Photo</span>
                          </button>
                        </div>
                      )}

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handlePhotoUpload(e, activeSolvingPaper.id, currentQ.number)}
                        className="hidden"
                      />

                      {/* Optional Typed Working / Derivation Text */}
                      <div className="space-y-1.5 pt-2 border-t theme-border">
                        <label className="text-[11px] font-bold theme-text-secondary flex items-center justify-between">
                          <span>Or Type Your Mathematical Working / Notes:</span>
                          <span className="text-[10px] theme-text-muted font-normal">(Optional scratchpad)</span>
                        </label>
                        <textarea
                          value={typedNotes[qKey] || ''}
                          onChange={(e) => setTypedNotes({ ...typedNotes, [qKey]: e.target.value })}
                          placeholder="e.g. State formulas, substitutions, or questions for peer review..."
                          rows={2}
                          className="w-full p-2.5 text-xs rounded-lg border theme-border theme-input theme-text-primary focus:outline-none font-mono"
                        />
                      </div>

                      {/* Peer / AI Marking Assistance Workflow */}
                      <div className="pt-3 border-t theme-border space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold theme-text-primary flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Marking Assistance & Peer Review:</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleRequestAIAssistance(activeSolvingPaper, activeQuestionIndex)}
                            disabled={isRequestingFeedback}
                            className="px-2.5 py-1.5 rounded-lg border theme-border theme-subtle text-xs theme-text-primary hover:theme-accent-btn flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isRequestingFeedback ? 'Analyzing...' : 'AI Examiner Tip'}</span>
                          </button>

                          <button
                            onClick={() => handleShareToStudyRoom(activeSolvingPaper, activeQuestionIndex)}
                            className="px-2.5 py-1.5 rounded-lg border theme-border theme-subtle text-xs theme-text-primary hover:theme-accent-btn flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Share photo to your subject's study room for peer review"
                          >
                            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Ask Study Room</span>
                          </button>
                        </div>

                        {feedback && (
                          <div className="p-3 rounded-lg border theme-border bg-zinc-900/80 text-xs font-sans theme-text-primary leading-relaxed whitespace-pre-line animate-fadeIn">
                            {feedback}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Official Mark Scheme & Self-Marking Checklist */}
                    <div className="lg:col-span-6 rounded-xl border theme-border theme-card p-4 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b theme-border">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold theme-text-primary uppercase tracking-wider">
                            Edexcel Mark Scheme Criteria
                          </h4>
                        </div>

                        <span className="text-xs font-bold text-emerald-400">
                          Awarded: {cappedMarks} / {currentQ.marks}
                        </span>
                      </div>

                      {/* Toggle Button */}
                      <div>
                        <button
                          onClick={() =>
                            setRevealedMarkSchemes({
                              ...revealedMarkSchemes,
                              [qKey]: !isMarkSchemeRevealed,
                            })
                          }
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                            isMarkSchemeRevealed
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                              : 'theme-accent-btn'
                          }`}
                        >
                          {isMarkSchemeRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <span>
                            {isMarkSchemeRevealed
                              ? 'Hide Official Mark Scheme'
                              : 'Reveal Mark Scheme & Check My Working'}
                          </span>
                        </button>
                      </div>

                      {/* Mark Scheme Points with interactive check boxes */}
                      {isMarkSchemeRevealed ? (
                        <div className="space-y-2.5 animate-fadeIn">
                          <div className="text-[11px] font-sans theme-text-secondary">
                            Tick each point that matches your handwritten solution:
                          </div>

                          <div className="space-y-2">
                            {currentQ.markSchemePoints.map((pt, pIdx) => {
                              const pointKey = `${activeSolvingPaper.id}-${currentQ.number}-${pIdx}`;
                              const isChecked = !!checkedPoints[pointKey];

                              return (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() =>
                                    handleToggleMarkCriterion(activeSolvingPaper.id, currentQ.number, pIdx)
                                  }
                                  className={`w-full p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                                    isChecked
                                      ? 'border-emerald-500/40 bg-emerald-500/10 theme-text-primary'
                                      : 'theme-border theme-subtle theme-text-secondary hover:theme-text-primary'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {isChecked ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <Square className="w-4 h-4 text-zinc-500" />
                                    )}
                                  </div>
                                  <span className="text-xs font-sans leading-relaxed flex-1">
                                    {pt}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Examiner Tip */}
                          {currentQ.examinerTip && (
                            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-sans text-amber-300 flex items-start gap-2 mt-3">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                              <div className="leading-relaxed">
                                <strong className="font-mono text-amber-200">Examiner Advice: </strong>
                                {currentQ.examinerTip}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 rounded-lg border theme-border theme-subtle text-center space-y-2">
                          <Eye className="w-6 h-6 mx-auto opacity-40 theme-text-muted" />
                          <div className="text-xs font-bold theme-text-primary">
                            Mark Scheme Hidden For Exam Conditions
                          </div>
                          <p className="text-[11px] font-sans theme-text-secondary max-w-xs mx-auto">
                            Attempt the question first on paper. When ready to assess your solution, click &quot;Reveal Mark Scheme&quot; above.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Persistent Bottom Bar with Live Total Score & Grade 9 Prediction */}
            {(() => {
              const scoreResult = calculatePaperScore(activeSolvingPaper, checkedPoints);
              const { earned, total, percentage, isGrade9, grade9Cutoff } = scoreResult;

              return (
                <div className="p-4 border-t theme-border bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs theme-text-muted">Total Paper Score:</span>
                      <span className="text-base font-bold theme-text-primary">
                        {earned} / {total} ({percentage}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isGrade9 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          ★ Grade 9 Standard (Target Reached)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs theme-subtle theme-text-secondary border theme-border">
                          Grade 9 Target: {grade9Cutoff} marks ({Math.max(0, grade9Cutoff - earned)} more needed)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        if (activeQuestionIndex > 0) {
                          setActiveQuestionIndex(activeQuestionIndex - 1);
                        }
                      }}
                      disabled={activeQuestionIndex === 0}
                      className="px-3 py-1.5 rounded-lg border theme-border theme-subtle text-xs disabled:opacity-30 cursor-pointer"
                    >
                      ← Prev Q
                    </button>

                    <button
                      onClick={() => {
                        if (activeQuestionIndex < activeSolvingPaper.sampleQuestions.length - 1) {
                          setActiveQuestionIndex(activeQuestionIndex + 1);
                        }
                      }}
                      disabled={activeQuestionIndex === activeSolvingPaper.sampleQuestions.length - 1}
                      className="px-3 py-1.5 rounded-lg border theme-border theme-subtle text-xs disabled:opacity-30 cursor-pointer"
                    >
                      Next Q →
                    </button>

                    <button
                      onClick={() => handleFinishAndSavePaper(activeSolvingPaper)}
                      className="px-4 py-1.5 rounded-lg theme-accent-btn font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Finish & Save Record (+150 XP)
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Fullscreen Photo Zoom Modal */}
      {zoomedPhotoUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setZoomedPhotoUrl(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedPhotoUrl}
              alt="Handwritten Solution Fullscreen"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Manual Quick Score Logging Modal */}
      {scoringPaperId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-xl border theme-border theme-card p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold theme-text-primary">Record Your Exam Score</h3>
              </div>
              <button
                onClick={() => setScoringPaperId(null)}
                className="text-xs theme-text-secondary hover:theme-text-primary cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs font-sans theme-text-secondary">
              Enter the marks you scored on this paper to track your Grade 9 progress. Finishing an exam paper awards
              <strong> +150 XP</strong>.
            </p>

            <div className="space-y-1">
              <label className="text-xs theme-text-secondary">Marks Scored:</label>
              <input
                type="number"
                value={inputScore}
                onChange={(e) => setInputScore(e.target.value)}
                placeholder="e.g. 88"
                className="w-full px-3 py-2 rounded-lg border theme-border theme-subtle text-sm theme-text-primary focus:outline-hidden font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setScoringPaperId(null)}
                className="px-3 py-1.5 rounded-lg border theme-border theme-subtle text-xs theme-text-secondary cursor-pointer"
              >
                Skip Score
              </button>
              <button
                onClick={() => handleSaveScore(scoringPaperId)}
                className="px-4 py-1.5 rounded-lg theme-accent-btn text-xs font-bold cursor-pointer"
              >
                Save & Claim +150 XP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
