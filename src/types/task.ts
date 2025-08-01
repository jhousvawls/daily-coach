export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  priority: 'high' | 'medium' | 'low';
  goalId?: string;
  aiGenerated: boolean;
  estimatedMinutes?: number;
}

export interface DailyTask {
  text: string;
  completed: boolean;
  completedAt?: string;
}

export interface DailyTasks {
  [date: string]: DailyTask;
}

export interface RecurringTask {
  id: string;
  text: string;
  recurrenceType: 'weekly' | 'monthly';
  weeklyDays?: number[]; // 0-6 (Sunday-Saturday), multiple days allowed
  monthlyOption?: 'firstDay' | 'midMonth' | 'lastDay';
  lastCompleted?: string; // ISO timestamp
  createdAt: string;
  updatedAt: string;
}
