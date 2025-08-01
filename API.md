# Daily Focus Coach - API Documentation

This document describes the API integrations, data structures, and external service configurations for the Daily Focus Coach application.

## Table of Contents

1. [OpenAI API Integration](#openai-api-integration)
2. [Data Models](#data-models)
3. [Local Storage API](#local-storage-api)
4. [Service Layer](#service-layer)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Security](#security)

## OpenAI API Integration

The Daily Focus Coach integrates with OpenAI's GPT-4 API to provide AI-powered productivity insights and recommendations.

### Configuration

```typescript
// src/services/ai.ts
class AIService {
  private apiKey: string = '';
  private baseUrl = 'https://api.openai.com/v1';
  
  setApiKey(key: string): void {
    this.apiKey = key;
  }
}
```

### API Endpoints Used

#### Chat Completions
- **Endpoint**: `POST /v1/chat/completions`
- **Purpose**: Generate AI responses for focus synthesis, pattern analysis, and recommendations
- **Model**: GPT-4
- **Rate Limit**: 3 requests per minute (recommended)

### AI Functions

#### 1. Focus Synthesis from Brain Dump

**Purpose**: Analyze a user's brain dump and identify the most important task.

**Input**:
```typescript
interface BrainDumpRequest {
  brainDump: string;  // User's list of tasks and thoughts
}
```

**API Call**:
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a productivity coach that helps people identify their most important daily priority. Be concise and actionable.'
      },
      {
        role: 'user',
        content: `From the following brain dump of tasks and thoughts, identify and phrase the single most important priority for today. Be concise and actionable. Focus on what would have the biggest impact.\n\nBrain dump: "${brainDump}"\n\nRespond with just the prioritized task, nothing else.`
      }
    ],
    max_tokens: 100,
    temperature: 0.7,
  }),
});
```

**Output**:
```typescript
interface FocusSynthesisResponse {
  prioritizedTask: string;  // The most important task identified by AI
}
```

#### 2. Pattern Analysis

**Purpose**: Analyze user's task completion history to identify productivity patterns.

**Input**:
```typescript
interface PatternAnalysisRequest {
  dailyTasks: DailyTasks;
  goals: Goals;
}
```

**API Call**:
```typescript
const prompt = `Analyze this user's task completion history and goals to provide insights:

Completed Tasks:
${completedTasks.map(t => `${t.date}: ${t.task}`).join('\n')}

Current Goals:
Personal: ${goals.personal.map(g => g.text).join(', ')}
Professional: ${goals.professional.map(g => g.text).join(', ')}

Provide 2-3 insights in JSON format with this structure:
[
  {
    "type": "pattern|recommendation|motivation",
    "title": "Brief title",
    "content": "Actionable insight",
    "confidence": 0.8
  }
]`;
```

**Output**:
```typescript
interface AIInsight {
  type: 'pattern' | 'recommendation' | 'motivation';
  title: string;
  content: string;
  confidence: number;
}

type PatternAnalysisResponse = AIInsight[];
```

#### 3. Goal Breakdown

**Purpose**: Break down a large goal into actionable daily tasks.

**Input**:
```typescript
interface GoalBreakdownRequest {
  goalText: string;
  targetDate?: string;
  userContext?: string;
}
```

**Output**:
```typescript
interface GoalBreakdownResponse {
  tasks: string[];  // Array of 5-7 actionable daily tasks
}
```

#### 4. Priority Recommendation

**Purpose**: Recommend the most important task based on user's context.

**Input**:
```typescript
interface PriorityRecommendationRequest {
  goals: Goals;
  recentTasks: DailyTasks;
  tinyGoals: TinyGoal[];
}
```

**Output**:
```typescript
interface PriorityRecommendationResponse {
  recommendedTask: string;
  reasoning?: string;
}
```

#### 5. Daily Quote Generation

**Purpose**: Generate inspirational quotes with mood-specific targeting.

**Input**:
```typescript
interface DailyQuoteRequest {
  mood: 'motivational' | 'business' | 'funny' | 'dad-joke';
}
```

**API Call**:
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a Daily Focus Coach delivering inspirational quotes to busy professionals.'
      },
      {
        role: 'user',
        content: `Generate a ${mood} quote from business thinkers like Jim Rohn, Naval Ravikant, Derek Sivers, Paul Graham, Adam Grant, etc. Format: "Quote" — Author`
      }
    ],
    max_tokens: 100,
    temperature: 0.8,
  }),
});
```

**Output**:
```typescript
interface DailyQuoteResponse {
  quote: string;
  author: string;
}
```

## Data Models

### Core Data Structures

#### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: string; // ISO 8601 timestamp
  priority: 'high' | 'medium' | 'low';
  goalId?: string;
  aiGenerated: boolean;
  estimatedMinutes?: number;
}
```

#### DailyTask
```typescript
interface DailyTask {
  text: string;
  completed: boolean;
  completedAt?: string; // ISO 8601 timestamp
}

interface DailyTasks {
  [date: string]: DailyTask; // date in YYYY-MM-DD format
}
```

#### Goal
```typescript
interface Goal {
  id: number;
  text: string;
  description?: string;
  category: 'personal' | 'professional';
  targetDate?: string; // YYYY-MM-DD format
  progress: number; // 0-100 percentage
  subtasks: SubTask[];
  completedAt?: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string; // ISO 8601 timestamp
}

interface Goals {
  personal: Goal[];
  professional: Goal[];
}
```

#### TinyGoal
```typescript
interface TinyGoal {
  id: number;
  text: string;
  completedAt?: string; // ISO 8601 timestamp
}
```

#### UserData
```typescript
interface UserData {
  apiKey?: string;
  preferences: UserPreferences;
  stats: UserStats;
}

interface UserPreferences {
  reminderTime: string; // HH:MM format
  theme: 'light' | 'dark';
  notifications: boolean;
}

interface UserStats {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
}
```

## Local Storage API

The application uses browser localStorage for data persistence. All data is stored locally and never sent to external servers (except for AI API calls).

### Storage Keys

```typescript
const STORAGE_KEYS = {
  GOALS: 'daily-focus-coach-goals',
  TINY_GOALS: 'daily-focus-coach-tiny-goals',
  DAILY_TASKS: 'daily-focus-coach-daily-tasks',
  USER_DATA: 'daily-focus-coach-user-data',
} as const;
```

### Storage Service API

```typescript
interface StorageService {
  // Goals
  getGoals(): Goals;
  setGoals(goals: Goals): void;
  
  // Tiny Goals
  getTinyGoals(): TinyGoal[];
  setTinyGoals(tinyGoals: TinyGoal[]): void;
  
  // Daily Tasks
  getDailyTasks(): DailyTasks;
  setDailyTasks(dailyTasks: DailyTasks): void;
  
  // User Data
  getUserData(): UserData;
  setUserData(userData: UserData): void;
  
  // Utility
  clearAll(): void;
  exportData(): BackupData;
  importData(data: BackupData): void;
}
```

### Data Export/Import

```typescript
interface BackupData {
  goals: Goals;
  tinyGoals: TinyGoal[];
  dailyTasks: DailyTasks;
  userData: UserData;
  exportedAt: string; // ISO 8601 timestamp
}

// Export data
const backup = storage.exportData();
const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup))}`;

// Import data
const importData = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target?.result as string);
    storage.importData(data);
  };
  reader.readAsText(file);
};
```

## Service Layer

### AI Service

```typescript
interface AIService {
  setApiKey(key: string): void;
  synthesizeFocusFromBrainDump(brainDump: string): Promise<string>;
  analyzePatterns(dailyTasks: DailyTasks, goals: Goals): Promise<AIInsight[]>;
  breakdownGoal(goalText: string, targetDate?: string): Promise<string[]>;
  recommendPriority(goals: Goals, recentTasks: DailyTasks, tinyGoals: TinyGoal[]): Promise<string>;
}
```

### Storage Service

```typescript
interface StorageService {
  getGoals(): Goals;
  setGoals(goals: Goals): void;
  getTinyGoals(): TinyGoal[];
  setTinyGoals(tinyGoals: TinyGoal[]): void;
  getDailyTasks(): DailyTasks;
  setDailyTasks(dailyTasks: DailyTasks): void;
  getUserData(): UserData;
  setUserData(userData: UserData): void;
  clearAll(): void;
  exportData(): BackupData;
  importData(data: BackupData): void;
}
```

### Analytics Service (Future)

```typescript
interface AnalyticsService {
  trackEvent(event: string, properties?: Record<string, any>): void;
  trackPageView(page: string): void;
  trackGoalCompletion(goalId: string): void;
  trackTaskCompletion(taskId: string): void;
  trackAIUsage(feature: string): void;
}
```

## Error Handling

### AI Service Errors

```typescript
interface AIError {
  type: 'network' | 'auth' | 'rate_limit' | 'invalid_response' | 'unknown';
  message: string;
  code?: string;
  retryAfter?: number; // seconds
}

// Error handling in AI service
try {
  const result = await aiService.synthesizeFocus(brainDump);
  return result;
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    // Show rate limit message
    return 'Please wait before making another AI request.';
  } else if (error.code === 'invalid_api_key') {
    // Show API key error
    return 'Please check your OpenAI API key in settings.';
  } else {
    // Fallback to default suggestions
    return getFallbackSuggestion();
  }
}
```

### Storage Errors

```typescript
// Storage error handling
try {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
} catch (error) {
  console.error(`Storage error for key ${key}:`, error);
  return defaultValue;
}
```

## Rate Limiting

### OpenAI API Rate Limits

- **Free Tier**: 3 requests per minute
- **Paid Tier**: 3,500 requests per minute

### Client-Side Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number; // milliseconds

  constructor(maxRequests: number = 3, timeWindow: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) return 0;
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldestRequest);
  }
}
```

### Usage in AI Service

```typescript
const rateLimiter = new RateLimiter(3, 60000); // 3 requests per minute

async makeRequest(endpoint: string, data: any): Promise<AIResponse> {
  if (!this.rateLimiter.canMakeRequest()) {
    const waitTime = this.rateLimiter.getTimeUntilNextRequest();
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  this.rateLimiter.recordRequest();
  
  // Make the actual request
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { /* headers */ },
    body: JSON.stringify(data),
  });

  return response;
}
```

## Security

### API Key Security

```typescript
// API key validation
const validateApiKey = (key: string): boolean => {
  // OpenAI API keys start with 'sk-' and are 51 characters long
  return /^sk-[a-zA-Z0-9]{48}$/.test(key);
};

// Secure storage (localStorage is used, but key is never logged)
const setApiKey = (key: string): void => {
  if (!validateApiKey(key)) {
    throw new Error('Invalid API key format');
  }
  
  // Store securely (localStorage in this case)
  localStorage.setItem('openai-api-key', key);
};
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               connect-src 'self' https://api.openai.com;">
```

### Data Privacy

- **Local Storage Only**: All user data is stored locally in the browser
- **No Server Storage**: No user data is sent to or stored on external servers
- **API Key Security**: OpenAI API key is stored locally and only used for API calls
- **No Tracking**: No analytics or tracking without explicit user consent

### Input Sanitization

```typescript
// Sanitize user input before sending to AI
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .slice(0, 2000) // Limit length
    .replace(/[<>]/g, ''); // Remove potential HTML
};

// Validate AI responses
const validateAIResponse = (response: any): boolean => {
  return typeof response === 'string' && response.length > 0 && response.length < 500;
};
```

## Testing API Integration

### Mock AI Service for Testing

```typescript
class MockAIService implements AIService {
  async synthesizeFocusFromBrainDump(brainDump: string): Promise<string> {
    // Return mock response for testing
    return "Focus on completing the most urgent project deadline";
  }

  async analyzePatterns(dailyTasks: DailyTasks, goals: Goals): Promise<AIInsight[]> {
    return [
      {
        type: 'pattern',
        title: 'Morning Productivity',
        content: 'You tend to be most productive in the morning hours.',
        confidence: 0.8
      }
    ];
  }

  // ... other mock methods
}
```

### API Testing

```typescript
// Test API connectivity
const testAPIConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};
```

---

This API documentation provides comprehensive information about all external integrations and data structures used in the Daily Focus Coach application. For implementation details, refer to the source code in the `src/services/` directory.
