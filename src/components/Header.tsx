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
  view: 'dashboard' | 'settings';
  setView: (view: 'dashboard' | 'settings') => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView }) => {
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

          {/* Temporarily hide authentication - show settings button only */}
          <button
            onClick={() => setView(view === 'settings' ? 'dashboard' : 'settings')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={view === 'settings' ? 'Back to dashboard' : 'Settings'}
          >
            <Settings className="text-gray-500 dark:text-gray-400" size={20} />
          </button>
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
