import React, { useState } from 'react';
import { XCircle, Sparkles, ArrowRight, ArrowLeft, Target, Zap, Heart, Brain, CheckCircle } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { PLACEHOLDERS } from '../utils/constants';
import type { ThemeAnalysisResult } from '../services/ai';

interface FocusAssistantProps {
  onClose: () => void;
  onFocusSelected: (focus: string, method: string, subtasks?: string[]) => void;
}

type Step = 'input' | 'analysis' | 'method' | 'final';
type Method = 'highest_impact' | 'quick_win' | 'personal_priority' | 'ai_decide';

const FocusAssistant: React.FC<FocusAssistantProps> = ({
  onClose,
  onFocusSelected
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [brainDump, setBrainDump] = useState('');
  const [analysis, setAnalysis] = useState<ThemeAnalysisResult | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [finalFocus, setFinalFocus] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const {
    isGenerating,
    error,
    analyzeTasksAndGenerateCandidates,
    selectFocusByMethod,
    generateSubtaskBreakdown
  } = useAI();

  const handleAnalyze = async () => {
    if (!brainDump.trim()) return;
    
    const result = await analyzeTasksAndGenerateCandidates(brainDump);
    if (result) {
      setAnalysis(result);
      setCurrentStep('analysis');
    }
  };

  const handleMethodSelect = async (method: Method) => {
    if (!analysis) return;
    
    setSelectedMethod(method);
    const focus = await selectFocusByMethod(analysis.candidates, method);
    if (focus) {
      setFinalFocus(focus);
      setCurrentStep('final');
    }
  };

  const handleGenerateSubtasks = async () => {
    if (!finalFocus) return;
    
    const result = await generateSubtaskBreakdown(finalFocus);
    if (result) {
      setSubtasks(result);
      setShowSubtasks(true);
    }
  };

  const handleConfirm = () => {
    if (finalFocus && selectedMethod) {
      onFocusSelected(finalFocus, selectedMethod, showSubtasks ? subtasks : undefined);
    }
  };

  const getMethodIcon = (method: Method) => {
    switch (method) {
      case 'highest_impact': return <Target className="w-5 h-5" />;
      case 'quick_win': return <Zap className="w-5 h-5" />;
      case 'personal_priority': return <Heart className="w-5 h-5" />;
      case 'ai_decide': return <Brain className="w-5 h-5" />;
    }
  };

  const getMethodLabel = (method: Method) => {
    switch (method) {
      case 'highest_impact': return 'Highest Impact';
      case 'quick_win': return 'Quick Win';
      case 'personal_priority': return 'Personal Priority';
      case 'ai_decide': return 'AI Decide';
    }
  };

  const getMethodDescription = (method: Method) => {
    switch (method) {
      case 'highest_impact': return 'Focus on what will make the biggest difference';
      case 'quick_win': return 'Choose something you can complete quickly for momentum';
      case 'personal_priority': return 'Pick what matters most to you personally';
      case 'ai_decide': return 'Let AI choose the optimal task for today';
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        {(['input', 'analysis', 'method', 'final'] as Step[]).map((step, index) => (
          <React.Fragment key={step}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === step 
                ? 'bg-orange-500 text-white' 
                : index < (['input', 'analysis', 'method', 'final'] as Step[]).indexOf(currentStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {index < (['input', 'analysis', 'method', 'final'] as Step[]).indexOf(currentStep) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 3 && (
              <div className={`w-8 h-0.5 ${
                index < (['input', 'analysis', 'method', 'final'] as Step[]).indexOf(currentStep)
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Focus Assistant</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <XCircle className="text-gray-500 dark:text-gray-400" size={20} />
          </button>
        </div>

        {renderStepIndicator()}

        {/* Step 1: Task Input */}
        {currentStep === 'input' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                What's on your mind?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                List all your tasks, thoughts, and priorities. The AI will help you find the perfect focus for today.
              </p>
            </div>
            
            <textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder={PLACEHOLDERS.BRAIN_DUMP}
              className="w-full h-40 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isGenerating}
            />
            
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleAnalyze}
              disabled={isGenerating || !brainDump.trim()}
              className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Tasks
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Theme Analysis & Candidates */}
        {currentStep === 'analysis' && analysis && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Task Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                I've grouped your tasks into themes and identified the best focus candidates.
              </p>
            </div>

            {/* Themes */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-white">Identified Themes:</h4>
              {analysis.themes.map((theme, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h5 className="font-medium text-gray-800 dark:text-white">{theme.name}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{theme.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {theme.tasks.map((task, taskIndex) => (
                      <span key={taskIndex} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Focus Candidates */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-white">Focus Candidates:</h4>
              {analysis.candidates.map((candidate, index) => (
                <div key={index} className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-800 dark:text-white">{candidate.task}</h5>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        candidate.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        candidate.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {candidate.impact} impact
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        candidate.effort === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        candidate.effort === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {candidate.effort} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{candidate.reasoning}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Theme: {candidate.theme}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('input')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                onClick={() => setCurrentStep('method')}
                className="flex-1 bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                Choose Method
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Method Selection */}
        {currentStep === 'method' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                How should I choose your focus?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Select the approach that resonates with you today.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['highest_impact', 'quick_win', 'personal_priority', 'ai_decide'] as Method[]).map((method) => (
                <button
                  key={method}
                  onClick={() => handleMethodSelect(method)}
                  disabled={isGenerating}
                  className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getMethodIcon(method)}
                    <h4 className="font-medium text-gray-800 dark:text-white">{getMethodLabel(method)}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{getMethodDescription(method)}</p>
                </button>
              ))}
            </div>

            {isGenerating && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Selecting your focus...</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={() => setCurrentStep('analysis')}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Analysis
            </button>
          </div>
        )}

        {/* Step 4: Final Focus */}
        {currentStep === 'final' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Your Focus for Today
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Based on your {selectedMethod && getMethodLabel(selectedMethod).toLowerCase()} approach:
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Today's Focus:</h4>
                  <p className="text-gray-700 dark:text-gray-200">{finalFocus}</p>
                </div>
              </div>
            </div>

            {/* Subtask Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800 dark:text-white">Optional: Break it down</h4>
                {!showSubtasks && (
                  <button
                    onClick={handleGenerateSubtasks}
                    disabled={isGenerating}
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate subtasks'}
                  </button>
                )}
              </div>

              {showSubtasks && subtasks.length > 0 && (
                <div className="space-y-2">
                  {subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{index + 1}.</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{subtask}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('method')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Set as Today's Focus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusAssistant;
