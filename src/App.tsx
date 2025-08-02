import { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { useAI } from './hooks/useAI';
import { getToday, getYesterday } from './utils/date';
import { aiService } from './services/ai';
import type { Goals, TinyGoal } from './types/goal';
import type { DailyTasks, RecurringTask } from './types/task';
import type { UserData } from './types/user';
import type { DailyQuote } from './services/storage';

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

  // Quote state
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

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

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (userData.preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [userData.preferences.theme]);

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

  // Initialize daily quote
  useEffect(() => {
    const loadDailyQuote = async () => {
      console.log('Loading daily quote...', {
        showDailyQuote: userData.preferences.showDailyQuote,
        hasApiKey: !!userData.apiKey,
        apiKeyLength: userData.apiKey?.length || 0,
        today
      });

      if (!userData.preferences.showDailyQuote) {
        console.log('Daily quote disabled in preferences');
        setDailyQuote(null);
        return;
      }

      // Check if we already have a quote for today
      const existingQuote = storage.getDailyQuote(today);
      if (existingQuote) {
        console.log('Found existing quote for today:', existingQuote);
        setDailyQuote(existingQuote);
        return;
      }

      // Generate new quote for today
      if (userData.apiKey && userData.apiKey.trim()) {
        console.log('Generating new quote with API key...');
        setIsQuoteLoading(true);
        aiService.setApiKey(userData.apiKey);
        
        try {
          const { quote, author } = await aiService.generateDailyQuote('motivational');
          const newQuote: DailyQuote = {
            quote,
            author,
            date: today,
            mood: 'motivational'
          };
          
          console.log('Generated new quote:', newQuote);
          storage.setDailyQuote(today, newQuote);
          setDailyQuote(newQuote);
        } catch (error) {
          console.error('Failed to generate daily quote:', error);
          // Set a fallback quote
          const fallbackQuote: DailyQuote = {
            quote: "The way to get started is to quit talking and begin doing.",
            author: "Walt Disney",
            date: today,
            mood: 'motivational'
          };
          console.log('Using fallback quote:', fallbackQuote);
          storage.setDailyQuote(today, fallbackQuote);
          setDailyQuote(fallbackQuote);
        } finally {
          setIsQuoteLoading(false);
        }
      } else {
        console.log('No API key available for quote generation');
        // Set a fallback quote when no API key
        const fallbackQuote: DailyQuote = {
          quote: "The way to get started is to quit talking and begin doing.",
          author: "Walt Disney",
          date: today,
          mood: 'motivational'
        };
        console.log('Using fallback quote (no API key):', fallbackQuote);
        storage.setDailyQuote(today, fallbackQuote);
        setDailyQuote(fallbackQuote);
      }
    };

    loadDailyQuote();
  }, [today, userData.apiKey, userData.preferences.showDailyQuote]);

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

  const handleSynthesizeFocus = async (brainDump: string) => {
    if (!brainDump.trim()) return;
    
    const result = await synthesizeFocus(brainDump);
    if (result) {
      setTodayFocus(result);
      setShowAiModal(false);
    }
  };

  const handleUpdateUserData = (updates: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...updates }));
    if (updates.apiKey) {
      setApiKey(updates.apiKey);
    }
  };

  const handleRefreshQuote = async (mood: string) => {
    console.log('Refreshing quote...', {
      mood,
      hasApiKey: !!userData.apiKey,
      apiKeyLength: userData.apiKey?.length || 0
    });

    if (!userData.apiKey || !userData.apiKey.trim()) {
      console.error('No API key available for quote refresh');
      return;
    }

    setIsQuoteLoading(true);
    aiService.setApiKey(userData.apiKey);
    
    try {
      console.log('Calling aiService.generateDailyQuote with mood:', mood);
      const { quote, author } = await aiService.generateDailyQuote(mood);
      const newQuote: DailyQuote = {
        quote,
        author,
        date: today,
        mood
      };
      
      console.log('Successfully generated new quote:', newQuote);
      storage.setDailyQuote(today, newQuote);
      setDailyQuote(newQuote);
    } catch (error) {
      console.error('Failed to refresh daily quote:', error);
      // Show fallback quote on error
      const fallbackQuote: DailyQuote = {
        quote: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        date: today,
        mood
      };
      console.log('Using fallback quote after error:', fallbackQuote);
      storage.setDailyQuote(today, fallbackQuote);
      setDailyQuote(fallbackQuote);
    } finally {
      setIsQuoteLoading(false);
    }
  };

  // Calculate stats
  const completedTasksCount = Object.values(dailyTasks).filter(t => t.completed).length;
  const totalTasks = Object.keys(dailyTasks).length;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6">
        <Header view={view} setView={setView} />
        
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
              recurringTasks={recurringTasks}
              onUpdateUserData={handleUpdateUserData}
              onAddRecurringTask={handleAddRecurringTask}
              onCompleteRecurringTask={handleCompleteRecurringTask}
              onBack={() => setView('dashboard')}
            />
          ) : (
            <Dashboard
              goals={goals}
              tinyGoals={tinyGoals}
              todayFocus={todayFocus}
              setTodayFocus={setTodayFocus}
              isFocusSet={isFocusSet}
              todayTask={todayTask}
              completedTasksCount={completedTasksCount}
              totalTasks={totalTasks}
              dailyQuote={dailyQuote}
              isQuoteLoading={isQuoteLoading}
              showDailyQuote={userData.preferences.showDailyQuote}
              onSetFocus={handleSetFocus}
              onCompleteTodayTask={handleCompleteTodayTask}
              onAddGoal={handleAddGoal}
              onCompleteBigGoal={handleCompleteBigGoal}
              onAddTinyGoal={handleAddTinyGoal}
              onToggleTinyGoal={handleToggleTinyGoal}
              onShowAiModal={() => setShowAiModal(true)}
              onRefreshQuote={handleRefreshQuote}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
