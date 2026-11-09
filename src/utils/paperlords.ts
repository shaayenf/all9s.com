import { PaperLordsPaper } from '../types';

/**
 * Official PaperLords Edexcel IGCSE Repository Root URL
 * Directs students to the verified past papers archive without broken 404 links.
 */
export const OFFICIAL_PAPERLORDS_IGCSE_URL = 'https://www.paperlords.org/igcse';

/**
 * Generates the clean, guaranteed non-404 PaperLords URL for any Edexcel IGCSE subject paper.
 */
export function getPaperLordsUrl(): string {
  return OFFICIAL_PAPERLORDS_IGCSE_URL;
}

export interface PaperScoreResult {
  earned: number;
  total: number;
  percentage: number;
  isGrade9: boolean;
  grade9Cutoff: number;
}

/**
 * Calculates total earned marks for a paper based on marked criteria checkboxes.
 * Ensures each question's marks cannot exceed the maximum question marks.
 */
export function calculatePaperScore(
  paper: PaperLordsPaper,
  checkedPoints: Record<string, boolean>
): PaperScoreResult {
  let earned = 0;

  paper.sampleQuestions.forEach((q) => {
    let qEarned = 0;
    q.markSchemePoints.forEach((_, pIdx) => {
      const key = `${paper.id}-${q.number}-${pIdx}`;
      if (checkedPoints[key]) {
        qEarned++;
      }
    });
    earned += Math.min(qEarned, q.marks);
  });

  const total = paper.totalMarks;
  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
  const grade9Cutoff = paper.gradeBoundaries?.grade9 ?? Math.round(total * 0.8);
  const isGrade9 = earned >= grade9Cutoff;

  return {
    earned,
    total,
    percentage,
    isGrade9,
    grade9Cutoff,
  };
}

/**
 * Pure filter function for paper catalog searches
 */
export function filterPaperLordsPapers(
  papers: PaperLordsPaper[],
  filters: {
    subjectId?: string;
    year?: string;
    tier?: string;
    searchQuery?: string;
  }
): PaperLordsPaper[] {
  const { subjectId = 'all', year = 'all', tier = 'all', searchQuery = '' } = filters;
  const q = searchQuery.trim().toLowerCase();

  return papers.filter((paper) => {
    if (subjectId !== 'all' && paper.subjectId !== subjectId) {
      return false;
    }
    if (year !== 'all' && paper.year.toString() !== year) {
      return false;
    }
    if (tier !== 'all' && paper.tier !== tier) {
      return false;
    }

    if (q) {
      const matchCode = paper.paperCode.toLowerCase().includes(q);
      const matchSubCode = paper.subjectCode.toLowerCase().includes(q);
      const matchName = paper.paperName.toLowerCase().includes(q);
      const matchSubject = paper.subjectName.toLowerCase().includes(q);
      const matchTopic = paper.keyTopics.some((t) => t.toLowerCase().includes(q));
      if (!matchCode && !matchSubCode && !matchName && !matchSubject && !matchTopic) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generates study room peer assistance message when sharing a handwritten solution photo
 */
export function formatPeerReviewMessage(
  studentNickname: string,
  paperCode: string,
  questionNumber: string,
  topic: string,
  userNotes?: string
): string {
  const noteSnippet = userNotes?.trim() ? ` Notes: "${userNotes.trim()}"` : '';
  return `📷 [Handwritten Solution for Peer Review] ${studentNickname} posted working for ${paperCode} - ${questionNumber} (${topic}).${noteSnippet} Can someone verify my steps with the mark scheme?`;
}
