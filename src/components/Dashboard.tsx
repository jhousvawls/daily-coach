import React from 'react';
import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTasks, DailyTask, RecurringTask } from '../types/task';

// Import sub-components
import FocusCard from './FocusCard';
import ProgressTracker from './ProgressTracker';
import GoalsList from './GoalsList';
import TinyGoalsList from './TinyGoalsList';
import RecurringTasksList from './RecurringTasksList';

interface DashboardProps {
  goals: Goals;
  dailyTasks: DailyTasks;
  tinyGoals: TinyGoal[];
  recurringTasks: RecurringTask[];
  todayFocus: string;
  setTodayFocus: (focus: string) => void;
  isFocusSet: boolean;
  todayTask: DailyTask;
  completedTasksCount: number;
  totalTasks: number;
  onSetFocus: () => void;
  onCompleteTodayTask: () => void;
  onAddGoal: (text: string, category: 'personal' | 'professional') => void;
  onCompleteBigGoal: (goalId: number, category: 'personal' | 'professional') => void;
  onAddTinyGoal: (text: string) => void;
  onToggleTinyGoal: (goalId: number) => void;
  onAddRecurringTask: (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCompleteRecurringTask: (taskId: string) => void;
  onShowAiModal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  goals,
  dailyTasks,
  tinyGoals,
  recurringTasks,
  todayFocus,
  setTodayFocus,
  isFocusSet,
  todayTask,
  completedTasksCount,
  totalTasks,
  onSetFocus,
  onCompleteTodayTask,
  onAddGoal,
  onCompleteBigGoal,
  onAddTinyGoal,
  onToggleTinyGoal,
  onAddRecurringTask,
  onCompleteRecurringTask,
  onShowAiModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Today's Focus - Full Width */}
      <FocusCard
        todayFocus={todayFocus}
        setTodayFocus={setTodayFocus}
        isFocusSet={isFocusSet}
        todayTask={todayTask}
        onSetFocus={onSetFocus}
        onCompleteTodayTask={onCompleteTodayTask}
        onShowAiModal={onShowAiModal}
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
      
      {/* Recurring Tasks - Full Width */}
      <RecurringTasksList
        tasks={recurringTasks}
        onAddTask={onAddRecurringTask}
        onCompleteTask={onCompleteRecurringTask}
      />
    </div>
  );
};

export default Dashboard;
