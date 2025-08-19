// src/components/articles/SentencePreview.tsx
import React, { useState } from 'react';
import { splitFragmentAt, mergeFragments, findAllSplitPoints, validateFragmentMerge, FragmentEditor } from '../../utils/sentenceFragmentSplitter';

interface SentencePreviewProps {
  sentences: string[];
  articleName?: string;
  showSentenceIds?: boolean;
  editable?: boolean;
  onSentencesChange?: (sentences: string[]) => void;
  originalText?: string; // For validation
}

export const SentencePreview: React.FC<SentencePreviewProps> = ({
  sentences: initialSentences,
  articleName,
  showSentenceIds = false,
  editable = true,
  onSentencesChange,
  originalText
}) => {
  const [sentences, setSentences] = useState<string[]>(initialSentences);
  const [editor] = useState(() => new FragmentEditor(initialSentences));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [showSplitUI, setShowSplitUI] = useState<number | null>(null);

  // Update sentences when prop changes
  React.useEffect(() => {
    setSentences(initialSentences);
  }, [initialSentences]);

  const handleSentencesUpdate = (newSentences: string[]) => {
    setSentences(newSentences);
    onSentencesChange?.(newSentences);
  };

  const handleMerge = (index: number) => {
    if (index >= sentences.length - 1) return;
    const result = editor.merge(sentences, index);
    handleSentencesUpdate(result);
  };

  const handleSplit = (fragmentIndex: number, splitPosition: number) => {
    const result = editor.split(sentences, fragmentIndex, splitPosition);
    handleSentencesUpdate(result);
    setShowSplitUI(null);
  };

  const handleUndo = () => {
    const result = editor.undo();
    if (result) {
      handleSentencesUpdate(result);
    }
  };

  const handleRedo = () => {
    const result = editor.redo();
    if (result) {
      handleSentencesUpdate(result);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditText(sentences[index]);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const newSentences = [...sentences];
    newSentences[editingIndex] = editText.trim();
    handleSentencesUpdate(newSentences);
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
  };

  const WordSplitter: React.FC<{ text: string; fragmentIndex: number }> = ({ text, fragmentIndex }) => {
    const splitPoints = findAllSplitPoints(text);
    const words = text.split(/(\s+)/);
    
    let charPosition = 0;
    const elements: React.ReactNode[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isSpace = i % 2 === 1;
      
      if (!isSpace && i > 0) {
        // Add split button before each word (except the first)
        const splitPoint = splitPoints.find(sp => sp.position === charPosition);
        if (splitPoint) {
          elements.push(
            <button
              key={`split-${charPosition}`}
              onClick={() => handleSplit(fragmentIndex, charPosition)}
              className="inline-block w-px h-4 bg-blue-400 hover:bg-blue-600 hover:w-0.5 transition-all cursor-pointer mx-0.5"
              title={splitPoint.reason}
            />
          );
        }
      }
      
      elements.push(
        <span key={`word-${i}`} className={isSpace ? '' : 'hover:bg-yellow-100'}>
          {word}
        </span>
      );
      
      charPosition += word.length;
    }
    
    return <span className="relative">{elements}</span>;
  };

  const getFragmentStats = (fragment: string) => {
    const wordCount = fragment.split(/\s+/).filter(w => w.length > 0).length;
    return {
      words: wordCount,
      chars: fragment.length,
      isLong: wordCount > 20,
      isShort: wordCount < 3 && wordCount > 0
    };
  };

  const validateMergeResult = () => {
    if (!originalText) return null;
    const isValid = validateFragmentMerge(sentences, originalText);
    return isValid;
  };

  const mergeValidation = validateMergeResult();

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      {editable && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUndo}
              disabled={!editor.canUndo()}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={!editor.canRedo()}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↷ Redo
            </button>
            <div className="text-sm text-gray-600">
              {sentences.length} fragments
            </div>
          </div>
          
          {/* Merge Validation */}
          {mergeValidation !== null && (
            <div className={`text-sm px-3 py-1 rounded ${
              mergeValidation 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {mergeValidation 
                ? '✓ Fragments can recreate original text' 
                : '⚠ Fragments may not recreate original text exactly'}
            </div>
          )}
        </div>
      )}

      {/* Fragments */}
      <div className="space-y-3">
        {sentences.map((sentence, index) => {
          const stats = getFragmentStats(sentence);
          const isEditing = editingIndex === index;
          const isShowingSplit = showSplitUI === index;
          
          return (
            <div
              key={index}
              className={`p-4 border rounded-lg transition-all ${
                stats.isLong ? 'border-yellow-300 bg-yellow-50' :
                stats.isShort ? 'border-blue-300 bg-blue-50' :
                'border-gray-200 bg-white'
              } ${isShowingSplit ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Fragment Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {showSentenceIds && (
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {stats.words} words, {stats.chars} chars
                  </span>
                  {stats.isLong && <span className="text-xs text-yellow-600">⚠ Long</span>}
                  {stats.isShort && <span className="text-xs text-blue-600">ⓘ Short</span>}
                </div>
                
                {editable && !isEditing && (
                  <div className="flex items-center space-x-1">
                    {/* Split Button */}
                    <button
                      onClick={() => setShowSplitUI(isShowingSplit ? null : index)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        isShowingSplit 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                      title="Click to show split points"
                    >
                      ✂️ Split
                    </button>
                    
                    {/* Merge Button */}
                    {index < sentences.length - 1 && (
                      <button
                        onClick={() => handleMerge(index)}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        title="Merge with next fragment"
                      >
                        🔗 Merge
                      </button>
                    )}
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => startEditing(index)}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Fragment Content */}
              <div className="text-sm text-gray-800">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isShowingSplit ? (
                  <div className="space-y-2">
                    <div className="text-xs text-blue-600 mb-2">
                      👆 Click on the blue lines to split at that position
                    </div>
                    <div className="leading-relaxed">
                      <WordSplitter text={sentence} fragmentIndex={index} />
                    </div>
                  </div>
                ) : (
                  <p className="leading-relaxed">{sentence}</p>
                )}
              </div>
              
              {/* Audio Preview (if available) */}
              {articleName && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Audio: {articleName}_sentence_{index + 1}.mp3
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t">
        Total: {sentences.length} fragments, {' '}
        {sentences.reduce((sum, s) => sum + s.split(/\s+/).filter(w => w.length > 0).length, 0)} words
      </div>
    </div>
  );
};