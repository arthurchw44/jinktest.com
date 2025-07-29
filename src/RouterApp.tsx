
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function Layout() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> |{' '}
        <Link to="/users">Users</Link>
      </nav>
      <hr />
      <Outlet />
    </>
  );
}

export default function RouterApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />

            {/* Public route */}
            <Route path="login" element={<Login />} />

            {/* Private routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="users" element={<Users />} />
              <Route path="users/:username" element={<UserDetail />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
