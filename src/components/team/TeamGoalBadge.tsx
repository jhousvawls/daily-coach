import React from 'react';
import { User, Clock, Flag } from 'lucide-react';
import type { TeamGoal } from '../../types/team';

interface TeamGoalBadgeProps {
  goal: TeamGoal;
  isTeamMode?: boolean;
}

const TeamGoalBadge: React.FC<TeamGoalBadgeProps> = ({ goal, isTeamMode = false }) => {
  if (!isTeamMode || goal.assignedBy === 'self') {
    return null; // Don't show badge for self-created goals or in personal mode
  }

  const getDeadlineStatus = () => {
    if (!goal.deadline) return null;
    
    const deadline = new Date(goal.deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { text: 'Overdue', color: 'bg-red-100 text-red-700 border-red-200' };
    if (daysUntil === 0) return { text: 'Due today', color: 'bg-red-100 text-red-700 border-red-200' };
    if (daysUntil === 1) return { text: 'Due tomorrow', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (daysUntil <= 7) return { text: `${daysUntil} days left`, color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { text: `${daysUntil} days left`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
  };

  const getPriorityColor = () => {
    switch (goal.priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {/* Assigned by badge */}
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
        <User size={10} />
        Assigned by Leader
      </span>

      {/* Priority badge */}
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getPriorityColor()}`}>
        <Flag size={10} />
        {goal.priority} priority
      </span>

      {/* Deadline badge */}
      {deadlineStatus && (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${deadlineStatus.color}`}>
          <Clock size={10} />
          {deadlineStatus.text}
        </span>
      )}
    </div>
  );
};

export default TeamGoalBadge;
