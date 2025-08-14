import React from 'react';
import { TrendingUp, AlertTriangle, Clock, Users, Target, Calendar } from 'lucide-react';
import type { TeamAnalytics, OverdueGoal, UpcomingDeadline } from '../../services/analytics';

interface AnalyticsWidgetsProps {
  analytics: TeamAnalytics;
  compact?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple';
  compact?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, color, compact = false }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white',
    purple: 'bg-purple-500 text-white'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20'
  };

  return (
    <div className={`${bgColorClasses[color]} p-4 rounded-lg border border-blue-200 dark:border-blue-700 ${compact ? 'min-h-[100px]' : 'min-h-[120px]'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 ${compact ? 'text-xs' : ''}`}>
            {title}
          </p>
          <p className={`font-bold text-blue-900 dark:text-blue-100 ${compact ? 'text-lg' : 'text-2xl'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-blue-600 dark:text-blue-400 ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-2 rounded-lg flex-shrink-0 ${compact ? 'p-1.5' : ''}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface OverdueGoalsWidgetProps {
  overdueGoals: OverdueGoal[];
  compact?: boolean;
}

const OverdueGoalsWidget: React.FC<OverdueGoalsWidgetProps> = ({ overdueGoals, compact = false }) => {
  if (overdueGoals.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-white p-2 rounded-lg">
            <Target size={compact ? 16 : 20} />
          </div>
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">No Overdue Goals</p>
            <p className="text-sm text-green-600 dark:text-green-400">Great job staying on track!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 text-white p-2 rounded-lg">
            <AlertTriangle size={compact ? 16 : 20} />
          </div>
          <div>
            <p className="font-medium text-red-900 dark:text-red-100">
              {overdueGoals.length} Overdue Goal{overdueGoals.length > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">Needs immediate attention</p>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {overdueGoals.slice(0, 3).map((goal) => (
            <div key={`${goal.memberId}-${goal.goalId}`} className="flex items-center justify-between text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-900 dark:text-red-100 truncate">
                  {goal.goalText}
                </p>
                <p className="text-red-600 dark:text-red-400">
                  {goal.memberName} • {goal.daysOverdue} day{goal.daysOverdue > 1 ? 's' : ''} overdue
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                goal.priority === 'high' ? 'bg-red-200 text-red-800' :
                goal.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {goal.priority}
              </span>
            </div>
          ))}
          {overdueGoals.length > 3 && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center pt-2">
              +{overdueGoals.length - 3} more overdue goals
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface UpcomingDeadlinesWidgetProps {
  upcomingDeadlines: UpcomingDeadline[];
  compact?: boolean;
}

const UpcomingDeadlinesWidget: React.FC<UpcomingDeadlinesWidgetProps> = ({ upcomingDeadlines, compact = false }) => {
  if (upcomingDeadlines.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <Calendar size={compact ? 16 : 20} />
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">No Upcoming Deadlines</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Next 2 weeks are clear</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white p-2 rounded-lg">
            <Clock size={compact ? 16 : 20} />
          </div>
          <div>
            <p className="font-medium text-orange-900 dark:text-orange-100">
              {upcomingDeadlines.length} Upcoming Deadline{upcomingDeadlines.length > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400">Next 2 weeks</p>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {upcomingDeadlines.slice(0, 3).map((goal) => (
            <div key={`${goal.memberId}-${goal.goalId}`} className="flex items-center justify-between text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-orange-900 dark:text-orange-100 truncate">
                  {goal.goalText}
                </p>
                <p className="text-orange-600 dark:text-orange-400">
                  {goal.memberName} • {goal.daysUntil === 0 ? 'Due today' : 
                    goal.daysUntil === 1 ? 'Due tomorrow' : 
                    `${goal.daysUntil} days left`}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                goal.priority === 'high' ? 'bg-red-200 text-red-800' :
                goal.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {goal.priority}
              </span>
            </div>
          ))}
          {upcomingDeadlines.length > 3 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 text-center pt-2">
              +{upcomingDeadlines.length - 3} more upcoming deadlines
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface TopPerformersWidgetProps {
  memberPerformance: Array<{
    memberId: string;
    memberName: string;
    completionRate: number;
    goalsCompleted: number;
    goalsAssigned: number;
    rank: number;
  }>;
  compact?: boolean;
}

const TopPerformersWidget: React.FC<TopPerformersWidgetProps> = ({ memberPerformance, compact = false }) => {
  if (memberPerformance.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <Users size={compact ? 16 : 20} />
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">No Team Data</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Add team members to see performance</p>
          </div>
        </div>
      </div>
    );
  }

  const topPerformers = memberPerformance.slice(0, compact ? 2 : 3);

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-purple-500 text-white p-2 rounded-lg">
          <TrendingUp size={compact ? 16 : 20} />
        </div>
        <div>
          <p className="font-medium text-purple-900 dark:text-purple-100">Top Performers</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">By completion rate</p>
        </div>
      </div>

      <div className="space-y-2">
        {topPerformers.map((member) => (
          <div key={member.memberId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                member.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                member.rank === 2 ? 'bg-gray-300 text-gray-700' :
                'bg-orange-300 text-orange-900'
              }`}>
                {member.rank}
              </span>
              <span className="font-medium text-purple-900 dark:text-purple-100 text-sm">
                {member.memberName}
              </span>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-900 dark:text-purple-100 text-sm">
                {member.completionRate.toFixed(0)}%
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {member.goalsCompleted}/{member.goalsAssigned} goals
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsWidgets: React.FC<AnalyticsWidgetsProps> = ({ analytics, compact = false }) => {
  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
      {/* Team Completion Rate */}
      <MetricCard
        title="Team Completion Rate"
        value={`${analytics.teamCompletionRate.toFixed(1)}%`}
        subtitle={`${analytics.totalGoalsCompleted}/${analytics.totalGoalsAssigned} goals`}
        icon={<Target size={compact ? 16 : 20} />}
        color="blue"
        compact={compact}
      />

      {/* Overdue Goals Alert */}
      <MetricCard
        title="Overdue Goals"
        value={analytics.overdueGoals.length}
        subtitle={analytics.overdueGoals.length > 0 ? "Need attention" : "All on track"}
        icon={<AlertTriangle size={compact ? 16 : 20} />}
        color={analytics.overdueGoals.length > 0 ? "red" : "green"}
        compact={compact}
      />

      {/* Upcoming Deadlines */}
      <MetricCard
        title="Upcoming Deadlines"
        value={analytics.upcomingDeadlines.length}
        subtitle="Next 2 weeks"
        icon={<Clock size={compact ? 16 : 20} />}
        color="orange"
        compact={compact}
      />

      {/* Team Members */}
      <MetricCard
        title="Team Members"
        value={analytics.memberPerformance.length}
        subtitle={analytics.memberPerformance.length > 0 ? "Active members" : "Add members"}
        icon={<Users size={compact ? 16 : 20} />}
        color="purple"
        compact={compact}
      />

      {/* Detailed Widgets (only in non-compact mode) */}
      {!compact && (
        <>
          <div className="sm:col-span-2">
            <OverdueGoalsWidget overdueGoals={analytics.overdueGoals} />
          </div>
          
          <div className="sm:col-span-2">
            <UpcomingDeadlinesWidget upcomingDeadlines={analytics.upcomingDeadlines} />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <TopPerformersWidget memberPerformance={analytics.memberPerformance} />
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsWidgets;
export { MetricCard, OverdueGoalsWidget, UpcomingDeadlinesWidget, TopPerformersWidget };
