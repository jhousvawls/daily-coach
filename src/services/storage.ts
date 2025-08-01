import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTasks, RecurringTask } from '../types/task';
import type { UserData } from '../types/user';

const STORAGE_KEYS = {
  GOALS: 'daily-focus-coach-goals',
  TINY_GOALS: 'daily-focus-coach-tiny-goals',
  DAILY_TASKS: 'daily-focus-coach-daily-tasks',
  RECURRING_TASKS: 'daily-focus-coach-recurring-tasks',
  USER_DATA: 'daily-focus-coach-user-data',
} as const;

// Default data
const defaultGoals: Goals = {
  personal: [
    { 
      id: 2, 
      text: 'Read 12 books this year', 
      progress: 50, 
      subtasks: [], 
      completedAt: undefined,
      category: 'personal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { 
      id: 3, 
      text: 'Run a 10k marathon', 
      progress: 10, 
      subtasks: [], 
      completedAt: undefined,
      category: 'personal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ],
  professional: [
    { 
      id: 1, 
      text: 'Launch a new personal project', 
      progress: 30, 
      subtasks: [], 
      completedAt: undefined,
      category: 'professional',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { 
      id: 4, 
      text: 'Finish Q3 marketing report', 
      progress: 100, 
      subtasks: [], 
      completedAt: '2025-07-31T10:00:00Z',
      category: 'professional',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ]
};

const defaultTinyGoals: TinyGoal[] = [
  { id: 1, text: 'Water the plants', completedAt: undefined },
  { id: 2, text: 'Take out the trash', completedAt: '2025-07-30T09:00:00Z' },
  { id: 3, text: 'Reply to mom\'s email', completedAt: undefined },
];

const defaultDailyTasks: DailyTasks = {
  '2025-07-31': { text: 'Finalize Q3 marketing report', completed: true },
  '2025-08-01': { text: '', completed: false },
};

const defaultRecurringTasks: RecurringTask[] = [
  {
    id: '1',
    text: 'Take out recycling',
    recurrenceType: 'weekly',
    weeklyDays: [1], // Monday
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    text: 'Review monthly budget',
    recurrenceType: 'monthly',
    monthlyOption: 'lastDay',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    text: 'Team standup',
    recurrenceType: 'weekly',
    weeklyDays: [1, 3, 5], // Monday, Wednesday, Friday
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    text: 'Pay bills',
    recurrenceType: 'monthly',
    monthlyOption: 'midMonth',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultUserData: UserData = {
  apiKey: '',
  preferences: {
    reminderTime: '09:00',
    theme: 'light',
    notifications: true,
  },
  stats: {
    totalTasks: 2,
    completedTasks: 1,
    currentStreak: 1,
    longestStreak: 3,
  },
};

// Storage utilities
export const storage = {
  // Goals
  getGoals(): Goals {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      return stored ? JSON.parse(stored) : defaultGoals;
    } catch {
      return defaultGoals;
    }
  },

  setGoals(goals: Goals): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  // Tiny Goals
  getTinyGoals(): TinyGoal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TINY_GOALS);
      return stored ? JSON.parse(stored) : defaultTinyGoals;
    } catch {
      return defaultTinyGoals;
    }
  },

  setTinyGoals(tinyGoals: TinyGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.TINY_GOALS, JSON.stringify(tinyGoals));
  },

  // Daily Tasks
  getDailyTasks(): DailyTasks {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
      return stored ? JSON.parse(stored) : defaultDailyTasks;
    } catch {
      return defaultDailyTasks;
    }
  },

  setDailyTasks(dailyTasks: DailyTasks): void {
    localStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(dailyTasks));
  },

  // Recurring Tasks
  getRecurringTasks(): RecurringTask[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECURRING_TASKS);
      return stored ? JSON.parse(stored) : defaultRecurringTasks;
    } catch {
      return defaultRecurringTasks;
    }
  },

  setRecurringTasks(recurringTasks: RecurringTask[]): void {
    localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(recurringTasks));
  },

  // User Data
  getUserData(): UserData {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return stored ? JSON.parse(stored) : defaultUserData;
    } catch {
      return defaultUserData;
    }
  },

  setUserData(userData: UserData): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Export data for backup
  exportData() {
    return {
      goals: this.getGoals(),
      tinyGoals: this.getTinyGoals(),
      dailyTasks: this.getDailyTasks(),
      recurringTasks: this.getRecurringTasks(),
      userData: this.getUserData(),
      exportedAt: new Date().toISOString(),
    };
  },

  // Import data from backup
  importData(data: any): void {
    if (data.goals) this.setGoals(data.goals);
    if (data.tinyGoals) this.setTinyGoals(data.tinyGoals);
    if (data.dailyTasks) this.setDailyTasks(data.dailyTasks);
    if (data.recurringTasks) this.setRecurringTasks(data.recurringTasks);
    if (data.userData) this.setUserData(data.userData);
  },
};
