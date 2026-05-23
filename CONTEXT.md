# Daily Focus Coach — Project Context Document

> Use this document to onboard Claude (or any AI assistant) into the codebase for feature development and UX work.

---

## 1. Project Overview

**Daily Focus Coach** is an AI-powered personal productivity PWA that helps users identify and complete their most important daily task. It supports both **personal** and **team** modes.

- **Live URL:** https://daily-focus-coach.vercel.app
- **Repo:** https://github.com/jhousvawls/daily-coach
- **Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS 3 + Supabase + Vercel
- **Architecture:** Single-page app (SPA) with client-side routing via React Router v7

---

## 2. Tech Stack & Dependencies

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.1 |
| Language | TypeScript | 5.8 |
| Build Tool | Vite | 7.0 |
| Styling | Tailwind CSS | 3.4 |
| Routing | React Router DOM | 7.7 |
| Icons | Lucide React | 0.536 |
| Backend/DB | Supabase (Postgres + Auth + RLS) | 2.53 |
| AI | OpenAI API (GPT-4 / GPT-3.5-turbo) | Direct REST calls |
| Hosting | Vercel | Auto-deploy on push to main |
| PWA | Custom service worker (`public/sw.js`) | Manual |

### No additional UI libraries — all components are custom-built with Tailwind utility classes.

---

## 3. Project Structure

```
src/
├── main.tsx                    # Entry point (BrowserRouter + TeamProvider + App)
├── App.tsx                     # Root router — personal vs team routes
├── App-personal.tsx            # Personal dashboard (main app logic, state management)
├── index.css                   # Global styles + Tailwind + custom component classes
├── vite-env.d.ts               # Vite type declarations
│
├── components/                 # UI Components
│   ├── Header.tsx              # App header with mode toggle (Personal/Team), auth, sync status
│   ├── Dashboard.tsx           # Main dashboard layout — composes sub-components
│   ├── FocusCard.tsx           # Today's focus input/display with completion toggle
│   ├── MotivationalQuote.tsx   # Daily AI-generated quote with mood selector
│   ├── ProgressTracker.tsx     # Visual progress bar for task completion
│   ├── GoalsList.tsx           # Big goals (personal + professional) with subtasks
│   ├── TinyGoalsList.tsx       # Quick tiny goals checklist
│   ├── DateNavigator.tsx       # Navigate between dates to view historical data
│   ├── FocusAssistant.tsx      # AI-powered brain dump → focus selection modal
│   ├── BrainDumpModal.tsx      # Text area for brain dumping thoughts
│   ├── Settings.tsx            # User preferences, API key, recurring tasks, achievements
│   ├── AchievementsTab.tsx     # Achievement stats and completed goals history
│   ├── RecurringTasksList.tsx  # Weekly/monthly recurring task management
│   ├── YesterdayCheckin.tsx    # Modal asking if yesterday's task was completed
│   ├── AuthModal.tsx           # Sign in/sign up modal (Supabase Auth)
│   ├── MigrationModal.tsx      # localStorage → cloud migration prompt
│   ├── SyncStatusIndicator.tsx # Cloud sync status badge
│   ├── UpdateNotification.tsx  # PWA update available notification
│   ├── StatsOverview.tsx       # Stats cards display
│   ├── ViewAllHistory.tsx      # Full history view
│   ├── RecentCompletions.tsx   # Recent completed items list
│   ├── CompletionItem.tsx      # Single completion item display
│   │
│   └── team/                   # Team Mode Components (lazy-loaded)
│       ├── TeamDashboard.tsx       # Team overview with all members
│       ├── TeamMemberPage.tsx      # Individual member's dashboard
│       ├── TeamSettings.tsx        # Add/remove team members
│       ├── TeamAnalytics.tsx       # Team-wide analytics
│       ├── TeamGoalBadge.tsx       # Priority/status badge for team goals
│       ├── GoalAssignmentModal.tsx  # Assign goals to team members
│       ├── AnalyticsWidgets.tsx    # Analytics widget components
│       └── analytics/
│           ├── AnalyticsCharts.tsx  # Chart visualizations
│           ├── AnalyticsExport.tsx  # Export analytics data
│           └── AnalyticsFilters.tsx # Filter controls for analytics
│
├── contexts/
│   └── TeamContext.tsx         # React Context for team state management
│
├── hooks/
│   ├── useAI.ts                # AI interaction hook (OpenAI API calls)
│   ├── useAuth.ts              # Supabase authentication hook
│   └── useLocalStorage.ts      # localStorage hook with JSON serialization
│
├── services/
│   ├── storage.ts              # localStorage CRUD for all data types
│   ├── cloudStorage.ts         # Supabase cloud CRUD operations
│   ├── hybridStorage.ts        # Offline-first sync engine (localStorage + cloud)
│   ├── teamStorage.ts          # Team data localStorage management
│   ├── supabase.ts             # Supabase client initialization (lazy, proxied)
│   ├── ai.ts                   # OpenAI API service (quotes, focus analysis)
│   ├── analytics.ts            # Analytics calculation service
│   ├── auth.ts                 # Auth service wrapper
│   ├── keepAlive.ts            # Supabase keep-alive pinger (prevents dormancy)
│   ├── migration.ts            # localStorage → cloud migration service
│   └── pwaUpdate.ts            # PWA update detection and management
│
├── types/                      # TypeScript type definitions
│   ├── goal.ts                 # Goal, Goals, TinyGoal, SubTask
│   ├── task.ts                 # Task, DailyTask, DailyTasks, RecurringTask
│   ├── user.ts                 # UserData, UserPreferences, DailyFocus
│   ├── team.ts                 # TeamMember, TeamGoal, TeamData, TeamStats
│   ├── achievement.ts          # AchievementStats, CompletedGoal
│   └── auth.ts                 # Auth types
│
└── utils/
    ├── constants.ts            # App name, storage keys, colors, messages, validation
    ├── date.ts                 # Date utility functions (getToday, getYesterday)
    └── debug.ts                # Dev-only logging utility
```

---

## 4. MCP Server Integration

The app includes a companion **MCP (Model Context Protocol) server** that allows AI assistants (Claude Desktop, ChatGPT, Cline) to read and write all app data.

- **Server location:** `/Users/john.housholder/Documents/Cline/MCP/daily-coach-mcp/`
- **Storage:** Local JSON file at `~/.daily-coach/data.json`
- **Transport:** stdio (standard MCP protocol)
- **18 tools** covering: goals, tiny goals, daily focus, agency focus, quarterly focus, dashboard summary

### Connection
- **Claude Desktop:** Configured in `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cline (VS Code):** Configured in `cline_mcp_settings.json`
- **ChatGPT:** Via mcp-remote bridge (see MCP server README)

---

## 5. Core Data Types

### Goal
```typescript
interface Goal {
  id: number;
  text: string;
  description?: string;
  category: 'personal' | 'professional';
  targetDate?: string;
  progress: number; // 0-100
  subtasks: SubTask[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Goals {
  personal: Goal[];
  professional: Goal[];
}
```

### TinyGoal
```typescript
interface TinyGoal {
  id: number;
  text: string;
  completedAt?: string;
  createdAt?: string;
}
```

### DailyTask (Focus)
```typescript
interface DailyTask {
  text: string;
  completed: boolean;
  completedAt?: string;
}

interface DailyTasks {
  [date: string]: DailyTask; // keyed by YYYY-MM-DD
}
```

### RecurringTask
```typescript
interface RecurringTask {
  id: string;
  text: string;
  recurrenceType: 'weekly' | 'monthly';
  weeklyDays?: number[]; // 0-6 (Sun-Sat)
  monthlyOption?: 'firstDay' | 'midMonth' | 'lastDay';
  lastCompleted?: string;
  createdAt: string;
  updatedAt: string;
}
```

### UserData
```typescript
interface UserData {
  apiKey?: string; // OpenAI API key
  preferences: {
    reminderTime: string;
    theme: 'light' | 'dark';
    notifications: boolean;
    showDailyQuote: boolean;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    currentStreak: number;
    longestStreak: number;
  };
  dailyFocus?: {
    current: string;
    date: string;
    method: 'highest_impact' | 'quick_win' | 'personal_priority' | 'ai_decide';
    subtasks?: string[];
    history: DailyFocusHistory[];
  };
}
```

### Team Types
```typescript
interface TeamMember {
  id: string;
  fullName: string;
  slug: string; // URL-friendly: "anna-smith"
  avatar?: string;
  color: string;
  joinedAt: string;
  isActive: boolean;
}

interface TeamGoal extends Goal {
  assignedBy: string; // leader ID
  assignedTo: string; // member ID
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

interface TeamData {
  members: TeamMember[];
  memberData: { [memberId: string]: TeamMemberData };
  teamQuote: DailyQuote | null;
  createdAt: string;
  updatedAt: string;
}
```

### AchievementStats
```typescript
interface AchievementStats {
  totalCompleted: number;
  bigGoalsCompleted: number;
  tinyGoalsCompleted: number;
  thisMonthCompleted: number;
  currentStreak: number;
  longestStreak: number;
  recentCompletions: CompletedGoal[];
}
```

---

## 5. Architecture Patterns

### State Management
- **No global state library** — state is managed in `App-personal.tsx` via `useState` hooks and passed down as props
- **TeamContext** — React Context (`useTeam()`) for team mode state, wraps entire app
- **localStorage-first** — all data writes go to localStorage immediately
- **Optional cloud sync** — when authenticated, `hybridStorage` syncs to Supabase with a queue-based approach

### Data Flow
```
User Action → setState() → useEffect persists to localStorage
                         → hybridStorage queues cloud sync (if authenticated)
                         → Supabase (cloud backup)
```

### Storage Architecture
1. **`storage.ts`** — Direct localStorage CRUD. Always available, always fast.
2. **`cloudStorage.ts`** — Direct Supabase CRUD. Used when authenticated.
3. **`hybridStorage.ts`** — Orchestrator. Writes to localStorage first, queues cloud operations. Features:
   - Debounced sync (500ms)
   - Batch processing (5 ops at a time)
   - Retry logic (max 3 attempts)
   - Online/offline detection
   - Conflict resolution via version numbers
4. **`teamStorage.ts`** — Team-specific localStorage. Separate from personal data.

### Routing
```
/                    → PersonalApp (main dashboard)
/personal            → Redirects to /
/team                → TeamDashboard (lazy loaded)
/team/settings       → TeamSettings (lazy loaded)
/team/analytics      → TeamAnalytics (lazy loaded)
/team/:memberSlug    → TeamMemberPage (lazy loaded)
*                    → Redirects to /
```

### Component Composition Pattern
Components are composed in a clean hierarchy:
```
App.tsx
├── PersonalApp (App-personal.tsx)
│   ├── Header
│   ├── YesterdayCheckin (modal)
│   ├── FocusAssistant (modal)
│   ├── DateNavigator
│   ├── Dashboard
│   │   ├── MotivationalQuote
│   │   ├── FocusCard
│   │   ├── ProgressTracker
│   │   ├── GoalsList
│   │   ├── TinyGoalsList
│   │   ├── AgencyFocus
│   │   └── KeyFocusAreas
│   ├── Settings
│   │   ├── AchievementsTab
│   │   └── RecurringTasksList
│   └── UpdateNotification
│
└── Team Routes (lazy loaded)
    ├── TeamDashboard
    ├── TeamMemberPage
    ├── TeamSettings
    └── TeamAnalytics
```

---

## 6. Design System & Styling

### Approach
- **Tailwind CSS utility classes** — no component library (no shadcn, no MUI, no Chakra)
- **Dark mode** — class-based (`darkMode: 'class'` in tailwind config), toggled via `document.documentElement.classList`
- **All components use inline Tailwind** — e.g., `className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"`

### Typography
- **Headings:** Lora (serif) — `font-serif`
- **Body:** Source Sans Pro (sans-serif) — `font-sans`
- Loaded via Google Fonts CDN in `index.css`

### Color Palette
| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| Background | `gray-100` | `gray-900` |
| Card Background | `white` | `gray-800` |
| Text Primary | `gray-800` / `gray-900` | `gray-100` |
| Text Secondary | `gray-500` | `gray-400` |
| Border | `gray-200` | `gray-700` |
| Primary Action | `gray-700` (buttons) | `gray-600` |
| Accent / Focus Ring | `orange-400` | `orange-400` |
| Success | `green-500` / `green-100` bg | `green-400` / `green-900/30` bg |
| AI / Special | `orange-600` text | `orange-400` text |
| Auth CTA | `blue-600` | `blue-600` |

### Custom CSS Component Classes (defined in `index.css`)
```css
.btn-primary    → bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg
.btn-secondary  → bg-white text-gray-700 border-2 border-gray-300 font-semibold py-3 px-6 rounded-lg
.input-primary  → p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400
.card           → bg-white p-6 rounded-2xl shadow-lg border border-gray-200
```

### Common UI Patterns
- **Cards:** `bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700`
- **Buttons:** Gray primary, orange for AI features, blue for auth
- **Modals:** Full-screen overlay with centered card, blur on background content
- **Icons:** Lucide React, sizes 16-24px, `text-gray-500 dark:text-gray-400`
- **Transitions:** `transition-colors duration-200` on most interactive elements
- **Layout:** Single column, max-width `max-w-4xl`, centered with `container mx-auto`
- **Responsive:** Mobile-first, `sm:` breakpoint for side-by-side layouts

---

## 7. Key Features

### Personal Mode
1. **Daily Focus** — Set one focus task per day, mark complete, AI-assisted selection
2. **Yesterday Check-in** — Modal prompting completion status of yesterday's focus
3. **Big Goals** — Personal + Professional categories, subtasks, progress tracking (0-100%)
4. **Tiny Goals** — Quick checkbox list for small tasks
5. **Recurring Tasks** — Weekly (multi-day) or monthly (first/mid/last) recurring items
6. **AI Brain Dump** — Paste everything on your mind, AI picks the most important focus
7. **Daily Quote** — AI-generated motivational quote with mood selector
8. **Date Navigation** — Browse historical days to see past focuses
9. **Achievements** — Completion stats, streaks, recent completions
10. **Dark/Light Theme** — Toggle in settings
11. **PWA** — Installable, offline-capable, update notifications

### Team Mode
1. **Team Dashboard** — Overview of all team members and their progress
2. **Member Pages** — Individual member dashboards (reuses PersonalApp component)
3. **Goal Assignment** — Leader can assign goals with priority and deadline
4. **Team Analytics** — Charts, filters, export capabilities
5. **Team Settings** — Add/remove members

### Authentication & Sync
1. **Supabase Auth** — Email/password sign up and sign in
2. **Offline-first** — App works fully offline with localStorage
3. **Cloud Sync** — Optional, activates on sign-in, queue-based with conflict resolution
4. **Migration** — One-time prompt to migrate existing localStorage data to cloud

---

## 8. Database Schema (Supabase/PostgreSQL)

```
Tables:
├── goals              — Big goals with category, progress, subtasks
├── tiny_goals         — Quick completion items
├── daily_tasks        — One focus per user per day (UNIQUE constraint)
├── recurring_tasks    — Weekly/monthly recurring items
├── user_preferences   — Theme, notifications, API key (encrypted), sync settings
└── daily_quotes       — AI-generated quotes cached per date

All tables have:
- user_id (FK to auth.users, with ON DELETE CASCADE)
- Row Level Security (RLS) — users can only access their own data
- version column for conflict resolution
- created_at / updated_at with auto-update triggers
```

---

## 9. Environment Variables

```env
VITE_SUPABASE_URL=https://xzbkkledybntzvpfcgeb.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_OPENAI_API_KEY=<optional-server-side-key>
```

- Supabase credentials have hardcoded fallbacks in `supabase.ts` (anon/public keys, acceptable for client)
- OpenAI API key can be set per-user in Settings or via env var

---

## 10. Build & Development

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

### Build Output (production)
- Main bundle: ~371KB (106KB gzip) — includes personal dashboard
- Team chunks: ~62KB total (lazy loaded separately)
- Supabase chunk: ~117KB (32KB gzip)
- Vendor chunk: ~12KB (React)
- Builds in ~1.3 seconds

### Deployment
- Auto-deploys to Vercel on push to `main` branch
- SPA routing handled via `vercel.json` rewrites
- Caching: immutable for `/assets/`, no-cache for `index.html` and `sw.js`

---

## 11. Key Conventions for New Features

When building new features, follow these patterns:

1. **Types first** — Define TypeScript interfaces in `src/types/`
2. **Storage service** — Add CRUD methods to `src/services/storage.ts` (localStorage) and optionally `cloudStorage.ts`
3. **Component composition** — Build small, focused components; compose them in parent containers
4. **Props-based state** — State lives in `App-personal.tsx`, pass as props. No Redux/Zustand.
5. **Tailwind only** — No CSS modules, no styled-components. Use utility classes with dark mode variants.
6. **Card-based layout** — New sections should use the card pattern: `bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700`
7. **Icons** — Import individual icons from `lucide-react`: `import { IconName } from 'lucide-react'`
8. **Lazy load** — New route-level components should use `React.lazy()` + `Suspense`
9. **Dark mode** — Always include `dark:` variants for backgrounds, text, borders
10. **Debug logging** — Use `import { debug } from '../utils/debug'` instead of `console.log`
11. **Mobile-first** — Design for mobile, use `sm:` / `md:` breakpoints for larger screens
12. **Single column** — App is max-width `max-w-4xl`, all content in a single column

---

## 12. What's NOT in the App Yet (Potential Areas)

- No notification/reminder system (preferences exist but no implementation)
- No data export/import for personal mode
- No collaborative real-time features (team mode is localStorage-only, not synced)
- No calendar view
- No integrations (Slack, email, calendar apps)
- No onboarding flow for new users
- Analytics are basic (no charting library — team analytics has custom chart components)
