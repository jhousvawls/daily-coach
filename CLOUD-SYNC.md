# Cloud Sync Implementation Plan - Supabase Integration

This document outlines the implementation plan for adding cloud synchronization to the Daily Focus Coach application using Supabase as the backend service.

## Overview

The cloud sync feature will enable users to:
- Access their data across multiple devices (phone, desktop, tablet)
- Real-time synchronization of changes
- Offline-first functionality with automatic sync when online
- Secure user authentication and data privacy
- Seamless migration from localStorage to cloud storage

## Architecture

### Current State
```
User Device → localStorage → Local Data Only
```

### Target State
```
User Device ↔ Supabase Cloud ↔ Real-time Sync ↔ All User Devices
     ↓              ↓
localStorage   PostgreSQL DB
(offline)      (persistent)
```

## Technology Stack

### Supabase Services
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Built-in auth with multiple providers
- **Real-time**: WebSocket subscriptions for live updates
- **Storage**: File storage for future features (user avatars, etc.)
- **Edge Functions**: For complex business logic if needed

### Client-Side Integration
- **Supabase JS Client**: Official JavaScript client library
- **React Integration**: Custom hooks for data fetching and real-time updates
- **Offline Support**: Service Worker + IndexedDB for offline capabilities
- **Conflict Resolution**: Last-writer-wins with timestamp comparison

## Database Schema

### Tables Structure

#### 1. Users Table (Managed by Supabase Auth)
```sql
-- Automatically created by Supabase Auth
-- Contains: id, email, created_at, updated_at, etc.
```

#### 2. Goals Table
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('personal', 'professional')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);
```

#### 3. Tiny Goals Table
```sql
CREATE TABLE tiny_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE tiny_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tiny goals" ON tiny_goals
  FOR ALL USING (auth.uid() = user_id);
```

#### 4. Daily Tasks Table
```sql
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one task per user per day
  UNIQUE(user_id, date)
);

-- Row Level Security
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own daily tasks" ON daily_tasks
  FOR ALL USING (auth.uid() = user_id);
```

#### 5. Recurring Tasks Table
```sql
CREATE TABLE recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'monthly')),
  weekly_days INTEGER[] CHECK (
    CASE 
      WHEN recurrence_type = 'weekly' THEN weekly_days IS NOT NULL 
      ELSE weekly_days IS NULL 
    END
  ),
  monthly_option TEXT CHECK (
    CASE 
      WHEN recurrence_type = 'monthly' THEN monthly_option IN ('firstDay', 'midMonth', 'lastDay')
      ELSE monthly_option IS NULL 
    END
  ),
  last_completed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own recurring tasks" ON recurring_tasks
  FOR ALL USING (auth.uid() = user_id);
```

#### 6. User Preferences Table
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT, -- Encrypted OpenAI API key
  reminder_time TIME DEFAULT '09:00:00',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

## Implementation Phases

### Phase 1: Setup and Authentication (Week 1)

#### 1.1 Supabase Project Setup
- [ ] Create Supabase project
- [ ] Configure authentication providers (Email, Google, GitHub)
- [ ] Set up database tables with RLS policies
- [ ] Configure environment variables

#### 1.2 Authentication Implementation
```typescript
// New files to create:
src/services/supabase.ts       // Supabase client configuration
src/services/auth.ts           // Authentication service
src/hooks/useAuth.ts           // Authentication hook
src/components/AuthModal.tsx   // Login/signup modal
src/components/UserProfile.tsx // User profile management
```

#### 1.3 Authentication Flow
- [ ] Add login/signup modal
- [ ] Implement authentication state management
- [ ] Add user profile dropdown in header
- [ ] Handle authentication redirects

### Phase 2: Data Migration and Sync (Week 2)

#### 2.1 Hybrid Storage Service
```typescript
// Enhanced storage service
src/services/cloudStorage.ts  // Cloud storage operations
src/services/syncService.ts   // Sync coordination
src/hooks/useCloudSync.ts     // Cloud sync hook
```

#### 2.2 Data Migration
- [ ] Create migration utilities for existing localStorage data
- [ ] Implement data import/export functionality
- [ ] Add conflict resolution strategies
- [ ] Handle data validation and sanitization

#### 2.3 Offline-First Architecture
- [ ] Implement optimistic updates
- [ ] Add sync queue for offline changes
- [ ] Create sync status indicators
- [ ] Handle network connectivity changes

### Phase 3: Real-time Features (Week 3)

#### 3.1 Real-time Subscriptions
```typescript
// Real-time hooks
src/hooks/useRealtimeGoals.ts
src/hooks/useRealtimeTasks.ts
src/hooks/useRealtimeSync.ts
```

#### 3.2 Live Updates
- [ ] Subscribe to database changes
- [ ] Update UI in real-time
- [ ] Handle concurrent edits
- [ ] Add presence indicators (optional)

### Phase 4: Advanced Features (Week 4)

#### 4.1 Enhanced Sync Features
- [ ] Batch operations for performance
- [ ] Delta sync for large datasets
- [ ] Compression for network efficiency
- [ ] Background sync with Service Workers

#### 4.2 User Experience Improvements
- [ ] Sync progress indicators
- [ ] Conflict resolution UI
- [ ] Data export/backup features
- [ ] Account management

## Technical Implementation Details

### Authentication Service
```typescript
export class AuthService {
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    })
    return { user: data.user, error }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user: data.user, error }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    return { error }
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }
}
```

### Cloud Storage Service
```typescript
export class CloudStorageService {
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  async getGoals(): Promise<Goal[]> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async saveGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('goals')
      .insert([{ ...goal, user_id: (await this.getCurrentUser())?.id }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async updateGoal(id: string, updates: Partial<Goal>) {
    const { data, error } = await this.supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  async deleteGoal(id: string) {
    const { error } = await this.supabase
      .from('goals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
```

### Real-time Sync Hook
```typescript
export function useRealtimeSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('user-data')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` },
        handleGoalsChange
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_tasks', filter: `user_id=eq.${user.id}` },
        handleTasksChange
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const syncToCloud = async () => {
    setSyncStatus('syncing')
    try {
      await syncLocalDataToCloud()
      setSyncStatus('idle')
    } catch (error) {
      setSyncStatus('error')
      console.error('Sync failed:', error)
    }
  }

  return { isOnline, syncStatus, syncToCloud }
}
```

## Migration Strategy

### Option 1: Gradual Migration (Recommended)
1. **Phase 1**: Add authentication as optional feature
2. **Phase 2**: Users can choose between local-only or cloud sync
3. **Phase 3**: Encourage migration with benefits (cross-device access)
4. **Phase 4**: Eventually deprecate local-only mode

### Option 2: Immediate Migration
1. **Phase 1**: Implement cloud sync for all new users
2. **Phase 2**: Auto-migrate existing users with consent
3. **Phase 3**: Maintain localStorage as fallback

## Security Considerations

### Data Privacy
- All user data protected by Row Level Security (RLS)
- API keys encrypted before storage
- No cross-user data access possible
- GDPR compliance with data export/deletion

### Authentication Security
- Secure password requirements
- Email verification for new accounts
- Optional 2FA (future enhancement)
- Session management with automatic refresh

### Network Security
- All communications over HTTPS
- API key rotation capabilities
- Rate limiting on sensitive operations
- Input validation and sanitization

## Performance Considerations

### Database Optimization
- Proper indexing on frequently queried columns
- Pagination for large datasets
- Connection pooling
- Query optimization

### Client-Side Performance
- Lazy loading of non-critical data
- Debounced sync operations
- Efficient state management
- Memory usage optimization

### Network Efficiency
- Delta sync for incremental updates
- Compression for large payloads
- Retry logic with exponential backoff
- Offline queue management

## Cost Analysis

### Supabase Pricing
- **Free Tier**: 50,000 MAU, 500MB DB, 1GB storage, 2GB bandwidth
- **Pro Tier**: $25/month - 100,000 MAU, 8GB DB, 100GB storage, 250GB bandwidth
- **Team Tier**: $599/month - 1M MAU, 32GB DB, 500GB storage, 1TB bandwidth

### Estimated Usage (Personal Use)
- **Users**: 1-10 (well within free tier)
- **Database**: <100MB (goals, tasks, preferences)
- **Bandwidth**: <1GB/month (sync operations)
- **Storage**: Minimal (text data only)

### Scaling Considerations
- Free tier sufficient for personal/small team use
- Pro tier needed for 100+ active users
- Consider usage-based pricing for larger scale

## Testing Strategy

### Unit Tests
- Authentication service tests
- Cloud storage service tests
- Sync logic tests
- Conflict resolution tests

### Integration Tests
- End-to-end sync workflows
- Cross-device synchronization
- Offline/online transitions
- Data migration scenarios

### Performance Tests
- Large dataset sync performance
- Concurrent user scenarios
- Network failure recovery
- Memory usage under load

## Deployment Considerations

### Environment Variables
```bash
# Production environment
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Development environment
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
```

### CI/CD Pipeline
- Automated database migrations
- Environment-specific deployments
- Integration test runs
- Performance monitoring

## Future Enhancements

### Advanced Features
- **Team Collaboration**: Shared goals and tasks
- **Data Analytics**: Usage patterns and insights
- **AI Integration**: Enhanced recommendations with user data
- **Mobile Apps**: Native iOS/Android applications
- **API Access**: Third-party integrations

### Technical Improvements
- **GraphQL**: More efficient data fetching
- **Edge Functions**: Complex business logic
- **File Storage**: Document attachments
- **Push Notifications**: Real-time alerts
- **Advanced Caching**: Redis for performance

## Implementation Timeline

### Week 1: Foundation
- Supabase project setup
- Database schema creation
- Basic authentication implementation

### Week 2: Core Sync
- Data migration utilities
- Hybrid storage implementation
- Basic sync functionality

### Week 3: Real-time Features
- WebSocket subscriptions
- Live updates implementation
- Conflict resolution

### Week 4: Polish & Testing
- UI/UX improvements
- Comprehensive testing
- Performance optimization
- Documentation updates

## Success Metrics

### Technical Metrics
- Sync latency < 500ms
- 99.9% uptime
- Zero data loss
- <100ms offline-to-online transition

### User Experience Metrics
- Seamless cross-device experience
- Intuitive authentication flow
- Clear sync status indicators
- Reliable offline functionality

---

This cloud sync implementation will transform the Daily Focus Coach from a single-device application to a truly cross-platform productivity tool, enabling users to maintain their focus and productivity habits across all their devices.
