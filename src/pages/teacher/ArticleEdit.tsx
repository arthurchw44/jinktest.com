import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateFragments, FragmentEditor } from '../../utils/sentenceFragmentSplitter';
import SentencePreview from '../../components/articles/SentencePreview';
import { useArticle, useUpdateArticleMetadata, useUpdateArticleSentences } from '../../hooks/useArticles';
import type { UpdateArticleRequest, UpdateSentencesRequest } from '../../types/article.types';

interface ArticleEditFormData {
  title: string;
  grade: string;
  subject: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

const ArticleEdit: React.FC = () => {
  const { articleName } = useParams<{ articleName: string }>();
  const navigate = useNavigate();
  
  const { data: article, isLoading, error } = useArticle(articleName!);
  const updateMetadataMutation = useUpdateArticleMetadata();
  const updateSentencesMutation = useUpdateArticleSentences();

  const [currentTab, setCurrentTab] = useState<'metadata' | 'fragments'>('metadata');
  const [formData, setFormData] = useState<ArticleEditFormData>({
    title: '',
    grade: '',
    subject: '',
    difficulty: 'A1'
  });
  
  const [fragments, setFragments] = useState<string[]>([]);
  const [fragmentEditor, setFragmentEditor] = useState<FragmentEditor | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form data when article loads
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        grade: article.metadata.grade || '',
        subject: article.metadata.subject || '',
        difficulty: article.metadata.difficulty || 'A1'
      });
      
      const sentenceTexts = article.sentences
        .sort((a, b) => a.order - b.order)
        .map(s => s.text);
      
      setFragments(sentenceTexts);
      setFragmentEditor(new FragmentEditor(sentenceTexts));
    }
  }, [article]);

  const handleInputChange = (field: keyof ArticleEditFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSplitFragment = (index: number, position: number) => {
    if (!fragmentEditor) return;
    
    try {
      const newFragments = fragmentEditor.split(fragments, index, position);
      setFragments(newFragments);
      setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(true);
      console.log('Undid last operation');
    }
  };

  const handleRedo = () => {
    if (!fragmentEditor) return;
    
    const redoFragments = fragmentEditor.redo();
    if (redoFragments) {
      setFragments(redoFragments);
      setHasUnsavedChanges(true);
      console.log('Redid operation');
    }
  };

  const handleSaveMetadata = async () => {
    if (!article || !articleName) return;

    try {
      const updateData: UpdateArticleRequest = {
        title: formData.title.trim(),
        metadata: {
          grade: formData.grade.trim() || undefined,
          subject: formData.subject.trim() || undefined,
          difficulty: formData.difficulty,
          estimatedTime: Math.ceil(fragments.length * 1.5)
        }
      };

      await updateMetadataMutation.mutateAsync({ articleName, updateData });
      setHasUnsavedChanges(false);
      alert('Article metadata updated successfully!');
    } catch (error: any) {
      console.error('Failed to update metadata:', error);
      alert(`Failed to update metadata: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSaveFragments = async () => {
    if (!article || !articleName) return;

    try {
      const sentencesData: UpdateSentencesRequest = {
        sentences: fragments.map((text, index) => ({
          order: index + 1,
          text: text.trim(),
          wordCount: text.trim().split(/\s+/).filter(w => w.length > 0).length,
          isLong: text.trim().split(/\s+/).filter(w => w.length > 0).length > 15
        }))
      };

      await updateSentencesMutation.mutateAsync({ articleName, sentences: sentencesData });
      setHasUnsavedChanges(false);
      alert('Article fragments updated successfully!');
    } catch (error: any) {
      console.error('Failed to update fragments:', error);
      alert(`Failed to update fragments: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return;
      }
    }
    navigate(`/teacher/articles/${articleName}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading article...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Article not found</div>
          <button 
            onClick={() => navigate('/teacher/articles')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  const validation = validateFragments(fragments);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-600 mt-1">
              Editing: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{article.articleName}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ You have unsaved changes. Don't forget to save your work!
            </p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setCurrentTab('metadata')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentTab === 'metadata'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Article Details
          </button>
          <button
            onClick={() => setCurrentTab('fragments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentTab === 'fragments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Edit Fragments ({fragments.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        
        {/* Metadata Tab */}
        {currentTab === 'metadata' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Article Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Name (Read-only)
                </label>
                <input
                  type="text"
                  value={article.articleName}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Article name cannot be changed after creation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            <div className="pt-4 border-t">
              <button
                onClick={handleSaveMetadata}
                disabled={updateMetadataMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {updateMetadataMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Metadata'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Fragments Tab */}
        {currentTab === 'fragments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Fragments</h2>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleUndo}
                  disabled={!fragmentEditor?.canUndo()}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded transition-colors"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!fragmentEditor?.canRedo()}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded transition-colors"
                >
                  ↷ Redo
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Fragment Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total:</span>
                  <span className="ml-1 font-medium">{validation.totalFragments}</span>
                </div>
                <div>
                  <span className="text-blue-700">Average words:</span>
                  <span className="ml-1 font-medium">{validation.averageWordCount}</span>
                </div>
                <div>
                  <span className="text-blue-700">Too long:</span>
                  <span className="ml-1 font-medium text-red-600">{validation.longFragments}</span>
                </div>
                <div>
                  <span className="text-blue-700">Too short:</span>
                  <span className="ml-1 font-medium text-orange-600">{validation.shortFragments}</span>
                </div>
              </div>
            </div>

            <SentencePreview
              sentences={fragments}
              articleName={article.articleName}
              showSentenceIds={false}
              editable={true}
              onSplit={handleSplitFragment}
              onMerge={handleMergeFragments}
              onEdit={handleEditFragment}
            />

            <div className="pt-4 border-t">
              <button
                onClick={handleSaveFragments}
                disabled={updateSentencesMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {updateSentencesMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Fragments'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(updateMetadataMutation.isError || updateSentencesMutation.isError) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {
                (updateMetadataMutation.error as Error)?.message || 
                (updateSentencesMutation.error as Error)?.message || 
                'Failed to save changes'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleEdit;