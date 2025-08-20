import React, { useState } from 'react';
// import { findSplitPoints } from '../../utils/sentenceFragmentSplitter';

interface SentencePreviewProps {
  sentences: string[];
  articleName: string;
  showSentenceIds?: boolean;
  editable?: boolean;
  onSplit?: (index: number, position: number) => void;
  onMerge?: (index: number) => void;
  onEdit?: (index: number, newText: string) => void;
}

const SentencePreview: React.FC<SentencePreviewProps> = ({
  sentences,
  articleName,
  showSentenceIds = false,
  editable = true,
  onSplit,
  onMerge,
  onEdit
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleSplitClick = (sentenceIndex: number, wordIndex: number, sentence: string) => {
    if (!onSplit) return;
    
    // Calculate the position to split at (after the word)
    const words = sentence.split(' ');
    const beforeWords = words.slice(0, wordIndex + 1);
    const position = beforeWords.join(' ').length;
    
    console.log(`Splitting sentence ${sentenceIndex} at position ${position}`);
    onSplit(sentenceIndex, position);
  };

  const handleMerge = (index: number) => {
    if (!onMerge) return;
    onMerge(index);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(sentences[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && onEdit) {
      onEdit(editingIndex, editText);
    }
    setEditingIndex(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
  };

  const renderSentenceWithSplitPoints = (sentence: string, sentenceIndex: number) => {
    const words = sentence.split(' ');
    const elements: React.ReactNode[] = [];

    words.forEach((word, wordIndex) => {
      // Add the word with proper spacing
      elements.push(
        <span key={`word-${wordIndex}`} className="inline whitespace-pre">
          {word}
        </span>
      );

      // Add split point after each word (except the last one)
      if (wordIndex < words.length - 1) {
        // Check if this is a good split point (after comma or before new clause)
        const isGoodSplitPoint = word.endsWith(',') || word.endsWith(';');
        
        elements.push(
          <span key={`space-${wordIndex}`} className="inline-flex items-center whitespace-pre">
            {/* Use non-breaking space entity to ensure space is preserved */}
            <span className="text-gray-400">&nbsp;</span>
            {editable && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSplitClick(sentenceIndex, wordIndex, sentence);
                }}
                className={`
                  inline-flex items-center justify-center mx-1 
                  transition-all duration-200 hover:scale-110 active:scale-95
                  ${isGoodSplitPoint 
                    ? 'w-6 h-6 bg-blue-500 hover:bg-blue-600' 
                    : 'w-4 h-4 bg-gray-300 hover:bg-blue-400'
                  }
                  rounded-full cursor-pointer shadow-sm hover:shadow-md
                `}
                title={`Split here (${isGoodSplitPoint ? 'Recommended' : 'Manual'})`}
                style={{ minWidth: '16px', minHeight: '16px' }}
              >
                <div className={`
                  w-0.5 h-3 bg-white rounded-full
                  ${isGoodSplitPoint ? 'opacity-100' : 'opacity-70'}
                `} />
              </button>
            )}
            {/* Add another space after the button */}
            <span className="text-transparent">&nbsp;</span>
          </span>
        );
      }
    });

    return <div className="leading-relaxed whitespace-pre-wrap">{elements}</div>;
  };

  // Alternative simpler approach - show text without split points in detail view
  const renderSentenceSimple = (sentence: string) => {
    return (
      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded">
        {sentence}
      </div>
    );
  };

  const getSentenceValidation = (sentence: string) => {
    const wordCount = sentence.split(' ').filter(word => word.trim().length > 0).length;
    const charCount = sentence.length;
    
    return {
      wordCount,
      charCount,
      isLong: wordCount > 20,
      isShort: wordCount < 2,
      isOptimal: wordCount >= 8 && wordCount <= 15
    };
  };

  const getValidationColor = (validation: ReturnType<typeof getSentenceValidation>) => {
    if (validation.isLong) return 'text-red-600 bg-red-50';
    if (validation.isShort) return 'text-orange-600 bg-orange-50';
    if (validation.isOptimal) return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getValidationIcon = (validation: ReturnType<typeof getSentenceValidation>) => {
    if (validation.isLong) return '⚠️';
    if (validation.isShort) return '📏';
    if (validation.isOptimal) return '✅';
    return '📝';
  };

  return (
    <div className="space-y-4">
      {/* Only show instructions if editable */}
      {editable && (
        <div className="text-sm text-gray-600 mb-4">
          <p><strong>Instructions:</strong> Click the blue circles between words to split fragments. 
          Larger circles indicate recommended split points.</p>
        </div>
      )}
      
      {sentences.map((sentence, index) => {
        const validation = getSentenceValidation(sentence);
        const isEditing = editingIndex === index;

        return (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            {/* Header with stats and controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getValidationColor(validation)}
                `}>
                  {getValidationIcon(validation)} #{index + 1}
                </span>
                
                <span className="text-sm text-gray-600">
                  <strong>{validation.wordCount}</strong> words, 
                  <strong> {validation.charCount}</strong> chars
                </span>
                
                {validation.isLong && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Too long - consider splitting
                  </span>
                )}
              </div>

              {editable && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 
                             text-gray-700 rounded transition-colors"
                    title="Edit this fragment"
                  >
                    ✏️ Edit
                  </button>
                  
                  {index < sentences.length - 1 && (
                    <button
                      onClick={() => handleMerge(index)}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 
                               text-blue-700 rounded transition-colors"
                      title="Merge with next fragment"
                    >
                      🔗 Merge
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Edit fragment text..."
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md 
                             hover:bg-green-700 transition-colors text-sm"
                  >
                    ✅ Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md 
                             hover:bg-gray-400 transition-colors text-sm"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Use simple rendering for detail view (non-editable) or complex for editable */}
                {editable ? 
                  renderSentenceWithSplitPoints(sentence, index) : 
                  renderSentenceSimple(sentence)
                }
              </>
            )}

            {/* Sentence ID display */}
            {showSentenceIds && (
              <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                ID: {articleName}_{index + 1}
              </div>
            )}
          </div>
        );
      })}

      {sentences.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No fragments to display</p>
          <p className="text-sm">Paste your article text to see fragments</p>
        </div>
      )}
    </div>
  );
};

export default SentencePreview;