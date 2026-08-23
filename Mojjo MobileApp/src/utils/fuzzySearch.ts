/**
 * Fuzzy Search & Typo Tolerance Utility using Levenshtein Distance
 */

export const CATALOG_KEYWORDS: string[] = [
  'real mixed fruit juice',
  'juice',
  'fruit juice',
  'butter',
  'ddc butter',
  'noodles',
  'wai wai',
  'wai wai noodles',
  'chips',
  'lays',
  'lays classic salted chips',
  'coca cola',
  'coke',
  'soda',
  'cold drinks',
  'milk',
  'fresh milk',
  'eggs',
  'farm eggs',
  'bread',
  'dairy',
  'cheese',
  'snacks',
  'munchies',
  'instant food',
  'ice cream',
  'beverages',
  'water',
  'chocolate',
  'biscuits',
  'oil',
  'tea',
  'coffee',
  'fruits',
  'vegetables',
];

/**
 * Calculates the Levenshtein Distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const str1 = a.toLowerCase().trim();
  const str2 = b.toLowerCase().trim();

  const m = str1.length;
  const n = str2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

/**
 * Finds the closest matching keyword from catalog for typo tolerance.
 */
export function findClosestTypoCorrection(
  query: string,
  candidates: string[] = CATALOG_KEYWORDS,
  maxDistanceThreshold: number = 3
): string | null {
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery.length < 3) return null;

  let bestMatch: string | null = null;
  let minDistance = Infinity;

  for (const candidate of candidates) {
    // If exact substring, no typo correction needed
    if (candidate.includes(cleanQuery)) {
      return null;
    }

    const words = candidate.split(' ');
    for (const word of words) {
      const distance = levenshteinDistance(cleanQuery, word);
      const similarity = 1 - distance / Math.max(cleanQuery.length, word.length);

      if (distance <= maxDistanceThreshold && similarity >= 0.55 && distance < minDistance) {
        minDistance = distance;
        bestMatch = word;
      }
    }
  }

  return bestMatch;
}

/**
 * Generates live search suggestions based on input prefix.
 */
export function getLiveSuggestions(
  query: string,
  candidates: string[] = CATALOG_KEYWORDS,
  limit: number = 5
): string[] {
  const clean = query.toLowerCase().trim();
  if (!clean || clean.length < 2) return [];

  const matched = candidates.filter((item) => item.toLowerCase().includes(clean));
  return Array.from(new Set(matched)).slice(0, limit);
}
