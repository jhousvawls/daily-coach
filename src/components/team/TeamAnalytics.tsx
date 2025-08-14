import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Target, Calendar } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { teamStorage } from '../../services/teamStorage';

const TeamAnalytics: React.FC = () => {
  const { teamData } = useTeam();
  const teamStats = teamStorage.getTeamStats();

  return (
    <div className="bg-blue-50 dark:bg-blue-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6">
        {/* Header */}
        <header className="flex items-center gap-4 mb-6 pb-4 border-b border-blue-200 dark:border-blue-700">
          <Link
            to="/team"
            className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            aria-label="Back to team dashboard"
          >
            <ArrowLeft className="text-blue-600 dark:text-blue-400" size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
              Team Analytics
            </h1>
          </div>
        </header>

        {/* Team Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Team Size</h3>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {teamStats.activeMembers}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Active members
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-green-600 dark:text-green-400" size={20} />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Goals Completed</h3>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {teamStats.totalGoalsCompleted}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Total achievements
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="text-purple-600 dark:text-purple-400" size={20} />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Completion Rate</h3>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {teamStats.averageCompletionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Team average
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-orange-600 dark:text-orange-400" size={20} />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Upcoming Deadlines</h3>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {teamStats.upcomingDeadlines.length}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Next 30 days
            </p>
          </div>
        </div>

        {/* Top Performers */}
        {teamStats.topPerformers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Top Performers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {teamStats.topPerformers.map((member, index) => (
                <Link
                  key={member.id}
                  to={`/team/${member.slug}`}
                  className="block p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                          1
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">
                        {member.fullName}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        High performer
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        {teamStats.upcomingDeadlines.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Upcoming Deadlines
            </h2>
            <div className="space-y-3">
              {teamStats.upcomingDeadlines.slice(0, 5).map((deadline) => (
                <div
                  key={`${deadline.memberId}-${deadline.goalId}`}
                  className="flex items-center justify-between p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">
                      {deadline.goalText}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Assigned to {deadline.memberName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      deadline.daysRemaining <= 3 
                        ? 'text-red-600 dark:text-red-400'
                        : deadline.daysRemaining <= 7
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {deadline.daysRemaining === 0 
                        ? 'Due today'
                        : deadline.daysRemaining === 1
                        ? 'Due tomorrow'
                        : `${deadline.daysRemaining} days left`
                      }
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400">
                      {deadline.priority} priority
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div>
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Team Members
          </h2>
          {teamData.members.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <Users className="mx-auto w-12 h-12 text-blue-400 mb-4" />
              <p className="text-blue-600 dark:text-blue-400">
                No team members yet. Add members in team settings.
              </p>
              <Link
                to="/team/settings"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Team Members
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamData.members.map((member) => {
                const memberData = teamData.memberData[member.id];
                const totalGoals = memberData 
                  ? memberData.goals.personal.length + memberData.goals.professional.length
                  : 0;
                const completedGoals = memberData ? memberData.achievementStats.totalCompleted : 0;
                const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

                return (
                  <Link
                    key={member.id}
                    to={`/team/${member.slug}`}
                    className="block p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
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
                          {completedGoals} goals completed
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600 dark:text-blue-400">Completion Rate</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          {completionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(completionRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;
