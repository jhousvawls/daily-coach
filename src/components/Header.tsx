import React, { useState, useEffect } from 'react';
import { Settings, User, LogOut, Cloud, Users, UserCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import MigrationModal from './MigrationModal';
import SyncStatusIndicator, { type SyncStatus } from './SyncStatusIndicator';
import { migrationService, type MigrationResult } from '../services/migration';
import { hybridStorage, type SyncState } from '../services/hybridStorage';

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
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're in team mode based on current route
  const isTeamMode = location.pathname.startsWith('/team');

  // Subscribe to sync state changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = hybridStorage.onSyncStateChange((state) => {
      setSyncState(state);
    });

    // Get initial sync state
    setSyncState(hybridStorage.getSyncState());

    return unsubscribe;
  }, [isAuthenticated]);

  // Check for migration needs when user authenticates
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkMigrationNeeds = () => {
      const migrationStatus = migrationService.getMigrationStatus();
      
      // Show migration modal if user has local data and hasn't migrated yet
      if (migrationStatus.needsMigration) {
        // Delay showing modal to allow UI to settle
        setTimeout(() => {
          setShowMigrationModal(true);
        }, 1000);
      }
    };

    checkMigrationNeeds();
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    setSyncState(null);
  };

  const handleMigrationComplete = (result: MigrationResult) => {
    if (result.success) {
      // Enable sync in hybrid storage
      hybridStorage.enableSync();
    }
    setShowMigrationModal(false);
  };

  const handleManualSync = async () => {
    await hybridStorage.manualSync();
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

  const getSyncStatus = (): SyncStatus => {
    if (!syncState) return 'offline';
    if (!syncState.syncEnabled) return 'offline';
    if (syncState.hasError) return 'error';
    if (syncState.isSyncing) return 'syncing';
    if (syncState.pendingOperations > 0) return 'pending';
    if (!syncState.isOnline) return 'offline';
    return 'synced';
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
          {/* Mode Toggle Buttons */}
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                !isTeamMode
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Personal Mode"
            >
              <UserCircle size={16} />
              <span className="hidden sm:inline">Personal</span>
            </button>
            <button
              onClick={() => navigate('/team')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                isTeamMode
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Team Mode"
            >
              <Users size={16} />
              <span className="hidden sm:inline">Team</span>
            </button>
          </div>

          {/* Cloud Sync Status */}
          {isAuthenticated && syncState && (
            <SyncStatusIndicator
              status={getSyncStatus()}
              lastSyncTime={syncState.lastSyncTime}
              pendingOperations={syncState.pendingOperations}
              onManualSync={handleManualSync}
            />
          )}

          {/* Authentication UI */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="User menu"
              >
                <User className="text-gray-500 dark:text-gray-400" size={20} />
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                  {getUserDisplayName()}
                </span>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      {user?.email}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Cloud size={16} />
              <span className="hidden sm:block">Sign In</span>
            </button>
          )}

          {/* Settings Button */}
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

      {/* Migration Modal */}
      <MigrationModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        onMigrationComplete={handleMigrationComplete}
      />
    </>
  );
};

export default Header;
