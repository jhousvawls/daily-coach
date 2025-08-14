import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error' | 'pending';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastSyncTime?: Date;
  pendingOperations?: number;
  onManualSync?: () => void;
  className?: string;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  status,
  lastSyncTime,
  pendingOperations = 0,
  onManualSync,
  className = ''
}) => {
  const { isAuthenticated } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  // Don't show sync status if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Syncing...',
          description: 'Your data is being synchronized with the cloud.'
        };
      case 'synced':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Synced',
          description: 'All your data is up to date across all devices.'
        };
      case 'pending':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Pending',
          description: `${pendingOperations} change${pendingOperations !== 1 ? 's' : ''} waiting to sync when you're back online.`
        };
      case 'error':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Sync Error',
          description: 'There was an issue syncing your data. Click to retry.'
        };
      case 'offline':
      default:
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Offline',
          description: 'You\'re working offline. Changes will sync when you\'re back online.'
        };
    }
  };

  const config = getStatusConfig();

  const formatLastSyncTime = (time: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const handleClick = () => {
    if (status === 'error' && onManualSync) {
      onManualSync();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.color} ${
          status === 'error' && onManualSync ? 'cursor-pointer hover:opacity-80' : ''
        } transition-opacity`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <span className="text-sm font-medium hidden sm:inline">
          {config.label}
        </span>
        {pendingOperations > 0 && status === 'pending' && (
          <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full">
            {pendingOperations}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 max-w-xs">
            <div className="font-medium">{config.label}</div>
            <div className="text-gray-300 mt-1">{config.description}</div>
            {lastSyncTime && status !== 'syncing' && (
              <div className="text-gray-400 text-xs mt-1">
                Last sync: {formatLastSyncTime(lastSyncTime)}
              </div>
            )}
            {status === 'error' && onManualSync && (
              <div className="text-gray-400 text-xs mt-1">
                Click to retry sync
              </div>
            )}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
