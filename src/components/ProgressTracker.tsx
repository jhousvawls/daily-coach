import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ProgressTrackerProps {
  completed: number;
  total: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completed, total }) => {
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <BarChart3 className="text-orange-400" size={24} />
        <h3 className="text-lg font-bold text-gray-800">Progress</h3>
      </div>
      
      <p className="text-gray-500 mb-3 text-sm">
        You've completed{' '}
        <span className="font-bold text-gray-700">{completed}</span> of{' '}
        <span className="font-bold text-gray-700">{total}</span> focus tasks.
      </p>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-orange-400 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="mt-2 text-right">
        <span className="text-sm font-medium text-gray-600">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Motivational message based on progress */}
      {total > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {progressPercentage === 100 ? (
              "🎉 Perfect completion rate! You're on fire!"
            ) : progressPercentage >= 80 ? (
              "🔥 Excellent progress! Keep up the momentum!"
            ) : progressPercentage >= 60 ? (
              "💪 Good progress! You're building great habits!"
            ) : progressPercentage >= 40 ? (
              "📈 Making progress! Every task completed counts!"
            ) : progressPercentage > 0 ? (
              "🌱 Great start! Consistency is key to success!"
            ) : (
              "🎯 Ready to start your focus journey? Set today's task!"
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
