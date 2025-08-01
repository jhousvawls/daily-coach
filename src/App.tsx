import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { useAI } from './hooks/useAI';
import { getToday, getYesterday } from './utils/date';
import type { Goals, TinyGoal } from './types/goal';
import type { DailyTasks, RecurringTask } from './types/task';
import type { UserData } from './types/user';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import YesterdayCheckin from './components/YesterdayCheckin';
import BrainDumpModal from './components/BrainDumpModal';

function App() {
  // Core state
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const [goals, setGoals] = useState<Goals>(() => storage.getGoals());
  const [tinyGoals, setTinyGoals] = useState<TinyGoal[]>(() => storage.getTinyGoals());
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>(() => storage.getDailyTasks());
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>(() => storage.getRecurringTasks());
  const [userData, setUserData] = useState<UserData>(() => storage.getUserData());

  // UI state
  const [showYesterdayCheckin, setShowYesterdayCheckin] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [todayFocus, setTodayFocus] = useState('');
  const [isFocusSet, setIsFocusSet] = useState(false);

  // AI hook
  const { isGenerating, error: aiError, synthesizeFocus, setApiKey } = useAI();

  // Date helpers
  const today = getToday();
  const yesterday = getYesterday();
  const yesterdayTask = dailyTasks[yesterday];
  const todayTask = dailyTasks[today] || { text: '', completed: false };

  // Initialize API key and check if focus is already set
  useEffect(() => {
    if (userData.apiKey) {
      setApiKey(userData.apiKey);
    }
    
    if (todayTask.text) {
      setTodayFocus(todayTask.text);
      setIsFocusSet(true);
    }

    // Hide yesterday checkin if no task or already handled
    if (!yesterdayTask || yesterdayTask.completed !== undefined) {
      setShowYesterdayCheckin(false);
    }
  }, [userData.apiKey, todayTask.text, yesterdayTask, setApiKey]);

  // Persist data changes
  useEffect(() => {
    storage.setGoals(goals);
  }, [goals]);

  useEffect(() => {
    storage.setTinyGoals(tinyGoals);
  }, [tinyGoals]);

  useEffect(() => {
    storage.setDailyTasks(dailyTasks);
  }, [dailyTasks]);

  useEffect(() => {
    storage.setRecurringTasks(recurringTasks);
  }, [recurringTasks]);

  useEffect(() => {
    storage.setUserData(userData);
  }, [userData]);

  // Handlers
  const handleSetFocus = () => {
    if (todayFocus.trim()) {
      setDailyTasks(prev => ({
        ...prev,
        [today]: { text: todayFocus, completed: false }
      }));
      setIsFocusSet(true);
    }
  };

  const handleCompleteTodayTask = () => {
    setDailyTasks(prev => ({
      ...prev,
      [today]: {
        ...prev[today],
        completed: !prev[today]?.completed,
        completedAt: !prev[today]?.completed ? new Date().toISOString() : undefined
      }
    }));
  };

  const handleYesterdayCompletion = (completed: boolean) => {
    setDailyTasks(prev => ({
      ...prev,
      [yesterday]: {
        ...prev[yesterday],
        completed,
        completedAt: completed ? new Date().toISOString() : undefined
      }
    }));
    setShowYesterdayCheckin(false);
  };

  const handleAddGoal = (text: string, category: 'personal' | 'professional') => {
    const newGoal = {
      id: Date.now(),
      text,
      progress: 0,
      subtasks: [],
      completedAt: undefined,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setGoals(prev => ({
      ...prev,
      [category]: [...prev[category], newGoal]
    }));
  };

  const handleCompleteBigGoal = (goalId: number, category: 'personal' | 'professional') => {
    setGoals(prev => ({
      ...prev,
      [category]: prev[category].map(g =>
        g.id === goalId
          ? { ...g, progress: 100, completedAt: new Date().toISOString() }
          : g
      )
    }));
  };

  const handleAddTinyGoal = (text: string) => {
    const newGoal = {
      id: Date.now(),
      text,
      completedAt: undefined
    };
    setTinyGoals(prev => [newGoal, ...prev]);
  };

  const handleToggleTinyGoal = (goalId: number) => {
    setTinyGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, completedAt: g.completedAt ? undefined : new Date().toISOString() }
          : g
      )
    );
  };

  const handleSynthesizeFocus = async (brainDump: string) => {
    if (!brainDump.trim()) return;
    
    const result = await synthesizeFocus(brainDump);
    if (result) {
      setTodayFocus(result);
      setShowAiModal(false);
    }
  };

  const handleAddRecurringTask = (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: RecurringTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRecurringTasks(prev => [...prev, newTask]);
  };

  const handleCompleteRecurringTask = (taskId: string) => {
    setRecurringTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, lastCompleted: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const handleUpdateUserData = (updates: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...updates }));
    if (updates.apiKey) {
      setApiKey(updates.apiKey);
    }
  };

  // Calculate stats
  const completedTasksCount = Object.values(dailyTasks).filter(t => t.completed).length;
  const totalTasks = Object.keys(dailyTasks).length;

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6">
        <Header setView={setView} />
        
        {/* Yesterday Check-in Modal */}
        {showYesterdayCheckin && yesterdayTask && (
          <YesterdayCheckin
            task={yesterdayTask}
            onComplete={handleYesterdayCompletion}
          />
        )}

        {/* AI Brain Dump Modal */}
        {showAiModal && (
          <BrainDumpModal
            onClose={() => setShowAiModal(false)}
            onSynthesize={handleSynthesizeFocus}
            isGenerating={isGenerating}
            error={aiError}
          />
        )}

        {/* Main Content */}
        <main
          className={`transition-opacity duration-500 ${
            showYesterdayCheckin || showAiModal
              ? 'opacity-30 blur-sm pointer-events-none'
              : 'opacity-100'
          }`}
        >
          {view === 'settings' ? (
            <Settings
              userData={userData}
              onUpdateUserData={handleUpdateUserData}
              onBack={() => setView('dashboard')}
            />
          ) : (
            <Dashboard
              goals={goals}
              dailyTasks={dailyTasks}
              tinyGoals={tinyGoals}
              recurringTasks={recurringTasks}
              todayFocus={todayFocus}
              setTodayFocus={setTodayFocus}
              isFocusSet={isFocusSet}
              todayTask={todayTask}
              completedTasksCount={completedTasksCount}
              totalTasks={totalTasks}
              onSetFocus={handleSetFocus}
              onCompleteTodayTask={handleCompleteTodayTask}
              onAddGoal={handleAddGoal}
              onCompleteBigGoal={handleCompleteBigGoal}
              onAddTinyGoal={handleAddTinyGoal}
              onToggleTinyGoal={handleToggleTinyGoal}
              onAddRecurringTask={handleAddRecurringTask}
              onCompleteRecurringTask={handleCompleteRecurringTask}
              onShowAiModal={() => setShowAiModal(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
