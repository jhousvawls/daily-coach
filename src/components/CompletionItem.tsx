import React from 'react';
import { Target, Zap, RotateCcw } from 'lucide-react';
import { formatDisplayDate } from '../utils/date';
import type { CompletedGoal } from '../types/achievement';

interface CompletionItemProps {
  completion: CompletedGoal;
  onMarkIncomplete: (goalId: number, type: 'big' | 'tiny') => void;
}

const CompletionItem: React.FC<CompletionItemProps> = ({ completion, onMarkIncomplete }) => {
  const IconComponent = completion.type === 'big' ? Target : Zap;
  const iconColor = completion.type === 'big' ? 'text-blue-500' : 'text-green-500';
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <IconComponent className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {completion.text}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Completed {formatDisplayDate(completion.completedAt)}
            {completion.completionTimeInDays > 0 && (
              <span className="ml-2">• {completion.completionTimeInDays} day{completion.completionTimeInDays !== 1 ? 's' : ''}</span>
            )}
            {completion.category && (
              <span className="ml-2">• {completion.category}</span>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onMarkIncomplete(completion.id, completion.type)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 ml-2 flex-shrink-0"
        title="Mark as incomplete"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CompletionItem;
