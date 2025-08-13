export interface CompletedGoal {
  id: number;
  text: string;
  type: 'big' | 'tiny';
  category?: 'personal' | 'professional'; // for big goals only
  completedAt: string;
  createdAt: string;
  completionTimeInDays: number;
}

export interface AchievementStats {
  totalCompleted: number;
  bigGoalsCompleted: number;
  tinyGoalsCompleted: number;
  thisMonthCompleted: number;
  currentStreak: number;
  longestStreak: number;
  recentCompletions: CompletedGoal[];
}
