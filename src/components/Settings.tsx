import React, { useState } from 'react';
import type { UserData } from '../types/user';
import { PLACEHOLDERS } from '../utils/constants';

interface SettingsProps {
  userData: UserData;
  onUpdateUserData: (updates: Partial<UserData>) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ userData, onUpdateUserData, onBack }) => {
  const [tempApiKey, setTempApiKey] = useState(userData.apiKey || '');
  const [tempReminderTime, setTempReminderTime] = useState(userData.preferences.reminderTime);
  const [tempNotifications, setTempNotifications] = useState(userData.preferences.notifications);

  const handleSave = () => {
    onUpdateUserData({
      apiKey: tempApiKey,
      preferences: {
        ...userData.preferences,
        reminderTime: tempReminderTime,
        notifications: tempNotifications,
      },
    });
    onBack();
  };

  const handleCancel = () => {
    // Reset to original values
    setTempApiKey(userData.apiKey || '');
    setTempReminderTime(userData.preferences.reminderTime);
    setTempNotifications(userData.preferences.notifications);
    onBack();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
      
      <div className="space-y-6">
        {/* API Key Section */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder={PLACEHOLDERS.API_KEY}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your key is stored locally and never sent to our servers.
          </p>
        </div>

        {/* Reminder Time Section */}
        <div>
          <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-2">
            Daily Reminder Time
          </label>
          <input
            type="time"
            id="reminderTime"
            value={tempReminderTime}
            onChange={(e) => setTempReminderTime(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow"
          />
          <p className="text-xs text-gray-500 mt-1">
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
              className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable notifications
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Receive reminders and motivational messages.
          </p>
        </div>

        {/* Stats Section */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{userData.stats.completedTasks}</div>
              <div className="text-sm text-gray-500">Tasks Completed</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{userData.stats.currentStreak}</div>
              <div className="text-sm text-gray-500">Current Streak</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{userData.stats.longestStreak}</div>
              <div className="text-sm text-gray-500">Longest Streak</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{userData.stats.totalTasks}</div>
              <div className="text-sm text-gray-500">Total Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={handleCancel}
          className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
