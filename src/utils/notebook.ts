import { SubjectId } from '../types';
import { Flashcard } from './flashcards';

export interface RevisionNote {
  id: string;
  userId: string;
  authorNickname: string;
  authorGrade: string;
  title: string;
  subjectId: SubjectId;
  topic: string;
  content: string; // Markdown / formatted revision notes
  tags: string[];
  isPublic: boolean;
  likesCount: number;
  forkCount: number;
  forkSourceAuthor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteComment {
  id: string;
  noteId: string;
  userId: string;
  authorNickname: string;
  text: string;
  createdAt: string;
}

export const SEED_COMMUNITY_NOTES: RevisionNote[] = [
  {
    id: 'note-comm-1',
    userId: 'user-cand-99',
    authorNickname: 'Sofia_Grade9',
    authorGrade: 'Grade 11',
    title: 'Edexcel Physics Paper 1: Forces, Motion & SUVAT Master Sheet',
    subjectId: 'physics',
    topic: 'Forces & Motion (1.1 - 1.24)',
    content: `### Core Kinematics Formulas
- **v = u + at** (Speed without distance)
- **s = ½(u + v)t** (Average velocity form)
- **v² = u² + 2as** (No time variable)
- **s = ut + ½at²** (Standard displacement)

### Examiner Traps & Common Mark Loss
1. **Thinking vs Braking Distance**: Remember speed affects BOTH. Thinking distance is directly proportional to speed; braking distance is proportional to speed squared!
2. **Terminal Velocity**: Weight = Drag when resultant force is ZERO. Acceleration ceases, velocity stays constant.
3. **Vectors**: Velocity and displacement possess direction. Deceleration must carry a negative sign in equations.`,
    tags: ['Paper1', 'Formulas', 'Grade9Target', 'Forces'],
    isPublic: true,
    likesCount: 38,
    forkCount: 14,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
  },
  {
    id: 'note-comm-2',
    userId: 'user-cand-72',
    authorNickname: 'Tariq_ChemStar',
    authorGrade: 'Grade 10',
    title: 'Electrolysis & Redox Half-Equations Cheat Sheet',
    subjectId: 'chemistry',
    topic: 'Physical Chemistry (1.45 - 1.60)',
    content: `### OIL RIG Rule
- **Oxidation Is Loss** of electrons (occurs at Anode / positive electrode).
- **Reduction Is Gain** of electrons (occurs at Cathode / negative electrode).

### Aqueous Solution Rules at Electrodes
- **At Cathode**: Hydrogen gas (H₂) is discharged UNLESS the metal is less reactive than hydrogen (Cu, Ag, Au).
- **At Anode**: Oxygen gas (O₂) is discharged UNLESS a halide ion (Cl⁻, Br⁻, I⁻) is present at high concentration.

### Half-Equation Examples
- Cathode: **2H⁺ + 2e⁻ → H₂**
- Anode: **4OH⁻ → O₂ + 2H₂O + 4e⁻**`,
    tags: ['Electrolysis', 'Redox', 'HighYield', 'ChemSummary'],
    isPublic: true,
    likesCount: 29,
    forkCount: 9,
    createdAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
  },
  {
    id: 'note-comm-3',
    userId: 'user-cand-15',
    authorNickname: 'Maya_Bio9s',
    authorGrade: 'Grade 11',
    title: 'Osmosis & Water Potential Step-by-Step Mark Scheme Breakdown',
    subjectId: 'biology',
    topic: 'Cell Biology (2.15 - 2.22)',
    content: `### Exact 4-Mark Answer Template for Osmosis Questions
1. State direction of movement: "Water moves into/out of cell by osmosis..."
2. State water potential gradient: "...from a region of higher water potential (dilute solution) to lower water potential (concentrated solution)..."
3. Name membrane: "...across a partially permeable membrane."
4. State cellular consequence:
   - Plant cell: becomes **turgid** (cell wall prevents lysis).
   - Animal cell: may burst (**lysis**) or shrink (**crenation**).`,
    tags: ['Osmosis', 'ExamTechnique', '4Marks', 'BiologyNotes'],
    isPublic: true,
    likesCount: 42,
    forkCount: 21,
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  },
  {
    id: 'note-comm-4',
    userId: 'user-cand-44',
    authorNickname: 'Liam_MathGenius',
    authorGrade: 'Grade 11',
    title: 'Circle Theorems & Geometric Proofs Fast Reference',
    subjectId: 'maths',
    topic: 'Geometry & Trigonometry',
    content: `### Must-Memorize Theorems:
- **Angle at Center**: The angle subtended at the center of a circle is twice the angle subtended at the circumference.
- **Angle in Semicircle**: Angle subtended by a diameter is always 90°.
- **Angles in Same Segment**: Angles in the same segment are equal.
- **Cyclic Quadrilateral**: Opposite angles add up to 180°.
- **Alternate Segment Theorem**: Angle between tangent and chord equals angle in alternate segment.`,
    tags: ['CircleTheorems', 'HigherTier', 'Proofs', 'Maths'],
    isPublic: true,
    likesCount: 51,
    forkCount: 27,
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
];

export const SEED_NOTE_COMMENTS: Record<string, NoteComment[]> = {
  'note-comm-1': [
    {
      id: 'c-1',
      noteId: 'note-comm-1',
      userId: 'user-peer-1',
      authorNickname: 'Marcus_Edexcel',
      text: 'The speed squared detail for braking distance saved me 2 marks in our mock exam today! Thank you!',
      createdAt: '2 hours ago',
    },
    {
      id: 'c-2',
      noteId: 'note-comm-1',
      userId: 'user-peer-2',
      authorNickname: 'Chloe_9s',
      text: 'Forked a copy to add my pendulum experiment notes. Great structure!',
      createdAt: '5 hours ago',
    },
  ],
  'note-comm-3': [
    {
      id: 'c-3',
      noteId: 'note-comm-3',
      userId: 'user-peer-3',
      authorNickname: 'David_Bio',
      text: 'Examiners always look for "partially permeable membrane" specifically. Solid 4-mark template.',
      createdAt: '1 day ago',
    },
  ],
};

/**
 * Forks/clones a note into a student's private notebook
 */
export function createForkedNote(
  sourceNote: RevisionNote,
  currentUserId: string,
  currentNickname: string,
  currentGrade: string
): RevisionNote {
  return {
    id: `note-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: currentUserId,
    authorNickname: currentNickname,
    authorGrade: currentGrade,
    title: `${sourceNote.title} (My Copy)`,
    subjectId: sourceNote.subjectId,
    topic: sourceNote.topic,
    content: sourceNote.content,
    tags: [...sourceNote.tags, 'ForkedCopy'],
    isPublic: false,
    likesCount: 0,
    forkCount: 0,
    forkSourceAuthor: sourceNote.authorNickname,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Toggles a like on a note, updating liked set and likesCount
 */
export function toggleNoteLike(
  likedNoteIds: Set<string>,
  noteId: string,
  currentLikesCount: number
): { isLiked: boolean; newLikesCount: number; updatedLikedSet: Set<string> } {
  const nextSet = new Set(likedNoteIds);
  const wasLiked = nextSet.has(noteId);

  if (wasLiked) {
    nextSet.delete(noteId);
    return {
      isLiked: false,
      newLikesCount: Math.max(0, currentLikesCount - 1),
      updatedLikedSet: nextSet,
    };
  } else {
    nextSet.add(noteId);
    return {
      isLiked: true,
      newLikesCount: currentLikesCount + 1,
      updatedLikedSet: nextSet,
    };
  }
}

/**
 * Extracts Flashcards automatically from note markdown / text lines
 */
export function extractFlashcardsFromNote(
  noteId: string,
  title: string,
  content: string,
  subjectId: SubjectId
): Flashcard[] {
  const cards: Flashcard[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim().replace(/^[-*•]\s*/, '').replace(/^#+\s*/, '');
    if (!trimmed) return;

    // Pattern 1: **Term**: Definition or Term: Definition
    const colonMatch = trimmed.match(/^(\*\*.*?\*\*|[^:]+):\s*(.+)$/);
    if (colonMatch && colonMatch[1] && colonMatch[2]) {
      const term = colonMatch[1].replace(/\*\*/g, '').trim();
      const definition = colonMatch[2].trim();
      if (term.length >= 3 && definition.length >= 6) {
        cards.push({
          id: `fc-gen-${noteId}-${index}`,
          subjectId,
          topic: title.slice(0, 30),
          front: `Define or explain: ${term}`,
          back: definition,
          category: 'definition',
        });
      }
    }
  });

  // Fallback: If no colon format found, break larger sections into cards
  if (cards.length === 0) {
    cards.push({
      id: `fc-gen-${noteId}-summary`,
      subjectId,
      topic: title.slice(0, 30),
      front: `Key Revision Summary: ${title}`,
      back: content.slice(0, 300) + (content.length > 300 ? '...' : ''),
      category: 'examiner_tip',
    });
  }

  return cards;
}
