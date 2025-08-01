import React, { useState, useRef, useEffect } from 'react';
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
  const [tempReminderTime, setTempReminderTime] = useState(userData.preferences.reminderTime);
  const [tempNotifications, setTempNotifications] = useState(userData.preferences.notifications);
  const [tempTheme, setTempTheme] = useState(userData.preferences.theme);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  
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
      preferences: {
        ...userData.preferences,
        reminderTime: tempReminderTime,
        notifications: tempNotifications,
        theme: tempTheme,
      },
    });
    onBack();
  };

  const handleCancel = () => {
    // Reset to original values
    setTempReminderTime(userData.preferences.reminderTime);
    setTempNotifications(userData.preferences.notifications);
    setTempTheme(userData.preferences.theme);
    setShowThemeDropdown(false);
    onBack();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Panel */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg transition-colors duration-200">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>
        
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

          {/* Reminder Time Section */}
          <div>
            <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Reminder Time
            </label>
            <input
              type="time"
              id="reminderTime"
              value={tempReminderTime}
              onChange={(e) => setTempReminderTime(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              When would you like to be reminded to set your daily focus?
            </p>
          </div>

          {/* Notifications Section */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={tempNotifications}
                onChange={(e) => setTempNotifications(e.target.checked)}
                className="w-4 h-4 text-orange-400 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-400 focus:ring-2 bg-white dark:bg-gray-700"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable notifications
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
              Receive reminders and motivational messages.
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
