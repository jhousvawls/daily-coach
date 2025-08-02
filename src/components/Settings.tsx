import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
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

const Settings: React.FC<SettingsProps> = ({ 
  userData, 
  recurringTasks,
  onUpdateUserData, 
  onAddRecurringTask,
  onCompleteRecurringTask,
  onBack 
}) => {
  const [tempApiKey, setTempApiKey] = useState(userData.apiKey || '');
  const [tempTheme, setTempTheme] = useState(userData.preferences.theme);
  const [tempShowDailyQuote, setTempShowDailyQuote] = useState(userData.preferences.showDailyQuote);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
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
    onBack();
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
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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

          {/* Stats Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.stats.completedTasks}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.stats.currentStreak}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.stats.longestStreak}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.stats.totalTasks}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
              </div>
            </div>
          </div>

          {/* Advanced Settings Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {showAdvancedSettings ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Advanced Settings
            </button>

            {showAdvancedSettings && (
              <div className="mt-4 space-y-4">
                {/* API Key Status and Override */}
                <div>
                  {(() => {
                    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
                    const hasEnvKey = !!envApiKey;
                    const hasUserKey = !!(tempApiKey && tempApiKey.trim());
                    
                    return (
                      <div className="space-y-3">
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

                        {/* API Key Override Input */}
                        <div>
                          <label htmlFor="apiKeyOverride" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {hasEnvKey ? 'Personal API Key (Optional Override)' : 'OpenAI API Key (Required)'}
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
                              {hasEnvKey 
                                ? "Optional: Use your own OpenAI API key to control costs or access different models."
                                : "Required for AI-generated quotes and focus synthesis."
                              } Get your API key from{' '}
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
              </div>
            )}
          </div>
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

      {/* Recurring Tasks Section */}
      <RecurringTasksList
        tasks={recurringTasks}
        onAddTask={onAddRecurringTask}
        onCompleteTask={onCompleteRecurringTask}
      />
    </div>
  );
};

export default Settings;
