import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Home } from 'lucide-react';
import { formatDisplayDate, getToday, addDays } from '../utils/date';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  hasData?: boolean;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onDateChange,
  hasData = false
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const today = getToday();
  const isToday = selectedDate === today;

  const handlePreviousDay = () => {
    const previousDate = addDays(selectedDate, -1);
    onDateChange(previousDate);
  };

  const handleNextDay = () => {
    const nextDate = addDays(selectedDate, 1);
    onDateChange(nextDate);
  };

  const handleTodayClick = () => {
    onDateChange(today);
  };

  const getDisplayText = () => {
    if (isToday) return 'Today';
    
    const yesterday = addDays(today, -1);
    if (selectedDate === yesterday) return 'Yesterday';
    
    const tomorrow = addDays(today, 1);
    if (selectedDate === tomorrow) return 'Tomorrow';
    
    return formatDisplayDate(selectedDate);
  };

  const handleDatePickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    if (newDate) {
      onDateChange(newDate);
      setShowDatePicker(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {/* Previous Day Button */}
      <button
        onClick={handlePreviousDay}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Date Display */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Calendar Icon for Date Picker */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open date picker"
          >
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Hidden Date Input */}
          {showDatePicker && (
            <input
              type="date"
              value={selectedDate}
              onChange={handleDatePickerChange}
              className="absolute top-full left-0 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 z-50"
              autoFocus
              onBlur={() => setShowDatePicker(false)}
            />
          )}
        </div>

        {/* Date Text */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getDisplayText()}
          </h2>
          {!isToday && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedDate}
            </p>
          )}
        </div>

        {/* Data Indicator */}
        {hasData && !isToday && (
          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has data" />
        )}
      </div>

      {/* Next Day Button */}
      <button
        onClick={handleNextDay}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Today Button (only show if not today) */}
      {!isToday && (
        <button
          onClick={handleTodayClick}
          className="ml-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Home className="w-3 h-3" />
          <span className="hidden sm:inline">Today</span>
        </button>
      )}
    </div>
  );
};

export default DateNavigator;
