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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Focus Card */}
      <div className="lg:col-span-2 space-y-6">
        <FocusCard
          todayFocus={todayFocus}
          setTodayFocus={setTodayFocus}
          isFocusSet={isFocusSet}
          todayTask={todayTask}
          onSetFocus={onSetFocus}
          onCompleteTodayTask={onCompleteTodayTask}
          onShowAiModal={onShowAiModal}
        />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <ProgressTracker
          completed={completedTasksCount}
          total={totalTasks}
        />
        
        <GoalsList
          goals={goals}
          onAddGoal={onAddGoal}
          onCompleteBigGoal={onCompleteBigGoal}
        />
        
        <TinyGoalsList
          goals={tinyGoals}
          onAddGoal={onAddTinyGoal}
          onToggleGoal={onToggleTinyGoal}
        />
        
        <RecurringTasksList
          tasks={recurringTasks}
          onAddTask={onAddRecurringTask}
          onCompleteTask={onCompleteRecurringTask}
        />
      </div>
    </div>
  );
};

export default Dashboard;
