import { supabase } from './supabase'
import type { Goal, TinyGoal } from '../types/goal'
import type { DailyTask, RecurringTask } from '../types/task'

export class CloudStorageService {
  private getDeviceId(): string {
    return navigator.userAgent
  }

  // =====================================================
  // GOALS
  // =====================================================

  async getGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch goals: ${error.message}`)
    
    return (data || []).map(this.transformGoalFromDB)
  }

  async saveGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert([this.transformGoalToDB(goal)])
      .select()
      .single()
    
    if (error) throw new Error(`Failed to save goal: ${error.message}`)
    
    return this.transformGoalFromDB(data)
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({
        ...this.transformGoalToDB(updates),
        updated_at: new Date().toISOString(),
        last_modified_device: this.getDeviceId(),
        version: supabase.rpc('increment_version', { table_name: 'goals', record_id: id })
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update goal: ${error.message}`)
    
    return this.transformGoalFromDB(data)
  }

  async deleteGoal(id: number): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete goal: ${error.message}`)
  }

  // =====================================================
  // TINY GOALS
  // =====================================================

  async getTinyGoals(): Promise<TinyGoal[]> {
    const { data, error } = await supabase
      .from('tiny_goals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch tiny goals: ${error.message}`)
    
    return (data || []).map(this.transformTinyGoalFromDB)
  }

  async saveTinyGoal(tinyGoal: Omit<TinyGoal, 'id'>): Promise<TinyGoal> {
    const { data, error } = await supabase
      .from('tiny_goals')
      .insert([this.transformTinyGoalToDB(tinyGoal)])
      .select()
      .single()
    
    if (error) throw new Error(`Failed to save tiny goal: ${error.message}`)
    
    return this.transformTinyGoalFromDB(data)
  }

  async updateTinyGoal(id: number, updates: Partial<TinyGoal>): Promise<TinyGoal> {
    const { data, error } = await supabase
      .from('tiny_goals')
      .update({
        ...this.transformTinyGoalToDB(updates),
        updated_at: new Date().toISOString(),
        last_modified_device: this.getDeviceId()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update tiny goal: ${error.message}`)
    
    return this.transformTinyGoalFromDB(data)
  }

  async deleteTinyGoal(id: number): Promise<void> {
    const { error } = await supabase
      .from('tiny_goals')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete tiny goal: ${error.message}`)
  }

  // =====================================================
  // DAILY TASKS
  // =====================================================

  async getDailyTasks(): Promise<{ [date: string]: DailyTask }> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch daily tasks: ${error.message}`)
    
    const dailyTasks: { [date: string]: DailyTask } = {}
    
    data?.forEach(task => {
      const taskDate = task.date as string
      dailyTasks[taskDate] = {
        text: task.text as string,
        completed: task.completed as boolean,
        completedAt: task.completed_at as string | undefined
      }
    })
    
    return dailyTasks
  }

  async saveDailyTask(date: string, task: DailyTask): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .upsert([{
        date,
        text: task.text,
        completed: task.completed,
        completed_at: task.completedAt,
        last_modified_device: this.getDeviceId()
      }])
    
    if (error) throw new Error(`Failed to save daily task: ${error.message}`)
  }

  async deleteDailyTask(date: string): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('date', date)
    
    if (error) throw new Error(`Failed to delete daily task: ${error.message}`)
  }

  // =====================================================
  // RECURRING TASKS
  // =====================================================

  async getRecurringTasks(): Promise<RecurringTask[]> {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch recurring tasks: ${error.message}`)
    
    return (data || []).map(this.transformRecurringTaskFromDB)
  }

  async saveRecurringTask(task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringTask> {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([this.transformRecurringTaskToDB(task)])
      .select()
      .single()
    
    if (error) throw new Error(`Failed to save recurring task: ${error.message}`)
    
    return this.transformRecurringTaskFromDB(data)
  }

  async updateRecurringTask(id: string, updates: Partial<RecurringTask>): Promise<RecurringTask> {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update({
        ...this.transformRecurringTaskToDB(updates),
        updated_at: new Date().toISOString(),
        last_modified_device: this.getDeviceId()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update recurring task: ${error.message}`)
    
    return this.transformRecurringTaskFromDB(data)
  }

  async deleteRecurringTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete recurring task: ${error.message}`)
  }

  // =====================================================
  // DAILY QUOTES
  // =====================================================

  async getDailyQuotes(): Promise<{ [date: string]: any }> {
    const { data, error } = await supabase
      .from('daily_quotes')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch daily quotes: ${error.message}`)
    
    const dailyQuotes: { [date: string]: any } = {}
    
    data?.forEach(quote => {
      const quoteDate = quote.date as string
      dailyQuotes[quoteDate] = {
        quote: quote.quote as string,
        author: quote.author as string,
        date: quoteDate,
        mood: quote.mood as string
      }
    })
    
    return dailyQuotes
  }

  async getDailyQuote(date: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('daily_quotes')
      .select('*')
      .eq('date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch daily quote: ${error.message}`)
    }
    
    if (!data) return null
    
    return {
      quote: data.quote,
      author: data.author,
      date: data.date,
      mood: data.mood
    }
  }

  async saveDailyQuote(date: string, quote: any): Promise<void> {
    const { error } = await supabase
      .from('daily_quotes')
      .upsert([{
        date,
        quote: quote.quote,
        author: quote.author,
        mood: quote.mood || 'motivational',
        last_modified_device: this.getDeviceId()
      }])
    
    if (error) throw new Error(`Failed to save daily quote: ${error.message}`)
  }

  async deleteDailyQuote(date: string): Promise<void> {
    const { error } = await supabase
      .from('daily_quotes')
      .delete()
      .eq('date', date)
    
    if (error) throw new Error(`Failed to delete daily quote: ${error.message}`)
  }

  // =====================================================
  // USER PREFERENCES
  // =====================================================

  async getUserPreferences(): Promise<any> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch user preferences: ${error.message}`)
    }
    
    return data || {}
  }

  async saveUserPreferences(preferences: any): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .upsert([{
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...preferences,
        updated_at: new Date().toISOString()
      }])
    
    if (error) throw new Error(`Failed to save user preferences: ${error.message}`)
  }

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  async getAllData() {
    const [goals, tinyGoals, dailyTasks, recurringTasks, preferences] = await Promise.all([
      this.getGoals(),
      this.getTinyGoals(),
      this.getDailyTasks(),
      this.getRecurringTasks(),
      this.getUserPreferences()
    ])

    return {
      goals,
      tinyGoals,
      dailyTasks,
      recurringTasks,
      preferences
    }
  }

  async importData(_data: any): Promise<void> {
    // This would be used for data migration from localStorage
    // Implementation would depend on the specific migration strategy
    throw new Error('Data import not yet implemented')
  }

  // =====================================================
  // TRANSFORM METHODS
  // =====================================================

  private transformGoalToDB(goal: any) {
    return {
      text: goal.text,
      description: goal.description,
      category: goal.category,
      progress: goal.progress,
      target_date: goal.targetDate,
      completed_at: goal.completedAt,
      last_modified_device: this.getDeviceId()
    }
  }

  private transformGoalFromDB(dbGoal: any): Goal {
    return {
      id: dbGoal.id,
      text: dbGoal.text,
      description: dbGoal.description,
      category: dbGoal.category,
      progress: dbGoal.progress,
      targetDate: dbGoal.target_date,
      completedAt: dbGoal.completed_at,
      createdAt: dbGoal.created_at,
      updatedAt: dbGoal.updated_at,
      subtasks: [] // Note: Subtasks would need separate handling
    }
  }

  private transformTinyGoalToDB(tinyGoal: any) {
    return {
      text: tinyGoal.text,
      completed_at: tinyGoal.completedAt,
      last_modified_device: this.getDeviceId()
    }
  }

  private transformTinyGoalFromDB(dbTinyGoal: any): TinyGoal {
    return {
      id: dbTinyGoal.id,
      text: dbTinyGoal.text,
      completedAt: dbTinyGoal.completed_at
    }
  }

  private transformRecurringTaskToDB(task: any) {
    return {
      text: task.text,
      recurrence_type: task.recurrenceType,
      weekly_days: task.weeklyDays,
      monthly_option: task.monthlyOption,
      last_completed: task.lastCompleted,
      last_modified_device: this.getDeviceId()
    }
  }

  private transformRecurringTaskFromDB(dbTask: any): RecurringTask {
    return {
      id: dbTask.id,
      text: dbTask.text,
      recurrenceType: dbTask.recurrence_type,
      weeklyDays: dbTask.weekly_days,
      monthlyOption: dbTask.monthly_option,
      lastCompleted: dbTask.last_completed,
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at
    }
  }
}

// Export a singleton instance
export const cloudStorage = new CloudStorageService()
