import React from 'react';
import { Settings } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

// Coach Icon Component
const CoachIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="7" r="3" />
    <path d="M12 10c-2.76 0-5 2.24-5 5v7h10v-7c0-2.76-2.24-5-5-5z" />
    <path d="M19.5 14a1.5 1.5 0 0 0-1.5-1.5H16v3h2a1.5 1.5 0 0 0 1.5-1.5z" />
    <path d="M16 14v-1" />
  </svg>
);

interface HeaderProps {
  setView: (view: 'dashboard' | 'settings') => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
  return (
    <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="bg-orange-400 p-2 rounded-lg">
          <CoachIcon className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize">
          {APP_NAME.toLowerCase()}
        </h1>
      </div>
      <button
        onClick={() => setView('settings')}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Settings"
      >
        <Settings className="text-gray-500" size={24} />
      </button>
    </header>
  );
};

export default Header;
