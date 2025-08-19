// src/utils/sentenceFragmentSplitter.ts

export interface FragmentData {
  text: string;
  wordCount: number;
  isLong: boolean;
  isShort: boolean;
  isEmpty: boolean;
  canSplit: boolean;
}

export interface SplitPoint {
  position: number;
  character: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FragmentValidation {
  totalFragments: number;
  optimalRange: boolean; // 15–25
  longFragments: number; // >20 words (increased tolerance)
  shortFragments: number; // <3 words
  emptyFragments: number;
  averageWordCount: number;
}

// Updated limits - more tolerant
const MAX_RECURSION_DEPTH = 8;
const MAX_WORDS_PER_FRAGMENT = 20; // Increased from 12
const MIN_WORDS_PER_FRAGMENT = 2; // Decreased from 3
const MIN_ARTICLE_WORDS = 20; // New minimum
const MAX_ARTICLE_WORDS = 1500; // New maximum

/**
 * Split text into sentence fragments - simplified and punctuation-preserving
 */
export const splitIntoSentenceFragments = (text: string): string[] => {
  if (!text || typeof text !== 'string') return [];

  // Validate article length
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < MIN_ARTICLE_WORDS) {
    throw new Error(`Article too short. Minimum ${MIN_ARTICLE_WORDS} words required.`);
  }
  if (wordCount > MAX_ARTICLE_WORDS) {
    throw new Error(`Article too long. Maximum ${MAX_ARTICLE_WORDS} words allowed.`);
  }

  // First, split by sentence endings to get complete sentences
  const sentences = splitBySentenceEndings(text);
  
  const fragments: string[] = [];
  for (const sentence of sentences) {
    const sentenceFragments = breakIntoFragments(sentence, 0);
    fragments.push(...sentenceFragments);
  }

  return fragments.filter(f => f.trim().length > 0);
};

/**
 * Split by sentence endings while preserving exact punctuation and spacing
 */
const splitBySentenceEndings = (text: string): string[] => {
  const sentences: string[] = [];
  let currentSentence = '';
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    currentSentence += char;
    
    // Check for sentence endings
    if (['.', '!', '?'].includes(char)) {
      // Look ahead to see if this is really a sentence ending
      let j = i + 1;
      
      // Skip whitespace
      while (j < text.length && /\s/.test(text[j])) {
        currentSentence += text[j];
        j++;
      }
      
      // If next char is uppercase or end of text, this is likely a sentence ending
      if (j >= text.length || /[A-Z]/.test(text[j])) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
        i = j;
        continue;
      }
    }
    
    i++;
  }
  
  // Add any remaining text
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }
  
  return sentences.filter(s => s.length > 0);
};

/**
 * Break a single sentence into fragments - simplified rules
 */
const breakIntoFragments = (sentence: string, depth: number): string[] => {
  if (depth >= MAX_RECURSION_DEPTH) return [sentence];

  const trimmed = sentence.trim();
  if (!trimmed) return [];

  const words = trimmed.split(/\s+/);
  if (words.length <= MAX_WORDS_PER_FRAGMENT) return [trimmed];

  // Find split points - SIMPLIFIED: only commas and periods
  const splitPoints = findSimpleSplitPoints(trimmed);

  // Choose best split position
  let splitPos: number | null = null;
  if (splitPoints.length > 0) {
    // Prefer splits closer to the middle
    const middle = Math.floor(trimmed.length / 2);
    splitPoints.sort((a, b) => 
      Math.abs(a.position - middle) - Math.abs(b.position - middle)
    );
    splitPos = splitPoints[0].position;
  } else {
    // Fallback: find middle word boundary
    const middleWordIndex = Math.floor(words.length / 2);
    let charCount = 0;
    for (let i = 0; i < middleWordIndex; i++) {
      charCount += words[i].length;
      if (i < middleWordIndex - 1) charCount += 1; // space
    }
    splitPos = charCount;
  }

  if (splitPos === null || splitPos <= 1 || splitPos >= trimmed.length - 1) {
    return [trimmed];
  }

  // Split while preserving exact spacing and punctuation
  const first = trimmed.substring(0, splitPos).trim();
  const second = trimmed.substring(splitPos).trim();

  if (!first || !second) return [trimmed];
  if (first === trimmed || second === trimmed) return [trimmed];

  // Recurse only if still too long
  const firstWords = first.split(/\s+/).length;
  const secondWords = second.split(/\s+/).length;
  
  const leftFragments = firstWords > MAX_WORDS_PER_FRAGMENT 
    ? breakIntoFragments(first, depth + 1) 
    : [first];
    
  const rightFragments = secondWords > MAX_WORDS_PER_FRAGMENT 
    ? breakIntoFragments(second, depth + 1) 
    : [second];

  return [...leftFragments, ...rightFragments];
};

/**
 * Find split points - SIMPLIFIED: only commas and periods
 */
export const findSimpleSplitPoints = (text: string): SplitPoint[] => {
  const points: SplitPoint[] = [];
  
  // High priority: periods followed by space (but not sentence ending)
  const periodRegex = /\.\s+(?![A-Z])/g;
  let match;
  while ((match = periodRegex.exec(text)) !== null) {
    points.push({
      position: match.index + match[0].length,
      character: match[0],
      reason: 'Period break',
      priority: 'high'
    });
  }
  
  // Medium priority: commas followed by space
  const commaRegex = /,\s+/g;
  while ((match = commaRegex.exec(text)) !== null) {
    points.push({
      position: match.index + match[0].length,
      character: match[0],
      reason: 'Comma break',
      priority: 'medium'
    });
  }
  
  return points.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.position - b.position;
  });
};

/**
 * Find ALL possible split points for manual splitting UI
 */
export const findAllSplitPoints = (text: string): Array<{position: number; word: string; reason: string}> => {
  const points: Array<{position: number; word: string; reason: string}> = [];
  const words = text.split(/(\s+)/); // Include spaces
  
  let position = 0;
  for (let i = 0; i < words.length; i += 2) { // Skip spaces (odd indices)
    if (i > 0) {
      points.push({
        position: position,
        word: words[i],
        reason: `Split before "${words[i]}"`
      });
    }
    position += words[i].length;
    if (i + 1 < words.length) {
      position += words[i + 1].length; // Add space length
    }
  }
  
  return points;
};

/**
 * Split fragment at exact character position
 */
export const splitFragmentAt = (fragments: string[], fragmentIndex: number, splitPosition: number): string[] => {
  if (fragmentIndex < 0 || fragmentIndex >= fragments.length) return fragments;

  const fragment = fragments[fragmentIndex];
  if (splitPosition <= 0 || splitPosition >= fragment.length) return fragments;

  // Find the exact word boundary near the split position
  let actualSplit = splitPosition;
  
  // If we're in the middle of a word, move to the nearest word boundary
  if (fragment[actualSplit] !== ' ') {
    // Look backwards for space
    let backPos = actualSplit;
    while (backPos > 0 && fragment[backPos] !== ' ') {
      backPos--;
    }
    
    // Look forwards for space
    let frontPos = actualSplit;
    while (frontPos < fragment.length && fragment[frontPos] !== ' ') {
      frontPos++;
    }
    
    // Choose the closer boundary
    const backDist = actualSplit - backPos;
    const frontDist = frontPos - actualSplit;
    actualSplit = backDist <= frontDist ? backPos : frontPos;
  }

  const first = fragment.substring(0, actualSplit).trim();
  const second = fragment.substring(actualSplit).trim();

  if (!first || !second) return fragments;

  const result = [...fragments];
  result.splice(fragmentIndex, 1, first, second);
  return result;
};

/**
 * Merge fragments while preserving exact spacing
 */
export const mergeFragments = (fragments: string[], index: number): string[] => {
  if (index < 0 || index >= fragments.length - 1) return fragments;
  
  // Merge with single space (teachers can adjust spacing manually if needed)
  const merged = `${fragments[index]} ${fragments[index + 1]}`;
  
  const result = [...fragments];
  result.splice(index, 2, merged);
  return result;
};

/**
 * Validate that merged fragments recreate original text
 */
export const validateFragmentMerge = (fragments: string[], originalText: string): boolean => {
  const merged = fragments.join(' ').replace(/\s+/g, ' ').trim();
  const normalized = originalText.replace(/\s+/g, ' ').trim();
  return merged === normalized;
};

// Rest of the validation and stats functions...
export const validateFragment = (fragment: string): FragmentData => {
  const text = fragment.trim();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  return {
    text,
    wordCount,
    isLong: wordCount > MAX_WORDS_PER_FRAGMENT,
    isShort: wordCount < MIN_WORDS_PER_FRAGMENT && wordCount > 0,
    isEmpty: text.length === 0,
    canSplit: findAllSplitPoints(text).length > 1
  };
};

export const validateFragments = (fragments: string[]): FragmentValidation => {
  const data = fragments.map(validateFragment);
  const totalWords = data.reduce((sum, f) => sum + f.wordCount, 0);

  return {
    totalFragments: fragments.length,
    optimalRange: fragments.length >= 15 && fragments.length <= 25,
    longFragments: data.filter(f => f.isLong).length,
    shortFragments: data.filter(f => f.isShort).length,
    emptyFragments: data.filter(f => f.isEmpty).length,
    averageWordCount: totalWords > 0 ? Math.round(totalWords / fragments.length) : 0
  };
};

// History and editor classes remain the same...
export interface FragmentHistory {
  fragments: string[];
  timestamp: number;
  action: string;
}

export class FragmentEditor {
  private history: FragmentHistory[] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;

  constructor(initialFragments: string[]) {
    this.saveState(initialFragments, 'Initial');
  }

  private saveState(fragments: string[], action: string) {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    this.history.push({ fragments: [...fragments], timestamp: Date.now(), action });
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
    this.currentIndex = this.history.length - 1;
  }

  merge(fragments: string[], index: number): string[] {
    const result = mergeFragments(fragments, index);
    this.saveState(result, `Merge fragments ${index} & ${index + 1}`);
    return result;
  }

  split(fragments: string[], index: number, position: number): string[] {
    const result = splitFragmentAt(fragments, index, position);
    this.saveState(result, `Split fragment ${index} at position ${position}`);
    return result;
  }

  undo(): string[] | null {
    if (this.currentIndex <= 0) return null;
    this.currentIndex--;
    return [...this.history[this.currentIndex].fragments];
  }

  redo(): string[] | null {
    if (this.currentIndex >= this.history.length - 1) return null;
    this.currentIndex++;
    return [...this.history[this.currentIndex].fragments];
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getCurrentState(): string[] {
    return this.currentIndex >= 0 ? [...this.history[this.currentIndex].fragments] : [];
  }
}

// Stats function
export const getFragmentStats = (text: string) => {
  const fragments = splitIntoSentenceFragments(text);
  const validation = validateFragments(fragments);
  const characters = text.length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const estimatedReadingTime = Math.ceil(words / 200);

  return {
    text: { characters, words, estimatedReadingTime },
    fragments: {
      count: fragments.length,
      validation,
      list: fragments.map(validateFragment)
    }
  };
};

// Backward compatibility
export const splitIntoSentences = splitIntoSentenceFragments;
export const validateSentence = validateFragment;
export const validateArticle = validateFragments;
export const mergeSentences = mergeFragments;
export const splitSentence = splitFragmentAt;
export const getArticleStats = getFragmentStats;

// Name validation helpers
export const validateArticleName = (name: string): boolean => {
  const regex = /^[a-zA-Z0-9_\-\(\)]{3,50}$/;
  return regex.test(name);
};

export const suggestArticleNameFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 40);
};