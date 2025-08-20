import React, { useState, useEffect } from 'react';
import { splitIntoSentenceFragments, validateFragments, FragmentEditor } from '../../utils/sentenceFragmentSplitter';
import SentencePreview from '../../components/articles/SentencePreview';
import { useCreateArticle } from '../../hooks/useArticles';
import type { CreateArticleRequest } from '../../types/article.types';
import { useNavigate } from 'react-router-dom';

interface ArticleFormData {
  articleName: string;
  title: string;
  originalText: string;
  grade: string;
  subject: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

const ArticleUpload: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ArticleFormData>({
    articleName: '',
    title: '',
    originalText: '',
    grade: '',
    subject: '',
    difficulty: 'A1'
  });
  
  const [fragments, setFragments] = useState<string[]>([]);
  const [fragmentEditor, setFragmentEditor] = useState<FragmentEditor | null>(null);
  const [isGeneratingFragments, setIsGeneratingFragments] = useState(false);

  const createArticleMutation = useCreateArticle();

  const navigate = useNavigate();
  
  // Auto-generate fragments when originalText changes
  useEffect(() => {
    if (formData.originalText.trim().length > 0) {
      setIsGeneratingFragments(true);
      
      // Debounce fragment generation
      const timeoutId = setTimeout(() => {
        try {
          const newFragments = splitIntoSentenceFragments(formData.originalText);
          setFragments(newFragments);
          setFragmentEditor(new FragmentEditor(newFragments));
          console.log('Generated fragments:', newFragments);
        } catch (error) {
          console.error('Error generating fragments:', error);
        } finally {
          setIsGeneratingFragments(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setFragments([]);
      setFragmentEditor(null);
      setIsGeneratingFragments(false);
    }
  }, [formData.originalText]);

  // Auto-generate article name from title
  useEffect(() => {
    if (formData.title.trim().length > 0 && !formData.articleName) {
      const suggestedName = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 40)
        .replace(/-+$/, '');
      
      setFormData(prev => ({ ...prev, articleName: suggestedName }));
    }
  }, [formData.title, formData.articleName]);

  const handleInputChange = (field: keyof ArticleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSplitFragment = (index: number, position: number) => {
    if (!fragmentEditor) return;
    
    try {
      const newFragments = fragmentEditor.split(fragments, index, position);
      setFragments(newFragments);
      console.log(`Split fragment ${index} at position ${position}`);
    } catch (error) {
      console.error('Error splitting fragment:', error);
    }
  };

  const handleMergeFragments = (index: number) => {
    if (!fragmentEditor) return;
    
    try {
      const newFragments = fragmentEditor.merge(fragments, index);
      setFragments(newFragments);
      console.log(`Merged fragments ${index} and ${index + 1}`);
    } catch (error) {
      console.error('Error merging fragments:', error);
    }
  };

  const handleEditFragment = (index: number, newText: string) => {
    if (!fragmentEditor) return;
    
    try {
      const newFragments = fragmentEditor.edit(fragments, index, newText);
      setFragments(newFragments);
      console.log(`Edited fragment ${index}`);
    } catch (error) {
      console.error('Error editing fragment:', error);
    }
  };

  const handleUndo = () => {
    if (!fragmentEditor) return;
    
    const undoFragments = fragmentEditor.undo();
    if (undoFragments) {
      setFragments(undoFragments);
      console.log('Undid last operation');
    }
  };

  const handleRedo = () => {
    if (!fragmentEditor) return;
    
    const redoFragments = fragmentEditor.redo();
    if (redoFragments) {
      setFragments(redoFragments);
      console.log('Redid operation');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.originalText.trim().length >= 20 && 
               formData.originalText.trim().length <= 1500;
      case 2:
        return fragments.length > 0 && fragments.length <= 30;
      case 3:
        return formData.articleName.trim().length >= 3 && 
               formData.title.trim().length >= 3;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || fragments.length === 0) {
      alert('Please complete all required fields and ensure you have fragments.');
      return;
    }

    try {
      // Prepare the payload according to the backend API structure
      const payload: CreateArticleRequest = {
        articleName: formData.articleName.trim(),
        title: formData.title.trim(),
        originalText: formData.originalText.trim(),
        metadata: {
          grade: formData.grade.trim() || undefined,
          subject: formData.subject.trim() || undefined,
          difficulty: formData.difficulty,
          estimatedTime: Math.ceil(fragments.length * 1.5) // Rough estimate: 1.5 min per fragment
        },
        sentences: fragments.map((text, index) => ({
          order: index + 1,
          text: text.trim(),
          wordCount: text.trim().split(/\s+/).filter(w => w.length > 0).length,
          isLong: text.trim().split(/\s+/).filter(w => w.length > 0).length > 15
        }))
      };

      console.log('Submitting article with payload:', payload);
      
      const result = await createArticleMutation.mutateAsync(payload);
      
      alert(`Article "${result.article.title}" created successfully!`);
      
      // Reset form
      setFormData({
        articleName: '',
        title: '',
        originalText: '',
        grade: '',
        subject: '',
        difficulty: 'A1'
      });
      setFragments([]);
      setFragmentEditor(null);
      setCurrentStep(1);
      navigate('/teacher/articles'); // Redirect to articles list
      
    } catch (error: any) {
      console.error('Failed to create article:', error);
      alert(`Failed to create article: ${error.message || 'Unknown error'}`);
    }
  };

  const validation = validateFragments(fragments);
  const wordCount = formData.originalText.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Article</h1>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'}
              `}>
                {step}
              </div>
              <span className={`ml-2 text-sm ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                {step === 1 && 'Enter Text'}
                {step === 2 && 'Review Fragments'}
                {step === 3 && 'Article Details'}
              </span>
              {step < 3 && (
                <div className={`w-16 h-0.5 ml-4 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        
        {/* Step 1: Text Input */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 1: Enter Article Text</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Text *
              </label>
              <textarea
                value={formData.originalText}
                onChange={(e) => handleInputChange('originalText', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md resize-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste or type your article text here... (20-1500 words)"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>
                  {wordCount} words 
                  {isGeneratingFragments && ' (Generating fragments...)'}
                </span>
                <span className={
                  wordCount < 20 ? 'text-red-500' :
                  wordCount > 1500 ? 'text-red-500' :
                  'text-green-500'
                }>
                  {wordCount < 20 && 'Too short (minimum 20 words)'}
                  {wordCount > 1500 && 'Too long (maximum 1500 words)'}
                  {wordCount >= 20 && wordCount <= 1500 && 'Good length'}
                </span>
              </div>
            </div>

            {fragments.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Fragment Preview</h3>
                <p className="text-sm text-blue-700">
                  Generated {fragments.length} fragments. Click "Next" to review and edit them.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Fragment Review */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Step 2: Review & Edit Fragments</h2>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleUndo}
                  disabled={!fragmentEditor?.canUndo()}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-gray-700 rounded transition-colors"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!fragmentEditor?.canRedo()}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-gray-700 rounded transition-colors"
                >
                  ↷ Redo
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Fragment Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-yellow-700">Total:</span>
                  <span className="ml-1 font-medium">{validation.totalFragments}</span>
                </div>
                <div>
                  <span className="text-yellow-700">Average words:</span>
                  <span className="ml-1 font-medium">{validation.averageWordCount}</span>
                </div>
                <div>
                  <span className="text-yellow-700">Too long:</span>
                  <span className="ml-1 font-medium text-red-600">{validation.longFragments}</span>
                </div>
                <div>
                  <span className="text-yellow-700">Too short:</span>
                  <span className="ml-1 font-medium text-orange-600">{validation.shortFragments}</span>
                </div>
              </div>
            </div>

            <SentencePreview
              sentences={fragments}
              articleName={formData.articleName || 'preview'}
              showSentenceIds={false}
              editable={true}
              onSplit={handleSplitFragment}
              onMerge={handleMergeFragments}
              onEdit={handleEditFragment}
            />
          </div>
        )}

        {/* Step 3: Article Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 3: Article Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Name * (URL-friendly)
                </label>
                <input
                  type="text"
                  value={formData.articleName}
                  onChange={(e) => handleInputChange('articleName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., climate-change-news-2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Climate Change Impact on Australia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Grade 9, University, Adult"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., English, Science, History"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEFR Difficulty Level *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-md
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficient</option>
                </select>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Ready to Create</h3>
              <p className="text-sm text-green-700">
                Article with {fragments.length} fragments ready for creation. 
                Estimated time: {Math.ceil(fragments.length * 1.5)} minutes.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={!validateStep(currentStep)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!validateStep(3) || createArticleMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-md
                       hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors flex items-center"
            >
              {createArticleMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Article'
              )}
            </button>
          )}
        </div>

        {/* Error Display */}
        {createArticleMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {(createArticleMutation.error as Error)?.message || 'Failed to create article'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleUpload;