import { storage } from './storage';
import { cloudStorage } from './cloudStorage';
import { supabase } from './supabase';
// import type { Goal, TinyGoal } from '../types/goal';
// import type { DailyTask, RecurringTask } from '../types/task';
// import type { UserData } from '../types/user';

export interface MigrationResult {
  success: boolean;
  migratedItems: {
    goals: number;
    tinyGoals: number;
    dailyTasks: number;
    recurringTasks: number;
    quotes: number;
    preferences: number;
  };
  errors: string[];
  duration: number;
  totalItems: number;
}

export interface MigrationProgress {
  stage: 'preparing' | 'goals' | 'tiny_goals' | 'daily_tasks' | 'recurring_tasks' | 'quotes' | 'preferences' | 'complete';
  current: number;
  total: number;
  percentage: number;
  currentItem?: string;
}

export interface MigrationStatus {
  isCompleted: boolean;
  lastAttempt?: string;
  lastResult?: MigrationResult;
  hasLocalData: boolean;
  needsMigration: boolean;
}

export interface IDMapping {
  localId: number;
  cloudId: string;
  type: 'goal' | 'tiny_goal';
  createdAt: string;
}

class MigrationService {
  private progressCallback?: (progress: MigrationProgress) => void;
  private idMappings: IDMapping[] = [];
  
  // Storage key for migration status
  private readonly MIGRATION_STATUS_KEY = 'daily-focus-coach-migration-status';
  private readonly ID_MAPPINGS_KEY = 'daily-focus-coach-id-mappings';

  /**
   * Check if user has local data that needs migration
   */
  hasLocalDataToMigrate(): boolean {
    const goals = storage.getGoals();
    const tinyGoals = storage.getTinyGoals();
    const dailyTasks = storage.getDailyTasks();
    const recurringTasks = storage.getRecurringTasks();
    const quotes = storage.getDailyQuotes();
    const userData = storage.getUserData();

    const hasGoals = goals.personal.length > 0 || goals.professional.length > 0;
    const hasTinyGoals = tinyGoals.length > 0;
    const hasDailyTasks = Object.keys(dailyTasks).length > 0;
    const hasRecurringTasks = recurringTasks.length > 0;
    const hasQuotes = Object.keys(quotes).length > 0;
    const hasUserData = !!userData.apiKey || userData.preferences.reminderTime !== '09:00';

    return hasGoals || hasTinyGoals || hasDailyTasks || hasRecurringTasks || hasQuotes || hasUserData;
  }

  /**
   * Get current migration status
   */
  getMigrationStatus(): MigrationStatus {
    try {
      const stored = localStorage.getItem(this.MIGRATION_STATUS_KEY);
      const status = stored ? JSON.parse(stored) : null;
      
      return {
        isCompleted: status?.isCompleted || false,
        lastAttempt: status?.lastAttempt,
        lastResult: status?.lastResult,
        hasLocalData: this.hasLocalDataToMigrate(),
        needsMigration: this.hasLocalDataToMigrate() && !status?.isCompleted
      };
    } catch {
      return {
        isCompleted: false,
        hasLocalData: this.hasLocalDataToMigrate(),
        needsMigration: this.hasLocalDataToMigrate()
      };
    }
  }

  /**
   * Set migration progress callback
   */
  setProgressCallback(callback: (progress: MigrationProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Load existing ID mappings from localStorage
   */
  private loadIDMappings(): void {
    try {
      const stored = localStorage.getItem(this.ID_MAPPINGS_KEY);
      this.idMappings = stored ? JSON.parse(stored) : [];
    } catch {
      this.idMappings = [];
    }
  }

  /**
   * Save ID mappings to localStorage
   */
  private saveIDMappings(): void {
    localStorage.setItem(this.ID_MAPPINGS_KEY, JSON.stringify(this.idMappings));
  }

  /**
   * Generate UUID for cloud storage
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Create ID mapping between local number ID and cloud UUID
   */
  private createIDMapping(localId: number, type: 'goal' | 'tiny_goal'): string {
    const cloudId = this.generateUUID();
    const mapping: IDMapping = {
      localId,
      cloudId,
      type,
      createdAt: new Date().toISOString()
    };
    
    this.idMappings.push(mapping);
    this.saveIDMappings();
    
    return cloudId;
  }

  /**
   * Get cloud ID for local ID
   */
  getCloudId(localId: number, type: 'goal' | 'tiny_goal'): string | null {
    const mapping = this.idMappings.find(m => m.localId === localId && m.type === type);
    return mapping?.cloudId || null;
  }

  /**
   * Get local ID for cloud ID
   */
  getLocalId(cloudId: string, type: 'goal' | 'tiny_goal'): number | null {
    const mapping = this.idMappings.find(m => m.cloudId === cloudId && m.type === type);
    return mapping?.localId || null;
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(stage: MigrationProgress['stage'], current: number, total: number, currentItem?: string): void {
    const progress: MigrationProgress = {
      stage,
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0,
      currentItem
    };
    
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Migrate goals to cloud storage
   */
  private async migrateGoals(): Promise<{ count: number; errors: string[] }> {
    const goals = storage.getGoals();
    const allGoals = [...goals.personal, ...goals.professional];
    const errors: string[] = [];
    let count = 0;

    this.updateProgress('goals', 0, allGoals.length);

    for (let i = 0; i < allGoals.length; i++) {
      const goal = allGoals[i];
      
      try {
        this.updateProgress('goals', i + 1, allGoals.length, goal.text);
        
        // Create cloud version of goal with UUID
        const cloudGoal = {
          text: goal.text,
          description: goal.description,
          category: goal.category,
          progress: goal.progress,
          targetDate: goal.targetDate,
          completedAt: goal.completedAt,
          subtasks: goal.subtasks || []
        };

        // Save to cloud and get the result with UUID
        await cloudStorage.saveGoal(cloudGoal);
        
        // Create ID mapping
        this.createIDMapping(goal.id, 'goal');
        
        count++;
      } catch (error) {
        const errorMsg = `Failed to migrate goal "${goal.text}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    return { count, errors };
  }

  /**
   * Migrate tiny goals to cloud storage
   */
  private async migrateTinyGoals(): Promise<{ count: number; errors: string[] }> {
    const tinyGoals = storage.getTinyGoals();
    const errors: string[] = [];
    let count = 0;

    this.updateProgress('tiny_goals', 0, tinyGoals.length);

    for (let i = 0; i < tinyGoals.length; i++) {
      const tinyGoal = tinyGoals[i];
      
      try {
        this.updateProgress('tiny_goals', i + 1, tinyGoals.length, tinyGoal.text);
        
        // Create cloud version of tiny goal
        const cloudTinyGoal = {
          text: tinyGoal.text,
          completedAt: tinyGoal.completedAt
        };

        // Save to cloud
        await cloudStorage.saveTinyGoal(cloudTinyGoal);
        
        // Create ID mapping
        this.createIDMapping(tinyGoal.id, 'tiny_goal');
        
        count++;
      } catch (error) {
        const errorMsg = `Failed to migrate tiny goal "${tinyGoal.text}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    return { count, errors };
  }

  /**
   * Migrate daily tasks to cloud storage
   */
  private async migrateDailyTasks(): Promise<{ count: number; errors: string[] }> {
    const dailyTasks = storage.getDailyTasks();
    const taskDates = Object.keys(dailyTasks);
    const errors: string[] = [];
    let count = 0;

    this.updateProgress('daily_tasks', 0, taskDates.length);

    for (let i = 0; i < taskDates.length; i++) {
      const date = taskDates[i];
      const task = dailyTasks[date];
      
      try {
        this.updateProgress('daily_tasks', i + 1, taskDates.length, `${date}: ${task.text}`);
        
        await cloudStorage.saveDailyTask(date, task);
        count++;
      } catch (error) {
        const errorMsg = `Failed to migrate daily task for ${date}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    return { count, errors };
  }

  /**
   * Migrate recurring tasks to cloud storage
   */
  private async migrateRecurringTasks(): Promise<{ count: number; errors: string[] }> {
    const recurringTasks = storage.getRecurringTasks();
    const errors: string[] = [];
    let count = 0;

    this.updateProgress('recurring_tasks', 0, recurringTasks.length);

    for (let i = 0; i < recurringTasks.length; i++) {
      const task = recurringTasks[i];
      
      try {
        this.updateProgress('recurring_tasks', i + 1, recurringTasks.length, task.text);
        
        // Create cloud version (excluding id, createdAt, updatedAt)
        const cloudTask = {
          text: task.text,
          recurrenceType: task.recurrenceType,
          weeklyDays: task.weeklyDays,
          monthlyOption: task.monthlyOption,
          lastCompleted: task.lastCompleted
        };

        await cloudStorage.saveRecurringTask(cloudTask);
        count++;
      } catch (error) {
        const errorMsg = `Failed to migrate recurring task "${task.text}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    return { count, errors };
  }

  /**
   * Migrate daily quotes to cloud storage
   */
  private async migrateDailyQuotes(): Promise<{ count: number; errors: string[] }> {
    const dailyQuotes = storage.getDailyQuotes();
    const quoteDates = Object.keys(dailyQuotes);
    const errors: string[] = [];
    let count = 0;

    this.updateProgress('quotes', 0, quoteDates.length);

    for (let i = 0; i < quoteDates.length; i++) {
      const date = quoteDates[i];
      const quote = dailyQuotes[date];
      
      try {
        this.updateProgress('quotes', i + 1, quoteDates.length, `${date}: ${quote.author}`);
        
        await cloudStorage.saveDailyQuote(date, quote);
        count++;
      } catch (error) {
        const errorMsg = `Failed to migrate quote for ${date}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    return { count, errors };
  }

  /**
   * Migrate user preferences to cloud storage
   */
  private async migrateUserPreferences(): Promise<{ count: number; errors: string[] }> {
    const userData = storage.getUserData();
    const errors: string[] = [];
    let count = 0;

    this.updateProgress('preferences', 0, 1);

    try {
      this.updateProgress('preferences', 1, 1, 'User preferences');
      
      // Convert userData to preferences format for cloud storage
      const preferences = {
        api_key_encrypted: userData.apiKey, // Note: In production, this should be properly encrypted
        reminder_time: userData.preferences.reminderTime,
        theme: userData.preferences.theme,
        notifications: userData.preferences.notifications,
        sync_enabled: true // Enable sync since they're migrating
      };

      await cloudStorage.saveUserPreferences(preferences);
      count = 1;
    } catch (error) {
      const errorMsg = `Failed to migrate user preferences: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg, error);
    }

    return { count, errors };
  }

  /**
   * Main migration function
   */
  async migrateUserData(): Promise<MigrationResult> {
    const startTime = Date.now();
    const allErrors: string[] = [];
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to migrate data');
    }

    // Load existing ID mappings
    this.loadIDMappings();

    this.updateProgress('preparing', 0, 1);

    try {
      // Migrate each data type
      const goalsResult = await this.migrateGoals();
      const tinyGoalsResult = await this.migrateTinyGoals();
      const dailyTasksResult = await this.migrateDailyTasks();
      const recurringTasksResult = await this.migrateRecurringTasks();
      const quotesResult = await this.migrateDailyQuotes();
      const preferencesResult = await this.migrateUserPreferences();

      // Collect all errors
      allErrors.push(...goalsResult.errors);
      allErrors.push(...tinyGoalsResult.errors);
      allErrors.push(...dailyTasksResult.errors);
      allErrors.push(...recurringTasksResult.errors);
      allErrors.push(...quotesResult.errors);
      allErrors.push(...preferencesResult.errors);

      const totalItems = goalsResult.count + tinyGoalsResult.count + dailyTasksResult.count + 
                        recurringTasksResult.count + quotesResult.count + preferencesResult.count;

      this.updateProgress('complete', totalItems, totalItems);

      const result: MigrationResult = {
        success: allErrors.length === 0,
        migratedItems: {
          goals: goalsResult.count,
          tinyGoals: tinyGoalsResult.count,
          dailyTasks: dailyTasksResult.count,
          recurringTasks: recurringTasksResult.count,
          quotes: quotesResult.count,
          preferences: preferencesResult.count
        },
        errors: allErrors,
        duration: Date.now() - startTime,
        totalItems
      };

      // Save migration status
      const status = {
        isCompleted: result.success,
        lastAttempt: new Date().toISOString(),
        lastResult: result
      };
      localStorage.setItem(this.MIGRATION_STATUS_KEY, JSON.stringify(status));

      return result;

    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      allErrors.push(errorMsg);
      
      const result: MigrationResult = {
        success: false,
        migratedItems: {
          goals: 0,
          tinyGoals: 0,
          dailyTasks: 0,
          recurringTasks: 0,
          quotes: 0,
          preferences: 0
        },
        errors: allErrors,
        duration: Date.now() - startTime,
        totalItems: 0
      };

      // Save failed migration status
      const status = {
        isCompleted: false,
        lastAttempt: new Date().toISOString(),
        lastResult: result
      };
      localStorage.setItem(this.MIGRATION_STATUS_KEY, JSON.stringify(status));

      return result;
    }
  }

  /**
   * Reset migration status (for testing or re-migration)
   */
  resetMigrationStatus(): void {
    localStorage.removeItem(this.MIGRATION_STATUS_KEY);
    localStorage.removeItem(this.ID_MAPPINGS_KEY);
    this.idMappings = [];
  }

  /**
   * Validate data integrity after migration
   */
  async validateDataIntegrity(): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        issues.push('User not authenticated');
        return { isValid: false, issues };
      }

      // Get local data
      const localGoals = storage.getGoals();
      const localTinyGoals = storage.getTinyGoals();
      const localDailyTasks = storage.getDailyTasks();

      // Get cloud data
      const cloudGoals = await cloudStorage.getGoals();
      const cloudTinyGoals = await cloudStorage.getTinyGoals();
      const cloudDailyTasks = await cloudStorage.getDailyTasks();

      // Validate goals count
      const localGoalsCount = localGoals.personal.length + localGoals.professional.length;
      if (cloudGoals.length !== localGoalsCount) {
        issues.push(`Goals count mismatch: local=${localGoalsCount}, cloud=${cloudGoals.length}`);
      }

      // Validate tiny goals count
      if (cloudTinyGoals.length !== localTinyGoals.length) {
        issues.push(`Tiny goals count mismatch: local=${localTinyGoals.length}, cloud=${cloudTinyGoals.length}`);
      }

      // Validate daily tasks count
      const localTasksCount = Object.keys(localDailyTasks).length;
      const cloudTasksCount = Object.keys(cloudDailyTasks).length;
      if (cloudTasksCount !== localTasksCount) {
        issues.push(`Daily tasks count mismatch: local=${localTasksCount}, cloud=${cloudTasksCount}`);
      }

      return { isValid: issues.length === 0, issues };

    } catch (error) {
      issues.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, issues };
    }
  }
}

// Export singleton instance
export const migrationService = new MigrationService();
