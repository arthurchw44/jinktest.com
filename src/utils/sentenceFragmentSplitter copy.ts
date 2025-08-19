// // src/utils/sentenceFragmentSplitter.ts

// export interface FragmentData {
//   text: string;
//   wordCount: number;
//   isLong: boolean;
//   isShort: boolean;
//   isEmpty: boolean;
//   canSplit: boolean; // Whether this fragment has potential split points
// }

// export interface SplitPoint {
//   position: number;
//   character: string;
//   reason: string; // Why this is a good split point
//   priority: 'high' | 'medium' | 'low';
// }

// export interface FragmentValidation {
//   totalFragments: number;
//   optimalRange: boolean; // 15-25 fragments
//   longFragments: number; // >12 words
//   shortFragments: number; // <4 words
//   emptyFragments: number;
//   averageWordCount: number;
// }

// /**
//  * Split text into sentence fragments using intelligent breaking points
//  * Focuses on meaningful chunks rather than complete sentences
//  */
// export const splitIntoSentenceFragments = (text: string): string[] => {
//   if (!text || typeof text !== 'string') {
//     return [];
//   }

//   // First, split by sentence endings to get complete sentences
//   const sentences = text
//     .replace(/\s+/g, ' ')
//     .trim()
//     .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Inc|Ltd|etc|vs|e\.g|i\.e)\./gi, '$1<ABBREV>')
//     .replace(/\d+\.\d+/g, (match) => match.replace('.', '<DECIMAL>'))
//     .split(/[.!?]+\s+(?=[A-Z])|[.!?]+\s*$/)
//     .map(sentence => 
//       sentence
//         .replace(/<ABBREV>/g, '.')
//         .replace(/<DECIMAL>/g, '.')
//         .trim()
//     )
//     .filter(sentence => sentence.length > 0);

//   // Now break each sentence into fragments
//   const fragments: string[] = [];
  
//   sentences.forEach(sentence => {
//     const sentenceFragments = breakIntoFragments(sentence);
//     fragments.push(...sentenceFragments);
//   });

//   return fragments.filter(fragment => fragment.trim().length > 0);
// };

// /**
//  * Break a single sentence into logical fragments
//  */
// const breakIntoFragments = (sentence: string): string[] => {
//   const words = sentence.split(/\s+/);
  
//   // If sentence is short enough, don't split
//   if (words.length <= 12) {
//     return [sentence];
//   }

//   // Find potential split points
//   const splitPoints = findSplitPoints(sentence);
  
//   // If no good split points found, try to split at midpoint
//   if (splitPoints.length === 0) {
//     const midPoint = Math.floor(words.length / 2);
//     const firstPart = words.slice(0, midPoint).join(' ');
//     const secondPart = words.slice(midPoint).join(' ');
//     return [firstPart, secondPart];
//   }

//   // Use the best split point
//   const bestSplit = splitPoints.find(sp => sp.priority === 'high') || splitPoints[0];
//   const firstPart = sentence.substring(0, bestSplit.position).trim();
//   const secondPart = sentence.substring(bestSplit.position).trim();

//   // Recursively split if parts are still too long
//   const fragments: string[] = [];
  
//   const firstFragments = firstPart.split(/\s+/).length > 12 ? breakIntoFragments(firstPart) : [firstPart];
//   const secondFragments = secondPart.split(/\s+/).length > 12 ? breakIntoFragments(secondPart) : [secondPart];
  
//   fragments.push(...firstFragments, ...secondFragments);
  
//   return fragments.filter(f => f.trim().length > 0);
// };

// /**
//  * Find potential split points in a sentence
//  */
// export const findSplitPoints = (text: string): SplitPoint[] => {
//   const splitPoints: SplitPoint[] = [];
  
//   // High priority split points
//   const highPriorityPatterns = [
//     { regex: /,\s+(?:particularly|especially|specifically|including|such as|for example|however|meanwhile|furthermore|moreover|nevertheless|therefore|consequently|thus|hence)/gi, reason: 'Transitional phrase' },
//     { regex: /,\s+(?:which|who|that|where|when|while|although|though|because|since|if|unless|until)/gi, reason: 'Relative/subordinate clause' },
//     { regex: /;\s+/g, reason: 'Semicolon break' },
//     { regex: /:\s+/g, reason: 'Colon break' }
//   ];

//   // Medium priority split points
//   const mediumPriorityPatterns = [
//     { regex: /,\s+(?:and|but|or|yet|so|for|nor)\s+/gi, reason: 'Coordinating conjunction' },
//     { regex: /,\s+(?:during|after|before|while|since|until|when|where|as)\s+/gi, reason: 'Temporal/spatial clause' },
//     { regex: /\s+(?:during|after|before|while|since|until|when|where|as)\s+/gi, reason: 'Clause beginning' }
//   ];

//   // Low priority split points
//   const lowPriorityPatterns = [
//     { regex: /,\s+/g, reason: 'Comma break' },
//     { regex: /\s+(?:and|but|or)\s+/gi, reason: 'Simple conjunction' }
//   ];

//   // Find high priority splits
//   highPriorityPatterns.forEach(pattern => {
//     let match;
//     while ((match = pattern.regex.exec(text)) !== null) {
//       splitPoints.push({
//         position: match.index + match[0].length,
//         character: match[0],
//         reason: pattern.reason,
//         priority: 'high'
//       });
//     }
//   });

//   // Find medium priority splits (only if no high priority found)
//   if (splitPoints.length === 0) {
//     mediumPriorityPatterns.forEach(pattern => {
//       let match;
//       while ((match = pattern.regex.exec(text)) !== null) {
//         splitPoints.push({
//           position: match.index + match[0].length,
//           character: match[0],
//           reason: pattern.reason,
//           priority: 'medium'
//         });
//       }
//     });
//   }

//   // Find low priority splits (only if no others found)
//   if (splitPoints.length === 0) {
//     lowPriorityPatterns.forEach(pattern => {
//       let match;
//       while ((match = pattern.regex.exec(text)) !== null) {
//         splitPoints.push({
//           position: match.index + match[0].length,
//           character: match[0],
//           reason: pattern.reason,
//           priority: 'low'
//         });
//       }
//     });
//   }

//   // Sort by priority and position
//   return splitPoints.sort((a, b) => {
//     const priorityOrder = { high: 0, medium: 1, low: 2 };
//     if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
//       return priorityOrder[a.priority] - priorityOrder[b.priority];
//     }
//     return a.position - b.position;
//   });
// };

// /**
//  * Validate individual fragment
//  */
// export const validateFragment = (fragment: string): FragmentData => {
//   const text = fragment.trim();
//   const words = text.split(/\s+/).filter(word => word.length > 0);
//   const wordCount = words.length;

//   return {
//     text,
//     wordCount,
//     isLong: wordCount > 12,
//     isShort: wordCount < 4 && wordCount > 0,
//     isEmpty: text.length === 0,
//     canSplit: findSplitPoints(text).length > 0
//   };
// };

// /**
//  * Validate entire article's fragment structure
//  */
// export const validateFragments = (fragments: string[]): FragmentValidation => {
//   const fragmentData = fragments.map(validateFragment);
//   const totalWords = fragmentData.reduce((sum, f) => sum + f.wordCount, 0);

//   return {
//     totalFragments: fragments.length,
//     optimalRange: fragments.length >= 15 && fragments.length <= 25,
//     longFragments: fragmentData.filter(f => f.isLong).length,
//     shortFragments: fragmentData.filter(f => f.isShort).length,
//     emptyFragments: fragmentData.filter(f => f.isEmpty).length,
//     averageWordCount: totalWords > 0 ? Math.round(totalWords / fragments.length) : 0
//   };
// };

// /**
//  * Merge two consecutive fragments
//  */
// export const mergeFragments = (fragments: string[], index: number): string[] => {
//   if (index < 0 || index >= fragments.length - 1) {
//     return fragments;
//   }

//   const newFragments = [...fragments];
//   const mergedText = `${fragments[index]} ${fragments[index + 1]}`;
  
//   newFragments.splice(index, 2, mergedText);
//   return newFragments;
// };

// /**
//  * Split a fragment at a specific position
//  */
// export const splitFragmentAt = (fragments: string[], fragmentIndex: number, splitPosition: number): string[] => {
//   if (fragmentIndex < 0 || fragmentIndex >= fragments.length) {
//     return fragments;
//   }

//   const fragment = fragments[fragmentIndex];
//   if (splitPosition <= 0 || splitPosition >= fragment.length) {
//     return fragments;
//   }

//   const newFragments = [...fragments];
//   let firstPart = fragment.substring(0, splitPosition).trim();
//   let secondPart = fragment.substring(splitPosition).trim();

//   // Clean up split - ensure proper spacing
//   if (firstPart.endsWith(',') || firstPart.endsWith(';') || firstPart.endsWith(':')) {
//     // Keep punctuation with first part
//   } else if (secondPart.startsWith(',') || secondPart.startsWith(';') || secondPart.startsWith(':')) {
//     // Move punctuation to first part
//     firstPart += secondPart.charAt(0);
//     secondPart = secondPart.substring(1).trim();
//   }

//   newFragments.splice(fragmentIndex, 1, firstPart, secondPart);
//   return newFragments.filter(f => f.trim().length > 0);
// };

// /**
//  * Smart split using detected split points
//  */
// export const smartSplitFragment = (fragments: string[], fragmentIndex: number): string[] => {
//   if (fragmentIndex < 0 || fragmentIndex >= fragments.length) {
//     return fragments;
//   }

//   const fragment = fragments[fragmentIndex];
//   const splitPoints = findSplitPoints(fragment);
  
//   if (splitPoints.length === 0) {
//     // Fallback to middle split
//     const middlePosition = Math.floor(fragment.length / 2);
//     const splitAt = fragment.lastIndexOf(' ', middlePosition);
//     return splitFragmentAt(fragments, fragmentIndex, splitAt > 0 ? splitAt : middlePosition);
//   }

//   // Use the best split point
//   const bestSplit = splitPoints.find(sp => sp.priority === 'high') || splitPoints[0];
//   return splitFragmentAt(fragments, fragmentIndex, bestSplit.position);
// };

// /**
//  * Undo/Redo functionality
//  */
// export interface FragmentHistory {
//   fragments: string[];
//   timestamp: number;
//   action: string;
// }

// export class FragmentEditor {
//   private history: FragmentHistory[] = [];
//   private currentIndex: number = -1;
//   private maxHistorySize: number = 50;

//   constructor(initialFragments: string[]) {
//     this.saveState(initialFragments, 'Initial');
//   }

//   private saveState(fragments: string[], action: string) {
//     // Remove any future history if we're not at the end
//     if (this.currentIndex < this.history.length - 1) {
//       this.history = this.history.slice(0, this.currentIndex + 1);
//     }

//     // Add new state
//     this.history.push({
//       fragments: [...fragments],
//       timestamp: Date.now(),
//       action
//     });

//     // Limit history size
//     if (this.history.length > this.maxHistorySize) {
//       this.history = this.history.slice(-this.maxHistorySize);
//     }

//     this.currentIndex = this.history.length - 1;
//   }

//   merge(fragments: string[], index: number): string[] {
//     const newFragments = mergeFragments(fragments, index);
//     this.saveState(newFragments, `Merge fragments ${index} and ${index + 1}`);
//     return newFragments;
//   }

//   split(fragments: string[], index: number, position?: number): string[] {
//     const newFragments = position !== undefined 
//       ? splitFragmentAt(fragments, index, position)
//       : smartSplitFragment(fragments, index);
//     this.saveState(newFragments, `Split fragment ${index}`);
//     return newFragments;
//   }

//   edit(fragments: string[], index: number, newText: string): string[] {
//     const newFragments = [...fragments];
//     newFragments[index] = newText;
//     this.saveState(newFragments, `Edit fragment ${index}`);
//     return newFragments;
//   }

//   undo(): string[] | null {
//     if (this.currentIndex <= 0) return null;
//     this.currentIndex--;
//     return [...this.history[this.currentIndex].fragments];
//   }

//   redo(): string[] | null {
//     if (this.currentIndex >= this.history.length - 1) return null;
//     this.currentIndex++;
//     return [...this.history[this.currentIndex].fragments];
//   }

//   canUndo(): boolean {
//     return this.currentIndex > 0;
//   }

//   canRedo(): boolean {
//     return this.currentIndex < this.history.length - 1;
//   }

//   getCurrentState(): string[] {
//     return this.currentIndex >= 0 ? [...this.history[this.currentIndex].fragments] : [];
//   }

//   getHistory(): FragmentHistory[] {
//     return [...this.history];
//   }
// }

// /**
//  * Generate article statistics for teacher review
//  */
// export const getFragmentStats = (text: string) => {
//   const fragments = splitIntoSentenceFragments(text);
//   const validation = validateFragments(fragments);

//   const characterCount = text.length;
//   const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
//   const estimatedReadingTime = Math.ceil(wordCount / 200);

//   return {
//     text: {
//       characters: characterCount,
//       words: wordCount,
//       estimatedReadingTime
//     },
//     fragments: {
//       count: fragments.length,
//       validation,
//       list: fragments.map(validateFragment)
//     }
//   };
// };

// // Maintain backward compatibility
// export const splitIntoSentences = splitIntoSentenceFragments;
// export const validateSentence = validateFragment;
// export const validateArticle = validateFragments;
// export const mergeSentences = mergeFragments;
// export const splitSentence = splitFragmentAt;
// export const getArticleStats = getFragmentStats;