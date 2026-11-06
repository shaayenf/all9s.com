import { SubjectId } from '../types';

export type FlashcardCategory = 'definition' | 'formula' | 'examiner_tip' | 'mechanism';

export interface Flashcard {
  id: string;
  subjectId: SubjectId;
  topic: string;
  specCode?: string;
  front: string; // Concept / Term / Question
  back: string; // Definition / Explanation / Mark scheme answer
  category: FlashcardCategory;
  hint?: string;
}

export type MasteryRating = 1 | 2 | 3 | 4; // 1 = Again, 2 = Hard, 3 = Good, 4 = Mastered

export interface DeckProgress {
  ratings: Record<string, MasteryRating>; // cardId -> rating
  currentIndex: number;
}

/**
 * Built-in high-yield Edexcel IGCSE flashcards for all 6 subjects
 */
export const DEFAULT_FLASHCARDS: Flashcard[] = [
  // Physics (4PH1)
  {
    id: 'fc-phys-1',
    subjectId: 'physics',
    topic: 'Forces & Motion',
    specCode: '1.12',
    front: "What is Newton's Second Law of Motion?",
    back: 'Resultant force equals mass multiplied by acceleration: F = m × a. The acceleration of an object is directly proportional to resultant force and inversely proportional to its mass.',
    category: 'definition',
    hint: 'F = m × a',
  },
  {
    id: 'fc-phys-2',
    subjectId: 'physics',
    topic: 'Forces & Motion',
    specCode: '1.20',
    front: 'State the difference between Thinking Distance and Braking Distance.',
    back: 'Thinking Distance is the distance travelled between driver perceiving hazard and applying brakes (affected by speed, tiredness, drugs/alcohol). Braking Distance is distance travelled under braking force until stopped (affected by road condition, tire tread, brakes, mass). Stopping Distance = Thinking + Braking.',
    category: 'definition',
  },
  {
    id: 'fc-phys-3',
    subjectId: 'physics',
    topic: 'Waves & Light',
    specCode: '3.14',
    front: 'Define Total Internal Reflection and state its two conditions.',
    back: 'The complete reflection of light ray back into the more optically dense medium at a boundary. Two conditions: (1) Light must travel from denser to less dense medium. (2) Angle of incidence must exceed critical angle (i > c).',
    category: 'definition',
    hint: 'sin c = 1 / n',
  },
  {
    id: 'fc-phys-4',
    subjectId: 'physics',
    topic: 'Energy & Work',
    specCode: '4.8',
    front: 'State the Principle of Conservation of Energy.',
    back: 'Energy cannot be created or destroyed; it can only be transferred from one store to another. Total energy in a closed system remains constant.',
    category: 'definition',
  },
  {
    id: 'fc-phys-5',
    subjectId: 'physics',
    topic: 'Radioactivity',
    specCode: '7.12',
    front: 'Define Half-Life of a radioactive isotope.',
    back: 'The time taken for half of the unstable nuclei in a sample to decay, OR the time taken for the activity of a radioactive source to halve.',
    category: 'definition',
  },

  // Chemistry (4CH1)
  {
    id: 'fc-chem-1',
    subjectId: 'chemistry',
    topic: 'Principles of Chemistry',
    specCode: '1.38',
    front: 'Define an Isotope in terms of subatomic particles.',
    back: 'Atoms of the same element with the same number of protons (same atomic number) but different numbers of neutrons (different mass number).',
    category: 'definition',
  },
  {
    id: 'fc-chem-2',
    subjectId: 'chemistry',
    topic: 'Chemical Bonding',
    specCode: '1.45',
    front: 'Explain why giant ionic lattices have high melting points.',
    back: 'They contain strong electrostatic forces of attraction between oppositely charged ions extending in all directions throughout the 3D lattice, requiring substantial thermal energy to overcome.',
    category: 'mechanism',
    hint: 'Focus on oppositely charged ions and lattice structure',
  },
  {
    id: 'fc-chem-3',
    subjectId: 'chemistry',
    topic: 'Rates of Reaction',
    specCode: '2.30',
    front: 'Define Activation Energy (Ea) according to collision theory.',
    back: 'The minimum energy colliding particles must possess for a collision to result in a chemical reaction (successful collision).',
    category: 'definition',
  },
  {
    id: 'fc-chem-4',
    subjectId: 'chemistry',
    topic: 'Equilibria',
    specCode: '2.34',
    front: "State Le Chatelier's Principle for dynamic equilibria.",
    back: 'If a dynamic equilibrium is subjected to a change in conditions (temperature, pressure, or concentration), the position of equilibrium shifts to counteract and oppose that change.',
    category: 'definition',
  },
  {
    id: 'fc-chem-5',
    subjectId: 'chemistry',
    topic: 'Acids, Alkalis & Titrations',
    specCode: '2.14',
    front: 'Define a Brønsted-Lowry acid and base.',
    back: 'A Brønsted-Lowry acid is a proton (H⁺ ion) donor. A Brønsted-Lowry base is a proton (H⁺ ion) acceptor.',
    category: 'definition',
  },

  // Biology (4BI1)
  {
    id: 'fc-biol-1',
    subjectId: 'biology',
    topic: 'Cell Biology',
    specCode: '2.17',
    front: 'Define Osmosis with mark-scheme precision.',
    back: 'The net movement of water molecules from a region of higher water potential to a region of lower water potential across a partially permeable membrane.',
    category: 'definition',
    hint: 'Mention water molecules, water potential gradient, and partially permeable membrane',
  },
  {
    id: 'fc-biol-2',
    subjectId: 'biology',
    topic: 'Plant Physiology',
    specCode: '2.54',
    front: 'Define Transpiration and state 3 factors that increase its rate.',
    back: 'The evaporation of water from the surface of spongy mesophyll cells followed by diffusion of water vapour through stomata. Increased by: higher temperature, higher light intensity, higher wind speed, and lower humidity.',
    category: 'definition',
  },
  {
    id: 'fc-biol-3',
    subjectId: 'biology',
    topic: 'Inheritance & Genetics',
    specCode: '3.25',
    front: 'State 3 key differences between Mitosis and Meiosis.',
    back: '(1) Mitosis produces 2 daughter cells; Meiosis produces 4 gametes. (2) Mitosis produces genetically identical diploid cells; Meiosis produces genetically diverse haploid cells. (3) Mitosis involves 1 division; Meiosis involves 2 successive divisions.',
    category: 'mechanism',
  },
  {
    id: 'fc-biol-4',
    subjectId: 'biology',
    topic: 'Ecology',
    specCode: '4.12',
    front: 'Define Trophic Level and explain the 10% energy transfer rule.',
    back: 'A trophic level is the feeding position an organism occupies in a food chain. Only ~10% of biomass/energy is transferred to next level because energy is lost via respiration, excretion, uneaten parts, and movement.',
    category: 'definition',
  },

  // Mathematics A (4MA1)
  {
    id: 'fc-math-1',
    subjectId: 'maths',
    topic: 'Algebra & Equations',
    specCode: '2.8',
    front: 'State the Quadratic Formula for ax² + bx + c = 0.',
    back: 'x = (-b ± √(b² - 4ac)) / (2a). Note: The discriminant b² - 4ac determines root nature (>0: two distinct real roots, =0: one repeated root, <0: no real roots).',
    category: 'formula',
  },
  {
    id: 'fc-math-2',
    subjectId: 'maths',
    topic: 'Trigonometry',
    specCode: '4.15',
    front: 'State the Sine Rule and Cosine Rule for non-right angled triangles.',
    back: 'Sine Rule: a / sin(A) = b / sin(B) = c / sin(C). Cosine Rule: a² = b² + c² - 2bc cos(A). Area of triangle = ½ab sin(C).',
    category: 'formula',
  },
  {
    id: 'fc-math-3',
    subjectId: 'maths',
    topic: 'Probability',
    specCode: '6.4',
    front: 'State the rule for Mutually Exclusive vs Independent Events in Probability.',
    back: 'Mutually Exclusive (cannot happen together): P(A or B) = P(A) + P(B). Independent (occurrence does not affect each other): P(A and B) = P(A) × P(B).',
    category: 'definition',
  },

  // French (4FR1)
  {
    id: 'fc-fren-1',
    subjectId: 'french',
    topic: 'Grammar & Connectives',
    front: 'Translate: "Bien que ce soit..." and state what grammar mood follows.',
    back: '"Although it is..." (or "Even though it is..."). It triggers the SUBJUNCTIVE mood (from verb être: que ce soit, que j\'aie).',
    category: 'definition',
  },
  {
    id: 'fc-fren-2',
    subjectId: 'french',
    topic: 'Opinion Phrases',
    front: 'Provide 3 high-mark alternatives to "Je pense que".',
    back: '(1) "À mon avis..." (In my opinion), (2) "Il me semble que..." (It seems to me that), (3) "Selon moi, il est primordial de..." (According to me, it is essential to).',
    category: 'examiner_tip',
  },
  {
    id: 'fc-fren-3',
    subjectId: 'french',
    topic: 'Environment Vocabulary',
    front: 'Translate: "le réchauffement climatique" and "les gaz à effet de serre".',
    back: '"Le réchauffement climatique" = global warming. "Les gaz à effet de serre" = greenhouse gases.',
    category: 'definition',
  },

  // ICT (4IT1)
  {
    id: 'fc-ict-1',
    subjectId: 'ict',
    topic: 'Cybersecurity',
    specCode: '5.2',
    front: 'Define Phishing versus Pharming.',
    back: 'Phishing: Fraudulent emails or messages tricking victims into revealing credentials or financial details. Pharming: Malicious code installed on system or DNS server redirecting user to a fake website even when typing correct URL.',
    category: 'definition',
  },
  {
    id: 'fc-ict-2',
    subjectId: 'ict',
    topic: 'Hardware & Storage',
    specCode: '2.4',
    front: 'Explain 3 differences between RAM and ROM.',
    back: '(1) RAM is volatile (loses data on power down); ROM is non-volatile. (2) RAM is read-write; ROM is typically read-only. (3) RAM holds active OS programs/data; ROM stores startup firmware (BIOS/bootloader).',
    category: 'definition',
  },
  {
    id: 'fc-ict-3',
    subjectId: 'ict',
    topic: 'Databases',
    specCode: '3.6',
    front: 'Define Primary Key and Foreign Key in relational databases.',
    back: 'Primary Key: A unique identifier field for each record in a table. Foreign Key: A primary key field from another table included to create a relationship between both tables.',
    category: 'definition',
  },
];

/**
 * Navigation helpers
 */
export function getNextCardIndex(currentIndex: number, totalCards: number): number {
  if (totalCards <= 0) return 0;
  return (currentIndex + 1) % totalCards;
}

export function getPrevCardIndex(currentIndex: number, totalCards: number): number {
  if (totalCards <= 0) return 0;
  return (currentIndex - 1 + totalCards) % totalCards;
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleCards<T>(cards: T[]): T[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Calculates deck mastery percentage
 */
export function calculateMasteryPercent(
  cards: Flashcard[],
  ratings: Record<string, MasteryRating>
): { masteredCount: number; total: number; percent: number } {
  if (cards.length === 0) return { masteredCount: 0, total: 0, percent: 0 };

  const masteredCount = cards.filter((c) => (ratings[c.id] || 0) >= 3).length;
  const percent = Math.round((masteredCount / cards.length) * 100);

  return { masteredCount, total: cards.length, percent };
}

/**
 * Filter cards by subject or all
 */
export function filterCardsBySubject(cards: Flashcard[], subjectId: SubjectId | 'all'): Flashcard[] {
  if (subjectId === 'all') return cards;
  return cards.filter((c) => c.subjectId === subjectId);
}
