export type AppView = 'dashboard' | 'vault' | 'feed' | 'pastpapers' | 'study_rooms' | 'lingua' | 'exam' | 'rewards' | 'settings' | 'profile';

export type SubjectId =
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'human_biology'
  | 'maths'
  | 'further_pure_maths'
  | 'extra_maths'
  | 'english_language'
  | 'english_literature'
  | 'extra_english'
  | 'economics'
  | 'business_studies'
  | 'accounting'
  | 'commerce'
  | 'computer_science'
  | 'history'
  | 'geography'
  | 'art'
  | 'psychology'
  | 'french'
  | 'sinhala'
  | 'music'
  | 'sport'
  | 'ict';

export type OLGradeFilter = 'all' | 'grade_10' | 'grade_11' | 'candidates';

export type ThemePalette = 'monochrome' | 'paper-ink' | 'nordic-slate' | 'high-contrast' | 'warm-terminal';

export type FontSizeOption = 'compact' | 'standard' | 'large';

export interface GuiSettings {
  themeMode: 'dark' | 'light';
  palette: ThemePalette;
  accentColor: string;
  fontSize: FontSizeOption;
}

export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  photoURL?: string;
  olGrade: string; // e.g. "Grade 11", "11A Gateway College", "O/L Candidate"
  level: number;
  xp: number;
  streak: number;
  badgeTitle: string;
  avatarSeed: string;
  primarySubjectId?: SubjectId;
  enrolledSubjectIds?: SubjectId[];
}

export interface SubjectInfo {
  id: SubjectId;
  code: string; // e.g. "4PH1"
  name: string;
  shortName?: string; // e.g. "Phy", "Chem", "Bio"
  teacher?: string; // e.g. "Dinum", "Nipuni"
  room?: string; // e.g. "Phy Lab", "Chem Lab", "11A"
  department?: 'Sciences' | 'Mathematics' | 'Languages' | 'Commerce' | 'Humanities' | 'Creative & Applied';
  iconName: string;
  color: string;
  progressPercent: number;
  lastTopic: string;
  totalModules: number;
  completedModules: number;
}

export interface SpecSubtopic {
  id: string;
  specCode: string; // e.g. "1.12"
  title: string;
  durationMinutes: number;
  completed: boolean;
  notesPlaceholder: string;
  keyEquations?: string[];
  examinerTips?: string[];
  checkpointQuestion?: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface SpecModule {
  id: string;
  title: string;
  sectionNumber: number;
  subtopics: SpecSubtopic[];
}

export interface PaperLordsQuestion {
  number: string;
  topic: string;
  marks: number;
  questionText: string;
  markSchemePoints: string[];
  examinerTip?: string;
}

export interface PaperLordsPaper {
  id: string;
  subjectId: SubjectId;
  subjectCode: string; // e.g. "4PH1"
  subjectName: string;
  year: number;
  session: 'June' | 'January' | 'November' | 'Specimen';
  paperCode: string; // e.g. "4PH1/1P", "4MA1/1H"
  paperName: string; // e.g. "Paper 1P: Forces, Energy & Waves"
  tier: 'Higher' | 'Foundation' | 'Standard';
  durationMinutes: number;
  totalMarks: number;
  isRegional?: boolean;
  paperlordsSlug: string;
  paperlordsUrl: string;
  gradeBoundaries?: {
    grade9: number;
    grade8: number;
    grade7: number;
    grade6: number;
    grade4: number;
  };
  keyTopics: string[];
  examinerWarnings: string[];
  sampleQuestions: PaperLordsQuestion[];
}

export interface PastPaper {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  year: number;
  session: 'June' | 'January' | 'November';
  paper: 'Paper 1' | 'Paper 2' | 'Paper 1F' | 'Paper 1H' | 'Paper 2F' | 'Paper 2H';
  tier: 'Higher' | 'Foundation';
  code: string;
  durationMinutes: number;
  totalMarks: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  lastScore?: number;
}

export interface VocabPair {
  id: string;
  french: string;
  english: string;
  category: string;
}

export interface LeaderboardUser {
  id?: string;
  rank: number;
  name: string; // Nickname
  avatarSeed: string;
  xp: number;
  streak: number;
  level: number;
  olGrade: string;
  league: 'Diamond' | 'Ruby' | 'Emerald' | 'Sapphire';
  badgeTitle: string;
  isCurrentUser?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  currentCount: number;
  targetCount: number;
  completed: boolean;
  claimed: boolean;
  type: 'past_paper' | 'lingua_match' | 'checkpoint_quiz' | 'streak';
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'mastery' | 'streak' | 'exam' | 'speed';
  unlocked: boolean;
  unlockedDate?: string;
  progressPercent: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowups?: string[];
  equationCallout?: string;
}

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export interface PomodoroSessionRecord {
  id: string;
  subjectId: SubjectId;
  durationMinutes: number;
  completedAt: string;
  xpEarned: number;
}

export interface PomodoroState {
  mode: PomodoroMode;
  subjectId: SubjectId;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  targetEndTime: number | null;
  completedSessions: number;
  subjectStats: Record<SubjectId, number>;
  sessionHistory: PomodoroSessionRecord[];
}

export interface StudyRoomInfo {
  roomId: string;
  subjectId: SubjectId;
  name: string;
  topic: string;
  createdBy: string;
  creatorNickname: string;
  activeParticipants: {
    userId: string;
    nickname: string;
    avatarSeed: string;
    level: number;
    currentFocusTopic?: string;
  }[];
  meetLink?: string | null;
  pomodoroRemainingSeconds?: number;
  isPomodoroActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StudyChatMessage {
  id: string;
  roomId: string;
  userId: string;
  nickname: string;
  avatarSeed: string;
  text: string;
  attachmentUrl?: string; // photo / handwritten working snapshot
  createdAt: string;
  likesCount?: number;
}
