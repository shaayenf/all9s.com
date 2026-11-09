export interface PixelBadgeDefinition {
  id: string;
  title: string;
  pixelName: string;
  category: 'streak' | 'paper' | 'mastery' | 'focus' | 'social';
  description: string;
  flavor: string;
  xpReward: number;
  targetValue: number;
  iconType: 'flame' | 'crown' | 'tome' | 'hourglass' | 'bolt' | 'key' | 'beacon' | 'diamond' | 'scroll';
  themeColor: string; // pixel accent hex
  secondaryColor: string;
}

export const PIXEL_BADGES: PixelBadgeDefinition[] = [
  {
    id: 'streak_10',
    title: '10-Day Streak',
    pixelName: 'Chrono Flame',
    category: 'streak',
    description: 'Maintain a consecutive study streak of 10 days',
    flavor: 'Your discipline burns brighter than Bunsen flame on maximum air-hole.',
    xpReward: 250,
    targetValue: 10,
    iconType: 'flame',
    themeColor: '#f97316', // orange
    secondaryColor: '#facc15',
  },
  {
    id: 'perfect_score',
    title: 'Perfect Paper Score',
    pixelName: 'Crown of 100%',
    category: 'paper',
    description: 'Score full marks (or 100% on a past paper mark scheme)',
    flavor: 'Zero examiner deductions. Complete syllabus dominance.',
    xpReward: 350,
    targetValue: 1,
    iconType: 'crown',
    themeColor: '#eab308', // gold
    secondaryColor: '#ffffff',
  },
  {
    id: 'subject_master',
    title: 'Subject Master',
    pixelName: 'Grandmaster Tome',
    category: 'mastery',
    description: 'Complete all specification modules in your primary subject',
    flavor: 'The entire Edexcel specification bends to your will.',
    xpReward: 300,
    targetValue: 6,
    iconType: 'tome',
    themeColor: '#8b5cf6', // purple
    secondaryColor: '#c084fc',
  },
  {
    id: 'pomodoro_centurion',
    title: 'Pomodoro Centurion',
    pixelName: 'Quantum Hourglass',
    category: 'focus',
    description: 'Accumulate over 100 minutes of deep focus study sessions',
    flavor: 'Unbroken concentration tuned to gamma frequency.',
    xpReward: 200,
    targetValue: 100,
    iconType: 'hourglass',
    themeColor: '#06b6d4', // cyan
    secondaryColor: '#67e8f9',
  },
  {
    id: 'speed_solver',
    title: 'Speed Solver',
    pixelName: 'Pixel Lightning',
    category: 'paper',
    description: 'Complete a full timed paper in Exam Arena with marks recorded',
    flavor: 'Fast calculations without sacrificing significant figures.',
    xpReward: 180,
    targetValue: 1,
    iconType: 'bolt',
    themeColor: '#3b82f6', // blue
    secondaryColor: '#93c5fd',
  },
  {
    id: 'vault_pioneer',
    title: 'Syllabus Explorer',
    pixelName: 'Cryptic Key',
    category: 'mastery',
    description: 'Master 4 checkpoint quiz questions across the Revision Vault',
    flavor: 'Unlocking hidden examination mark allocation keys.',
    xpReward: 160,
    targetValue: 4,
    iconType: 'key',
    themeColor: '#10b981', // emerald
    secondaryColor: '#6ee7b7',
  },
  {
    id: 'community_scholar',
    title: 'Community Scholar',
    pixelName: 'Signal Beacon',
    category: 'social',
    description: 'Share a revision note deck or flashcard set to Student Feed',
    flavor: 'Lifting fellow candidates to Grade 9 heights.',
    xpReward: 150,
    targetValue: 1,
    iconType: 'beacon',
    themeColor: '#ec4899', // pink
    secondaryColor: '#f472b6',
  },
  {
    id: 'room_host',
    title: 'Study Room Buddy',
    pixelName: 'Arcade Megaphone',
    category: 'social',
    description: 'Join or host a subject study room with a shared Google Meet',
    flavor: 'Collaborative peer revision multiplies retained memory.',
    xpReward: 180,
    targetValue: 1,
    iconType: 'scroll',
    themeColor: '#14b8a6', // teal
    secondaryColor: '#5eead4',
  },
  {
    id: 'diamond_tier',
    title: 'Diamond Scholar',
    pixelName: 'Pixel Diamond',
    category: 'mastery',
    description: 'Reach Level 2 or higher in the All9s candidate system',
    flavor: 'Refined under extreme pressure: the mark of a Grade 9 candidate.',
    xpReward: 200,
    targetValue: 2,
    iconType: 'diamond',
    themeColor: '#a855f7', // violet
    secondaryColor: '#e9d5ff',
  },
];
