import React from 'react';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import type { TeamAnalytics } from '../../../services/analytics';

interface AnalyticsChartsProps {
  analytics: TeamAnalytics;
  dateRange: {
    start: string;
    end: string;
  };
}

interface ChartDataPoint {
  date: string;
  completionRate: number;
  goalsCompleted: number;
  goalsAssigned: number;
}

interface MemberChartData {
  memberName: string;
  completionRate: number;
  goalsCompleted: number;
  goalsAssigned: number;
  rank: number;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics, dateRange }) => {
  // Generate sample trend data (in real implementation, this would come from analytics service)
  const generateTrendData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate realistic completion rate trends
      const baseRate = 75 + Math.sin(i * 0.2) * 15;
      const randomVariation = (Math.random() - 0.5) * 10;
      const completionRate = Math.max(0, Math.min(100, baseRate + randomVariation));
      
      data.push({
        date: date.toISOString().split('T')[0],
        completionRate: Math.round(completionRate * 10) / 10,
        goalsCompleted: Math.floor(completionRate / 10),
        goalsAssigned: 10
      });
    }
    
    return data;
  };

  const trendData = generateTrendData();
  const memberData: MemberChartData[] = analytics.memberPerformance.map(member => ({
    memberName: member.memberName,
    completionRate: member.completionRate,
    goalsCompleted: member.goalsCompleted,
    goalsAssigned: member.goalsAssigned,
    rank: member.rank
  }));

  // Simple CSS-based line chart
  const LineChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    const maxRate = Math.max(...data.map(d => d.completionRate));
    const minRate = Math.min(...data.map(d => d.completionRate));
    const range = maxRate - minRate || 1;

    return (
      <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Completion Rate Trend</h3>
        </div>
        
        <div className="relative h-64 bg-blue-50 dark:bg-blue-900/50 rounded-lg p-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-blue-600 dark:text-blue-400">
            <span>{Math.round(maxRate)}%</span>
            <span>{Math.round((maxRate + minRate) / 2)}%</span>
            <span>{Math.round(minRate)}%</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-8 h-full relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((point.completionRate - minRate) / range) * 100;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((point.completionRate - minRate) / range) * 100;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="#3B82F6"
                    className="hover:r-2 transition-all"
                  />
                );
              })}
            </svg>
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-blue-600 dark:text-blue-400">
            <span>{new Date(data[0]?.date).toLocaleDateString()}</span>
            <span>{new Date(data[Math.floor(data.length / 2)]?.date).toLocaleDateString()}</span>
            <span>{new Date(data[data.length - 1]?.date).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {data[data.length - 1]?.completionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Current Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {Math.max(...data.map(d => d.completionRate)).toFixed(1)}%
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Peak Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {(data.reduce((sum, d) => sum + d.completionRate, 0) / data.length).toFixed(1)}%
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Average</p>
          </div>
        </div>
      </div>
    );
  };

  // Simple CSS-based bar chart
  const BarChart: React.FC<{ data: MemberChartData[] }> = ({ data }) => {
    const maxRate = Math.max(...data.map(d => d.completionRate));

    return (
      <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Member Performance</h3>
        </div>
        
        <div className="space-y-4">
          {data.map((member) => (
            <div key={member.memberName} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    member.rank === 1 ? 'bg-yellow-500' :
                    member.rank === 2 ? 'bg-gray-400' :
                    member.rank === 3 ? 'bg-orange-400' :
                    'bg-blue-500'
                  }`}>
                    {member.rank}
                  </span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {member.memberName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-900 dark:text-blue-100">
                    {member.completionRate.toFixed(1)}%
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
                    ({member.goalsCompleted}/{member.goalsAssigned})
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-blue-100 dark:bg-blue-900/50 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    member.rank === 1 ? 'bg-yellow-500' :
                    member.rank === 2 ? 'bg-gray-400' :
                    member.rank === 3 ? 'bg-orange-400' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${(member.completionRate / maxRate) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple CSS-based pie chart (using conic-gradient)
  const PieChart: React.FC = () => {
    const totalGoals = analytics.totalGoalsAssigned;
    const completedGoals = analytics.totalGoalsCompleted;
    const overdueGoals = analytics.overdueGoals.length;
    const upcomingGoals = analytics.upcomingDeadlines.length;
    const onTrackGoals = totalGoals - completedGoals - overdueGoals - upcomingGoals;

    const completedPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    const overduePercentage = totalGoals > 0 ? (overdueGoals / totalGoals) * 100 : 0;
    const upcomingPercentage = totalGoals > 0 ? (upcomingGoals / totalGoals) * 100 : 0;
    // const onTrackPercentage = totalGoals > 0 ? (onTrackGoals / totalGoals) * 100 : 0;

    return (
      <div className="bg-white dark:bg-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <PieChartIcon className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Goal Status Distribution</h3>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative">
            <div
              className="w-32 h-32 rounded-full"
              style={{
                background: `conic-gradient(
                  #10B981 0deg ${completedPercentage * 3.6}deg,
                  #EF4444 ${completedPercentage * 3.6}deg ${(completedPercentage + overduePercentage) * 3.6}deg,
                  #F59E0B ${(completedPercentage + overduePercentage) * 3.6}deg ${(completedPercentage + overduePercentage + upcomingPercentage) * 3.6}deg,
                  #3B82F6 ${(completedPercentage + overduePercentage + upcomingPercentage) * 3.6}deg 360deg
                )`
              }}
            ></div>
            <div className="absolute inset-4 bg-white dark:bg-blue-800 rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{totalGoals}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Total</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-blue-900 dark:text-blue-100">
              Completed ({completedGoals})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-blue-900 dark:text-blue-100">
              Overdue ({overdueGoals})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-blue-900 dark:text-blue-100">
              Due Soon ({upcomingGoals})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-blue-900 dark:text-blue-100">
              On Track ({onTrackGoals})
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Completion Trend Chart */}
      <LineChart data={trendData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Performance Chart */}
        <BarChart data={memberData} />
        
        {/* Goal Distribution Chart */}
        <PieChart />
      </div>
    </div>
  );
};

export default AnalyticsCharts;
