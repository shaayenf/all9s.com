import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelAndProgress,
  calculateStreakMultiplier,
  formatExamTimer,
  checkPairMatch,
  isQuestCompleted,
  getContrastColor,
} from './revisionMath';

test('calculateLevelAndProgress computes correct level and title', () => {
  const result1 = calculateLevelAndProgress(3450);
  assert.equal(result1.level, 4);
  assert.equal(result1.currentLevelXp, 450);
  assert.equal(result1.progressPercent, 45);

  const result2 = calculateLevelAndProgress(14200);
  assert.equal(result2.level, 15);
  assert.equal(result2.title, 'Grade 9 Terminal Master');
});

test('calculateStreakMultiplier scales with streak days', () => {
  assert.equal(calculateStreakMultiplier(1), 1.0);
  assert.equal(calculateStreakMultiplier(3), 1.25);
  assert.equal(calculateStreakMultiplier(7), 1.5);
  assert.equal(calculateStreakMultiplier(14), 2.0);
  assert.equal(calculateStreakMultiplier(35), 2.5);
});

test('formatExamTimer correctly formats hours, minutes, and seconds', () => {
  assert.equal(formatExamTimer(0), '00:00:00');
  assert.equal(formatExamTimer(75), '00:01:15');
  assert.equal(formatExamTimer(3665), '01:01:05');
  assert.equal(formatExamTimer(6300), '01:45:00'); // Standard 1h 45m paper
});

test('checkPairMatch validates language pairing correctly', () => {
  const pairs = [
    { id: '1', french: 'le papillon', english: 'the butterfly' },
    { id: '2', french: 'le château', english: 'the castle' },
  ];

  // Match: same ID, different languages
  assert.equal(
    checkPairMatch({ id: '1', lang: 'fr' }, { id: '1', lang: 'en' }, pairs),
    true
  );

  // Mismatch: different IDs
  assert.equal(
    checkPairMatch({ id: '1', lang: 'fr' }, { id: '2', lang: 'en' }, pairs),
    false
  );

  // Mismatch: same language
  assert.equal(
    checkPairMatch({ id: '1', lang: 'fr' }, { id: '2', lang: 'fr' }, pairs),
    false
  );
});

test('isQuestCompleted evaluates threshold completion', () => {
  assert.equal(isQuestCompleted(2, 2), true);
  assert.equal(isQuestCompleted(3, 2), true);
  assert.equal(isQuestCompleted(1, 2), false);
});

test('getContrastColor returns high-contrast text color based on luminance', () => {
  assert.equal(getContrastColor('#ffffff'), '#000000');
  assert.equal(getContrastColor('#000000'), '#ffffff');
  assert.equal(getContrastColor('#f59e0b'), '#000000'); // Solar Amber -> dark text
  assert.equal(getContrastColor('#3b82f6'), '#ffffff'); // Deep blue -> light text
  assert.equal(getContrastColor('#10b981'), '#ffffff'); // Emerald -> light text
  assert.equal(getContrastColor('#fef08a'), '#000000'); // Light yellow -> dark text
});
