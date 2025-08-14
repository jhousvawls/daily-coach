import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { analyticsService, type MemberPerformance, type RecentActivity } from '../../services/analytics';
import AnalyticsCharts from './analytics/AnalyticsCharts';
import AnalyticsFilters from './analytics/AnalyticsFilters';
import { downloadCSV, downloadPDF } from './analytics/AnalyticsExport';

const TeamAnalytics: React.FC = () => {
  const { teamData } = useTeam();
  
  // Filter states
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [goalCategory, setGoalCategory] = useState<'all' | 'personal' | 'professional'>('all');
  const [priority, setPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Calculate analytics with current filters
  const analytics = useMemo(() => {
    return analyticsService.calculateTeamAnalytics();
  }, [teamData, dateRange, selectedMembers, goalCategory, priority]);

  // Prepare available members for filtering
  const availableMembers = useMemo(() => {
    return teamData.members.map(member => ({
      id: member.id,
      name: member.fullName
    }));
  }, [teamData.members]);

  // Initialize selected members to all members if empty
  React.useEffect(() => {
    if (selectedMembers.length === 0 && availableMembers.length > 0) {
      setSelectedMembers(availableMembers.map(m => m.id));
    }
  }, [availableMembers, selectedMembers.length]);

  // Export handlers
  const handleExportCSV = () => {
    downloadCSV({
      analytics,
      dateRange,
      selectedMembers,
      goalCategory,
      priority
    });
  };

  const handleExportPDF = () => {
    downloadPDF({
      analytics,
      dateRange,
      selectedMembers,
      goalCategory,
      priority
    });
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <div className="container mx-auto max-w-7xl p-4 sm:p-6">
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

        {/* Check if team has members */}
        {teamData.members.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
            <BarChart3 className="mx-auto w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              No Analytics Available
            </h3>
            <p className="text-blue-600 dark:text-blue-400 mb-4">
              Add team members to start tracking analytics
            </p>
            <Link
              to="/team/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Users size={16} />
              Add Team Members
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analytics Filters */}
            <AnalyticsFilters
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedMembers={selectedMembers}
              onMemberSelectionChange={setSelectedMembers}
              availableMembers={availableMembers}
              goalCategory={goalCategory}
              onGoalCategoryChange={setGoalCategory}
              priority={priority}
              onPriorityChange={setPriority}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
            />

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Team Completion Rate</h3>
                </div>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {analytics.teamCompletionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {analytics.totalGoalsCompleted} of {analytics.totalGoalsAssigned} goals
                </p>
              </div>

              <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    analytics.overdueGoals.length > 0 
                      ? 'bg-red-100 dark:bg-red-900/50' 
                      : 'bg-green-100 dark:bg-green-900/50'
                  }`}>
                    <span className={`text-lg font-bold ${
                      analytics.overdueGoals.length > 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {analytics.overdueGoals.length > 0 ? '⚠️' : '✅'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Overdue Goals</h3>
                </div>
                <p className={`text-3xl font-bold ${
                  analytics.overdueGoals.length > 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {analytics.overdueGoals.length}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {analytics.overdueGoals.length === 0 ? 'All on track' : 'Need attention'}
                </p>
              </div>

              <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400 text-lg font-bold">⏰</span>
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Upcoming Deadlines</h3>
                </div>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {analytics.upcomingDeadlines.length}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Next 2 weeks
                </p>
              </div>

              <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                    <Users className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Team Members</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics.memberPerformance.length}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Active members
                </p>
              </div>
            </div>

            {/* Analytics Charts */}
            <AnalyticsCharts 
              analytics={analytics} 
              dateRange={dateRange}
            />

            {/* Top Performers Section */}
            {analytics.memberPerformance.length > 0 && (
              <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  Top Performers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.memberPerformance.slice(0, 3).map((member: MemberPerformance) => {
                    const teamMember = teamData.members.find(m => m.fullName === member.memberName);
                    return (
                      <Link
                        key={member.memberName}
                        to={`/team/${teamMember?.slug || ''}`}
                        className="block p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            member.rank === 1 ? 'bg-yellow-500' :
                            member.rank === 2 ? 'bg-gray-400' :
                            member.rank === 3 ? 'bg-orange-400' :
                            'bg-blue-500'
                          }`}>
                            {member.rank}
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">
                              {member.memberName}
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {member.completionRate.toFixed(1)}% completion rate
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          {member.goalsCompleted} of {member.goalsAssigned} goals completed
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {analytics.recentActivity.length > 0 && (
              <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  Recent Activity (Last 7 Days)
                </h3>
                <div className="space-y-3">
                  {analytics.recentActivity.slice(0, 5).map((activity: RecentActivity, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {activity.memberName} {
                            activity.type === 'goal_completed' ? 'completed' :
                            activity.type === 'goal_assigned' ? 'was assigned' :
                            'missed deadline for'
                          } goal
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          "{activity.goalText}"
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                        {activity.priority && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activity.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                            activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                          }`}>
                            {activity.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAnalytics;
