import React, { useState } from 'react';
import { XCircle, Sparkles } from 'lucide-react';
import { PLACEHOLDERS } from '../utils/constants';

interface BrainDumpModalProps {
  onClose: () => void;
  onSynthesize: (brainDump: string) => void;
  isGenerating: boolean;
  error?: string | null;
}

const BrainDumpModal: React.FC<BrainDumpModalProps> = ({
  onClose,
  onSynthesize,
  isGenerating,
  error
}) => {
  const [brainDump, setBrainDump] = useState('');

  const handleSynthesize = () => {
    if (brainDump.trim()) {
      onSynthesize(brainDump);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">AI-Powered Brain Dump</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <XCircle className="text-gray-500" size={20} />
          </button>
        </div>
        
        <p className="text-gray-500 mb-4">
          List everything on your mind. The AI will help you find the most important task to focus on.
        </p>
        
        <textarea
          value={brainDump}
          onChange={(e) => setBrainDump(e.target.value)}
          placeholder={PLACEHOLDERS.BRAIN_DUMP}
          className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow resize-none"
          disabled={isGenerating}
        />
        
        {error && (
          <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <button
          onClick={handleSynthesize}
          disabled={isGenerating || !brainDump.trim()}
          className="mt-4 w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Synthesize Focus
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BrainDumpModal;
