import React from 'react';
import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTask } from '../types/task';
import type { DailyQuote } from '../services/storage';

// Import sub-components
import MotivationalQuote from './MotivationalQuote';
import FocusCard from './FocusCard';
import ProgressTracker from './ProgressTracker';
import GoalsList from './GoalsList';
import TinyGoalsList from './TinyGoalsList';

interface DashboardProps {
  goals: Goals;
  tinyGoals: TinyGoal[];
  todayFocus: string;
  setTodayFocus: (focus: string) => void;
  isFocusSet: boolean;
  todayTask: DailyTask;
  completedTasksCount: number;
  totalTasks: number;
  dailyQuote: DailyQuote | null;
  isQuoteLoading: boolean;
  showDailyQuote: boolean;
  onSetFocus: () => void;
  onCompleteTodayTask: () => void;
  onAddGoal: (text: string, category: 'personal' | 'professional') => void;
  onCompleteBigGoal: (goalId: number, category: 'personal' | 'professional') => void;
  onAddTinyGoal: (text: string) => void;
  onToggleTinyGoal: (goalId: number) => void;
  onShowAiModal: () => void;
  onRefreshQuote: (mood: string) => void;
  onRefreshFocus: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  goals,
  tinyGoals,
  todayFocus,
  setTodayFocus,
  isFocusSet,
  todayTask,
  completedTasksCount,
  totalTasks,
  dailyQuote,
  isQuoteLoading,
  showDailyQuote,
  onSetFocus,
  onCompleteTodayTask,
  onAddGoal,
  onCompleteBigGoal,
  onAddTinyGoal,
  onToggleTinyGoal,
  onShowAiModal,
  onRefreshQuote,
  onRefreshFocus,
}) => {
  return (
    <div className="space-y-6">
      {/* Daily Inspirational Quote - Full Width */}
      <MotivationalQuote
        dailyQuote={dailyQuote}
        isLoading={isQuoteLoading}
        onRefreshQuote={onRefreshQuote}
        enabled={showDailyQuote}
      />

      {/* Today's Focus - Full Width */}
      <FocusCard
        todayFocus={todayFocus}
        setTodayFocus={setTodayFocus}
        isFocusSet={isFocusSet}
        todayTask={todayTask}
        onSetFocus={onSetFocus}
        onCompleteTodayTask={onCompleteTodayTask}
        onShowAiModal={onShowAiModal}
        onRefreshFocus={onRefreshFocus}
      />

      {/* Progress Tracker - Full Width */}
      <ProgressTracker
        completed={completedTasksCount}
        total={totalTasks}
      />
      
      {/* Big Goals - Full Width */}
      <GoalsList
        goals={goals}
        onAddGoal={onAddGoal}
        onCompleteBigGoal={onCompleteBigGoal}
      />
      
      {/* Tiny Goals - Full Width */}
      <TinyGoalsList
        goals={tinyGoals}
        onAddGoal={onAddTinyGoal}
        onToggleGoal={onToggleTinyGoal}
      />
    </div>
  );
};

export default Dashboard;
