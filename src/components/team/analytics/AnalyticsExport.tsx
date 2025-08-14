import React from 'react';
import type { TeamAnalytics } from '../../../services/analytics';

interface AnalyticsExportProps {
  analytics: TeamAnalytics;
  dateRange: {
    start: string;
    end: string;
  };
  selectedMembers: string[];
  goalCategory: 'all' | 'personal' | 'professional';
  priority: 'all' | 'high' | 'medium' | 'low';
}

export const generateCSVReport = (props: AnalyticsExportProps): string => {
  const { analytics, dateRange, goalCategory, priority } = props;
  
  const csvLines = [
    'Team Focus Coach Analytics Report',
    `Generated: ${new Date().toLocaleDateString()}`,
    `Date Range: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`,
    `Filters: Category=${goalCategory}, Priority=${priority}`,
    '',
    'TEAM OVERVIEW',
    `Team Completion Rate,${analytics.teamCompletionRate.toFixed(1)}%`,
    `Total Goals Assigned,${analytics.totalGoalsAssigned}`,
    `Total Goals Completed,${analytics.totalGoalsCompleted}`,
    `Overdue Goals,${analytics.overdueGoals.length}`,
    `Upcoming Deadlines,${analytics.upcomingDeadlines.length}`,
    '',
    'MEMBER PERFORMANCE',
    'Rank,Member Name,Completion Rate,Goals Completed,Goals Assigned'
  ];

  analytics.memberPerformance.forEach(member => {
    csvLines.push(
      `${member.rank},${member.memberName},${member.completionRate.toFixed(1)}%,${member.goalsCompleted},${member.goalsAssigned}`
    );
  });

  if (analytics.overdueGoals.length > 0) {
    csvLines.push('');
    csvLines.push('OVERDUE GOALS');
    csvLines.push('Member,Goal,Days Overdue,Priority,Category');
    
    analytics.overdueGoals.forEach(goal => {
      csvLines.push(
        `${goal.memberName},"${goal.goalText}",${goal.daysOverdue},${goal.priority},${goal.category}`
      );
    });
  }

  if (analytics.upcomingDeadlines.length > 0) {
    csvLines.push('');
    csvLines.push('UPCOMING DEADLINES');
    csvLines.push('Member,Goal,Days Until Due,Priority,Category');
    
    analytics.upcomingDeadlines.forEach(goal => {
      csvLines.push(
        `${goal.memberName},"${goal.goalText}",${goal.daysUntil},${goal.priority},${goal.category}`
      );
    });
  }

  if (analytics.recentActivity.length > 0) {
    csvLines.push('');
    csvLines.push('RECENT ACTIVITY (Last 7 Days)');
    csvLines.push('Date,Member,Activity,Goal,Priority');
    
    analytics.recentActivity.forEach(activity => {
      const activityType = activity.type === 'goal_completed' ? 'Completed' :
                          activity.type === 'goal_assigned' ? 'Assigned' :
                          'Deadline Missed';
      csvLines.push(
        `${new Date(activity.timestamp).toLocaleDateString()},${activity.memberName},${activityType},"${activity.goalText}",${activity.priority || 'N/A'}`
      );
    });
  }

  return csvLines.join('\n');
};

export const generateHTMLReport = (props: AnalyticsExportProps): string => {
  const { analytics, dateRange, goalCategory, priority } = props;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Team Focus Coach Analytics Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333; 
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
        }
        .header h1 { 
            color: #1E40AF; 
            margin: 0;
            font-size: 28px;
        }
        .header p { 
            color: #6B7280; 
            margin: 5px 0;
        }
        .section { 
            margin: 30px 0; 
        }
        .section h2 { 
            color: #1E40AF; 
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 10px;
            font-size: 20px;
        }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 20px 0;
        }
        .metric-card { 
            background: #F8FAFC; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #3B82F6;
        }
        .metric-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1E40AF;
            margin: 0;
        }
        .metric-label { 
            color: #6B7280; 
            font-size: 14px;
            margin: 5px 0 0 0;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #E5E7EB;
        }
        th { 
            background-color: #F3F4F6; 
            font-weight: 600;
            color: #374151;
        }
        .rank-badge {
            display: inline-block;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        .rank-1 { background-color: #F59E0B; }
        .rank-2 { background-color: #9CA3AF; }
        .rank-3 { background-color: #F97316; }
        .rank-other { background-color: #3B82F6; }
        .priority-high { color: #DC2626; font-weight: bold; }
        .priority-medium { color: #D97706; }
        .priority-low { color: #059669; }
        .overdue { color: #DC2626; font-weight: bold; }
        .upcoming { color: #D97706; }
        @media print {
            body { margin: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Team Focus Coach Analytics Report</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        <p>Date Range: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}</p>
        <p>Filters: Category=${goalCategory}, Priority=${priority}</p>
    </div>

    <div class="section">
        <h2>Team Overview</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <p class="metric-value">${analytics.teamCompletionRate.toFixed(1)}%</p>
                <p class="metric-label">Team Completion Rate</p>
            </div>
            <div class="metric-card">
                <p class="metric-value">${analytics.totalGoalsCompleted}</p>
                <p class="metric-label">Goals Completed</p>
            </div>
            <div class="metric-card">
                <p class="metric-value">${analytics.totalGoalsAssigned}</p>
                <p class="metric-label">Total Goals Assigned</p>
            </div>
            <div class="metric-card">
                <p class="metric-value ${analytics.overdueGoals.length > 0 ? 'overdue' : ''}">${analytics.overdueGoals.length}</p>
                <p class="metric-label">Overdue Goals</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Member Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Member Name</th>
                    <th>Completion Rate</th>
                    <th>Goals Completed</th>
                    <th>Goals Assigned</th>
                </tr>
            </thead>
            <tbody>
                ${analytics.memberPerformance.map(member => `
                    <tr>
                        <td>
                            <span class="rank-badge rank-${member.rank <= 3 ? member.rank : 'other'}">${member.rank}</span>
                        </td>
                        <td>${member.memberName}</td>
                        <td>${member.completionRate.toFixed(1)}%</td>
                        <td>${member.goalsCompleted}</td>
                        <td>${member.goalsAssigned}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    ${analytics.overdueGoals.length > 0 ? `
    <div class="section">
        <h2>Overdue Goals</h2>
        <table>
            <thead>
                <tr>
                    <th>Member</th>
                    <th>Goal</th>
                    <th>Days Overdue</th>
                    <th>Priority</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                ${analytics.overdueGoals.map(goal => `
                    <tr>
                        <td>${goal.memberName}</td>
                        <td>${goal.goalText}</td>
                        <td class="overdue">${goal.daysOverdue} days</td>
                        <td class="priority-${goal.priority}">${goal.priority}</td>
                        <td>${goal.category}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${analytics.upcomingDeadlines.length > 0 ? `
    <div class="section">
        <h2>Upcoming Deadlines</h2>
        <table>
            <thead>
                <tr>
                    <th>Member</th>
                    <th>Goal</th>
                    <th>Days Until Due</th>
                    <th>Priority</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                ${analytics.upcomingDeadlines.map(goal => `
                    <tr>
                        <td>${goal.memberName}</td>
                        <td>${goal.goalText}</td>
                        <td class="upcoming">${goal.daysUntil === 0 ? 'Due today' : goal.daysUntil === 1 ? 'Due tomorrow' : `${goal.daysUntil} days`}</td>
                        <td class="priority-${goal.priority}">${goal.priority}</td>
                        <td>${goal.category}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${analytics.recentActivity.length > 0 ? `
    <div class="section">
        <h2>Recent Activity (Last 7 Days)</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Activity</th>
                    <th>Goal</th>
                    <th>Priority</th>
                </tr>
            </thead>
            <tbody>
                ${analytics.recentActivity.map(activity => {
                  const activityType = activity.type === 'goal_completed' ? 'Completed' :
                                      activity.type === 'goal_assigned' ? 'Assigned' :
                                      'Deadline Missed';
                  return `
                    <tr>
                        <td>${new Date(activity.timestamp).toLocaleDateString()}</td>
                        <td>${activity.memberName}</td>
                        <td>${activityType}</td>
                        <td>${activity.goalText}</td>
                        <td class="priority-${activity.priority || 'medium'}">${activity.priority || 'N/A'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <p style="text-align: center; color: #6B7280; font-size: 12px; margin-top: 40px;">
            Generated by Team Focus Coach Analytics System
        </p>
    </div>
</body>
</html>
  `;

  return html;
};

export const downloadCSV = (props: AnalyticsExportProps) => {
  const csvContent = generateCSVReport(props);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `team-analytics-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadPDF = (props: AnalyticsExportProps) => {
  const htmlContent = generateHTMLReport(props);
  
  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Note: The user will need to choose "Save as PDF" in the print dialog
      }, 500);
    };
  }
};

const AnalyticsExport: React.FC<AnalyticsExportProps> = () => {
  // This component doesn't render anything, it's just for organizing export functions
  return null;
};

export default AnalyticsExport;
