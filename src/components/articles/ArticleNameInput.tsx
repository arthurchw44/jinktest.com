// src/components/articles/ArticleNameInput.tsx
import React, { useEffect } from 'react';
import { validateArticleName, suggestArticleNameFromTitle } from '../../utils/sentenceFragmentSplitter';

interface ArticleNameInputProps {
  value: string;
  onChange: (value: string) => void;
  title?: string; // For auto-suggestion
  className?: string;
}

export const ArticleNameInput: React.FC<ArticleNameInputProps> = ({
  value,
  onChange,
  title = '',
  className = ''
}) => {
  const isValid = validateArticleName(value);
  const suggestion = title ? suggestArticleNameFromTitle(title) : '';

  // Auto-suggest article name when title changes (only if current value is empty)
  useEffect(() => {
    if (title && !value && suggestion) {
      onChange(suggestion);
    }
  }, [title, value, suggestion, onChange]);

  const handleSuggestionClick = () => {
    if (suggestion) {
      onChange(suggestion);
    }
  };

  const getValidationMessage = () => {
    if (!value) return null;
    
    if (value.length < 3) return 'Article name must be at least 3 characters';
    if (value.length > 50) return 'Article name must be 50 characters or less';
    if (!/^[a-zA-Z0-9_\-\(\)]+$/.test(value)) {
      return 'Only letters, numbers, underscore, dash, and parentheses allowed';
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Article Name *
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter unique article identifier..."
          className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
            !value
              ? 'border-gray-300 focus:border-blue-500'
              : isValid
              ? 'border-green-300 focus:border-green-500 bg-green-50'
              : 'border-red-300 focus:border-red-500 bg-red-50'
          } ${className}`}
          required
        />
        
        {isValid && value && (
          <div className="absolute right-3 top-3 text-green-600">
            ✓
          </div>
        )}
      </div>

      {/* Auto-suggestion */}
      {suggestion && suggestion !== value && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">Suggested:</span>
          <button
            type="button"
            onClick={handleSuggestionClick}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {suggestion}
          </button>
        </div>
      )}

      {/* Validation message */}
      {validationMessage && (
        <div className="text-xs text-red-600">
          {validationMessage}
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500">
        Used for file naming and identification. Must be unique and contain only letters, 
        numbers, underscore, dash, or parentheses.
      </div>

      {/* Preview of generated filenames */}
      {value && isValid && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <div className="font-medium mb-1">Generated files:</div>
          <div>• {value}_full_audio.mp3</div>
          <div>• {value}_sentence_1.mp3, {value}_sentence_2.mp3, ...</div>
        </div>
      )}
    </div>
  );
};