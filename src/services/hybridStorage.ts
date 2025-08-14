import { storage } from './storage';
import { cloudStorage } from './cloudStorage';
import { migrationService } from './migration';
import { supabase } from './supabase';
import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTasks, RecurringTask } from '../types/task';
import type { UserData } from '../types/user';
import type { DailyQuote, DailyQuotes } from './storage';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'goals' | 'tiny_goals' | 'daily_tasks' | 'recurring_tasks' | 'quotes' | 'preferences';
  data: any;
  timestamp: string;
  retryCount: number;
  localId?: number; // For ID mapping
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: Date;
  pendingOperations: number;
  syncEnabled: boolean;
  hasError: boolean;
  errorMessage?: string;
}

type SyncStateCallback = (state: SyncState) => void;

class HybridStorageService {
  private syncQueue: SyncOperation[] = [];
  private syncStateCallbacks: SyncStateCallback[] = [];
  private syncState: SyncState = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingOperations: 0,
    syncEnabled: false,
    hasError: false
  };
  
  private readonly SYNC_QUEUE_KEY = 'daily-focus-coach-sync-queue';
  private readonly SYNC_STATE_KEY = 'daily-focus-coach-sync-state';
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  
  private syncTimeout?: NodeJS.Timeout;
  private isInitialized = false;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the hybrid storage service
   */
  private async initializeService(): Promise<void> {
    if (this.isInitialized) return;

    // Load sync queue from localStorage
    this.loadSyncQueue();
    this.loadSyncState();

    // Set up online/offline listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Check if user is authenticated and migration is needed
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const migrationStatus = migrationService.getMigrationStatus();
      this.syncState.syncEnabled = migrationStatus.isCompleted;
      
      // If migration is complete, start processing sync queue
      if (this.syncState.syncEnabled && this.syncState.isOnline) {
        this.processSyncQueue();
      }
    }

    this.isInitialized = true;
    this.notifyStateChange();
  }

  /**
   * Subscribe to sync state changes
   */
  onSyncStateChange(callback: SyncStateCallback): () => void {
    this.syncStateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncStateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Enable sync after successful migration
   */
  enableSync(): void {
    this.syncState.syncEnabled = true;
    this.saveSyncState();
    this.notifyStateChange();
    
    if (this.syncState.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Manually trigger sync
   */
  async manualSync(): Promise<void> {
    if (!this.syncState.syncEnabled || this.syncState.isSyncing) {
      return;
    }

    this.syncState.hasError = false;
    this.syncState.errorMessage = undefined;
    this.notifyStateChange();

    await this.processSyncQueue();
  }

  // =====================================================
  // GOALS METHODS
  // =====================================================

  getGoals(): Goals {
    return storage.getGoals();
  }

  async setGoals(goals: Goals): Promise<void> {
    // Always save to localStorage first (instant response)
    storage.setGoals(goals);

    // Queue for cloud sync if enabled
    if (this.syncState.syncEnabled) {
      this.queueSyncOperation('update', 'goals', goals);
    }
  }

  // =====================================================
  // TINY GOALS METHODS
  // =====================================================

  getTinyGoals(): TinyGoal[] {
    return storage.getTinyGoals();
  }

  async setTinyGoals(tinyGoals: TinyGoal[]): Promise<void> {
    // Always save to localStorage first
    storage.setTinyGoals(tinyGoals);

    // Queue for cloud sync if enabled
    if (this.syncState.syncEnabled) {
      this.queueSyncOperation('update', 'tiny_goals', tinyGoals);
    }
  }

  // =====================================================
  // DAILY TASKS METHODS
  // =====================================================

  getDailyTasks(): DailyTasks {
    return storage.getDailyTasks();
  }

  async setDailyTasks(dailyTasks: DailyTasks): Promise<void> {
    // Always save to localStorage first
    storage.setDailyTasks(dailyTasks);

    // Queue for cloud sync if enabled
    if (this.syncState.syncEnabled) {
      this.queueSyncOperation('update', 'daily_tasks', dailyTasks);
    }
  }

  // =====================================================
  // RECURRING TASKS METHODS
  // =====================================================

  getRecurringTasks(): RecurringTask[] {
    return storage.getRecurringTasks();
  }

  async setRecurringTasks(recurringTasks: RecurringTask[]): Promise<void> {
    // Always save to localStorage first
    storage.setRecurringTasks(recurringTasks);

    // Queue for cloud sync if enabled
    if (this.syncState.syncEnabled) {
      this.queueSyncOperation('update', 'recurring_tasks', recurringTasks);
    }
  }

  // =====================================================
  // USER DATA METHODS
  // =====================================================

  getUserData(): UserData {
    return storage.getUserData();
  }

  async setUserData(userData: UserData): Promise<void> {
    // Always save to localStorage first
    storage.setUserData(userData);

    // Queue for cloud sync if enabled
    if (this.syncState.syncEnabled) {
      this.queueSyncOperation('update', 'preferences', userData);
    }
  }

  // =====================================================
  // DAILY QUOTES METHODS
  // =====================================================

  getDailyQuotes(): DailyQuotes {
    return storage.getDailyQuotes();
  }

  async setDailyQuotes(dailyQuotes: DailyQuotes): Promise<void> {
    // Always save to localStorage first
    storage.setDailyQuotes(dailyQuotes);

    // Queue for cloud sync if enabled
    if (this.syncState.syncEnabled) {
      this.queueSyncOperation('update', 'quotes', dailyQuotes);
    }
  }

  async getDailyQuote(date: string): Promise<DailyQuote | null> {
    return storage.getDailyQuote(date);
  }

  async setDailyQuote(date: string, quote: DailyQuote): Promise<void> {
    // Always save to localStorage first
    await storage.setDailyQuote(date, quote);

    // Queue for cloud sync if enabled
    if (this.syncState.syncEnabled) {
      this.queueSyncOperation('update', 'quotes', { [date]: quote });
    }
  }

  // =====================================================
  // SYNC QUEUE MANAGEMENT
  // =====================================================

  private queueSyncOperation(
    type: SyncOperation['type'],
    table: SyncOperation['table'],
    data: any,
    localId?: number
  ): void {
    const operation: SyncOperation = {
      id: this.generateOperationId(),
      type,
      table,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      localId
    };

    this.syncQueue.push(operation);
    this.syncState.pendingOperations = this.syncQueue.length;
    this.saveSyncQueue();
    this.notifyStateChange();

    // Process queue if online and sync is enabled
    if (this.syncState.isOnline && this.syncState.syncEnabled && !this.syncState.isSyncing) {
      // Debounce sync operations
      if (this.syncTimeout) {
        clearTimeout(this.syncTimeout);
      }
      this.syncTimeout = setTimeout(() => {
        this.processSyncQueue();
      }, 500); // Wait 500ms for more operations
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.syncState.syncEnabled || !this.syncState.isOnline || this.syncState.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.syncState.isSyncing = true;
    this.syncState.hasError = false;
    this.syncState.errorMessage = undefined;
    this.notifyStateChange();

    try {
      // Process operations in batches
      const batchSize = 5;
      const operations = [...this.syncQueue];
      
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        await this.processBatch(batch);
      }

      // Update sync state
      this.syncState.lastSyncTime = new Date();
      this.syncState.pendingOperations = this.syncQueue.length;
      this.saveSyncState();

    } catch (error) {
      console.error('Sync queue processing failed:', error);
      this.syncState.hasError = true;
      this.syncState.errorMessage = error instanceof Error ? error.message : 'Sync failed';
    } finally {
      this.syncState.isSyncing = false;
      this.notifyStateChange();
    }
  }

  private async processBatch(operations: SyncOperation[]): Promise<void> {
    for (const operation of operations) {
      try {
        await this.processSyncOperation(operation);
        
        // Remove successful operation from queue
        const index = this.syncQueue.findIndex(op => op.id === operation.id);
        if (index > -1) {
          this.syncQueue.splice(index, 1);
        }
      } catch (error) {
        console.error(`Sync operation failed:`, operation, error);
        
        // Increment retry count
        operation.retryCount++;
        
        // Remove operation if max retries exceeded
        if (operation.retryCount >= this.MAX_RETRY_COUNT) {
          const index = this.syncQueue.findIndex(op => op.id === operation.id);
          if (index > -1) {
            this.syncQueue.splice(index, 1);
          }
          console.warn(`Sync operation abandoned after ${this.MAX_RETRY_COUNT} retries:`, operation);
        }
        
        // Don't throw error to continue processing other operations
      }
    }
    
    this.saveSyncQueue();
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    const { type, table, data } = operation;

    switch (table) {
      case 'goals':
        await this.syncGoals(data);
        break;
      case 'tiny_goals':
        await this.syncTinyGoals(data);
        break;
      case 'daily_tasks':
        await this.syncDailyTasks(data);
        break;
      case 'recurring_tasks':
        await this.syncRecurringTasks(data);
        break;
      case 'quotes':
        await this.syncQuotes(data);
        break;
      case 'preferences':
        await this.syncPreferences(data);
        break;
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  // =====================================================
  // SYNC METHODS FOR EACH DATA TYPE
  // =====================================================

  private async syncGoals(goals: Goals): Promise<void> {
    // For now, we'll implement a simple approach where we sync all goals
    // In a more sophisticated implementation, we'd track individual goal changes
    const allGoals = [...goals.personal, ...goals.professional];
    
    for (const goal of allGoals) {
      // Check if this goal has a cloud mapping
      const cloudId = migrationService.getCloudId(goal.id, 'goal');
      
      if (cloudId) {
        // Update existing goal
        await cloudStorage.updateGoal(cloudId as any, goal);
      } else {
        // Create new goal and create mapping
        const savedGoal = await cloudStorage.saveGoal({
          text: goal.text,
          description: goal.description,
          category: goal.category,
          progress: goal.progress,
          targetDate: goal.targetDate,
          completedAt: goal.completedAt,
          subtasks: goal.subtasks || []
        });
        // Note: We'd need to update the migration service to handle new mappings
      }
    }
  }

  private async syncTinyGoals(tinyGoals: TinyGoal[]): Promise<void> {
    for (const tinyGoal of tinyGoals) {
      const cloudId = migrationService.getCloudId(tinyGoal.id, 'tiny_goal');
      
      if (cloudId) {
        await cloudStorage.updateTinyGoal(cloudId as any, tinyGoal);
      } else {
        await cloudStorage.saveTinyGoal({
          text: tinyGoal.text,
          completedAt: tinyGoal.completedAt
        });
      }
    }
  }

  private async syncDailyTasks(dailyTasks: DailyTasks): Promise<void> {
    for (const [date, task] of Object.entries(dailyTasks)) {
      await cloudStorage.saveDailyTask(date, task);
    }
  }

  private async syncRecurringTasks(recurringTasks: RecurringTask[]): Promise<void> {
    // For simplicity, we'll clear and re-create all recurring tasks
    // In production, you'd want more sophisticated change tracking
    for (const task of recurringTasks) {
      await cloudStorage.saveRecurringTask({
        text: task.text,
        recurrenceType: task.recurrenceType,
        weeklyDays: task.weeklyDays,
        monthlyOption: task.monthlyOption,
        lastCompleted: task.lastCompleted
      });
    }
  }

  private async syncQuotes(quotes: DailyQuotes | { [date: string]: DailyQuote }): Promise<void> {
    for (const [date, quote] of Object.entries(quotes)) {
      await cloudStorage.saveDailyQuote(date, quote);
    }
  }

  private async syncPreferences(userData: UserData): Promise<void> {
    const preferences = {
      api_key_encrypted: userData.apiKey,
      reminder_time: userData.preferences.reminderTime,
      theme: userData.preferences.theme,
      notifications: userData.preferences.notifications,
      sync_enabled: true
    };
    
    await cloudStorage.saveUserPreferences(preferences);
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private generateOperationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem(this.SYNC_QUEUE_KEY);
      this.syncQueue = stored ? JSON.parse(stored) : [];
      this.syncState.pendingOperations = this.syncQueue.length;
    } catch {
      this.syncQueue = [];
      this.syncState.pendingOperations = 0;
    }
  }

  private saveSyncQueue(): void {
    localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
  }

  private loadSyncState(): void {
    try {
      const stored = localStorage.getItem(this.SYNC_STATE_KEY);
      if (stored) {
        const savedState = JSON.parse(stored);
        this.syncState = {
          ...this.syncState,
          ...savedState,
          lastSyncTime: savedState.lastSyncTime ? new Date(savedState.lastSyncTime) : undefined,
          isOnline: navigator.onLine, // Always use current online status
          isSyncing: false // Never restore syncing state
        };
      }
    } catch {
      // Use default state
    }
  }

  private saveSyncState(): void {
    localStorage.setItem(this.SYNC_STATE_KEY, JSON.stringify({
      ...this.syncState,
      isOnline: undefined, // Don't persist online status
      isSyncing: undefined // Don't persist syncing status
    }));
  }

  private notifyStateChange(): void {
    this.syncStateCallbacks.forEach(callback => {
      try {
        callback(this.getSyncState());
      } catch (error) {
        console.error('Sync state callback error:', error);
      }
    });
  }

  private handleOnline(): void {
    this.syncState.isOnline = true;
    this.notifyStateChange();
    
    if (this.syncState.syncEnabled) {
      // Process pending operations when coming back online
      setTimeout(() => {
        this.processSyncQueue();
      }, 1000); // Wait a moment for connection to stabilize
    }
  }

  private handleOffline(): void {
    this.syncState.isOnline = false;
    this.syncState.isSyncing = false;
    this.notifyStateChange();
  }

  // =====================================================
  // DELEGATION TO ORIGINAL STORAGE METHODS
  // =====================================================

  // Delegate all other storage methods to the original storage service
  exportData() {
    return storage.exportData();
  }

  importData(data: any): void {
    storage.importData(data);
  }

  clearAll(): void {
    storage.clearAll();
    this.syncQueue = [];
    this.syncState.pendingOperations = 0;
    this.saveSyncQueue();
    this.notifyStateChange();
  }

  hasDataForDate(date: string): boolean {
    return storage.hasDataForDate(date);
  }

  getDataForDate(date: string) {
    return storage.getDataForDate(date);
  }

  getCompletionStats(startDate: string, endDate: string) {
    return storage.getCompletionStats(startDate, endDate);
  }

  getCompletedGoals() {
    return storage.getCompletedGoals();
  }

  getCompletedGoalsForDate(date: string) {
    return storage.getCompletedGoalsForDate(date);
  }

  getAchievementStats() {
    return storage.getAchievementStats();
  }

  calculateCurrentStreak(completions: any[]) {
    return storage.calculateCurrentStreak(completions);
  }

  calculateLongestStreak(completions: any[]) {
    return storage.calculateLongestStreak(completions);
  }

  // Sync versions of quote methods
  getDailyQuoteSync(date: string): DailyQuote | null {
    return storage.getDailyQuoteSync(date);
  }

  setDailyQuoteSync(date: string, quote: DailyQuote): void {
    storage.setDailyQuoteSync(date, quote);
    
    // Queue for sync if enabled
    if (this.syncState.syncEnabled) {
      this.queueSyncOperation('update', 'quotes', { [date]: quote });
    }
  }
}

// Export singleton instance
export const hybridStorage = new HybridStorageService();
