import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimerSeconds,
  formatDurationHuman,
  calculatePomodoroXp,
  initPomodoroState,
  startPomodoro,
  pausePomodoro,
  resetPomodoro,
  tickPomodoro,
  changePomodoroMode,
  changePomodoroSubject,
  completeFocusSession,
  DEFAULT_DURATIONS,
} from './pomodoro';

test('formatTimerSeconds formats mm:ss accurately', () => {
  assert.equal(formatTimerSeconds(1500), '25:00');
  assert.equal(formatTimerSeconds(65), '01:05');
  assert.equal(formatTimerSeconds(9), '00:09');
  assert.equal(formatTimerSeconds(0), '00:00');
  assert.equal(formatTimerSeconds(-5), '00:00');
});

test('formatDurationHuman formats hours and minutes', () => {
  assert.equal(formatDurationHuman(1500), '25m');
  assert.equal(formatDurationHuman(3600), '1h');
  assert.equal(formatDurationHuman(4500), '1h 15m');
  assert.equal(formatDurationHuman(0), '0m');
});

test('calculatePomodoroXp scales with session duration', () => {
  assert.equal(calculatePomodoroXp(25 * 60), 50);
  assert.equal(calculatePomodoroXp(15 * 60), 30);
  assert.equal(calculatePomodoroXp(45 * 60), 90);
  assert.equal(calculatePomodoroXp(60), 10); // Minimum 10 XP
});

test('initPomodoroState provides valid defaults', () => {
  const initial = initPomodoroState();
  assert.equal(initial.mode, 'focus');
  assert.equal(initial.durationSeconds, DEFAULT_DURATIONS.focus);
  assert.equal(initial.remainingSeconds, DEFAULT_DURATIONS.focus);
  assert.equal(initial.isRunning, false);
  assert.equal(initial.completedSessions, 0);
  assert.equal(initial.subjectId, 'physics');
  assert.equal(initial.subjectStats.physics, 0);
});

test('start, pause, reset cycle manages remaining time correctly', () => {
  const t0 = 1000000;
  const initial = initPomodoroState();
  const started = startPomodoro(initial, t0);

  assert.equal(started.isRunning, true);
  assert.equal(started.targetEndTime, t0 + 1500 * 1000);

  // 100 seconds later
  const t1 = t0 + 100 * 1000;
  const paused = pausePomodoro(started, t1);
  assert.equal(paused.isRunning, false);
  assert.equal(paused.remainingSeconds, 1400);
  assert.equal(paused.targetEndTime, null);

  const reset = resetPomodoro(paused);
  assert.equal(reset.isRunning, false);
  assert.equal(reset.remainingSeconds, 1500);
});

test('tickPomodoro completes when targetEndTime is reached', () => {
  const t0 = 1000000;
  const initial = initPomodoroState();
  const started = startPomodoro(initial, t0);

  // In progress
  const tick1 = tickPomodoro(started, t0 + 500 * 1000);
  assert.equal(tick1.justCompleted, false);
  assert.equal(tick1.nextState.remainingSeconds, 1000);

  // Completed
  const tickDone = tickPomodoro(started, t0 + 1500 * 1000);
  assert.equal(tickDone.justCompleted, true);
  assert.equal(tickDone.nextState.isRunning, false);
  assert.equal(tickDone.nextState.remainingSeconds, 0);
});

test('completeFocusSession tracks subject focus time and cycles to short break', () => {
  const initial = initPomodoroState({ subjectId: 'biology' });
  const { nextState, record, xpEarned } = completeFocusSession(initial, 25 * 60);

  assert.equal(xpEarned, 50);
  assert.equal(record.subjectId, 'biology');
  assert.equal(record.durationMinutes, 25);
  assert.equal(nextState.completedSessions, 1);
  assert.equal(nextState.subjectStats.biology, 1500);
  assert.equal(nextState.subjectStats.physics, 0);
  assert.equal(nextState.mode, 'short_break');
  assert.equal(nextState.remainingSeconds, DEFAULT_DURATIONS.short_break);
});

test('completeFocusSession triggers long break on 4th session', () => {
  let state = initPomodoroState({ completedSessions: 3, subjectId: 'chemistry' });
  const { nextState } = completeFocusSession(state, 25 * 60);

  assert.equal(nextState.completedSessions, 4);
  assert.equal(nextState.mode, 'long_break');
  assert.equal(nextState.remainingSeconds, DEFAULT_DURATIONS.long_break);
});

test('changePomodoroMode and changePomodoroSubject update state cleanly', () => {
  const state = initPomodoroState();
  const breakState = changePomodoroMode(state, 'short_break');
  assert.equal(breakState.mode, 'short_break');
  assert.equal(breakState.durationSeconds, 300);
  assert.equal(breakState.remainingSeconds, 300);

  const subjectState = changePomodoroSubject(state, 'french');
  assert.equal(subjectState.subjectId, 'french');
});
