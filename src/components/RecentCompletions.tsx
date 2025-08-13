import React from 'react';
import { CheckCircle } from 'lucide-react';
import CompletionItem from './CompletionItem';
import type { CompletedGoal } from '../types/achievement';

interface RecentCompletionsProps {
  completions: CompletedGoal[];
  onMarkIncomplete: (goalId: number, type: 'big' | 'tiny') => void;
}

const RecentCompletions: React.FC<RecentCompletionsProps> = ({ completions, onMarkIncomplete }) => {
  if (completions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Recent Completions
        </h3>
        
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p>No completed goals yet.</p>
          <p className="text-sm mt-1">Complete your first goal to see it here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        Recent Completions
      </h3>
      
      <div className="space-y-3">
        {completions.map((completion) => (
          <CompletionItem 
            key={`${completion.type}-${completion.id}`}
            completion={completion}
            onMarkIncomplete={onMarkIncomplete}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentCompletions;
