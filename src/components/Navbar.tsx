// 1. Import dependencies at the top
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import { useState } from 'react';
import { LogoutAllConfirmModal } from './auth/LogoutAllConfirmModal'; // Adjust path if needed


export default function Navbar() {
  const { user, logout, loading, logoutAll } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Add these states inside the Navbar component
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState<boolean>(false); 


  if (loading)return null;
  if (!user) return null; // Or show a minimal login link

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
      <Link to={`/${user.role}`} className="text-xl font-bold text-blue-700">Your App</Link>
      {/* Right side: User profile menu */}
      <div className="relative ml-auto">
        <button
          onClick={() => setShowUserMenu(v => !v)}
          className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span className="sr-only">Open user menu</span>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.fullname?.charAt(0).toUpperCase()}
            </span>
          </div>
        </button>

{user.role === 'admin' && (
  <div className="ml-auto">
    <div className="relative">
      <button
        onClick={() => setShowAdminMenu(v => !v)}
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >Admin
      </button>
      
      {showAdminMenu && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <Link 
              to="/admin/users" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowAdminMenu(false)}
            >
              User Management
            </Link>
            <Link 
              to="/admin/articles" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowAdminMenu(false)}
            >
              Article Management
            </Link>
            <Link 
              to="/admin/groups" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowAdminMenu(false)}
            >
              Group Management
            </Link>
            <Link 
              to="/admin/bulk-operations" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowAdminMenu(false)}
            >
              Bulk Operations
            </Link>
          </div>
        </div>
      )}
    </div>
  </div>
)}



        {/* // Update the user menu dropdown section to include logout all option: */}
        {showUserMenu && (
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                Your Profile
              </Link>
              <button
                onClick={() => {
                  alert('Password change modal not yet wired up!');
                  setShowUserMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Change Password
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  setShowLogoutAllConfirm(true);
                  setShowUserMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zM11 5V3a2 2 0 112 0v2M7 7h10" />
                  </svg>
                  Logout All Devices
                </div>
              </button>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {showLogoutAllConfirm && (
          <LogoutAllConfirmModal
            isOpen={showLogoutAllConfirm}
            onClose={() => setShowLogoutAllConfirm(false)}
            onConfirm={async () => {
              await logoutAll();
              setShowLogoutAllConfirm(false);
            }}
          />
        )}


      </div>


    </nav>
  );
}
