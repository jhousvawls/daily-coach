import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import CompletionItem from './CompletionItem';
import type { CompletedGoal } from '../types/achievement';

interface ViewAllHistoryProps {
  achievements: CompletedGoal[];
  onMarkIncomplete: (goalId: number, type: 'big' | 'tiny') => void;
}

const ViewAllHistory: React.FC<ViewAllHistoryProps> = ({ achievements, onMarkIncomplete }) => {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'big' | 'tiny'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAchievements = achievements
    .filter(a => filter === 'all' || a.type === filter)
    .filter(a => a.text.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  
  if (!showAll) {
    return (
      <button
        onClick={() => setShowAll(true)}
        className="w-full p-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        View All History ({achievements.length} total)
      </button>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Achievements</h3>
        <button
          onClick={() => setShowAll(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'big' | 'tiny')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Goals</option>
          <option value="big">🎯 Big Goals</option>
          <option value="tiny">⚡ Tiny Goals</option>
        </select>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing {filteredAchievements.length} of {achievements.length} achievements
      </div>
      
      {/* Achievement List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => (
            <CompletionItem
              key={`${achievement.type}-${achievement.id}`}
              completion={achievement}
              onMarkIncomplete={onMarkIncomplete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No achievements found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllHistory;
