import type { TeamData } from '../types/team';
import { teamStorage } from './teamStorage';

export interface TeamAnalytics {
  teamCompletionRate: number;
  totalGoalsAssigned: number;
  totalGoalsCompleted: number;
  overdueGoals: OverdueGoal[];
  upcomingDeadlines: UpcomingDeadline[];
  memberPerformance: MemberPerformance[];
  recentActivity: RecentActivity[];
}

export interface MemberAnalytics {
  memberId: string;
  memberName: string;
  overallCompletionRate: number;
  recentCompletionRate: number; // Last 30 days
  totalGoalsAssigned: number;
  totalGoalsCompleted: number;
  overdueGoals: number;
  upcomingDeadlines: number;
  averageCompletionTime: number; // Days
}

export interface OverdueGoal {
  goalId: number;
  goalText: string;
  memberId: string;
  memberName: string;
  deadline: string;
  daysOverdue: number;
  priority: 'high' | 'medium' | 'low';
  category: 'personal' | 'professional';
}

export interface UpcomingDeadline {
  goalId: number;
  goalText: string;
  memberId: string;
  memberName: string;
  deadline: string;
  daysUntil: number;
  priority: 'high' | 'medium' | 'low';
  category: 'personal' | 'professional';
}

export interface MemberPerformance {
  memberId: string;
  memberName: string;
  completionRate: number;
  goalsCompleted: number;
  goalsAssigned: number;
  rank: number;
}

export interface RecentActivity {
  type: 'goal_completed' | 'goal_assigned' | 'deadline_missed';
  goalText: string;
  memberId: string;
  memberName: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

class AnalyticsService {
  /**
   * Calculate comprehensive team analytics
   */
  calculateTeamAnalytics(): TeamAnalytics {
    const teamData = teamStorage.getTeamData();
    const memberAnalytics = teamData.members.map(member => 
      this.calculateMemberAnalytics(member.id)
    );

    // Calculate team-wide metrics
    const totalGoalsAssigned = memberAnalytics.reduce((sum, member) => sum + member.totalGoalsAssigned, 0);
    const totalGoalsCompleted = memberAnalytics.reduce((sum, member) => sum + member.totalGoalsCompleted, 0);
    const teamCompletionRate = totalGoalsAssigned > 0 ? (totalGoalsCompleted / totalGoalsAssigned) * 100 : 0;

    // Collect overdue goals and upcoming deadlines
    const overdueGoals: OverdueGoal[] = [];
    const upcomingDeadlines: UpcomingDeadline[] = [];

    teamData.members.forEach(member => {
      const memberData = teamStorage.getMemberData(member.id);
      if (!memberData) return;

      // Check all goals for deadlines
      [...memberData.goals.personal, ...memberData.goals.professional].forEach(goal => {
        if (goal.deadline && !goal.completedAt) {
          const deadline = new Date(goal.deadline);
          const today = new Date();
          const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntil < 0) {
            // Overdue
            overdueGoals.push({
              goalId: goal.id,
              goalText: goal.text,
              memberId: member.id,
              memberName: member.fullName,
              deadline: goal.deadline,
              daysOverdue: Math.abs(daysUntil),
              priority: goal.priority,
              category: goal.category
            });
          } else if (daysUntil <= 14) {
            // Upcoming (within 2 weeks)
            upcomingDeadlines.push({
              goalId: goal.id,
              goalText: goal.text,
              memberId: member.id,
              memberName: member.fullName,
              deadline: goal.deadline,
              daysUntil,
              priority: goal.priority,
              category: goal.category
            });
          }
        }
      });
    });

    // Sort overdue by days overdue (most overdue first)
    overdueGoals.sort((a, b) => b.daysOverdue - a.daysOverdue);

    // Sort upcoming by days until deadline
    upcomingDeadlines.sort((a, b) => a.daysUntil - b.daysUntil);

    // Calculate member performance rankings
    const memberPerformance: MemberPerformance[] = memberAnalytics
      .map((member) => ({
        memberId: member.memberId,
        memberName: member.memberName,
        completionRate: member.overallCompletionRate,
        goalsCompleted: member.totalGoalsCompleted,
        goalsAssigned: member.totalGoalsAssigned,
        rank: 0 // Will be set after sorting
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .map((member, index) => ({ ...member, rank: index + 1 }));

    // Generate recent activity (last 7 days)
    const recentActivity = this.generateRecentActivity(teamData);

    return {
      teamCompletionRate,
      totalGoalsAssigned,
      totalGoalsCompleted,
      overdueGoals,
      upcomingDeadlines,
      memberPerformance,
      recentActivity
    };
  }

  /**
   * Calculate analytics for a specific team member
   */
  calculateMemberAnalytics(memberId: string): MemberAnalytics {
    const member = teamStorage.getTeamMember(memberId);
    const memberData = teamStorage.getMemberData(memberId);

    if (!member || !memberData) {
      return {
        memberId,
        memberName: 'Unknown Member',
        overallCompletionRate: 0,
        recentCompletionRate: 0,
        totalGoalsAssigned: 0,
        totalGoalsCompleted: 0,
        overdueGoals: 0,
        upcomingDeadlines: 0,
        averageCompletionTime: 0
      };
    }

    // Get all goals (personal + professional)
    const allGoals = [...memberData.goals.personal, ...memberData.goals.professional];
    
    // Calculate overall completion rate
    const totalGoalsAssigned = allGoals.length;
    const totalGoalsCompleted = allGoals.filter(goal => goal.completedAt).length;
    const overallCompletionRate = totalGoalsAssigned > 0 ? (totalGoalsCompleted / totalGoalsAssigned) * 100 : 0;

    // Calculate recent completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentGoals = allGoals.filter(goal => 
      new Date(goal.createdAt) >= thirtyDaysAgo
    );
    const recentCompleted = recentGoals.filter(goal => goal.completedAt).length;
    const recentCompletionRate = recentGoals.length > 0 ? (recentCompleted / recentGoals.length) * 100 : 0;

    // Count overdue goals
    const today = new Date();
    const overdueGoals = allGoals.filter(goal => {
      if (!goal.deadline || goal.completedAt) return false;
      const deadline = new Date(goal.deadline);
      return deadline < today;
    }).length;

    // Count upcoming deadlines (within 14 days)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    
    const upcomingDeadlines = allGoals.filter(goal => {
      if (!goal.deadline || goal.completedAt) return false;
      const deadline = new Date(goal.deadline);
      return deadline >= today && deadline <= twoWeeksFromNow;
    }).length;

    // Calculate average completion time
    const completedGoalsWithDates = allGoals.filter(goal => 
      goal.completedAt && goal.createdAt
    );
    
    let averageCompletionTime = 0;
    if (completedGoalsWithDates.length > 0) {
      const totalCompletionTime = completedGoalsWithDates.reduce((sum, goal) => {
        const created = new Date(goal.createdAt);
        const completed = new Date(goal.completedAt!);
        const days = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      averageCompletionTime = totalCompletionTime / completedGoalsWithDates.length;
    }

    return {
      memberId,
      memberName: member.fullName,
      overallCompletionRate,
      recentCompletionRate,
      totalGoalsAssigned,
      totalGoalsCompleted,
      overdueGoals,
      upcomingDeadlines,
      averageCompletionTime
    };
  }

  /**
   * Generate recent activity feed
   */
  private generateRecentActivity(teamData: TeamData): RecentActivity[] {
    const activities: RecentActivity[] = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    teamData.members.forEach(member => {
      const memberData = teamStorage.getMemberData(member.id);
      if (!memberData) return;

      const allGoals = [...memberData.goals.personal, ...memberData.goals.professional];

      allGoals.forEach(goal => {
        // Goal completed recently
        if (goal.completedAt && new Date(goal.completedAt) >= sevenDaysAgo) {
          activities.push({
            type: 'goal_completed',
            goalText: goal.text,
            memberId: member.id,
            memberName: member.fullName,
            timestamp: goal.completedAt,
            priority: goal.priority
          });
        }

        // Goal assigned recently (only for leader-assigned goals)
        if (goal.assignedBy !== 'self' && new Date(goal.createdAt) >= sevenDaysAgo) {
          activities.push({
            type: 'goal_assigned',
            goalText: goal.text,
            memberId: member.id,
            memberName: member.fullName,
            timestamp: goal.createdAt,
            priority: goal.priority
          });
        }

        // Deadline missed recently
        if (goal.deadline && !goal.completedAt) {
          const deadline = new Date(goal.deadline);
          const today = new Date();
          if (deadline < today && deadline >= sevenDaysAgo) {
            activities.push({
              type: 'deadline_missed',
              goalText: goal.text,
              memberId: member.id,
              memberName: member.fullName,
              timestamp: goal.deadline,
              priority: goal.priority
            });
          }
        }
      });
    });

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10); // Return last 10 activities
  }

  /**
   * Export analytics data for reporting
   */
  exportTeamReport(period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'): string {
    const analytics = this.calculateTeamAnalytics();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Generate CSV content
    const csvLines = [
      'Team Focus Coach Analytics Report',
      `Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`,
      `Generated: ${endDate.toLocaleDateString()}`,
      `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
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

    return csvLines.join('\n');
  }
}

export const analyticsService = new AnalyticsService();
