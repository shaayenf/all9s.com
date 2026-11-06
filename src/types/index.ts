export type AppView = 'dashboard' | 'vault' | 'lingua' | 'exam' | 'rewards' | 'settings' | 'profile';

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'maths' | 'french' | 'ict';

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
  olGrade: string; // e.g. "Grade 10", "Grade 11", "O/L Candidate"
  level: number;
  xp: number;
  streak: number;
  badgeTitle: string;
  avatarSeed: string;
}

export interface SubjectInfo {
  id: SubjectId;
  code: string; // e.g. "4PH1"
  name: string;
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

