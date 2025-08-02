import { useState, useCallback } from 'react';
import { aiService, type AIInsight, type ThemeAnalysisResult, type FocusCandidate } from '../services/ai';
import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTasks } from '../types/task';

export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const synthesizeFocus = useCallback(async (brainDump: string): Promise<string | null> => {
    if (!brainDump.trim()) return null;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await aiService.synthesizeFocusFromBrainDump(brainDump);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to synthesize focus';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const analyzePatterns = useCallback(async (
    dailyTasks: DailyTasks, 
    goals: Goals
  ): Promise<AIInsight[] | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const insights = await aiService.analyzePatterns(dailyTasks, goals);
      return insights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze patterns';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const breakdownGoal = useCallback(async (
    goalText: string, 
    targetDate?: string
  ): Promise<string[] | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const tasks = await aiService.breakdownGoal(goalText, targetDate);
      return tasks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to breakdown goal';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const recommendPriority = useCallback(async (
    goals: Goals,
    recentTasks: DailyTasks,
    tinyGoals: TinyGoal[]
  ): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const recommendation = await aiService.recommendPriority(goals, recentTasks, tinyGoals);
      return recommendation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendation';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const analyzeTasksAndGenerateCandidates = useCallback(async (brainDump: string): Promise<ThemeAnalysisResult | null> => {
    if (!brainDump.trim()) return null;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await aiService.analyzeTasksAndGenerateCandidates(brainDump);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze tasks';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const selectFocusByMethod = useCallback(async (
    candidates: FocusCandidate[], 
    method: string
  ): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await aiService.selectFocusByMethod(candidates, method);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select focus';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateSubtaskBreakdown = useCallback(async (focus: string): Promise<string[] | null> => {
    if (!focus.trim()) return null;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const subtasks = await aiService.generateSubtaskBreakdown(focus);
      return subtasks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate subtasks';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    aiService.setApiKey(key);
    setError(null);
  }, []);

  return {
    isGenerating,
    error,
    synthesizeFocus,
    analyzePatterns,
    breakdownGoal,
    recommendPriority,
    analyzeTasksAndGenerateCandidates,
    selectFocusByMethod,
    generateSubtaskBreakdown,
    setApiKey,
  };
}
