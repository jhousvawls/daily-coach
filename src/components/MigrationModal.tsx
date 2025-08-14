import React, { useState, useEffect } from 'react';
import { migrationService, type MigrationProgress, type MigrationResult } from '../services/migration';
import { useAuth } from '../hooks/useAuth';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationComplete: (result: MigrationResult) => void;
}

const MigrationModal: React.FC<MigrationModalProps> = ({ isOpen, onClose, onMigrationComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'intro' | 'migrating' | 'complete' | 'error'>('intro');
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setProgress(null);
      setResult(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleStartMigration = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setStep('migrating');
    setIsLoading(true);

    // Set up progress callback
    migrationService.setProgressCallback((progressUpdate) => {
      setProgress(progressUpdate);
    });

    try {
      const migrationResult = await migrationService.migrateUserData();
      setResult(migrationResult);
      
      if (migrationResult.success) {
        setStep('complete');
      } else {
        setStep('error');
      }
      
      onMigrationComplete(migrationResult);
    } catch (error) {
      console.error('Migration failed:', error);
      const errorResult: MigrationResult = {
        success: false,
        migratedItems: {
          goals: 0,
          tinyGoals: 0,
          dailyTasks: 0,
          recurringTasks: 0,
          quotes: 0,
          preferences: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: 0,
        totalItems: 0
      };
      setResult(errorResult);
      setStep('error');
      onMigrationComplete(errorResult);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageDisplayName = (stage: string) => {
    switch (stage) {
      case 'preparing': return 'Preparing migration...';
      case 'goals': return 'Migrating goals';
      case 'tiny_goals': return 'Migrating tiny goals';
      case 'daily_tasks': return 'Migrating daily tasks';
      case 'recurring_tasks': return 'Migrating recurring tasks';
      case 'quotes': return 'Migrating daily quotes';
      case 'preferences': return 'Migrating preferences';
      case 'complete': return 'Migration complete!';
      default: return 'Processing...';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Intro Step */}
        {step === 'intro' && (
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Enable Cloud Sync</h2>
                <p className="text-sm text-gray-600">Sync your data across all devices</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Benefits of Cloud Sync:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Access your data from any device
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Automatic backup of your goals and tasks
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time sync across devices
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Your local data stays as backup
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">Safe Migration</p>
                  <p className="text-blue-700">Your existing data will be copied to the cloud. Your local data remains unchanged as a backup.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleStartMigration}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Enable Cloud Sync
              </button>
            </div>
          </div>
        )}

        {/* Migration Progress Step */}
        {step === 'migrating' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Migrating Your Data</h2>
              <p className="text-gray-600">Please wait while we sync your data to the cloud...</p>
            </div>

            {progress && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{getStageDisplayName(progress.stage)}</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {progress.currentItem && (
                  <div className="text-sm text-gray-500 text-center">
                    {progress.currentItem}
                  </div>
                )}

                <div className="text-xs text-gray-400 text-center">
                  {progress.current} of {progress.total} items
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Step */}
        {step === 'complete' && result && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Migration Complete!</h2>
              <p className="text-gray-600">Your data has been successfully synced to the cloud.</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-800 mb-2">Migration Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-green-700">Goals: {result.migratedItems.goals}</div>
                <div className="text-green-700">Tiny Goals: {result.migratedItems.tinyGoals}</div>
                <div className="text-green-700">Daily Tasks: {result.migratedItems.dailyTasks}</div>
                <div className="text-green-700">Recurring Tasks: {result.migratedItems.recurringTasks}</div>
                <div className="text-green-700">Quotes: {result.migratedItems.quotes}</div>
                <div className="text-green-700">Preferences: {result.migratedItems.preferences}</div>
              </div>
              <div className="mt-2 pt-2 border-t border-green-200">
                <div className="text-sm text-green-700">
                  <strong>Total: {result.totalItems} items</strong> migrated in {formatDuration(result.duration)}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Get Started with Cloud Sync
            </button>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && result && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Migration Failed</h2>
              <p className="text-gray-600">There was an issue migrating your data. Don't worry, your local data is safe.</p>
            </div>

            {result.migratedItems.goals > 0 || result.migratedItems.tinyGoals > 0 || result.migratedItems.dailyTasks > 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-yellow-800 mb-2">Partial Migration</h3>
                <div className="text-sm text-yellow-700">
                  Some items were successfully migrated:
                  <ul className="mt-1 ml-4 list-disc">
                    {result.migratedItems.goals > 0 && <li>Goals: {result.migratedItems.goals}</li>}
                    {result.migratedItems.tinyGoals > 0 && <li>Tiny Goals: {result.migratedItems.tinyGoals}</li>}
                    {result.migratedItems.dailyTasks > 0 && <li>Daily Tasks: {result.migratedItems.dailyTasks}</li>}
                    {result.migratedItems.recurringTasks > 0 && <li>Recurring Tasks: {result.migratedItems.recurringTasks}</li>}
                    {result.migratedItems.quotes > 0 && <li>Quotes: {result.migratedItems.quotes}</li>}
                    {result.migratedItems.preferences > 0 && <li>Preferences: {result.migratedItems.preferences}</li>}
                  </ul>
                </div>
              </div>
            ) : null}

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-red-800 mb-2">Errors</h3>
                <div className="text-sm text-red-700 max-h-32 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <div key={index} className="mb-1">{error}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleStartMigration}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationModal;
