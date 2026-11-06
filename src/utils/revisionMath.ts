/**
 * Pure calculation utilities for All9s gamified Edexcel IGCSE platform.
 */

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
}

export function calculateLevelAndProgress(totalXp: number): LevelInfo {
  const XP_PER_LEVEL = 1000;
  const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
  const currentLevelXp = totalXp % XP_PER_LEVEL;
  const xpNeededForNextLevel = XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / XP_PER_LEVEL) * 100));

  let title = 'Grade 7 Novice';
  if (level >= 20) {
    title = 'Triple 9 Legend';
  } else if (level >= 15) {
    title = 'Grade 9 Terminal Master';
  } else if (level >= 10) {
    title = 'Grade 9 Aspirant';
  } else if (level >= 5) {
    title = 'Grade 8 Prodigy';
  }

  return {
    level,
    title,
    currentLevelXp,
    xpNeededForNextLevel,
    progressPercent,
  };
}

export function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.5;
  if (streakDays >= 14) return 2.0;
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.25;
  return 1.0;
}

export function formatExamTimer(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return '00:00:00';
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export interface PairMatchValidation {
  id: string;
  lang: 'fr' | 'en';
}

export function checkPairMatch(
  item1: PairMatchValidation,
  item2: PairMatchValidation,
  referencePairs: Array<{ id: string; french: string; english: string }>
): boolean {
  if (item1.lang === item2.lang) return false;
  const pair = referencePairs.find((p) => p.id === item1.id);
  if (!pair) return false;
  return item1.id === item2.id;
}

export function isQuestCompleted(currentCount: number, targetCount: number): boolean {
  return currentCount >= targetCount;
}

export function getContrastColor(hexColor: string): '#000000' | '#ffffff' {
  if (!hexColor) return '#ffffff';
  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 145 ? '#000000' : '#ffffff';
    }
  }
  return '#ffffff';
}

export function hexToRgba(hexColor: string, alpha: number): string {
  if (!hexColor) return `rgba(255, 255, 255, ${alpha})`;
  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return `rgba(255, 255, 255, ${alpha})`;
}
