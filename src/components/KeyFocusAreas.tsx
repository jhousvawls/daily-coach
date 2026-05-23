import React, { useState } from 'react';
import { Crosshair, Plus } from 'lucide-react';
import type { QuarterlyFocusData, KeyFocusArea } from '../types/agency';

interface KeyFocusAreasProps {
  data: QuarterlyFocusData;
  onUpdateData: (data: QuarterlyFocusData) => void;
}

const PROGRESS_COLORS = ['red', 'blue', 'green', 'orange', 'purple', 'teal'];

const getProgressBarColor = (color: string): string => {
  const map: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500',
  };
  return map[color] || 'bg-blue-500';
};

const getProgressTextColor = (color: string): string => {
  const map: Record<string, string> = {
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    purple: 'text-purple-600 dark:text-purple-400',
    teal: 'text-teal-600 dark:text-teal-400',
  };
  return map[color] || 'text-blue-600 dark:text-blue-400';
};

const KeyFocusAreas: React.FC<KeyFocusAreasProps> = ({ data, onUpdateData }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingProgressId, setEditingProgressId] = useState<string | null>(null);
  const [editingProgressValue, setEditingProgressValue] = useState('');

  const addArea = () => {
    if (!newTitle.trim()) return;
    const colorIndex = data.areas.length % PROGRESS_COLORS.length;
    const newArea: KeyFocusArea = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      progress: 0,
      color: PROGRESS_COLORS[colorIndex],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateData({
      ...data,
      areas: [...data.areas, newArea],
    });
    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  };

  const updateProgress = (areaId: string) => {
    const value = Math.min(100, Math.max(0, parseInt(editingProgressValue) || 0));
    onUpdateData({
      ...data,
      areas: data.areas.map(area => {
        if (area.id !== areaId) return area;
        return { ...area, progress: value, updatedAt: new Date().toISOString() };
      }),
    });
    setEditingProgressId(null);
    setEditingProgressValue('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <Crosshair className="text-orange-400" size={24} />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Key Focus Areas — {data.quarter || 'Q?'}
          </h3>
        </div>
        {data.dateRange && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{data.dateRange}</span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Quarterly priorities and their progress
      </p>

      {/* Focus Area Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.areas.map(area => (
          <div
            key={area.id}
            className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 transition-colors hover:border-gray-300 dark:hover:border-gray-500"
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                {area.title}
              </h4>
              {editingProgressId === area.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingProgressValue}
                    onChange={e => setEditingProgressValue(e.target.value)}
                    className="w-14 text-xs p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-right"
                    onKeyDown={e => {
                      if (e.key === 'Enter') updateProgress(area.id);
                      if (e.key === 'Escape') { setEditingProgressId(null); setEditingProgressValue(''); }
                    }}
                    autoFocus
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingProgressId(area.id); setEditingProgressValue(area.progress.toString()); }}
                  className={`text-sm font-bold ${getProgressTextColor(area.color)} hover:opacity-80`}
                >
                  {area.progress}%
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{area.description}</p>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(area.color)}`}
                style={{ width: `${area.progress}%` }}
              />
            </div>
          </div>
        ))}

        {/* Add Focus Area Card */}
        {isAdding ? (
          <div className="border border-dashed border-orange-300 dark:border-orange-700 rounded-xl p-4">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Focus area title"
              className="w-full text-sm font-semibold p-1.5 mb-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
              autoFocus
            />
            <input
              type="text"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Description / target"
              className="w-full text-xs p-1.5 mb-3 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
              onKeyDown={e => {
                if (e.key === 'Enter') addArea();
                if (e.key === 'Escape') { setIsAdding(false); setNewTitle(''); setNewDescription(''); }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={addArea}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700"
              >
                Add
              </button>
              <button
                onClick={() => { setIsAdding(false); setNewTitle(''); setNewDescription(''); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex items-center justify-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
          >
            <Plus size={16} />
            Add focus area
          </button>
        )}
      </div>
    </div>
  );
};

export default KeyFocusAreas;
