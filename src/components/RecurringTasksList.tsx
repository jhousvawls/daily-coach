import React, { useState } from 'react';
import { Repeat, Plus, CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import type { RecurringTask } from '../types/task';
import { formatShortDate, isSameDay, isSameMonth, isFirstDayOfMonth, isMidMonth, isLastDayOfMonth } from '../utils/date';

interface RecurringTasksListProps {
  tasks: RecurringTask[];
  onAddTask: (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCompleteTask: (taskId: string) => void;
}

const RecurringTasksList: React.FC<RecurringTasksListProps> = ({ 
  tasks, 
  onAddTask, 
  onCompleteTask 
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [monthlyOption, setMonthlyOption] = useState<'firstDay' | 'midMonth' | 'lastDay'>('firstDay');

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayFullNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if a task is completable today
  const isCompletable = (task: RecurringTask): boolean => {
    const today = new Date();
    const todayDay = today.getDay(); // 0-6

    // Check if already completed today/this month
    if (task.lastCompleted) {
      const lastCompletedDate = new Date(task.lastCompleted);
      if (task.recurrenceType === 'weekly') {
        // Check if completed today
        if (isSameDay(lastCompletedDate, today)) {
          return false;
        }
      } else {
        // Check if completed this month
        if (isSameMonth(lastCompletedDate, today)) {
          return false;
        }
      }
    }

    // Check schedule match
    if (task.recurrenceType === 'weekly') {
      return task.weeklyDays?.includes(todayDay) || false;
    } else {
      switch (task.monthlyOption) {
        case 'firstDay': return isFirstDayOfMonth(today);
        case 'midMonth': return isMidMonth(today);
        case 'lastDay': return isLastDayOfMonth(today);
        default: return false;
      }
    }
  };

  // Get schedule description for display
  const getScheduleDescription = (task: RecurringTask): string => {
    if (task.recurrenceType === 'weekly') {
      const selectedDays = task.weeklyDays?.map(day => dayFullNames[day]).join(', ');
      return `Every ${selectedDays}`;
    } else {
      switch (task.monthlyOption) {
        case 'firstDay': return 'On the 1st of each month';
        case 'midMonth': return 'On the 15th of each month';
        case 'lastDay': return 'On the last day of each month';
        default: return 'Monthly';
      }
    }
  };

  // Toggle day selection for weekly tasks
  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  // Handle adding a new task
  const handleAdd = () => {
    if (!newTaskText.trim()) return;

    if (recurrenceType === 'weekly' && selectedDays.length === 0) {
      return; // Need at least one day selected for weekly tasks
    }

    const newTask: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'> = {
      text: newTaskText.trim(),
      recurrenceType,
      ...(recurrenceType === 'weekly' 
        ? { weeklyDays: selectedDays }
        : { monthlyOption }
      ),
    };

    onAddTask(newTask);
    
    // Reset form
    setNewTaskText('');
    setSelectedDays([]);
    setRecurrenceType('weekly');
    setMonthlyOption('firstDay');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  // Check if task was completed today/this month
  const isCompletedToday = (task: RecurringTask): boolean => {
    if (!task.lastCompleted) return false;
    
    const lastCompletedDate = new Date(task.lastCompleted);
    const today = new Date();
    
    if (task.recurrenceType === 'weekly') {
      return isSameDay(lastCompletedDate, today);
    } else {
      return isSameMonth(lastCompletedDate, today);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Repeat className="text-orange-400" size={24} />
        <h3 className="text-lg font-bold text-gray-800">Recurring Tasks</h3>
      </div>

      {/* Tasks List */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
        {tasks.map((task) => {
          const completable = isCompletable(task);
          const completed = isCompletedToday(task);
          
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => completable && onCompleteTask(task.id)}
            >
              <div className="flex-shrink-0">
                {completed ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : completable ? (
                  <Circle size={20} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                ) : (
                  <Circle size={20} className="text-gray-200" />
                )}
              </div>
              <div className="flex-grow">
                <p
                  className={`font-medium text-sm ${
                    completed 
                      ? 'line-through text-gray-400' 
                      : completable 
                        ? 'text-gray-700' 
                        : 'text-gray-500'
                  }`}
                >
                  {task.text}
                </p>
                <p className="text-xs text-gray-400">
                  {getScheduleDescription(task)}
                </p>
                {task.lastCompleted && (
                  <p className="text-xs text-gray-400">
                    Last completed: {formatShortDate(task.lastCompleted)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <p className="text-center text-gray-400 text-sm pt-4">
            No recurring tasks yet.
          </p>
        )}
      </div>

      {/* Add New Task Form */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        {/* Task Input */}
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a recurring task..."
          className="w-full p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-shadow"
        />

        {/* Recurrence Type Selector */}
        <div className="relative">
          <select
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value as 'weekly' | 'monthly')}
            className="w-full p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-shadow appearance-none bg-white pr-8"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Conditional UI based on recurrence type */}
        {recurrenceType === 'weekly' ? (
          <div>
            <p className="text-xs text-gray-500 mb-2">Select days:</p>
            <div className="flex gap-1">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  onClick={() => toggleDay(index)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    selectedDays.includes(index)
                      ? 'bg-orange-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative">
            <select
              value={monthlyOption}
              onChange={(e) => setMonthlyOption(e.target.value as 'firstDay' | 'midMonth' | 'lastDay')}
              className="w-full p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-shadow appearance-none bg-white pr-8"
            >
              <option value="firstDay">First Day of Month</option>
              <option value="midMonth">Mid Month (15th)</option>
              <option value="lastDay">Last Day of Month</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={
            !newTaskText.trim() || 
            (recurrenceType === 'weekly' && selectedDays.length === 0)
          }
          className="w-full bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Quick Stats */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {tasks.filter(t => isCompletedToday(t)).length} completed today
            </span>
            <span>
              {tasks.filter(t => isCompletable(t) && !isCompletedToday(t)).length} due today
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTasksList;
