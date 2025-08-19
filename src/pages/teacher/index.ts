// src/pages/teacher/index.ts

// Export all teacher-related components for easy importing
export { default as TeacherDashboard } from './TeacherDashboard';
export { default as ArticleUpload } from './ArticleUpload';
export { default as ArticleList } from './ArticleList';
export { default as ArticleDetail } from './ArticleDetail';

// Re-export article components for convenience
export * from '../../components/articles/TextInput';
export * from '../../components/articles/SentencePreview';
export * from '../../components/articles/ArticleNameInput';