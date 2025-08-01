export interface UserPreferences {
  reminderTime: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
}

export interface UserData {
  apiKey?: string;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface AppState {
  view: 'dashboard' | 'settings';
  showYesterdayCheckin: boolean;
  showAiModal: boolean;
  todayFocus: string;
  isFocusSet: boolean;
  isGenerating: boolean;
}
