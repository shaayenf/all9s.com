import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createForkedNote,
  toggleNoteLike,
  extractFlashcardsFromNote,
  SEED_COMMUNITY_NOTES,
} from './notebook';

test('createForkedNote creates an editable private copy attributed to original author', () => {
  const source = SEED_COMMUNITY_NOTES[0];
  const forked = createForkedNote(source, 'user-new-123', 'CandidateAlex', 'Grade 11');

  assert.equal(forked.userId, 'user-new-123');
  assert.equal(forked.authorNickname, 'CandidateAlex');
  assert.equal(forked.authorGrade, 'Grade 11');
  assert.equal(forked.isPublic, false);
  assert.equal(forked.title, `${source.title} (My Copy)`);
  assert.equal(forked.forkSourceAuthor, source.authorNickname);
  assert.equal(forked.content, source.content);
  assert.ok(forked.tags.includes('ForkedCopy'));
});

test('toggleNoteLike adds like on first click and removes on second click', () => {
  const initialLikedSet = new Set<string>();
  const noteId = 'test-note-1';

  // First like
  const like1 = toggleNoteLike(initialLikedSet, noteId, 10);
  assert.equal(like1.isLiked, true);
  assert.equal(like1.newLikesCount, 11);
  assert.ok(like1.updatedLikedSet.has(noteId));

  // Unlike
  const like2 = toggleNoteLike(like1.updatedLikedSet, noteId, 11);
  assert.equal(like2.isLiked, false);
  assert.equal(like2.newLikesCount, 10);
  assert.ok(!like2.updatedLikedSet.has(noteId));
});

test('extractFlashcardsFromNote parses key definitions into study cards', () => {
  const content = `
### Forces & Motion
- **Newton Second Law**: F = m * a where resultant force causes acceleration.
- **Hooke Law**: Force is directly proportional to extension up to elastic limit.
  `;
  const cards = extractFlashcardsFromNote('test-note-2', 'Forces Chapter', content, 'physics');

  assert.ok(cards.length >= 2);
  assert.equal(cards[0].subjectId, 'physics');
  assert.ok(cards[0].front.includes('Newton Second Law'));
  assert.ok(cards[0].back.includes('F = m * a'));
  assert.ok(cards[1].front.includes('Hooke Law'));
});
