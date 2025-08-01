import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTasks, RecurringTask } from '../types/task';
import type { UserData } from '../types/user';

export interface DailyQuote {
  quote: string;
  author: string;
  date: string;
  mood?: string;
}

export interface DailyQuotes {
  [date: string]: DailyQuote; // date in YYYY-MM-DD format
}

const STORAGE_KEYS = {
  GOALS: 'daily-focus-coach-goals',
  TINY_GOALS: 'daily-focus-coach-tiny-goals',
  DAILY_TASKS: 'daily-focus-coach-daily-tasks',
  RECURRING_TASKS: 'daily-focus-coach-recurring-tasks',
  USER_DATA: 'daily-focus-coach-user-data',
  DAILY_QUOTES: 'daily-focus-coach-daily-quotes',
} as const;

// Default data - empty for fresh start
const defaultGoals: Goals = {
  personal: [],
  professional: []
};

const defaultTinyGoals: TinyGoal[] = [];

const defaultDailyTasks: DailyTasks = {};

const defaultRecurringTasks: RecurringTask[] = [];

const defaultDailyQuotes: DailyQuotes = {};

const defaultUserData: UserData = {
  apiKey: '',
  preferences: {
    reminderTime: '09:00',
    theme: 'light',
    notifications: true,
    showDailyQuote: true,
  },
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    currentStreak: 0,
    longestStreak: 0,
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

  // Daily Quotes
  getDailyQuotes(): DailyQuotes {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_QUOTES);
      return stored ? JSON.parse(stored) : defaultDailyQuotes;
    } catch {
      return defaultDailyQuotes;
    }
  },

  setDailyQuotes(dailyQuotes: DailyQuotes): void {
    localStorage.setItem(STORAGE_KEYS.DAILY_QUOTES, JSON.stringify(dailyQuotes));
  },

  getDailyQuote(date: string): DailyQuote | null {
    const quotes = this.getDailyQuotes();
    return quotes[date] || null;
  },

  setDailyQuote(date: string, quote: DailyQuote): void {
    const quotes = this.getDailyQuotes();
    quotes[date] = quote;
    this.setDailyQuotes(quotes);
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
      dailyQuotes: this.getDailyQuotes(),
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
    if (data.dailyQuotes) this.setDailyQuotes(data.dailyQuotes);
  },
};
