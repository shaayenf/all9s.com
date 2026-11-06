import { SubjectId } from '../types';

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
  targetEndTime: number | null; // epoch timestamp in ms
  completedSessions: number;
  subjectStats: Record<SubjectId, number>; // total focused seconds per subject
  sessionHistory: PomodoroSessionRecord[];
}

export const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const SUBJECT_METADATA: Record<SubjectId, { name: string; code: string; short: string }> = {
  physics: { name: 'Physics', code: '4PH1', short: 'PHYS' },
  chemistry: { name: 'Chemistry', code: '4CH1', short: 'CHEM' },
  biology: { name: 'Biology', code: '4BI1', short: 'BIOL' },
  maths: { name: 'Mathematics A', code: '4MA1', short: 'MATH' },
  french: { name: 'French', code: '4FR1', short: 'FREN' },
  ict: { name: 'ICT', code: '4IT1', short: 'ICT' },
};

export const INITIAL_SUBJECT_STATS: Record<SubjectId, number> = {
  physics: 0,
  chemistry: 0,
  biology: 0,
  maths: 0,
  french: 0,
  ict: 0,
};

/**
 * Formats seconds into MM:SS display
 */
export function formatTimerSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats total seconds into human-readable e.g. "1h 45m" or "25m"
 */
export function formatDurationHuman(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Calculates XP reward for a completed focus study session
 * Base 2 XP per minute, minimum 10 XP, standard 25m = 50 XP
 */
export function calculatePomodoroXp(durationSeconds: number): number {
  const minutes = Math.max(1, Math.floor(durationSeconds / 60));
  return Math.max(10, minutes * 2);
}

/**
 * Initializes a new or restored Pomodoro state
 */
export function initPomodoroState(saved?: Partial<PomodoroState>): PomodoroState {
  const mode = saved?.mode || 'focus';
  const duration = saved?.durationSeconds || DEFAULT_DURATIONS[mode];
  const now = Date.now();

  let remaining = saved?.remainingSeconds !== undefined ? saved.remainingSeconds : duration;
  let isRunning = Boolean(saved?.isRunning);
  let targetEndTime = saved?.targetEndTime || null;

  // If it was running when saved/reloaded, recalculate based on wall clock
  if (isRunning && targetEndTime) {
    const deltaMs = targetEndTime - now;
    if (deltaMs <= 0) {
      remaining = 0;
      isRunning = false;
      targetEndTime = null;
    } else {
      remaining = Math.ceil(deltaMs / 1000);
    }
  }

  return {
    mode,
    subjectId: saved?.subjectId || 'physics',
    durationSeconds: duration,
    remainingSeconds: remaining,
    isRunning,
    targetEndTime,
    completedSessions: saved?.completedSessions || 0,
    subjectStats: {
      ...INITIAL_SUBJECT_STATS,
      ...(saved?.subjectStats || {}),
    },
    sessionHistory: saved?.sessionHistory || [],
  };
}

/**
 * Starts the timer
 */
export function startPomodoro(state: PomodoroState, now = Date.now()): PomodoroState {
  if (state.isRunning) return state;

  const remaining = state.remainingSeconds > 0 ? state.remainingSeconds : state.durationSeconds;
  return {
    ...state,
    isRunning: true,
    remainingSeconds: remaining,
    targetEndTime: now + remaining * 1000,
  };
}

/**
 * Pauses the timer
 */
export function pausePomodoro(state: PomodoroState, now = Date.now()): PomodoroState {
  if (!state.isRunning) return state;

  let remaining = state.remainingSeconds;
  if (state.targetEndTime) {
    const diff = Math.max(0, Math.ceil((state.targetEndTime - now) / 1000));
    remaining = diff;
  }

  return {
    ...state,
    isRunning: false,
    remainingSeconds: remaining,
    targetEndTime: null,
  };
}

/**
 * Resets the current mode timer
 */
export function resetPomodoro(state: PomodoroState): PomodoroState {
  return {
    ...state,
    isRunning: false,
    remainingSeconds: state.durationSeconds,
    targetEndTime: null,
  };
}

/**
 * Advances timer state according to wall clock delta
 */
export function tickPomodoro(
  state: PomodoroState,
  now = Date.now()
): { nextState: PomodoroState; justCompleted: boolean } {
  if (!state.isRunning || !state.targetEndTime) {
    return { nextState: state, justCompleted: false };
  }

  const deltaSeconds = Math.max(0, Math.ceil((state.targetEndTime - now) / 1000));

  if (deltaSeconds <= 0) {
    return {
      nextState: {
        ...state,
        isRunning: false,
        remainingSeconds: 0,
        targetEndTime: null,
      },
      justCompleted: true,
    };
  }

  return {
    nextState: {
      ...state,
      remainingSeconds: deltaSeconds,
    },
    justCompleted: false,
  };
}

/**
 * Changes timer mode (Focus, Short Break, Long Break) with optional custom seconds
 */
export function changePomodoroMode(
  state: PomodoroState,
  newMode: PomodoroMode,
  customDurationSecs?: number
): PomodoroState {
  const duration = customDurationSecs || DEFAULT_DURATIONS[newMode];
  return {
    ...state,
    mode: newMode,
    durationSeconds: duration,
    remainingSeconds: duration,
    isRunning: false,
    targetEndTime: null,
  };
}

/**
 * Changes active study subject for the timer
 */
export function changePomodoroSubject(state: PomodoroState, subjectId: SubjectId): PomodoroState {
  return {
    ...state,
    subjectId,
  };
}

/**
 * Completes a focus session, updates subject stats, accumulates XP and history
 */
export function completeFocusSession(
  state: PomodoroState,
  actualDurationSeconds?: number
): {
  nextState: PomodoroState;
  record: PomodoroSessionRecord;
  xpEarned: number;
} {
  const secondsSpent = actualDurationSeconds ?? state.durationSeconds;
  const minutesSpent = Math.max(1, Math.round(secondsSpent / 60));
  const xpEarned = calculatePomodoroXp(secondsSpent);

  const record: PomodoroSessionRecord = {
    id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    subjectId: state.subjectId,
    durationMinutes: minutesSpent,
    completedAt: new Date().toISOString(),
    xpEarned,
  };

  const prevSubjectTime = state.subjectStats[state.subjectId] || 0;
  const updatedSubjectStats: Record<SubjectId, number> = {
    ...state.subjectStats,
    [state.subjectId]: prevSubjectTime + secondsSpent,
  };

  // Next recommended mode: short break after normal focus, long break every 4 sessions
  const newCompletedCount = state.completedSessions + 1;
  const nextMode: PomodoroMode = newCompletedCount % 4 === 0 ? 'long_break' : 'short_break';
  const nextDuration = DEFAULT_DURATIONS[nextMode];

  const nextState: PomodoroState = {
    ...state,
    completedSessions: newCompletedCount,
    subjectStats: updatedSubjectStats,
    sessionHistory: [record, ...state.sessionHistory].slice(0, 50),
    mode: nextMode,
    durationSeconds: nextDuration,
    remainingSeconds: nextDuration,
    isRunning: false,
    targetEndTime: null,
  };

  return { nextState, record, xpEarned };
}

/**
 * Plays a soft, non-intrusive harmonic chime using Web Audio API
 */
export function playChimeSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic chord: C5 (523.25Hz) and G5 (783.99Hz)
    const tones = [523.25, 783.99];

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.85);
    });
  } catch {
    // Ignore audio autoplay policy restrictions quietly
  }
}
