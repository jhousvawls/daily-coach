import React, { useState } from 'react';
import { Quote, RefreshCw, Loader2 } from 'lucide-react';

interface DailyQuote {
  quote: string;
  author: string;
  date: string;
  mood?: string;
}

interface MotivationalQuoteProps {
  dailyQuote: DailyQuote | null;
  isLoading: boolean;
  onRefreshQuote: (mood: string) => void;
  enabled: boolean;
}

const MOOD_OPTIONS = [
  { value: 'motivational', label: 'Motivational', emoji: '🎯', description: 'Drive and focus' },
  { value: 'business', label: 'Business-focused', emoji: '💼', description: 'Leadership and strategy' },
  { value: 'funny', label: 'Funny & Witty', emoji: '😄', description: 'Clever and meaningful' },
  { value: 'dad-joke', label: 'Dad Joke', emoji: '🤪', description: 'Light and fun' },
];

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({
  dailyQuote,
  isLoading,
  onRefreshQuote,
  enabled,
}) => {
  const [showMoodModal, setShowMoodModal] = useState(false);

  if (!enabled) {
    return null;
  }

  const handleMoodSelect = (mood: string) => {
    setShowMoodModal(false);
    onRefreshQuote(mood);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Quote size={20} className="text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Daily Inspiration</h2>
          </div>
          <button
            onClick={() => setShowMoodModal(true)}
            disabled={isLoading}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get new quote"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span>Generating your daily inspiration...</span>
            </div>
          </div>
        ) : dailyQuote ? (
          <div className="space-y-3">
            <blockquote className="text-lg font-medium text-gray-800 dark:text-gray-100 italic leading-relaxed">
              "{dailyQuote.quote}"
            </blockquote>
            <div className="text-right">
              <cite className="text-gray-600 dark:text-gray-400 font-semibold not-italic">
                — {dailyQuote.author}
              </cite>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">
              Click the refresh button to get your daily inspiration!
            </p>
          </div>
        )}
      </div>

      {/* Mood Selection Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              What kind of inspiration are you looking for today?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose the mood that fits your day
            </p>
            
            <div className="space-y-3">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mood.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                        {mood.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {mood.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMoodModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MotivationalQuote;
