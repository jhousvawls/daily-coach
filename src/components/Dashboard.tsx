import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, Settings2, RotateCcw, Check } from 'lucide-react';
import { storage } from '../services/storage';
import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTask } from '../types/task';
import type { DailyQuote } from '../services/storage';
import type { TeamMemberData } from '../types/team';
import type { AgencyFocusData, QuarterlyFocusData } from '../types/agency';

// Import sub-components
import MotivationalQuote from './MotivationalQuote';
import FocusCard from './FocusCard';
import ProgressTracker from './ProgressTracker';
import GoalsList from './GoalsList';
import TinyGoalsList from './TinyGoalsList';
import AgencyFocus from './AgencyFocus';
import KeyFocusAreas from './KeyFocusAreas';

// Section configuration
const DEFAULT_SECTION_ORDER = [
  'quote',
  'focus',
  'progress',
  'goals',
  'tiny-goals',
  'agency-focus',
  'key-focus-areas',
];

const SECTION_LABELS: Record<string, string> = {
  'quote': 'Daily Quote',
  'focus': "Today's Focus",
  'progress': 'Progress Tracker',
  'goals': 'Big Goals',
  'tiny-goals': 'Tiny Goals',
  'agency-focus': 'Agency Focus',
  'key-focus-areas': 'Key Focus Areas',
};

interface DashboardProps {
  goals: Goals;
  tinyGoals: TinyGoal[];
  todayFocus: string;
  setTodayFocus: (focus: string) => void;
  isFocusSet: boolean;
  todayTask: DailyTask;
  completedTasksCount: number;
  totalTasks: number;
  dailyQuote: DailyQuote | null;
  isQuoteLoading: boolean;
  showDailyQuote: boolean;
  onSetFocus: () => void;
  onCompleteTodayTask: () => void;
  onAddGoal: (text: string, category: 'personal' | 'professional') => void;
  onCompleteBigGoal: (goalId: number, category: 'personal' | 'professional') => void;
  onAddTinyGoal: (text: string) => void;
  onToggleTinyGoal: (goalId: number) => void;
  onShowAiModal: () => void;
  onRefreshQuote: (mood: string) => void;
  onRefreshFocus: () => void;
  agencyFocusData: AgencyFocusData;
  onUpdateAgencyFocus: (data: AgencyFocusData) => void;
  quarterlyFocusData: QuarterlyFocusData;
  onUpdateQuarterlyFocus: (data: QuarterlyFocusData) => void;
  teamMemberData?: TeamMemberData | null;
  isTeamMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const {
    goals, tinyGoals, todayFocus, setTodayFocus, isFocusSet, todayTask,
    completedTasksCount, totalTasks, dailyQuote, isQuoteLoading, showDailyQuote,
    onSetFocus, onCompleteTodayTask, onAddGoal, onCompleteBigGoal,
    onAddTinyGoal, onToggleTinyGoal, onShowAiModal, onRefreshQuote, onRefreshFocus,
    agencyFocusData, onUpdateAgencyFocus, quarterlyFocusData, onUpdateQuarterlyFocus,
    teamMemberData, isTeamMode,
  } = props;

  // Section order state
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const saved = storage.getSectionOrder();
    if (saved && saved.length === DEFAULT_SECTION_ORDER.length) return saved;
    return DEFAULT_SECTION_ORDER;
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Touch drag state
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const touchDraggedEl = useRef<HTMLDivElement | null>(null);

  // Render a section by ID
  const renderSection = useCallback((sectionId: string) => {
    switch (sectionId) {
      case 'quote':
        return (
          <MotivationalQuote
            dailyQuote={dailyQuote}
            isLoading={isQuoteLoading}
            onRefreshQuote={onRefreshQuote}
            enabled={showDailyQuote}
          />
        );
      case 'focus':
        return (
          <FocusCard
            todayFocus={todayFocus}
            setTodayFocus={setTodayFocus}
            isFocusSet={isFocusSet}
            todayTask={todayTask}
            onSetFocus={onSetFocus}
            onCompleteTodayTask={onCompleteTodayTask}
            onShowAiModal={onShowAiModal}
            onRefreshFocus={onRefreshFocus}
          />
        );
      case 'progress':
        return (
          <ProgressTracker
            completed={completedTasksCount}
            total={totalTasks}
          />
        );
      case 'goals':
        return (
          <GoalsList
            goals={goals}
            onAddGoal={onAddGoal}
            onCompleteBigGoal={onCompleteBigGoal}
            teamMemberData={teamMemberData}
            isTeamMode={isTeamMode}
          />
        );
      case 'tiny-goals':
        return (
          <TinyGoalsList
            goals={tinyGoals}
            onAddGoal={onAddTinyGoal}
            onToggleGoal={onToggleTinyGoal}
          />
        );
      case 'agency-focus':
        return (
          <AgencyFocus
            data={agencyFocusData}
            onUpdateData={onUpdateAgencyFocus}
          />
        );
      case 'key-focus-areas':
        return (
          <KeyFocusAreas
            data={quarterlyFocusData}
            onUpdateData={onUpdateQuarterlyFocus}
          />
        );
      default:
        return null;
    }
  }, [
    dailyQuote, isQuoteLoading, onRefreshQuote, showDailyQuote,
    todayFocus, setTodayFocus, isFocusSet, todayTask, onSetFocus, onCompleteTodayTask, onShowAiModal, onRefreshFocus,
    completedTasksCount, totalTasks,
    goals, onAddGoal, onCompleteBigGoal, teamMemberData, isTeamMode,
    tinyGoals, onAddTinyGoal, onToggleTinyGoal,
    agencyFocusData, onUpdateAgencyFocus,
    quarterlyFocusData, onUpdateQuarterlyFocus,
  ]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    if (!isEditMode) return;
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
    // Make the drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedSection(null);
    setDragOverSection(null);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    if (!isEditMode || !draggedSection || draggedSection === sectionId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Determine if above or below the midpoint
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const pos = e.clientY < midpoint ? 'above' : 'below';
    
    setDragOverSection(sectionId);
    setDropPosition(pos);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;

    setSectionOrder(prev => {
      const newOrder = [...prev];
      const dragIdx = newOrder.indexOf(draggedSection);
      
      // Remove dragged item
      newOrder.splice(dragIdx, 1);
      
      // Insert at new position
      let insertIdx = newOrder.indexOf(targetSectionId);
      if (dropPosition === 'below') insertIdx += 1;
      newOrder.splice(insertIdx, 0, draggedSection);
      
      return newOrder;
    });

    setDraggedSection(null);
    setDragOverSection(null);
    setDropPosition(null);
  };

  // Touch drag handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, sectionId: string) => {
    if (!isEditMode) return;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    setDraggedSection(sectionId);
    touchDraggedEl.current = sectionRefs.current[sectionId] || null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isEditMode || !draggedSection) return;
    e.preventDefault();
    touchCurrentY.current = e.touches[0].clientY;

    // Find which section we're over
    for (const [id, ref] of Object.entries(sectionRefs.current)) {
      if (!ref || id === draggedSection) continue;
      const rect = ref.getBoundingClientRect();
      if (touchCurrentY.current >= rect.top && touchCurrentY.current <= rect.bottom) {
        const midpoint = rect.top + rect.height / 2;
        setDragOverSection(id);
        setDropPosition(touchCurrentY.current < midpoint ? 'above' : 'below');
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isEditMode || !draggedSection || !dragOverSection) {
      setDraggedSection(null);
      setDragOverSection(null);
      setDropPosition(null);
      return;
    }

    setSectionOrder(prev => {
      const newOrder = [...prev];
      const dragIdx = newOrder.indexOf(draggedSection);
      newOrder.splice(dragIdx, 1);
      let insertIdx = newOrder.indexOf(dragOverSection);
      if (dropPosition === 'below') insertIdx += 1;
      newOrder.splice(insertIdx, 0, draggedSection);
      return newOrder;
    });

    setDraggedSection(null);
    setDragOverSection(null);
    setDropPosition(null);
    touchDraggedEl.current = null;
  };

  // Save/Reset handlers
  const handleSave = () => {
    storage.setSectionOrder(sectionOrder);
    setIsEditMode(false);
  };

  const handleReset = () => {
    setSectionOrder(DEFAULT_SECTION_ORDER);
    storage.setSectionOrder(DEFAULT_SECTION_ORDER);
  };

  // Auto-save when leaving edit mode
  useEffect(() => {
    if (!isEditMode) {
      storage.setSectionOrder(sectionOrder);
    }
  }, [isEditMode, sectionOrder]);

  return (
    <div className="space-y-6">
      {/* Customize Layout Button */}
      <div className="flex justify-end">
        {isEditMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 
                         bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg 
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white 
                         bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Check size={14} />
              Done
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 
                       hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Settings2 size={14} />
            Customize Layout
          </button>
        )}
      </div>

      {/* Sections */}
      {sectionOrder.map((sectionId) => (
        <div
          key={sectionId}
          ref={(el) => { sectionRefs.current[sectionId] = el; }}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, sectionId)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, sectionId)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, sectionId)}
          onTouchStart={(e) => handleTouchStart(e, sectionId)}
          onTouchMove={(e) => handleTouchMove(e)}
          onTouchEnd={handleTouchEnd}
          className={`relative transition-all duration-200 ${
            isEditMode ? 'cursor-grab active:cursor-grabbing' : ''
          } ${
            draggedSection === sectionId ? 'opacity-50 scale-[0.98]' : ''
          } ${
            dragOverSection === sectionId && dropPosition === 'above'
              ? 'border-t-2 border-t-blue-500 pt-1'
              : ''
          } ${
            dragOverSection === sectionId && dropPosition === 'below'
              ? 'border-b-2 border-b-blue-500 pb-1'
              : ''
          }`}
        >
          {/* Edit mode handle overlay */}
          {isEditMode && (
            <div className="absolute -left-2 top-0 bottom-0 w-8 flex items-center justify-center z-10 
                            opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex flex-col items-center gap-0.5 bg-white dark:bg-gray-800 
                              border border-gray-200 dark:border-gray-700 rounded-lg px-1 py-2 shadow-sm">
                <GripVertical size={16} className="text-gray-400 dark:text-gray-500" />
                <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap leading-tight">
                  {SECTION_LABELS[sectionId]}
                </span>
              </div>
            </div>
          )}
          
          {/* Section content */}
          <div className={isEditMode ? 'ml-6 ring-1 ring-dashed ring-gray-200 dark:ring-gray-700 rounded-2xl' : ''}>
            {renderSection(sectionId)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
