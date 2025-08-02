import { useState, useEffect } from 'react';
import { pwaUpdateService, cacheUtils, type UpdateInfo } from '../services/pwaUpdate';

interface UpdateNotificationProps {
  onUpdateApplied?: () => void;
}

export default function UpdateNotification({ onUpdateApplied }: UpdateNotificationProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{ name: string; size: number }[]>([]);

  useEffect(() => {
    // Listen for update notifications
    pwaUpdateService.onUpdateAvailable((info) => {
      console.log('[UpdateNotification] Update available:', info);
      setUpdateInfo(info);
    });

    // Check for updates on mount
    pwaUpdateService.checkForUpdates().then((info) => {
      if (info.updateAvailable) {
        setUpdateInfo(info);
      }
    });

    // Load cache info for debugging
    cacheUtils.getCacheInfo().then(setCacheInfo);
  }, []);

  const handleUpdate = async () => {
    if (!updateInfo) return;

    setIsUpdating(true);
    try {
      await pwaUpdateService.applyUpdate();
      onUpdateApplied?.();
    } catch (error) {
      console.error('[UpdateNotification] Failed to apply update:', error);
      // Fallback: force refresh
      window.location.reload();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateInfo(null);
  };

  const handleForceRefresh = () => {
    cacheUtils.forceRefresh();
  };

  const handleClearCache = async () => {
    await cacheUtils.clearAllCaches();
    window.location.reload();
  };

  // Don't show if no update available
  if (!updateInfo?.updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {/* Debug button - only show in development */}
        {import.meta.env.DEV && (
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="mb-2 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            PWA Debug
          </button>
        )}
        
        {/* Debug panel */}
        {showDebugInfo && (
          <div className="mb-4 p-4 bg-gray-800 text-white text-xs rounded-lg shadow-lg max-w-sm">
            <h4 className="font-semibold mb-2">PWA Debug Info</h4>
            <div className="space-y-2">
              <div>
                <strong>Current Version:</strong> {updateInfo?.currentVersion || 'unknown'}
              </div>
              <div>
                <strong>Service Worker:</strong> {'serviceWorker' in navigator ? 'Supported' : 'Not supported'}
              </div>
              <div>
                <strong>Caches:</strong>
                {cacheInfo.length > 0 ? (
                  <ul className="ml-2 mt-1">
                    {cacheInfo.map((cache) => (
                      <li key={cache.name}>
                        {cache.name}: {cache.size} items
                      </li>
                    ))}
                  </ul>
                ) : (
                  ' None'
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleForceRefresh}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Force Refresh
                </button>
                <button
                  onClick={handleClearCache}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Update icon */}
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Update Available
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              A new version of Daily Focus Coach is ready to install.
            </p>
            {updateInfo.newVersion && updateInfo.newVersion !== 'newer' && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Version: {updateInfo.newVersion}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </span>
            ) : (
              'Update Now'
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
