import type { TeamData, TeamMember, TeamMemberData, TeamGoal, TeamStats, TeamDeadline } from '../types/team';
import type { TinyGoal } from '../types/goal';
import type { DailyTasks } from '../types/task';
import type { AchievementStats } from '../types/achievement';
import type { DailyQuote } from './storage';

const TEAM_STORAGE_KEY = 'daily-focus-coach-team-data';

// Default team colors for visual distinction
const MEMBER_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

const defaultTeamData: TeamData = {
  members: [],
  memberData: {},
  teamQuote: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Utility function to create URL-friendly slug from full name
const createSlug = (fullName: string): string => {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Utility function to get next available color
const getNextMemberColor = (existingMembers: TeamMember[]): string => {
  const usedColors = existingMembers.map(m => m.color);
  const availableColor = MEMBER_COLORS.find(color => !usedColors.includes(color));
  return availableColor || MEMBER_COLORS[existingMembers.length % MEMBER_COLORS.length];
};

export const teamStorage = {
  // Core data operations
  getTeamData(): TeamData {
    try {
      const stored = localStorage.getItem(TEAM_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultTeamData;
    } catch {
      return defaultTeamData;
    }
  },

  setTeamData(teamData: TeamData): void {
    const updatedData = {
      ...teamData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updatedData));
  },

  // Team member management
  addTeamMember(fullName: string): TeamMember {
    const teamData = this.getTeamData();
    const slug = createSlug(fullName);
    
    // Check for duplicate slugs
    const existingMember = teamData.members.find(m => m.slug === slug);
    if (existingMember) {
      throw new Error(`A team member with the name "${fullName}" already exists`);
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName,
      slug,
      color: getNextMemberColor(teamData.members),
      joinedAt: new Date().toISOString(),
      isActive: true,
    };

    // Initialize empty data for the new member
    const memberData: TeamMemberData = {
      goals: { personal: [], professional: [] },
      tinyGoals: [],
      dailyTasks: {},
      achievementStats: {
        totalCompleted: 0,
        bigGoalsCompleted: 0,
        tinyGoalsCompleted: 0,
        thisMonthCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        recentCompletions: [],
      },
    };

    const updatedTeamData = {
      ...teamData,
      members: [...teamData.members, newMember],
      memberData: {
        ...teamData.memberData,
        [newMember.id]: memberData,
      },
    };

    this.setTeamData(updatedTeamData);
    return newMember;
  },

  removeTeamMember(memberId: string): void {
    const teamData = this.getTeamData();
    const updatedTeamData = {
      ...teamData,
      members: teamData.members.filter(m => m.id !== memberId),
      memberData: Object.fromEntries(
        Object.entries(teamData.memberData).filter(([id]) => id !== memberId)
      ),
    };
    this.setTeamData(updatedTeamData);
  },

  updateTeamMember(memberId: string, updates: Partial<TeamMember>): void {
    const teamData = this.getTeamData();
    const memberIndex = teamData.members.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) {
      throw new Error('Team member not found');
    }

    // If updating full name, update slug too
    if (updates.fullName) {
      updates.slug = createSlug(updates.fullName);
    }

    teamData.members[memberIndex] = {
      ...teamData.members[memberIndex],
      ...updates,
    };

    this.setTeamData(teamData);
  },

  getTeamMember(memberId: string): TeamMember | null {
    const teamData = this.getTeamData();
    return teamData.members.find(m => m.id === memberId) || null;
  },

  getTeamMemberBySlug(slug: string): TeamMember | null {
    const teamData = this.getTeamData();
    return teamData.members.find(m => m.slug === slug) || null;
  },

  // Member data operations
  getMemberData(memberId: string): TeamMemberData | null {
    const teamData = this.getTeamData();
    return teamData.memberData[memberId] || null;
  },

  setMemberData(memberId: string, memberData: TeamMemberData): void {
    const teamData = this.getTeamData();
    const updatedTeamData = {
      ...teamData,
      memberData: {
        ...teamData.memberData,
        [memberId]: memberData,
      },
    };
    this.setTeamData(updatedTeamData);
  },

  // Goal assignment
  assignGoalToMember(memberId: string, goal: Omit<TeamGoal, 'id' | 'createdAt' | 'updatedAt'>): TeamGoal {
    const memberData = this.getMemberData(memberId);
    if (!memberData) {
      throw new Error('Team member not found');
    }

    const newGoal: TeamGoal = {
      ...goal,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMemberData = {
      ...memberData,
      goals: {
        ...memberData.goals,
        [goal.category]: [...memberData.goals[goal.category], newGoal],
      },
    };

    this.setMemberData(memberId, updatedMemberData);
    return newGoal;
  },

  // Team quote management
  setTeamQuote(quote: DailyQuote): void {
    const teamData = this.getTeamData();
    const updatedTeamData = {
      ...teamData,
      teamQuote: quote,
    };
    this.setTeamData(updatedTeamData);
  },

  getTeamQuote(): DailyQuote | null {
    const teamData = this.getTeamData();
    return teamData.teamQuote;
  },

  // Analytics and stats
  getTeamStats(): TeamStats {
    const teamData = this.getTeamData();
    const activeMembers = teamData.members.filter(m => m.isActive);
    
    let totalGoalsCompleted = 0;
    let totalCompletionRate = 0;
    const upcomingDeadlines: TeamDeadline[] = [];

    activeMembers.forEach(member => {
      const memberData = teamData.memberData[member.id];
      if (memberData) {
        totalGoalsCompleted += memberData.achievementStats.totalCompleted;
        
        // Calculate completion rate (simplified)
        const totalGoals = memberData.goals.personal.length + memberData.goals.professional.length;
        const completedGoals = memberData.achievementStats.totalCompleted;
        const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
        totalCompletionRate += completionRate;

        // Collect upcoming deadlines
        [...memberData.goals.personal, ...memberData.goals.professional].forEach(goal => {
          if (goal.deadline && !goal.completedAt) {
            const deadline = new Date(goal.deadline);
            const today = new Date();
            const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining >= 0) {
              upcomingDeadlines.push({
                goalId: goal.id,
                goalText: goal.text,
                memberName: member.fullName,
                memberId: member.id,
                deadline: goal.deadline,
                priority: goal.priority,
                daysRemaining,
              });
            }
          }
        });
      }
    });

    // Sort deadlines by urgency
    upcomingDeadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);

    // Sort members by completion rate for top performers
    const topPerformers = activeMembers
      .map(member => {
        const memberData = teamData.memberData[member.id];
        return {
          ...member,
          completionRate: memberData ? memberData.achievementStats.totalCompleted : 0,
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3)
      .map(({ completionRate, ...member }) => member);

    return {
      totalMembers: teamData.members.length,
      activeMembers: activeMembers.length,
      totalGoalsCompleted,
      averageCompletionRate: activeMembers.length > 0 ? totalCompletionRate / activeMembers.length : 0,
      upcomingDeadlines: upcomingDeadlines.slice(0, 10), // Top 10 upcoming deadlines
      topPerformers,
    };
  },

  // Utility functions
  clearAllTeamData(): void {
    localStorage.removeItem(TEAM_STORAGE_KEY);
  },

  exportTeamData() {
    return {
      teamData: this.getTeamData(),
      exportedAt: new Date().toISOString(),
    };
  },

  importTeamData(data: any): void {
    if (data.teamData) {
      this.setTeamData(data.teamData);
    }
  },
};
