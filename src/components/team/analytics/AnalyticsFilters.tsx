import React, { useState } from 'react';
import { Calendar, Filter, Download, Users, Target } from 'lucide-react';

interface AnalyticsFiltersProps {
  dateRange: {
    start: string;
    end: string;
  };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  selectedMembers: string[];
  onMemberSelectionChange: (members: string[]) => void;
  availableMembers: Array<{ id: string; name: string }>;
  goalCategory: 'all' | 'personal' | 'professional';
  onGoalCategoryChange: (category: 'all' | 'personal' | 'professional') => void;
  priority: 'all' | 'high' | 'medium' | 'low';
  onPriorityChange: (priority: 'all' | 'high' | 'medium' | 'low') => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  selectedMembers,
  onMemberSelectionChange,
  availableMembers,
  goalCategory,
  onGoalCategoryChange,
  priority,
  onPriorityChange,
  onExportPDF,
  onExportCSV
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Quick date range presets
  const getDatePreset = (preset: string) => {
    const today = new Date();
    const start = new Date();
    
    switch (preset) {
      case 'last7days':
        start.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        start.setDate(today.getDate() - 30);
        break;
      case 'last90days':
        start.setDate(today.getDate() - 90);
        break;
      case 'thisMonth':
        start.setDate(1);
        break;
      case 'lastMonth':
        start.setMonth(today.getMonth() - 1);
        start.setDate(1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          start: start.toISOString().split('T')[0],
          end: lastMonth.toISOString().split('T')[0]
        };
      default:
        start.setDate(today.getDate() - 30);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const handlePresetClick = (preset: string) => {
    const newRange = getDatePreset(preset);
    onDateRangeChange(newRange);
  };

  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onMemberSelectionChange(selectedMembers.filter(id => id !== memberId));
    } else {
      onMemberSelectionChange([...selectedMembers, memberId]);
    }
  };

  const handleSelectAllMembers = () => {
    if (selectedMembers.length === availableMembers.length) {
      onMemberSelectionChange([]);
    } else {
      onMemberSelectionChange(availableMembers.map(m => m.id));
    }
  };

  return (
    <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Date Range Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="font-medium text-blue-900 dark:text-blue-100">Date Range:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Quick presets */}
            <button
              onClick={() => handlePresetClick('last7days')}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
            >
              Last 7 days
            </button>
            <button
              onClick={() => handlePresetClick('last30days')}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
            >
              Last 30 days
            </button>
            <button
              onClick={() => handlePresetClick('thisMonth')}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
            >
              This month
            </button>
          </div>

          {/* Custom date inputs */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="px-3 py-1 text-sm border border-blue-200 dark:border-blue-600 rounded-md bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
            <span className="text-blue-600 dark:text-blue-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="px-3 py-1 text-sm border border-blue-200 dark:border-blue-600 rounded-md bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team Member Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="text-blue-600 dark:text-blue-400" size={16} />
                <label className="font-medium text-blue-900 dark:text-blue-100">Team Members</label>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={handleSelectAllMembers}
                  className="w-full text-left px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {selectedMembers.length === availableMembers.length ? 'Deselect All' : 'Select All'}
                </button>
                
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableMembers.map(member => (
                    <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleMemberToggle(member.id)}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-blue-900 dark:text-blue-100">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Goal Category Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-blue-600 dark:text-blue-400" size={16} />
                <label className="font-medium text-blue-900 dark:text-blue-100">Goal Category</label>
              </div>
              
              <select
                value={goalCategory}
                onChange={(e) => onGoalCategoryChange(e.target.value as 'all' | 'personal' | 'professional')}
                className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-600 rounded-md bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="all">All Categories</option>
                <option value="personal">Personal Goals</option>
                <option value="professional">Professional Goals</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="text-blue-600 dark:text-blue-400" size={16} />
                <label className="font-medium text-blue-900 dark:text-blue-100">Priority Level</label>
              </div>
              
              <select
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-600 rounded-md bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedMembers.length > 0 && selectedMembers.length < availableMembers.length && (
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
              </span>
            )}
            {goalCategory !== 'all' && (
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                {goalCategory} goals
              </span>
            )}
            {priority !== 'all' && (
              <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full">
                {priority} priority
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;
