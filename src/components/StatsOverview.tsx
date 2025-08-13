import React from 'react';
import { Trophy } from 'lucide-react';
import type { AchievementStats } from '../types/achievement';

interface StatsOverviewProps {
  stats: AchievementStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Your Progress
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCompleted}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.thisMonthCompleted}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.longestStreak}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
        </div>
      </div>
      
      {/* Additional breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>🎯 Big Goals: {stats.bigGoalsCompleted}</span>
          <span>⚡ Tiny Goals: {stats.tinyGoalsCompleted}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
