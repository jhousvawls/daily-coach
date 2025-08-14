import type { TinyGoal } from './goal';
import type { DailyTasks } from './task';
import type { AchievementStats } from './achievement';
import type { DailyQuote } from '../services/storage';

export interface TeamMember {
  id: string;
  fullName: string;
  slug: string; // URL-friendly version: "anna-smith"
  avatar?: string;
  color: string; // for visual distinction
  joinedAt: string;
  isActive: boolean;
}

export interface TeamGoal {
  id: number;
  text: string;
  description?: string;
  category: 'personal' | 'professional';
  progress: number;
  targetDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Team-specific fields
  assignedBy: string; // leader ID
  assignedTo: string; // team member ID
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
  subtasks: TeamSubTask[];
}

export interface TeamSubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface TeamMemberData {
  goals: {
    personal: TeamGoal[];
    professional: TeamGoal[];
  };
  tinyGoals: TinyGoal[];
  dailyTasks: DailyTasks;
  achievementStats: AchievementStats;
}

export interface TeamData {
  members: TeamMember[];
  memberData: { [memberId: string]: TeamMemberData };
  teamQuote: DailyQuote | null; // shared across team
  createdAt: string;
  updatedAt: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalGoalsCompleted: number;
  averageCompletionRate: number;
  upcomingDeadlines: TeamDeadline[];
  topPerformers: TeamMember[];
}

export interface TeamDeadline {
  goalId: number;
  goalText: string;
  memberName: string;
  memberId: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  daysRemaining: number;
}

export type AppMode = 'personal' | 'team';

export interface AppContext {
  mode: AppMode;
  currentTeamMember?: TeamMember;
}
