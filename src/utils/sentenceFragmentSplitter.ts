// Complete sentenceFragmentSplitter.ts with all missing exports
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
  optimalRange: boolean; // 15-25 fragments
  longFragments: number; // >15 words
  shortFragments: number; // <4 words
  emptyFragments: number;
  averageWordCount: number;
}

// Article stats interface for compatibility
export interface ArticleStats {
  text: {
    characters: number;
    words: number;
    estimatedReadingTime: number;
  };
  fragments: {
    count: number;
    validation: FragmentValidation;
    list: FragmentData[];
  };
}

const MAX_WORDS_PER_FRAGMENT = 20;
const MIN_WORDS_PER_FRAGMENT = 2;
const OPTIMAL_WORDS_PER_FRAGMENT = 12;

export const isOptimalLength = (fragment: string): boolean => {
  const wordCount = fragment.split(/\s+/).filter(w => w.length > 0).length;
  return wordCount >= (OPTIMAL_WORDS_PER_FRAGMENT - 3) && 
         wordCount <= (OPTIMAL_WORDS_PER_FRAGMENT + 3);
};


/**
 * Simple fragment splitter focusing ONLY on periods and commas
 */
export const splitIntoSentenceFragments = (text: string): string[] => {
  if (!text || typeof text !== 'string') return [];
  
  // Clean and normalize the text
  const cleanText = text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
    
  if (!cleanText) return [];
  
  // Step 1: Split by sentence endings (periods followed by space and capital letter)
  const sentences = cleanText
    .split(/\.(?=\s+[A-Z])/) // Split on period followed by space and capital
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
    .map((sentence, index, array) => {
      // Add back period if it was removed (except for last sentence if it already ends properly)
      if (index < array.length - 1 && !sentence.endsWith('.')) {
        return sentence + '.';
      }
      return sentence;
    });
  
  const fragments: string[] = [];
  
  // Step 2: Process each sentence
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    
    // If sentence is short enough, keep as single fragment
    if (words.length <= MAX_WORDS_PER_FRAGMENT) {
      fragments.push(sentence);
      continue;
    }
    
    // For long sentences, split by commas
    const commaParts = sentence.split(/,(?=\s)/); // Split on comma followed by space
    let currentFragment = '';
    
    for (let i = 0; i < commaParts.length; i++) {
      const part = commaParts[i].trim();
      if (!part) continue;
      
      // Add comma back (except for last part)
      const partWithComma = (i < commaParts.length - 1 && !part.endsWith(',')) 
        ? part + ',' 
        : part;
      
      const testFragment = currentFragment 
        ? `${currentFragment} ${partWithComma}` 
        : partWithComma;
      
      const testWords = testFragment.split(/\s+/).length;
      
      // If adding this part exceeds limit, save current and start new
      if (testWords > MAX_WORDS_PER_FRAGMENT && currentFragment) {
        fragments.push(currentFragment);
        currentFragment = partWithComma;
      } else {
        currentFragment = testFragment;
      }
    }
    
    // Don't forget the last fragment
    if (currentFragment) {
      fragments.push(currentFragment);
    }
  }
  
  return fragments.filter(fragment => fragment.trim().length > 0);
};

/**
 * Find split points in text - simplified to focus on periods and commas only
 */
export const findSplitPoints = (text: string): SplitPoint[] => {
  const points: SplitPoint[] = [];
  
  // Find periods followed by space and capital letter
  const periodRegex = /\.(?=\s+[A-Z])/g;
  let match;
  while ((match = periodRegex.exec(text)) !== null) {
    points.push({
      position: match.index + 1, // After the period
      character: '. ',
      reason: 'Sentence boundary',
      priority: 'high'
    });
  }
  
  // Find commas followed by space (but not within parentheses or quotes)
  const commaRegex = /,(?=\s+[a-zA-Z])/g;
  while ((match = commaRegex.exec(text)) !== null) {
    // Simple check to avoid splitting within parentheses
    const beforeText = text.substring(0, match.index);
    const openParens = (beforeText.match(/\(/g) || []).length;
    const closeParens = (beforeText.match(/\)/g) || []).length;
    
    // Only split if we're not inside parentheses
    if (openParens === closeParens) {
      points.push({
        position: match.index + 1, // After the comma
        character: ', ',
        reason: 'Comma break',
        priority: 'medium'
      });
    }
  }
  
  // Sort by priority and position
  return points.sort((a, b) => {
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.position - b.position;
  });
};

/**
 * Split fragment at exact position
 */
export const splitFragmentAt = (
  fragments: string[], 
  fragmentIndex: number, 
  splitPosition: number
): string[] => {
  if (fragmentIndex < 0 || fragmentIndex >= fragments.length) return fragments;
  
  const fragment = fragments[fragmentIndex];
  if (splitPosition <= 0 || splitPosition >= fragment.length) return fragments;
  
  const first = fragment.substring(0, splitPosition).trim();
  const second = fragment.substring(splitPosition).trim();
  
  if (!first || !second) return fragments;
  
  const result = [...fragments];
  result.splice(fragmentIndex, 1, first, second);
  return result;
};

/**
 * Merge two consecutive fragments
 */
export const mergeFragments = (fragments: string[], index: number): string[] => {
  if (index < 0 || index >= fragments.length - 1) return fragments;
  
  const merged = `${fragments[index]} ${fragments[index + 1]}`;
  const result = [...fragments];
  result.splice(index, 2, merged);
  return result;
};

/**
 * Validate individual fragment
 */
export const validateFragment = (fragment: string): FragmentData => {
  const text = fragment.trim();
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  return {
    text,
    wordCount,
    isLong: wordCount > MAX_WORDS_PER_FRAGMENT,
    isShort: wordCount < MIN_WORDS_PER_FRAGMENT && wordCount > 0,
    isEmpty: text.length === 0,
    canSplit: findSplitPoints(text).length > 0
  };
};

/**
 * Validate entire fragments array
 */
export const validateFragments = (fragments: string[]): FragmentValidation => {
  const fragmentData = fragments.map(validateFragment);
  const totalWords = fragmentData.reduce((sum, f) => sum + f.wordCount, 0);
  
  return {
    totalFragments: fragments.length,
    optimalRange: fragments.length >= 15 && fragments.length <= 25,
    longFragments: fragmentData.filter(f => f.isLong).length,
    shortFragments: fragmentData.filter(f => f.isShort).length,
    emptyFragments: fragmentData.filter(f => f.isEmpty).length,
    averageWordCount: totalWords > 0 ? Math.round(totalWords / fragments.length) : 0
  };
};

/**
 * Smart split using detected split points
 */
export const smartSplitFragment = (fragments: string[], fragmentIndex: number): string[] => {
  if (fragmentIndex < 0 || fragmentIndex >= fragments.length) return fragments;
  
  const fragment = fragments[fragmentIndex];
  const splitPoints = findSplitPoints(fragment);
  
  if (splitPoints.length === 0) {
    // Fallback: split at middle word boundary
    const words = fragment.split(/\s+/);
    const middleIndex = Math.floor(words.length / 2);
    const middlePosition = words.slice(0, middleIndex).join(' ').length + 1;
    return splitFragmentAt(fragments, fragmentIndex, middlePosition);
  }
  
  // Use the first high-priority split point
  const bestSplit = splitPoints.find(sp => sp.priority === 'high') || splitPoints[0];
  return splitFragmentAt(fragments, fragmentIndex, bestSplit.position);
};

// Fragment Editor with History
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
    this.saveState([...initialFragments], 'Initial');
  }

  private saveState(fragments: string[], action: string): void {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push({
      fragments: [...fragments],
      timestamp: Date.now(),
      action
    });

    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }

    this.currentIndex = this.history.length - 1;
  }

  merge(fragments: string[], index: number): string[] {
    const result = mergeFragments(fragments, index);
    this.saveState(result, `Merge fragments ${index} and ${index + 1}`);
    return result;
  }

  split(fragments: string[], index: number, position?: number): string[] {
    const newFragments = position !== undefined 
      ? splitFragmentAt(fragments, index, position)
      : smartSplitFragment(fragments, index);
    this.saveState(newFragments, `Split fragment ${index}`);
    return newFragments;
  }

  edit(fragments: string[], index: number, newText: string): string[] {
    const newFragments = [...fragments];
    newFragments[index] = newText;
    this.saveState(newFragments, `Edit fragment ${index}`);
    return newFragments;
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

// MISSING EXPORTS - Adding these functions that are needed by other components

/**
 * Validate article name format
 */
export const validateArticleName = (name: string): boolean => {
  const regex = /^[a-zA-Z0-9-_]{3,50}$/;
  return regex.test(name);
};

/**
 * Suggest article name from title
 */
export const suggestArticleNameFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 40) // Limit length
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Get fragment statistics for TextInput component
 */
export const getFragmentStats = (text: string): ArticleStats => {
  const fragments = splitIntoSentenceFragments(text);
  const validation = validateFragments(fragments);
  const characterCount = text.length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const estimatedReadingTime = Math.ceil(wordCount / 200); // Average reading speed

  return {
    text: {
      characters: characterCount,
      words: wordCount,
      estimatedReadingTime
    },
    fragments: {
      count: fragments.length,
      validation,
      list: fragments.map(validateFragment)
    }
  };
};

// Backward compatibility exports
export const splitIntoSentences = splitIntoSentenceFragments;
export const validateSentence = validateFragment;
export const validateArticle = validateFragments;
export const mergeSentences = mergeFragments;
export const splitSentence = splitFragmentAt;