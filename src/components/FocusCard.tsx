import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import type { DailyTask } from '../types/task';
import { MESSAGES, PLACEHOLDERS } from '../utils/constants';

interface FocusCardProps {
  todayFocus: string;
  setTodayFocus: (focus: string) => void;
  isFocusSet: boolean;
  todayTask: DailyTask;
  onSetFocus: () => void;
  onCompleteTodayTask: () => void;
  onShowAiModal: () => void;
}

const FocusCard: React.FC<FocusCardProps> = ({
  todayFocus,
  setTodayFocus,
  isFocusSet,
  todayTask,
  onSetFocus,
  onCompleteTodayTask,
  onShowAiModal,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Today's Focus</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{MESSAGES.FOCUS_QUESTION}</p>

      {!isFocusSet ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={todayFocus}
              onChange={(e) => setTodayFocus(e.target.value)}
              placeholder={PLACEHOLDERS.TASK_INPUT}
              className="flex-grow p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onSetFocus();
                }
              }}
            />
            <button
              onClick={onSetFocus}
              disabled={!todayFocus.trim()}
              className="bg-gray-700 dark:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Set Focus
              <ArrowRight size={18} />
            </button>
          </div>
          
          <div className="text-center">
            <button
              onClick={onShowAiModal}
              className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <Sparkles size={16} />
              Use AI Assist
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onClick={onCompleteTodayTask}
            className={`p-4 rounded-lg flex items-center gap-4 cursor-pointer transition-all duration-300 ${
              todayTask.completed
                ? 'bg-green-100 dark:bg-green-900/30 text-gray-500 dark:text-gray-400 line-through'
                : 'bg-orange-100 dark:bg-orange-900/30'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                todayTask.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-orange-400'
              }`}
            >
              {todayTask.completed && (
                <CheckCircle2 size={16} className="text-white" />
              )}
            </div>
            <p className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex-grow">
              {todayTask.text}
            </p>
          </div>

          {todayTask.completed && (
            <div className="text-center">
              <p className="text-green-600 dark:text-green-400 font-medium">
                🎉 Great job! You completed today's focus!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FocusCard;
