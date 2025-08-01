import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { DailyTask } from '../types/task';

interface YesterdayCheckinProps {
  task: DailyTask;
  onComplete: (completed: boolean) => void;
}

const YesterdayCheckin: React.FC<YesterdayCheckinProps> = ({ task, onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center transform transition-all scale-100 opacity-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Checking In</h2>
        <p className="text-gray-500 mb-4">Did you complete yesterday's focus?</p>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="font-medium text-gray-700">{task.text}</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => onComplete(false)}
            className="flex-1 bg-white text-gray-700 border-2 border-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <XCircle size={20} />
            Not this time
          </button>
          <button
            onClick={() => onComplete(true)}
            className="flex-1 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            Yes, I did!
          </button>
        </div>
      </div>
    </div>
  );
};

export default YesterdayCheckin;
