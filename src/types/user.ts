export interface UserPreferences {
  reminderTime: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  showDailyQuote: boolean;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
}

export interface DailyFocusHistory {
  focus: string;
  date: string;
  method: 'highest_impact' | 'quick_win' | 'personal_priority' | 'ai_decide';
  completed?: boolean;
}

export interface DailyFocus {
  current: string;
  date: string; // YYYY-MM-DD
  method: 'highest_impact' | 'quick_win' | 'personal_priority' | 'ai_decide';
  subtasks?: string[];
  history: DailyFocusHistory[];
}

export interface UserData {
  apiKey?: string;
  preferences: UserPreferences;
  stats: UserStats;
  dailyFocus?: DailyFocus;
}

export interface AppState {
  view: 'dashboard' | 'settings';
  showYesterdayCheckin: boolean;
  showAiModal: boolean;
  todayFocus: string;
  isFocusSet: boolean;
  isGenerating: boolean;
}
