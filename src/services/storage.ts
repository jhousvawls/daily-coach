import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTasks, RecurringTask } from '../types/task';
import type { UserData } from '../types/user';
import type { CompletedGoal, AchievementStats } from '../types/achievement';
import { cloudStorage } from './cloudStorage';

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

  async getDailyQuote(date: string): Promise<DailyQuote | null> {
    // Temporarily disable cloud storage - use localStorage only
    const quotes = this.getDailyQuotes();
    return quotes[date] || null;
  },

  async setDailyQuote(date: string, quote: DailyQuote): Promise<void> {
    // Temporarily disable cloud storage - use localStorage only
    const quotes = this.getDailyQuotes();
    quotes[date] = quote;
    this.setDailyQuotes(quotes);
  },

  // Synchronous version for backward compatibility
  getDailyQuoteSync(date: string): DailyQuote | null {
    const quotes = this.getDailyQuotes();
    return quotes[date] || null;
  },

  setDailyQuoteSync(date: string, quote: DailyQuote): void {
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

  // Date-based utility methods
  hasDataForDate(date: string): boolean {
    const dailyTasks = this.getDailyTasks();
    const dailyQuotes = this.getDailyQuotes();
    const goals = this.getGoals();
    const tinyGoals = this.getTinyGoals();

    // Check if there's a daily task for this date
    if (dailyTasks[date]) return true;

    // Check if there's a quote for this date
    if (dailyQuotes[date]) return true;

    // Check if any goals were completed on this date
    const allGoals = [...goals.personal, ...goals.professional];
    if (allGoals.some(goal => goal.completedAt && goal.completedAt.startsWith(date))) return true;

    // Check if any tiny goals were completed on this date
    if (tinyGoals.some(goal => goal.completedAt && goal.completedAt.startsWith(date))) return true;

    return false;
  },

  getDataForDate(date: string) {
    const dailyTasks = this.getDailyTasks();
    const dailyQuotes = this.getDailyQuotes();
    const goals = this.getGoals();
    const tinyGoals = this.getTinyGoals();

    // Get daily task for this date
    const dailyTask = dailyTasks[date] || { text: '', completed: false };

    // Get quote for this date
    const dailyQuote = dailyQuotes[date] || null;

    // Get goals completed on this date
    const allGoals = [...goals.personal, ...goals.professional];
    const goalsCompletedOnDate = allGoals.filter(goal => 
      goal.completedAt && goal.completedAt.startsWith(date)
    );

    // Get tiny goals completed on this date
    const tinyGoalsCompletedOnDate = tinyGoals.filter(goal => 
      goal.completedAt && goal.completedAt.startsWith(date)
    );

    return {
      dailyTask,
      dailyQuote,
      goalsCompletedOnDate,
      tinyGoalsCompletedOnDate,
      hasData: this.hasDataForDate(date)
    };
  },

  // Get completion stats for date ranges
  getCompletionStats(startDate: string, endDate: string) {
    const dailyTasks = this.getDailyTasks();
    const stats = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const task = dailyTasks[dateStr];
      
      stats.push({
        date: dateStr,
        hasTask: !!task?.text,
        completed: !!task?.completed,
        taskText: task?.text || ''
      });
    }
    
    return stats;
  },

  // Achievement-specific methods
  getCompletedGoals(): { bigGoals: CompletedGoal[], tinyGoals: CompletedGoal[] } {
    const goals = this.getGoals();
    const tinyGoals = this.getTinyGoals();
    
    const completedBigGoals: CompletedGoal[] = [];
    const completedTinyGoals: CompletedGoal[] = [];
    
    // Process big goals
    [...goals.personal, ...goals.professional].forEach(goal => {
      if (goal.completedAt) {
        const createdDate = new Date(goal.createdAt);
        const completedDate = new Date(goal.completedAt);
        const completionTimeInDays = Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        completedBigGoals.push({
          id: goal.id,
          text: goal.text,
          type: 'big',
          category: goal.category,
          completedAt: goal.completedAt,
          createdAt: goal.createdAt,
          completionTimeInDays: Math.max(0, completionTimeInDays)
        });
      }
    });
    
    // Process tiny goals
    tinyGoals.forEach(goal => {
      if (goal.completedAt) {
        // For tiny goals, use createdAt if available, otherwise use completedAt as fallback
        const createdAt = goal.createdAt || goal.completedAt;
        const createdDate = new Date(createdAt);
        const completedDate = new Date(goal.completedAt);
        const completionTimeInDays = goal.createdAt 
          ? Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        completedTinyGoals.push({
          id: goal.id,
          text: goal.text,
          type: 'tiny',
          completedAt: goal.completedAt,
          createdAt: createdAt,
          completionTimeInDays: Math.max(0, completionTimeInDays)
        });
      }
    });
    
    return { bigGoals: completedBigGoals, tinyGoals: completedTinyGoals };
  },

  getCompletedGoalsForDate(date: string): { bigGoals: CompletedGoal[], tinyGoals: CompletedGoal[] } {
    const { bigGoals, tinyGoals } = this.getCompletedGoals();
    
    const bigGoalsForDate = bigGoals.filter(goal => 
      goal.completedAt.startsWith(date)
    );
    
    const tinyGoalsForDate = tinyGoals.filter(goal => 
      goal.completedAt.startsWith(date)
    );
    
    return { bigGoals: bigGoalsForDate, tinyGoals: tinyGoalsForDate };
  },

  getAchievementStats(): AchievementStats {
    const { bigGoals, tinyGoals } = this.getCompletedGoals();
    const allCompletions = [...bigGoals, ...tinyGoals];
    
    // Sort by completion date (most recent first)
    allCompletions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    
    // Calculate this month's completions
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCompleted = allCompletions.filter(goal => 
      new Date(goal.completedAt) >= thisMonthStart
    ).length;
    
    // Calculate current streak (consecutive days with completions)
    const currentStreak = this.calculateCurrentStreak(allCompletions);
    
    // Calculate longest streak
    const longestStreak = this.calculateLongestStreak(allCompletions);
    
    return {
      totalCompleted: allCompletions.length,
      bigGoalsCompleted: bigGoals.length,
      tinyGoalsCompleted: tinyGoals.length,
      thisMonthCompleted,
      currentStreak,
      longestStreak,
      recentCompletions: allCompletions.slice(0, 10) // Last 10 completions
    };
  },

  calculateCurrentStreak(completions: CompletedGoal[]): number {
    if (completions.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const completionDates = new Set(
      completions.map(c => c.completedAt.split('T')[0])
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check if today has completions, if not start from yesterday
    if (!completionDates.has(today)) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Count consecutive days with completions
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (completionDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  },

  calculateLongestStreak(completions: CompletedGoal[]): number {
    if (completions.length === 0) return 0;
    
    const completionDates = Array.from(new Set(
      completions.map(c => c.completedAt.split('T')[0])
    )).sort();
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < completionDates.length; i++) {
      const prevDate = new Date(completionDates[i - 1]);
      const currentDate = new Date(completionDates[i]);
      const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  },
};
