import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import type { TeamMember } from '../../types/team';

interface GoalAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember?: TeamMember | null;
}

const GoalAssignmentModal: React.FC<GoalAssignmentModalProps> = ({
  isOpen,
  onClose,
  selectedMember
}) => {
  const { teamData, assignGoalToMember } = useTeam();
  const [goalText, setGoalText] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'personal' | 'professional'>('professional');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>(selectedMember?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setGoalText('');
      setDescription('');
      setCategory('professional');
      setPriority('medium');
      setDeadline('');
      setAssignedTo(selectedMember?.id || '');
      setError('');
    }
  }, [isOpen, selectedMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim() || !assignedTo) return;

    setIsSubmitting(true);
    setError('');

    try {
      await assignGoalToMember(assignedTo, {
        text: goalText.trim(),
        description: description.trim() || undefined,
        category,
        progress: 0,
        assignedBy: 'leader', // In a real app, this would be the current user ID
        assignedTo,
        deadline: deadline || undefined,
        priority,
        subtasks: []
      });

      // Reset form and close modal
      setGoalText('');
      setDescription('');
      setDeadline('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeadlineStatus = (deadlineDate: string) => {
    if (!deadlineDate) return null;
    
    const deadline = new Date(deadlineDate);
    const today = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (daysUntil === 0) return { text: 'Due today', color: 'text-red-600' };
    if (daysUntil === 1) return { text: 'Due tomorrow', color: 'text-orange-600' };
    if (daysUntil <= 7) return { text: `${daysUntil} days left`, color: 'text-orange-600' };
    return { text: `${daysUntil} days left`, color: 'text-blue-600' };
  };

  const deadlineStatus = deadline ? getDeadlineStatus(deadline) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-blue-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-200 dark:border-blue-700">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
            {selectedMember ? `Assign Goal to ${selectedMember.fullName}` : 'Assign Goal to Team Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="text-blue-600 dark:text-blue-400" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Team Member Selection */}
          {!selectedMember && (
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Assign to Team Member
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-blue-800 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a team member...</option>
                {teamData.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Goal Text */}
          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Enter the goal title..."
              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-blue-800 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add additional details about this goal..."
              rows={3}
              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-blue-800 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category and Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'personal' | 'professional')}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-blue-800 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="professional">Professional</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-blue-800 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-blue-800 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {deadlineStatus && (
              <p className={`mt-1 text-sm ${deadlineStatus.color}`}>
                {deadlineStatus.text}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-blue-200 dark:border-blue-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !goalText.trim() || !assignedTo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              {isSubmitting ? 'Assigning...' : 'Assign Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalAssignmentModal;
