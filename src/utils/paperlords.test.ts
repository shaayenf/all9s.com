import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFICIAL_PAPERLORDS_IGCSE_URL,
  getPaperLordsUrl,
  calculatePaperScore,
  filterPaperLordsPapers,
  formatPeerReviewMessage,
} from './paperlords';
import { PaperLordsPaper } from '../types';

const mockTestPaper: PaperLordsPaper = {
  id: 'test-phys-1p',
  subjectId: 'physics',
  subjectCode: '4PH1',
  subjectName: 'Physics',
  year: 2024,
  session: 'June',
  paperCode: '4PH1/1P',
  paperName: 'Paper 1P: Principles of Physics',
  tier: 'Higher',
  durationMinutes: 120,
  totalMarks: 10,
  paperlordsSlug: 'edexcel-igcse-physics-4ph1',
  paperlordsUrl: OFFICIAL_PAPERLORDS_IGCSE_URL,
  gradeBoundaries: {
    grade9: 8,
    grade8: 7,
    grade7: 6,
    grade6: 5,
    grade4: 3,
  },
  keyTopics: ['Newton Laws', 'Ohm Law'],
  examinerWarnings: ['Check units'],
  sampleQuestions: [
    {
      number: 'Q1',
      topic: 'Forces',
      marks: 3,
      questionText: 'Calculate force given mass 2kg and accel 3m/s2',
      markSchemePoints: ['F = ma (1)', '2 * 3 = 6 (1)', 'Unit: N (1)'],
    },
    {
      number: 'Q2',
      topic: 'Electricity',
      marks: 2,
      questionText: 'State Ohm law',
      markSchemePoints: ['Current is directly proportional to voltage (1)', 'At constant temperature (1)'],
    },
  ],
};

test('getPaperLordsUrl always returns official https://www.paperlords.org/igcse', () => {
  assert.equal(getPaperLordsUrl(), 'https://www.paperlords.org/igcse');
  assert.equal(OFFICIAL_PAPERLORDS_IGCSE_URL, 'https://www.paperlords.org/igcse');
});

test('calculatePaperScore awards points and respects per-question caps', () => {
  // Check all points for Q1 (3 pts) and 1 point for Q2 (1 pt) => total 4 pts
  const checked = {
    'test-phys-1p-Q1-0': true,
    'test-phys-1p-Q1-1': true,
    'test-phys-1p-Q1-2': true,
    'test-phys-1p-Q2-0': true,
  };

  const result = calculatePaperScore(mockTestPaper, checked);
  assert.equal(result.earned, 4);
  assert.equal(result.total, 10);
  assert.equal(result.percentage, 40);
  assert.equal(result.isGrade9, false);
  assert.equal(result.grade9Cutoff, 8);
});

test('calculatePaperScore correctly identifies Grade 9 threshold', () => {
  // Check 5 points in a 5 mark test (scaled)
  const checked = {
    'test-phys-1p-Q1-0': true,
    'test-phys-1p-Q1-1': true,
    'test-phys-1p-Q1-2': true,
    'test-phys-1p-Q2-0': true,
    'test-phys-1p-Q2-1': true,
  };

  // If paper totalMarks is 5, 5 >= 8 boundary of 10 marks paper, let's test with custom paper
  const smallPaper: PaperLordsPaper = {
    ...mockTestPaper,
    totalMarks: 5,
    gradeBoundaries: { grade9: 4, grade8: 3, grade7: 2, grade6: 2, grade4: 1 },
  };

  const result = calculatePaperScore(smallPaper, checked);
  assert.equal(result.earned, 5);
  assert.equal(result.isGrade9, true);
  assert.equal(result.percentage, 100);
});

test('filterPaperLordsPapers matches code, subject, tier, and search query', () => {
  const papers = [mockTestPaper];

  // Subject filter
  assert.equal(filterPaperLordsPapers(papers, { subjectId: 'physics' }).length, 1);
  assert.equal(filterPaperLordsPapers(papers, { subjectId: 'chemistry' }).length, 0);

  // Search query
  assert.equal(filterPaperLordsPapers(papers, { searchQuery: 'Newton' }).length, 1);
  assert.equal(filterPaperLordsPapers(papers, { searchQuery: '4PH1' }).length, 1);
  assert.equal(filterPaperLordsPapers(papers, { searchQuery: 'Biology' }).length, 0);

  // Tier filter
  assert.equal(filterPaperLordsPapers(papers, { tier: 'Higher' }).length, 1);
  assert.equal(filterPaperLordsPapers(papers, { tier: 'Foundation' }).length, 0);
});

test('formatPeerReviewMessage structures candidate working notice correctly', () => {
  const msg = formatPeerReviewMessage('Candidate_007', '4PH1/1P', 'Q1', 'Forces', 'Stuck on line 2');
  assert.match(msg, /Candidate_007/);
  assert.match(msg, /4PH1\/1P/);
  assert.match(msg, /Q1/);
  assert.match(msg, /Stuck on line 2/);
});
