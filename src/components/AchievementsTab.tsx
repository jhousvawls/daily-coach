import React from 'react';
import StatsOverview from './StatsOverview';
import RecentCompletions from './RecentCompletions';
import ViewAllHistory from './ViewAllHistory';
import type { AchievementStats } from '../types/achievement';
import { storage } from '../services/storage';

interface AchievementsTabProps {
  stats: AchievementStats;
  onMarkIncomplete: (goalId: number, type: 'big' | 'tiny') => void;
}

const AchievementsTab: React.FC<AchievementsTabProps> = ({
  stats,
  onMarkIncomplete
}) => {
  // Get all completed goals for the history view
  const { bigGoals, tinyGoals } = storage.getCompletedGoals();
  const allAchievements = [...bigGoals, ...tinyGoals];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview stats={stats} />
      
      {/* Recent Completions */}
      <RecentCompletions 
        completions={stats.recentCompletions} 
        onMarkIncomplete={onMarkIncomplete}
      />
      
      {/* View All History */}
      {allAchievements.length > 0 && (
        <ViewAllHistory 
          achievements={allAchievements} 
          onMarkIncomplete={onMarkIncomplete}
        />
      )}
    </div>
  );
};

export default AchievementsTab;
