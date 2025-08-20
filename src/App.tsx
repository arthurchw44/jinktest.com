import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './routes/guards/RoleGuard';

// Import your existing pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
// import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
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


function App() {

  const location = useLocation();
  const hideNavbar = ["/login", "/unauthorized"].includes(location.pathname);
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
        </Route>

        {/* Teacher routes */}
        <Route element={<RoleGuard allow={["teacher"]} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/articles" element={<ArticleList />} />
          <Route path="/teacher/articles/create" element={<ArticleUpload />} />
          <Route path="/teacher/articles/:articleName" element={<ArticleDetail />} />
          <Route path="/teacher/articles/:articleName/edit" element={<ArticleEdit />} />
        </Route>

        {/* Student routes */}
        <Route element={<RoleGuard allow={["student"]} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>    
    </>

  );
}

export default App;
