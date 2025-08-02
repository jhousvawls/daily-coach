import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, CheckCircle, AlertTriangle, Download, Trash2 } from 'lucide-react';
import type { UserData } from '../types/user';
import type { RecurringTask } from '../types/task';
import RecurringTasksList from './RecurringTasksList';

interface SettingsProps {
  userData: UserData;
  recurringTasks: RecurringTask[];
  onUpdateUserData: (updates: Partial<UserData>) => void;
  onAddRecurringTask: (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCompleteRecurringTask: (taskId: string) => void;
  onBack: () => void;
}

type TabType = 'general' | 'recurring' | 'stats' | 'advanced';

const Settings: React.FC<SettingsProps> = ({ 
  userData, 
  recurringTasks,
  onUpdateUserData, 
  onAddRecurringTask,
  onCompleteRecurringTask,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [tempApiKey, setTempApiKey] = useState(userData.apiKey || '');
  const [tempTheme, setTempTheme] = useState(userData.preferences.theme);
  const [tempShowDailyQuote, setTempShowDailyQuote] = useState(userData.preferences.showDailyQuote);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    onUpdateUserData({
      apiKey: tempApiKey,
      preferences: {
        ...userData.preferences,
        theme: tempTheme,
        showDailyQuote: tempShowDailyQuote,
      },
    });
    onBack();
  };

  const handleCancel = () => {
    // Reset to original values
    setTempApiKey(userData.apiKey || '');
    setTempTheme(userData.preferences.theme);
    setTempShowDailyQuote(userData.preferences.showDailyQuote);
    setShowThemeDropdown(false);
    setShowResetConfirm(false);
    onBack();
  };

  const handleExportData = () => {
    const exportData = {
      userData,
      recurringTasks,
      goals: JSON.parse(localStorage.getItem('daily-focus-goals') || '{"personal":[],"professional":[]}'),
      tinyGoals: JSON.parse(localStorage.getItem('daily-focus-tiny-goals') || '[]'),
      dailyTasks: JSON.parse(localStorage.getItem('daily-focus-daily-tasks') || '{}'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-focus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (showResetConfirm) {
      // Clear all localStorage data
      localStorage.removeItem('daily-focus-goals');
      localStorage.removeItem('daily-focus-tiny-goals');
      localStorage.removeItem('daily-focus-daily-tasks');
      localStorage.removeItem('daily-focus-recurring-tasks');
      localStorage.removeItem('daily-focus-user-data');
      localStorage.removeItem('daily-focus-daily-quotes');
      
      // Reload the page to reset the app state
      window.location.reload();
    } else {
      setShowResetConfirm(true);
    }
  };

  const tabs = [
    { id: 'general' as TabType, label: 'General' },
    { id: 'recurring' as TabType, label: 'Recurring' },
    { id: 'stats' as TabType, label: 'Stats' },
    { id: 'advanced' as TabType, label: 'Advanced' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Theme Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="relative" ref={themeDropdownRef}>
                <button
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow text-left bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-center justify-between"
                >
                  <span className="capitalize">{tempTheme}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                </button>
                
                {showThemeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        setTempTheme('light');
                        setShowThemeDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 first:rounded-t-lg"
                    >
                      Light
                    </button>
                    <button
                      onClick={() => {
                        setTempTheme('dark');
                        setShowThemeDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 last:rounded-b-lg"
                    >
                      Dark
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Quote Section */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={tempShowDailyQuote}
                  onChange={(e) => setTempShowDailyQuote(e.target.checked)}
                  className="w-4 h-4 text-orange-400 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-400 focus:ring-2 bg-white dark:bg-gray-700"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show daily inspirational quote
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                Display an AI-generated motivational quote above your daily focus.
              </p>
            </div>
          </div>
        );

      case 'recurring':
        return (
          <div className="space-y-6">
            <RecurringTasksList
              tasks={recurringTasks}
              onAddTask={onAddRecurringTask}
              onCompleteTask={onCompleteRecurringTask}
            />
          </div>
        );

      case 'stats':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {userData.stats.completedTasks}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</div>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {userData.stats.currentStreak}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {userData.stats.longestStreak}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</div>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {userData.stats.totalTasks}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            {/* API Key Section with Smart Status */}
            <div>
              {(() => {
                const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
                const hasEnvKey = !!envApiKey;
                const hasUserKey = !!(tempApiKey && tempApiKey.trim());
                
                return (
                  <div className="space-y-4">
                    {/* Status Display */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      {hasEnvKey ? (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            ✅ Shared API key is active. AI features are enabled for all users.
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} className="text-yellow-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            ⚠️ No shared API key found. Add your personal API key below to enable AI features.
                          </span>
                        </>
                      )}
                    </div>

                    {/* API Key Input */}
                    <div>
                      <label htmlFor="apiKeyOverride" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {hasEnvKey ? 'Personal OpenAI API Key (Optional Override)' : 'OpenAI API Key (Required)'}
                      </label>
                      <input
                        type="password"
                        id="apiKeyOverride"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder={hasEnvKey ? "sk-... (optional - leave empty to use shared key)" : "sk-... (required for AI features)"}
                        className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      />
                      <div className="mt-2 space-y-1">
                        {hasUserKey && hasEnvKey && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            🔄 Your personal API key will override the shared key for your account.
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Your key is stored locally and never sent to our servers. Get your API key from{' '}
                          <a 
                            href="https://platform.openai.com/api-keys" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 underline"
                          >
                            OpenAI Platform
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Export Data Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Download size={16} />
                Export All Data
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Download a backup of all your tasks, goals, and settings as a JSON file.
              </p>
            </div>

            {/* Reset Data Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleResetData}
                className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 size={16} />
                Reset All Data
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {showResetConfirm 
                  ? "Click again to confirm. This will permanently delete all your tasks and goals. This cannot be undone."
                  : "Permanently delete all your tasks and goals. This cannot be undone."
                }
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Panel */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h2>
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gray-700 dark:bg-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
