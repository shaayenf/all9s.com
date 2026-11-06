import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FLASHCARDS,
  getNextCardIndex,
  getPrevCardIndex,
  calculateMasteryPercent,
  filterCardsBySubject,
  shuffleCards,
  MasteryRating,
} from './flashcards';

test('DEFAULT_FLASHCARDS contains cards across all 6 subjects', () => {
  assert.ok(DEFAULT_FLASHCARDS.length >= 18);
  const subjects = new Set(DEFAULT_FLASHCARDS.map((c) => c.subjectId));
  assert.equal(subjects.has('physics'), true);
  assert.equal(subjects.has('chemistry'), true);
  assert.equal(subjects.has('biology'), true);
  assert.equal(subjects.has('maths'), true);
  assert.equal(subjects.has('french'), true);
  assert.equal(subjects.has('ict'), true);
});

test('getNextCardIndex wraps around deck bounds correctly', () => {
  assert.equal(getNextCardIndex(0, 5), 1);
  assert.equal(getNextCardIndex(4, 5), 0); // Wrap to start
  assert.equal(getNextCardIndex(0, 1), 0);
  assert.equal(getNextCardIndex(0, 0), 0);
});

test('getPrevCardIndex wraps backwards to deck end', () => {
  assert.equal(getPrevCardIndex(2, 5), 1);
  assert.equal(getPrevCardIndex(0, 5), 4); // Wrap to end
  assert.equal(getPrevCardIndex(0, 1), 0);
});

test('filterCardsBySubject filters cards correctly', () => {
  const physicsCards = filterCardsBySubject(DEFAULT_FLASHCARDS, 'physics');
  assert.ok(physicsCards.length >= 4);
  assert.ok(physicsCards.every((c) => c.subjectId === 'physics'));

  const allCards = filterCardsBySubject(DEFAULT_FLASHCARDS, 'all');
  assert.equal(allCards.length, DEFAULT_FLASHCARDS.length);
});

test('calculateMasteryPercent accurately computes mastery ratio', () => {
  const cards = DEFAULT_FLASHCARDS.slice(0, 4);
  const ratings: Record<string, MasteryRating> = {
    [cards[0].id]: 4, // Mastered
    [cards[1].id]: 3, // Good (counted as mastered >= 3)
    [cards[2].id]: 2, // Hard
    [cards[3].id]: 1, // Again
  };

  const result = calculateMasteryPercent(cards, ratings);
  assert.equal(result.total, 4);
  assert.equal(result.masteredCount, 2);
  assert.equal(result.percent, 50);
});

test('shuffleCards retains all elements while creating a copy', () => {
  const original = DEFAULT_FLASHCARDS.slice(0, 10);
  const shuffled = shuffleCards(original);
  assert.equal(shuffled.length, original.length);
  const originalIds = original.map((c) => c.id).sort();
  const shuffledIds = shuffled.map((c) => c.id).sort();
  assert.deepEqual(shuffledIds, originalIds);
});
