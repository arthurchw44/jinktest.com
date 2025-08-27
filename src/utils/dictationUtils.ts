// src/utils/dictationUtils.ts


import type { TokenDiff, ComparisonResult } from '../types/article.types';


/**
 * Normalize text for comparison - case insensitive, punctuation stripped
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace curly quotes with straight quotes
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ');
}

/**
 * Tokenize and clean tokens for comparison
 */
export function tokenizeForComparison(text: string): string[] {
  const normalized = normalizeText(text);
  
  return normalized
    .split(/\s+/)
    .map(token => 
      // Strip leading/trailing punctuation but preserve internal punctuation (contractions)
      token.replace(/^[^\w']+|[^\w']+$/g, '')
    )
    .filter(token => token.length > 0);
}

/**
 * Simple token-level diff algorithm
 */
export function computeTokenDiff(originalTokens: string[], attemptTokens: string[]): TokenDiff[] {
  const diffs: TokenDiff[] = [];
  const maxLen = Math.max(originalTokens.length, attemptTokens.length);
  
  for (let i = 0; i < maxLen; i++) {
    const original = originalTokens[i] || '';
    const attempt = attemptTokens[i] || '';
    
    if (i >= originalTokens.length) {
      // Extra word in attempt (insertion)
      diffs.push({
        original: '',
        attempt,
        isCorrect: false,
        type: 'insertion'
      });
    } else if (i >= attemptTokens.length) {
      // Missing word in attempt (deletion)
      diffs.push({
        original,
        attempt: '',
        isCorrect: false,
        type: 'deletion'
      });
    } else if (original === attempt) {
      // Perfect match
      diffs.push({
        original,
        attempt,
        isCorrect: true,
        type: 'match'
      });
    } else {
      // Substitution
      diffs.push({
        original,
        attempt,
        isCorrect: false,
        type: 'substitution'
      });
    }
  }
  
  return diffs;
}

/**
 * Generate masked hint feedback
 */
export function generateMaskedHint(originalTokens: string[], tokenDiffs: TokenDiff[]): string {
  return originalTokens.map((token, index) => {
    const diff = tokenDiffs[index];
    if (diff && diff.isCorrect) {
      return token;
    } else {
      // Mask incorrect/missing words with asterisks matching original length
      return '*'.repeat(Math.max(token.length, 3));
    }
  }).join(' ');
}

/**
 * Main comparison function
 */
export function compareTexts(original: string, attempt: string): ComparisonResult {
  const originalTokens = tokenizeForComparison(original);
  const attemptTokens = tokenizeForComparison(attempt);
  
  const tokenDiffs = computeTokenDiff(originalTokens, attemptTokens);
  
  const correctTokens = tokenDiffs.filter(diff => 
    diff.isCorrect && diff.type === 'match'
  ).length;
  
  const totalTokens = Math.max(originalTokens.length, 1); // Avoid division by zero
  const score = correctTokens / totalTokens;
  const isPerfect = score === 1 && originalTokens.length === attemptTokens.length;
  
  const feedback = generateMaskedHint(originalTokens, tokenDiffs);
  
  return {
    score,
    totalTokens,
    correctTokens,
    feedback,
    tokenDiffs,
    isPerfect
  };
}

/**
 * Check if answer is acceptable (perfect or near-perfect for long sentences)
 */
export function isAnswerAcceptable(result: ComparisonResult, toleranceMode: boolean = false): boolean {
  if (result.isPerfect) return true;
  
  // For MVP, require perfect match. Later can add tolerance for long sentences
  if (toleranceMode && result.totalTokens >= 8) {
    // Allow 1 error for sentences >= 8 words
    return (result.totalTokens - result.correctTokens) <= 1;
  }
  
  return false;
}
