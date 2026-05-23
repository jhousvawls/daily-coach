import React, { useState } from 'react';
import { Building2, Plus, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import type { AgencyFocusData, Agency, AgencyBucket, AgencyLever } from '../types/agency';

interface AgencyFocusProps {
  data: AgencyFocusData;
  onUpdateData: (data: AgencyFocusData) => void;
}

const BUCKET_CONFIG: Record<AgencyBucket, { label: string; color: string; dotColor: string; bgColor: string; borderColor: string }> = {
  core: {
    label: 'Core',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    dotColor: 'bg-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  expansion: {
    label: 'Expansion',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    dotColor: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  maintain: {
    label: 'Maintain',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    dotColor: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
};

const BUCKETS: AgencyBucket[] = ['core', 'expansion', 'maintain'];

const AgencyFocus: React.FC<AgencyFocusProps> = ({ data, onUpdateData }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [addingAgencyBucket, setAddingAgencyBucket] = useState<AgencyBucket | null>(null);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgencyDetail, setNewAgencyDetail] = useState('');
  const [addingLeverAgencyId, setAddingLeverAgencyId] = useState<string | null>(null);
  const [newLeverText, setNewLeverText] = useState('');

  const getAgenciesForBucket = (bucket: AgencyBucket) =>
    data.agencies.filter(a => a.bucket === bucket);

  const getCompletedLeversThisMonth = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    let count = 0;
    data.agencies.forEach(agency => {
      agency.levers.forEach(lever => {
        if (lever.completedAt && lever.completedAt >= monthStart) count++;
      });
    });
    return count;
  };

  const toggleLever = (agencyId: string, leverId: string) => {
    const updated = {
      ...data,
      agencies: data.agencies.map(agency => {
        if (agency.id !== agencyId) return agency;
        return {
          ...agency,
          updatedAt: new Date().toISOString(),
          levers: agency.levers.map(lever => {
            if (lever.id !== leverId) return lever;
            return {
              ...lever,
              completed: !lever.completed,
              completedAt: !lever.completed ? new Date().toISOString() : undefined,
            };
          }),
        };
      }),
    };
    onUpdateData(updated);
  };

  const addAgency = (bucket: AgencyBucket) => {
    if (!newAgencyName.trim()) return;
    const newAgency: Agency = {
      id: Date.now().toString(),
      name: newAgencyName.trim(),
      detail: newAgencyDetail.trim(),
      bucket,
      levers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateData({
      ...data,
      agencies: [...data.agencies, newAgency],
    });
    setNewAgencyName('');
    setNewAgencyDetail('');
    setAddingAgencyBucket(null);
  };

  const addLever = (agencyId: string) => {
    if (!newLeverText.trim()) return;
    const newLever: AgencyLever = {
      id: Date.now().toString(),
      text: newLeverText.trim(),
      completed: false,
      subtasks: [],
    };
    onUpdateData({
      ...data,
      agencies: data.agencies.map(agency => {
        if (agency.id !== agencyId) return agency;
        return {
          ...agency,
          updatedAt: new Date().toISOString(),
          levers: [...agency.levers, newLever],
        };
      }),
    });
    setNewLeverText('');
    setAddingLeverAgencyId(null);
  };

  const completedCount = getCompletedLeversThisMonth();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Building2 className="text-orange-400" size={24} />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Agency Focus</h3>
          {data.quarter && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
              {data.quarter}
            </span>
          )}
        </div>
      </div>

      {/* Bucket Tabs (visual only — all buckets shown inline) */}
      <div className="flex gap-2 mb-5">
        {BUCKETS.map(bucket => {
          const config = BUCKET_CONFIG[bucket];
          const count = getAgenciesForBucket(bucket).length;
          return (
            <div
              key={bucket}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold ${config.color}`}
            >
              <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
              {config.label}
              {count > 0 && <span className="text-xs opacity-70">({count})</span>}
            </div>
          );
        })}
      </div>

      {/* Bucket Sections */}
      {BUCKETS.map(bucket => {
        const config = BUCKET_CONFIG[bucket];
        const agencies = getAgenciesForBucket(bucket);

        return (
          <div key={bucket} className="mb-6 last:mb-0">
            {/* Bucket Header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg ${config.bgColor} border ${config.borderColor} border-b-0`}>
              <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {config.label} agencies
              </span>
            </div>

            {/* Agency Table */}
            <div className={`border ${config.borderColor} rounded-b-lg overflow-hidden`}>
              {/* Table Header */}
              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Agency
                </div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority Levers
                </div>
              </div>

              {/* Agency Rows */}
              {agencies.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
                  No agencies yet
                </div>
              ) : (
                agencies.map(agency => {
                  const visibleLevers = showCompleted
                    ? agency.levers
                    : agency.levers.filter(l => !l.completed).concat(
                        agency.levers.filter(l => l.completed).slice(0, 1)
                      );

                  return (
                    <div
                      key={agency.id}
                      className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      {/* Agency Info */}
                      <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{agency.name}</p>
                        {agency.detail && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{agency.detail}</p>
                        )}
                      </div>

                      {/* Levers */}
                      <div className="px-3 py-2">
                        {visibleLevers.map(lever => (
                          <div
                            key={lever.id}
                            className="flex items-center gap-2 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 group"
                          >
                            <button
                              onClick={() => toggleLever(agency.id, lever.id)}
                              className="flex-shrink-0"
                            >
                              {lever.completed ? (
                                <CheckSquare size={18} className="text-green-500" />
                              ) : (
                                <Square size={18} className="text-gray-300 dark:text-gray-500 group-hover:text-gray-400 dark:group-hover:text-gray-400" />
                              )}
                            </button>
                            <span
                              className={`text-sm flex-grow ${
                                lever.completed
                                  ? 'line-through text-gray-400 dark:text-gray-500'
                                  : 'text-gray-700 dark:text-gray-200'
                              }`}
                            >
                              {lever.text}
                            </span>
                            {lever.subtasks.length > 0 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                {lever.subtasks.length} subtask{lever.subtasks.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Add Lever */}
                        {addingLeverAgencyId === agency.id ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={newLeverText}
                              onChange={e => setNewLeverText(e.target.value)}
                              placeholder="New lever..."
                              className="flex-grow text-sm p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                              onKeyDown={e => {
                                if (e.key === 'Enter') addLever(agency.id);
                                if (e.key === 'Escape') { setAddingLeverAgencyId(null); setNewLeverText(''); }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => addLever(agency.id)}
                              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setAddingLeverAgencyId(agency.id); setNewLeverText(''); }}
                            className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                          >
                            <Plus size={12} />
                            Add lever
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showCompleted ? 'Hide' : 'View'} completed levers
          {completedCount > 0 && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
              {completedCount} done this month
            </span>
          )}
        </button>

        {/* Add Agency */}
        {addingAgencyBucket !== null ? (
          <div className="flex items-center gap-2">
            <select
              value={addingAgencyBucket}
              onChange={e => setAddingAgencyBucket(e.target.value as AgencyBucket)}
              className="text-xs p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {BUCKETS.map(b => (
                <option key={b} value={b}>{BUCKET_CONFIG[b].label}</option>
              ))}
            </select>
            <input
              type="text"
              value={newAgencyName}
              onChange={e => setNewAgencyName(e.target.value)}
              placeholder="Agency name"
              className="text-sm p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-orange-400 w-28"
              autoFocus
            />
            <input
              type="text"
              value={newAgencyDetail}
              onChange={e => setNewAgencyDetail(e.target.value)}
              placeholder="Detail (optional)"
              className="text-sm p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-orange-400 w-32 hidden sm:block"
              onKeyDown={e => {
                if (e.key === 'Enter') addAgency(addingAgencyBucket);
                if (e.key === 'Escape') { setAddingAgencyBucket(null); setNewAgencyName(''); setNewAgencyDetail(''); }
              }}
            />
            <button
              onClick={() => addAgency(addingAgencyBucket)}
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700"
            >
              Add
            </button>
            <button
              onClick={() => { setAddingAgencyBucket(null); setNewAgencyName(''); setNewAgencyDetail(''); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingAgencyBucket('core')}
            className="flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            <Plus size={14} />
            Add agency
          </button>
        )}
      </div>
    </div>
  );
};

export default AgencyFocus;
