import React, { useState } from 'react';
import { Target, Plus, CheckCircle2 } from 'lucide-react';
import type { Goals } from '../types/goal';
import { formatShortDate } from '../utils/date';

interface GoalsListProps {
  goals: Goals;
  onAddGoal: (text: string, category: 'personal' | 'professional') => void;
  onCompleteBigGoal: (goalId: number, category: 'personal' | 'professional') => void;
}

const GoalsList: React.FC<GoalsListProps> = ({ goals, onAddGoal, onCompleteBigGoal }) => {
  const [newGoalText, setNewGoalText] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'professional'>('personal');

  const handleAdd = () => {
    if (newGoalText.trim()) {
      onAddGoal(newGoalText, activeTab);
      setNewGoalText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const TabButton: React.FC<{ tabName: 'personal' | 'professional'; children: React.ReactNode }> = ({ 
    tabName, 
    children 
  }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-orange-400 text-white'
          : 'text-gray-500 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Target className="text-orange-400" size={24} />
        <h3 className="text-lg font-bold text-gray-800">Big Goals</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
        <TabButton tabName="personal">Personal</TabButton>
        <TabButton tabName="professional">Professional</TabButton>
      </div>

      {/* Goals List */}
      <div className="space-y-4 mb-4 min-h-[100px]">
        {goals[activeTab].map((goal) => (
          <div key={goal.id}>
            <div className="flex justify-between items-start gap-2">
              <p
                className={`font-semibold text-gray-700 text-sm mb-1 flex-grow ${
                  goal.completedAt ? 'line-through text-gray-400' : ''
                }`}
              >
                {goal.text}
              </p>
              {!goal.completedAt && (
                <button
                  onClick={() => onCompleteBigGoal(goal.id, activeTab)}
                  className="text-gray-400 hover:text-green-500 transition-colors flex-shrink-0"
                  aria-label="Mark as complete"
                >
                  <CheckCircle2 size={18} />
                </button>
              )}
            </div>

            {goal.completedAt ? (
              <p className="text-xs text-green-600">
                Completed on {formatShortDate(goal.completedAt)}
              </p>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-orange-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}

        {goals[activeTab].length === 0 && (
          <p className="text-center text-gray-400 text-sm pt-4">
            No {activeTab} goals yet.
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
          placeholder={`Add a new ${activeTab} goal`}
          className="flex-grow p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-shadow"
        />
        <button
          onClick={handleAdd}
          disabled={!newGoalText.trim()}
          className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Add goal"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default GoalsList;
