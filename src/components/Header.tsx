import React, { useState } from 'react';
import { Settings, User, LogOut, Cloud } from 'lucide-react';
import { APP_NAME } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

// Coach Icon Component
const CoachIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="7" r="3" />
    <path d="M12 10c-2.76 0-5 2.24-5 5v7h10v-7c0-2.76-2.24-5-5-5z" />
    <path d="M19.5 14a1.5 1.5 0 0 0-1.5-1.5H16v3h2a1.5 1.5 0 0 0 1.5-1.5z" />
    <path d="M16 14v-1" />
  </svg>
);

interface HeaderProps {
  setView: (view: 'dashboard' | 'settings') => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <>
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-orange-400 p-2 rounded-lg">
            <CoachIcon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 capitalize">
            {APP_NAME.toLowerCase()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Cloud Sync Status */}
          {isAuthenticated && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md text-xs">
              <Cloud className="w-3 h-3" />
              <span>Synced</span>
            </div>
          )}

          {/* User Menu or Sign In Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="text-white w-4 h-4" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getUserDisplayName()}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                      {user?.email}
                    </div>
                    <button
                      onClick={() => setView('settings')}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setView('settings')}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Settings"
              >
                <Settings className="text-gray-500 dark:text-gray-400" size={20} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </>
  );
};

export default Header;
