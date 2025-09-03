import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './routes/guards/RoleGuard';

// Import your existing pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
// import TeacherDashboard from './pages/TeacherDashboard';
// import StudentDashboard from './pages/StudentDashboard';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Import new admin pages
import Groups from './pages/admin/Groups';
import BulkOperations from './pages/admin/BulkOperations';

import UserDetail from './pages/UserDetail';
import UserProfile from './pages/UserProfile';
import Navbar from './components/Navbar';
import { useLocation } from 'react-router-dom';


import { TeacherDashboard, ArticleList, ArticleUpload, ArticleDetail } from './pages/teacher';
import ArticleEdit from './pages/teacher/ArticleEdit';

import DictationPracticePage from './pages/student/DictationPractice';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentArticleList from './pages/student/StudentArticleList';

import AdminArticlesDashboard from './pages/admin/AdminArticlesDashboard';
import AdminArticleDetail from './pages/admin/AdminArticleDetail';
import StudentAnalytics from './pages/teacher/StudentAnalytics';
import StudentArticleProgressPage from './pages/student/StudentArticleProgressPage';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';


function App() {

  const location = useLocation();
  const hideNavbar = ["/login", "/unauthorized"].includes(location.pathname);
  // Add to your main index.tsx or App.tsx
  // Preload audio files for better performance
  // const preloadCriticalAudio = (audioUrls: string[]) => {
  //   audioUrls.forEach(url => {
  //     const audio = new Audio();
  //     audio.preload = 'metadata';
  //     audio.src = url;
  //   });
  // };

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />


        <Route element={<RoleGuard />}>
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* Admin routes */}
        <Route element={<RoleGuard allow={["admin"]} />}>
          {/* <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/groups" element={<Groups />} />
          <Route path="/admin/bulk-operations" element={<BulkOperations />} /> */}


            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/users/:username" element={<UserDetail />} />
            <Route path="/admin/groups" element={<Groups />} />
            <Route path="/admin/bulk-operations" element={<BulkOperations />} />

            <Route path="/admin/articles" element={<AdminArticlesDashboard />} />
            <Route path="/admin/articles/:articleName" element={<AdminArticleDetail />} />
        </Route>

        {/* Teacher routes */}
        <Route element={<RoleGuard allow={["teacher"]} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/articles" element={<ArticleList />} />
          <Route path="/teacher/articles/create" element={<ArticleUpload />} />
          <Route path="/teacher/articles/:articleName" element={<ArticleDetail />} />
          <Route path="/teacher/articles/:articleName/edit" element={<ArticleEdit />} />
          <Route path="/teacher/practice/:articleName" element={<DictationPracticePage />} />
          <Route path="/teacher/analytics/students" element={<StudentAnalytics />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
        </Route>

        {/* Student routes */}
        <Route element={<RoleGuard allow={["student"]} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/articles" element={<StudentArticleList />} />
           <Route path="student/practice/:articleName" element={<DictationPracticePage />} /> 
           <Route path="/student/progress/:articleName" element={<StudentArticleProgressPage />} />
        </Route>


        {/* Teacher/Admin preview*/}
        <Route element={<RoleGuard allow={['teacher', 'admin']} />}>
          <Route path="/teacher/practice/:articleName" element={<DictationPracticePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>    
    </>

  );
}

export default App;
