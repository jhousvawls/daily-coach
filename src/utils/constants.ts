export const APP_NAME = 'Daily Focus Coach';

export const STORAGE_KEYS = {
  GOALS: 'daily-focus-coach-goals',
  TINY_GOALS: 'daily-focus-coach-tiny-goals',
  DAILY_TASKS: 'daily-focus-coach-daily-tasks',
  USER_DATA: 'daily-focus-coach-user-data',
  APP_STATE: 'daily-focus-coach-app-state',
} as const;

export const GOAL_CATEGORIES = {
  PERSONAL: 'personal',
  PROFESSIONAL: 'professional',
} as const;

export const TASK_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const AI_MODELS = {
  GPT_4: 'gpt-4',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
} as const;

export const INSIGHT_TYPES = {
  PATTERN: 'pattern',
  RECOMMENDATION: 'recommendation',
  MOTIVATION: 'motivation',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  ACCENT: '#F59E0B',
  ORANGE: '#F97316',
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;

export const API_ENDPOINTS = {
  OPENAI: 'https://api.openai.com/v1',
} as const;

export const DEFAULT_SETTINGS = {
  REMINDER_TIME: '09:00',
  THEME: THEMES.LIGHT,
  NOTIFICATIONS: true,
  AI_MODEL: AI_MODELS.GPT_4,
} as const;

export const VALIDATION = {
  MIN_GOAL_LENGTH: 3,
  MAX_GOAL_LENGTH: 200,
  MIN_TASK_LENGTH: 3,
  MAX_TASK_LENGTH: 500,
  MAX_BRAIN_DUMP_LENGTH: 2000,
} as const;

export const MESSAGES = {
  FOCUS_QUESTION: "What is the most important thing you can work on today?",
  YESTERDAY_CHECKIN: "Did you complete yesterday's focus?",
  AI_BRAIN_DUMP_PROMPT: "List everything on your mind. The AI will help you find the most important task to focus on.",
  NO_GOALS_YET: "No goals yet. Add your first goal to get started!",
  NO_TASKS_YET: "No tasks completed yet. Start building your streak!",
  API_KEY_REQUIRED: "Please configure your OpenAI API key in settings to use AI features.",
  GOAL_COMPLETED: "Congratulations! Goal completed!",
  TASK_COMPLETED: "Great job! Task completed!",
} as const;

export const PLACEHOLDERS = {
  GOAL_INPUT: "Add a new goal...",
  TASK_INPUT: "What's your focus for today?",
  BRAIN_DUMP: "- Finish report for marketing\n- Call the vet to make an appointment\n- Need to start planning the Q4 project\n- Buy groceries",
  API_KEY: "Enter your OpenAI API key",
} as const;

export const ICONS = {
  SIZE: {
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
  },
} as const;
