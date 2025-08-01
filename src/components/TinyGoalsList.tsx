import React, { useState } from 'react';
import { Zap, Plus, CheckSquare, Square } from 'lucide-react';
import type { TinyGoal } from '../types/goal';
import { formatShortDate } from '../utils/date';

interface TinyGoalsListProps {
  goals: TinyGoal[];
  onAddGoal: (text: string) => void;
  onToggleGoal: (goalId: number) => void;
}

const TinyGoalsList: React.FC<TinyGoalsListProps> = ({ goals, onAddGoal, onToggleGoal }) => {
  const [newGoalText, setNewGoalText] = useState('');

  const handleAdd = () => {
    if (newGoalText.trim()) {
      onAddGoal(newGoalText);
      setNewGoalText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="text-orange-400" size={24} />
        <h3 className="text-lg font-bold text-gray-800">Tiny Goals</h3>
      </div>

      {/* Goals List */}
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onToggleGoal(goal.id)}
          >
            <div className="flex-shrink-0">
              {goal.completedAt ? (
                <CheckSquare size={20} className="text-green-500" />
              ) : (
                <Square size={20} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
              )}
            </div>
            <div className="flex-grow">
              <p
                className={`font-medium text-gray-700 text-sm ${
                  goal.completedAt ? 'line-through text-gray-400' : ''
                }`}
              >
                {goal.text}
              </p>
              {goal.completedAt && (
                <p className="text-xs text-gray-400">
                  Completed: {formatShortDate(goal.completedAt)}
                </p>
              )}
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <p className="text-center text-gray-400 text-sm pt-4">
            No tiny goals yet.
          </p>
        )}
      </div>

      {/* Add New Goal */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <input
          type="text"
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a tiny goal..."
          className="flex-grow p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-shadow"
        />
        <button
          onClick={handleAdd}
          disabled={!newGoalText.trim()}
          className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Add tiny goal"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Quick Stats */}
      {goals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {goals.filter(g => g.completedAt).length} completed
            </span>
            <span>
              {goals.filter(g => !g.completedAt).length} remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TinyGoalsList;
