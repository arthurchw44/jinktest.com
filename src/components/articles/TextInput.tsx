// src/components/articles/TextInput.tsx
import React from 'react';
import { getFragmentStats } from '../../utils/sentenceFragmentSplitter';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your article text here...",
  className = ""
}) => {
  const getStats = () => {
    if (!value.trim()) {
      return {
        text: { characters: 0, words: 0, estimatedReadingTime: 0 },
        fragments: { 
          count: 0, 
          validation: { 
            totalFragments: 0,
            optimalRange: false,
            longFragments: 0,
            shortFragments: 0,
            emptyFragments: 0,
            averageWordCount: 0
          }, 
          list: [] 
        },
        error: null
      };
    }

    try {
      return { ...getFragmentStats(value), error: null };
    } catch (error) {
      return {
        text: { 
          characters: value.length, 
          words: value.split(/\s+/).filter(w => w.length > 0).length, 
          estimatedReadingTime: Math.ceil(value.split(/\s+/).filter(w => w.length > 0).length / 200) 
        },
        fragments: { 
          count: 0, 
          validation: { 
            totalFragments: 0,
            optimalRange: false,
            longFragments: 0,
            shortFragments: 0,
            emptyFragments: 0,
            averageWordCount: 0
          }, 
          list: [] 
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const stats = getStats();

  const getWordCountClass = () => {
    const count = stats.text.words;
    if (count === 0) return 'text-gray-500';
    if (count < 20) return 'text-red-600'; // Below minimum
    if (count > 1500) return 'text-red-600'; // Above maximum  
    if (count < 50) return 'text-yellow-600'; // Very short but acceptable
    if (count > 1000) return 'text-yellow-600'; // Long but acceptable
    return 'text-green-600';
  };

  const getFragmentCountClass = () => {
    const count = stats.fragments.count;
    if (count === 0) return 'text-gray-500';
    if (count < 10) return 'text-yellow-600';
    if (count > 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const hasError = !!stats.error;
  const canProceed = !hasError && stats.text.words >= 20 && stats.text.words <= 1500;

  return (
    <div className="space-y-4">
      {/* Main Text Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none transition-colors ${
            hasError ? 'border-red-300 bg-red-50' : ''
          } ${className}`}
          rows={12}
        />
        
        {/* Character count overlay */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
          {stats.text.characters} chars
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="text-sm text-red-700 font-medium">Article Validation Error</span>
          </div>
          <div className="text-sm text-red-600 mt-1">{stats.error}</div>
        </div>
      )}

      {/* Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Text Statistics */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-medium text-gray-700 mb-3">Text Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Word Count:</span>
              <span className={`font-mono font-bold ${getWordCountClass()}`}>
                {stats.text.words}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Characters:</span>
              <span className="font-mono text-sm">{stats.text.characters}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Est. Reading Time:</span>
              <span className="font-mono text-sm">{stats.text.estimatedReadingTime}min</span>
            </div>
          </div>
        </div>

        {/* Fragment Statistics */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-medium text-gray-700 mb-3">Fragment Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fragments:</span>
              <span className={`font-mono font-bold ${getFragmentCountClass()}`}>
                {stats.fragments.count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Words:</span>
              <span className="font-mono text-sm">{stats.fragments.validation.averageWordCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Long Fragments:</span>
              <span className={`font-mono text-sm ${
                stats.fragments.validation.longFragments > 0 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {stats.fragments.validation.longFragments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Optimal Range:</span>
              <span className={`font-mono text-sm ${
                stats.fragments.validation.optimalRange ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {stats.fragments.validation.optimalRange ? '✓ Yes' : '⚠ No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Article Guidelines</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div className="flex items-center space-x-2">
            <span className={stats.text.words >= 20 && stats.text.words <= 1500 ? '✅' : '❌'}>
            </span>
            <span>Word count: 20-1500 words (currently {stats.text.words})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={stats.fragments.validation.optimalRange ? '✅' : '⚠️'}>
            </span>
            <span>Optimal fragments: 15-25 (currently {stats.fragments.count})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={stats.fragments.validation.longFragments === 0 ? '✅' : '⚠️'}>
            </span>
            <span>Long fragments (&gt;20 words): {stats.fragments.validation.longFragments}</span>
          </div>
        </div>
        
        {!hasError && stats.text.words > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="text-xs text-blue-600">
              💡 <strong>Tip:</strong> After creating the article, you can manually split and merge fragments using the editor.
              {stats.fragments.validation.longFragments > 0 && 
                " Some fragments are long - you can split them for better dictation pacing."
              }
            </div>
          </div>
        )}
      </div>

      {/* Validation Status */}
      {!hasError && (
        <div className={`p-3 rounded-lg border ${
          canProceed 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {canProceed ? '✅' : '⚠️'}
            </span>
            <span className={`text-sm font-medium ${
              canProceed ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {canProceed 
                ? 'Article is ready to be processed!' 
                : 'Article needs adjustments before processing'
              }
            </span>
          </div>
          {!canProceed && (
            <div className={`text-sm mt-2 ${
              stats.text.words < 20 || stats.text.words > 1500 ? 'text-yellow-700' : 'text-green-700'
            }`}>
              {stats.text.words < 20 && 'Article is too short. Add more content.'}
              {stats.text.words > 1500 && 'Article is too long. Consider shortening or splitting into multiple articles.'}
              {stats.text.words >= 20 && stats.text.words <= 1500 && 'Ready to proceed - you can fine-tune fragments after creation.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};