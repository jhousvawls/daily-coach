import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Settings, BarChart3, Target } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
// import { APP_NAME } from '../../utils/constants';
import { analyticsService } from '../../services/analytics';
import GoalAssignmentModal from './GoalAssignmentModal';
import AnalyticsWidgets from './AnalyticsWidgets';

const TeamDashboard: React.FC = () => {
  const { teamData } = useTeam();
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Calculate analytics for the team
  const analytics = useMemo(() => {
    if (teamData.members.length === 0) {
      return {
        teamCompletionRate: 0,
        totalGoalsAssigned: 0,
        totalGoalsCompleted: 0,
        overdueGoals: [],
        upcomingDeadlines: [],
        memberPerformance: [],
        recentActivity: []
      };
    }
    return analyticsService.calculateTeamAnalytics();
  }, [teamData]);

  return (
    <div className="bg-blue-50 dark:bg-blue-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6">
        {/* Team Header */}
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Users className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
              Team Focus Coach
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/team/analytics"
              className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              aria-label="Team Analytics"
            >
              <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
            </Link>
            <Link
              to="/team/settings"
              className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              aria-label="Team Settings"
            >
              <Settings className="text-blue-600 dark:text-blue-400" size={20} />
            </Link>
            <Link
              to="/"
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Personal
            </Link>
          </div>
        </header>

        {/* Team Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              Our Team
            </h2>
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {teamData.members.length} members
            </span>
          </div>

          {/* Team Members Grid */}
          {teamData.members.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <Users className="mx-auto w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                No team members yet
              </h3>
              <p className="text-blue-600 dark:text-blue-400 mb-4">
                Add your first team member to get started
              </p>
              <Link
                to="/team/settings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add Team Member
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamData.members.map((member) => (
                <Link
                  key={member.id}
                  to={`/team/${member.slug}`}
                  className="block p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">
                        {member.fullName}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Active member
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Team Analytics Overview */}
        {teamData.members.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Team Performance
              </h2>
              <Link
                to="/team/analytics"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                View detailed analytics →
              </Link>
            </div>
            <AnalyticsWidgets analytics={analytics} compact={true} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowGoalModal(true)}
            disabled={teamData.members.length === 0}
            className="p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target className="mx-auto w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Assign Goals
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Set goals for team members
            </p>
          </button>

          <Link
            to="/team/settings"
            className="p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow text-center"
          >
            <Settings className="mx-auto w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Manage Team
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Add or remove members
            </p>
          </Link>

          <Link
            to="/team/analytics"
            className="p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow text-center"
          >
            <BarChart3 className="mx-auto w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Team Analytics
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              View performance metrics
            </p>
          </Link>

          <Link
            to="/"
            className="p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow text-center"
          >
            <Users className="mx-auto w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Personal Mode
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Switch to personal focus
            </p>
          </Link>
        </div>

        {/* Goal Assignment Modal */}
        <GoalAssignmentModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
        />
      </div>
    </div>
  );
};

export default TeamDashboard;
