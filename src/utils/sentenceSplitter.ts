// src/utils/sentenceSplitter.ts
import { validateSentence } from './sentenceFragmentSplitter';

export interface SentenceData {
  text: string;
  wordCount: number;
  isLong: boolean;
  isShort: boolean;
  isEmpty: boolean;
}

export interface SentenceValidation {
  totalSentences: number;
  optimalRange: boolean; // 15-25 sentences
  longSentences: number; // >15 words
  shortSentences: number; // <5 words
  emptySentences: number;
  averageWordCount: number;
}

// /**
//  * Split text into sentences using regex-based approach
//  * This provides immediate client-side feedback to teachers
//  */
// export const splitIntoSentences = (text: string): string[] => {
//   if (!text || typeof text !== 'string') {
//     return [];
//   }

//   return text
//     // Normalize whitespace and newlines
//     .replace(/\s+/g, ' ')
//     .trim()
    
//     // Handle common abbreviations that shouldn't end sentences
//     .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Inc|Ltd|etc|vs|e\.g|i\.e)\./gi, '$1<ABBREV>')
    
//     // Handle decimal numbers
//     .replace(/\d+\.\d+/g, (match) => match.replace('.', '<DECIMAL>'))
    
//     // Split on sentence endings followed by whitespace and capital letter or end of string
//     .split(/[.!?]+\s+(?=[A-Z])|[.!?]+\s*$/)
    
//     // Clean up and restore abbreviations
//     .map(sentence => 
//       sentence
//         .replace(/<ABBREV>/g, '.')
//         .replace(/<DECIMAL>/g, '.')
//         .trim()
//     )
    
//     // Filter out empty sentences
//     .filter(sentence => sentence.length > 0)
    
//     // Ensure sentences end with proper punctuation
//     .map(sentence => {
//       const lastChar = sentence.slice(-1);
//       if (!['.', '!', '?'].includes(lastChar)) {
//         return sentence + '.';
//       }
//       return sentence;
//     });
// };

// /**
//  * Validate individual sentence
//  */
// export const validateSentence = (sentence: string): SentenceData => {
//   const text = sentence.trim();
//   const words = text.split(/\s+/).filter(word => word.length > 0);
//   const wordCount = words.length;

//   return {
//     text,
//     wordCount,
//     isLong: wordCount > 15,
//     isShort: wordCount < 5 && wordCount > 0,
//     isEmpty: text.length === 0
//   };
// };

// /**
//  * Validate entire article's sentence structure
//  */
// export const validateArticle = (sentences: string[]): SentenceValidation => {
//   const sentenceData = sentences.map(validateSentence);
//   const totalWords = sentenceData.reduce((sum, s) => sum + s.wordCount, 0);

//   return {
//     totalSentences: sentences.length,
//     optimalRange: sentences.length >= 15 && sentences.length <= 25,
//     longSentences: sentenceData.filter(s => s.isLong).length,
//     shortSentences: sentenceData.filter(s => s.isShort).length,
//     emptySentences: sentenceData.filter(s => s.isEmpty).length,
//     averageWordCount: totalWords > 0 ? Math.round(totalWords / sentences.length) : 0
//   };
// };

// /**
//  * Merge two consecutive sentences
//  */
// export const mergeSentences = (sentences: string[], index: number): string[] => {
//   if (index < 0 || index >= sentences.length - 1) {
//     return sentences;
//   }

//   const newSentences = [...sentences];
//   const mergedText = `${sentences[index].replace(/[.!?]+$/, '')} ${sentences[index + 1]}`;
  
//   newSentences.splice(index, 2, mergedText);
//   return newSentences;
// };

// /**
//  * Split a sentence at a specific position
//  */
// export const splitSentence = (sentences: string[], sentenceIndex: number, splitPosition: number): string[] => {
//   if (sentenceIndex < 0 || sentenceIndex >= sentences.length) {
//     return sentences;
//   }

//   const sentence = sentences[sentenceIndex];
//   if (splitPosition <= 0 || splitPosition >= sentence.length) {
//     return sentences;
//   }

//   const newSentences = [...sentences];
//   const firstPart = sentence.substring(0, splitPosition).trim();
//   const secondPart = sentence.substring(splitPosition).trim();

//   // Ensure proper punctuation
//   const firstSentence = firstPart.match(/[.!?]$/) ? firstPart : firstPart + '.';
//   const secondSentence = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);

//   newSentences.splice(sentenceIndex, 1, firstSentence, secondSentence);
//   return newSentences;
// };

/**
 * Auto-suggest sentence improvements
 */
export const getSentenceSuggestions = (sentences: string[]): Array<{
  index: number;
  type: 'long' | 'short' | 'merge' | 'split';
  message: string;
  severity: 'warning' | 'suggestion';
}> => {
  const suggestions: Array<{
    index: number;
    type: 'long' | 'short' | 'merge' | 'split';
    message: string;
    severity: 'warning' | 'suggestion';
  }> = [];

  sentences.forEach((sentence, index) => {
    const validation = validateSentence(sentence);

    if (validation.isLong) {
      suggestions.push({
        index,
        type: 'long',
        message: `This sentence has ${validation.wordCount} words. Consider splitting it for better dictation.`,
        severity: 'warning'
      });
    }

    if (validation.isShort && !validation.isEmpty) {
      suggestions.push({
        index,
        type: 'short',
        message: `This sentence is quite short (${validation.wordCount} words). Consider merging with adjacent sentence.`,
        severity: 'suggestion'
      });
    }
  });

  return suggestions;
};

// /**
//  * Generate article statistics for teacher review
//  */
// export const getArticleStats = (text: string) => {
//   const sentences = splitIntoSentences(text);
//   const validation = validateArticle(sentences);
//   const suggestions = getSentenceSuggestions(sentences);

//   const characterCount = text.length;
//   const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
//   const estimatedReadingTime = Math.ceil(wordCount / 200); // Average reading speed

//   return {
//     text: {
//       characters: characterCount,
//       words: wordCount,
//       estimatedReadingTime
//     },
//     sentences: {
//       count: sentences.length,
//       validation,
//       suggestions,
//       list: sentences.map(validateSentence)
//     }
//   };
// };

/**
 * Generate sentence ID from article name and order
 */
export const generateSentenceId = (articleName: string, order: number): string => {
  return `${articleName}_${order}`;
};

/**
 * Parse sentence ID to get article name and order
 */
export const parseSentenceId = (sentenceId: string): { articleName: string; order: number } | null => {
  const lastUnderscoreIndex = sentenceId.lastIndexOf('_');
  if (lastUnderscoreIndex === -1) {
    return null;
  }
  
  const articleName = sentenceId.substring(0, lastUnderscoreIndex);
  const orderStr = sentenceId.substring(lastUnderscoreIndex + 1);
  const order = parseInt(orderStr, 10);
  
  if (isNaN(order)) {
    return null;
  }
  
  return { articleName, order };
};

/**
 * Validate article name format
 */
export const validateArticleName = (name: string): boolean => {
  const regex = /^[a-zA-Z0-9_\-\(\)]{3,50}$/;
  return regex.test(name);
};

/**
 * Clean title to suggest article name
 */
export const suggestArticleNameFromTitle = (title: string): string => {
  return title.toLowerCase()
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 40);
};


export * from './sentenceFragmentSplitter';


