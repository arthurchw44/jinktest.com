// src/pages/teacher/ArticleUpload.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/articles/TextInput';
import { SentencePreview } from '../../components/articles/SentencePreview';
import { ArticleNameInput } from '../../components/articles/ArticleNameInput';
import { useCreateArticle } from '../../hooks/useArticles';
import { splitIntoSentenceFragments } from '../../utils/sentenceFragmentSplitter';

// Local metadata type that matches the API expectations
type ArticleMetadataUI = {
  grade?: string;
  subject?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimatedTime?: number;
};

const ArticleUpload: React.FC = () => {
  const navigate = useNavigate();
  const createArticleMutation = useCreateArticle();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [articleName, setArticleName] = useState('');
  const [title, setTitle] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [fragments, setFragments] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<ArticleMetadataUI>({
    difficulty: 'B1'
  });

  // Auto-generate fragments when text changes
  useEffect(() => {
    if (originalText.trim()) {
      try {
        const autoFragments = splitIntoSentenceFragments(originalText);
        setFragments(autoFragments);
      } catch (error) {
        console.error('Error splitting text:', error);
        setFragments([]);
      }
    } else {
      setFragments([]);
    }
  }, [originalText]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

const handleSubmit = async () => {
  if (!articleName || !title || !originalText || fragments.length === 0) {
    alert('Please complete all required fields');
    return;
  }

  try {
    // Convert fragments to sentences format for API
    const sentences = fragments.map((text, index) => ({
      order: index + 1,
      text: text.trim(),
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
      isLong: text.split(/\s+/).filter(w => w.length > 0).length > 20,
      status: 'pending' as const
    }));

    await createArticleMutation.mutateAsync({
      articleName,
      title,
      originalText,
      metadata,
      sentences
    });

    navigate('/teacher/articles');
  } catch (error) {
    console.error('Failed to create article:', error);
    alert('Failed to create article. Please try again.');
  }
};


  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return originalText.trim().length > 0 && 
               originalText.split(/\s+/).filter(w => w.length > 0).length >= 20 &&
               originalText.split(/\s+/).filter(w => w.length > 0).length <= 1500;
      case 2:
        return fragments.length > 0;
      case 3:
        return articleName.trim().length > 0 && title.trim().length > 0;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Article</h1>
        <p className="text-gray-600">Create a dictation exercise from your article</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : currentStep > step 
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                {currentStep > step ? '✓' : step}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Article Text'}
                  {step === 2 && 'Review Fragments'}
                  {step === 3 && 'Article Details'}
                </div>
                <div className="text-xs text-gray-500">
                  {step === 1 && 'Enter your article content'}
                  {step === 2 && 'Split and merge fragments'}
                  {step === 3 && 'Name and metadata'}
                </div>
              </div>
              {step < 3 && (
                <div className={`flex-1 h-px mx-4 ${
                  currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow border p-6 min-h-[500px]">
        {/* Step 1: Article Text */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Enter Article Text</h3>
              <p className="text-gray-600 mb-6">
                Paste or type your article content. The system will automatically split it into fragments 
                that you can review and adjust in the next step.
              </p>
            </div>

            <TextInput
              value={originalText}
              onChange={setOriginalText}
              placeholder="Paste your article text here. Minimum 20 words, maximum 1500 words..."
            />

            {originalText && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Preview: Auto-Generated Fragments</h4>
                <p className="text-sm text-blue-700 mb-3">
                  {fragments.length} fragments will be created. You can fine-tune them in the next step.
                </p>
                {fragments.length > 0 && (
                  <div className="text-xs text-blue-600 space-y-1 max-h-32 overflow-y-auto">
                    {fragments.slice(0, 5).map((fragment, index) => (
                      <div key={index} className="truncate">
                        {index + 1}. {fragment}
                      </div>
                    ))}
                    {fragments.length > 5 && (
                      <div className="italic">... and {fragments.length - 5} more fragments</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Fragment Review */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Review and Edit Fragments</h3>
              <p className="text-gray-600 mb-6">
                Review the automatically generated fragments. You can split long fragments, 
                merge short ones, or edit the text directly. Use the Split button to see split points 
                between words.
              </p>
            </div>

            <SentencePreview
              sentences={fragments}
              editable={true}
              onSentencesChange={setFragments}
              originalText={originalText}
              showSentenceIds={true}
            />

            {fragments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-lg font-medium mb-2">No fragments to display</p>
                <p>Go back to add article text first.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Article Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Article Details</h3>
              <p className="text-gray-600 mb-6">
                Provide a name and metadata for your article. The article name will be used 
                for identification and file naming.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <ArticleNameInput
                  value={articleName}
                  onChange={setArticleName}
                  title={title}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={metadata.subject || ''}
                    onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                    placeholder="e.g., Science, History, Literature..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    value={metadata.grade || ''}
                    onChange={(e) => setMetadata({ ...metadata, grade: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select grade level...</option>
                    <option value="elementary">Elementary</option>
                    <option value="middle">Middle School</option>
                    <option value="high">High School</option>
                    <option value="university">University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    value={metadata.difficulty || 'B1'}
                    onChange={(e) => setMetadata({ 
                      ...metadata, 
                      difficulty: e.target.value as 'A1'|'A2'|'B1'|'B2'|'C1'|'C2' 
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="A1">A1 (Beginner)</option>
                    <option value="A2">A2 (Elementary)</option>
                    <option value="B1">B1 (Intermediate)</option>
                    <option value="B2">B2 (Upper-Intermediate)</option>
                    <option value="C1">C1 (Advanced)</option>
                    <option value="C2">C2 (Proficient)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={metadata.estimatedTime || ''}
                    onChange={(e) => setMetadata({ 
                      ...metadata, 
                      estimatedTime: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Leave blank for auto-calculation"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Article Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Fragments:</span>
                  <div className="font-medium">{fragments.length}</div>
                </div>
                <div>
                  <span className="text-gray-600">Words:</span>
                  <div className="font-medium">{originalText.split(/\s+/).filter(w => w.length > 0).length}</div>
                </div>
                <div>
                  <span className="text-gray-600">Avg Words/Fragment:</span>
                  <div className="font-medium">
                    {fragments.length > 0 
                      ? Math.round(originalText.split(/\s+/).filter(w => w.length > 0).length / fragments.length)
                      : 0
                    }
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Est. Time:</span>
                  <div className="font-medium">
                    {metadata.estimatedTime || Math.ceil(originalText.split(/\s+/).filter(w => w.length > 0).length / 200)} min
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <div>
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Validation Message */}
          {!canProceed && (
            <div className="text-sm text-red-600">
              {currentStep === 1 && 'Please enter valid article text (20-1500 words)'}
              {currentStep === 2 && 'No fragments available. Check your article text.'}
              {currentStep === 3 && 'Please fill in required fields (title and article name)'}
            </div>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed || createArticleMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createArticleMutation.isPending ? 'Creating...' : 'Create Article'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleUpload;