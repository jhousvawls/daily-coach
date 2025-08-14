import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TeamData, TeamMember, TeamMemberData, TeamGoal, AppMode } from '../types/team';
import { teamStorage } from '../services/teamStorage';

interface TeamContextType {
  // App mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  
  // Team data
  teamData: TeamData;
  refreshTeamData: () => void;
  
  // Current team member (when viewing individual member page)
  currentTeamMember: TeamMember | null;
  setCurrentTeamMember: (member: TeamMember | null) => void;
  
  // Team member operations
  addTeamMember: (fullName: string) => Promise<TeamMember>;
  removeTeamMember: (memberId: string) => Promise<void>;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  getTeamMemberBySlug: (slug: string) => TeamMember | null;
  
  // Member data operations
  getMemberData: (memberId: string) => TeamMemberData | null;
  updateMemberData: (memberId: string, data: TeamMemberData) => void;
  
  // Goal assignment
  assignGoalToMember: (memberId: string, goal: Omit<TeamGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TeamGoal>;
  
  // Utility
  isTeamMode: boolean;
  isPersonalMode: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>('personal');
  const [teamData, setTeamData] = useState<TeamData>(() => teamStorage.getTeamData());
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember | null>(null);

  // Refresh team data from storage
  const refreshTeamData = () => {
    setTeamData(teamStorage.getTeamData());
  };

  // Team member operations
  const addTeamMember = async (fullName: string): Promise<TeamMember> => {
    try {
      const newMember = teamStorage.addTeamMember(fullName);
      refreshTeamData();
      return newMember;
    } catch (error) {
      throw error;
    }
  };

  const removeTeamMember = async (memberId: string): Promise<void> => {
    try {
      teamStorage.removeTeamMember(memberId);
      refreshTeamData();
      
      // Clear current member if it was the one being removed
      if (currentTeamMember?.id === memberId) {
        setCurrentTeamMember(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>): Promise<void> => {
    try {
      teamStorage.updateTeamMember(memberId, updates);
      refreshTeamData();
      
      // Update current member if it's the one being updated
      if (currentTeamMember?.id === memberId) {
        const updatedMember = teamStorage.getTeamMember(memberId);
        setCurrentTeamMember(updatedMember);
      }
    } catch (error) {
      throw error;
    }
  };

  const getTeamMemberBySlug = (slug: string): TeamMember | null => {
    return teamStorage.getTeamMemberBySlug(slug);
  };

  // Member data operations
  const getMemberData = (memberId: string): TeamMemberData | null => {
    return teamStorage.getMemberData(memberId);
  };

  const updateMemberData = (memberId: string, data: TeamMemberData): void => {
    teamStorage.setMemberData(memberId, data);
    refreshTeamData();
  };

  // Goal assignment
  const assignGoalToMember = async (memberId: string, goal: Omit<TeamGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamGoal> => {
    try {
      const assignedGoal = teamStorage.assignGoalToMember(memberId, goal);
      refreshTeamData();
      return assignedGoal;
    } catch (error) {
      throw error;
    }
  };

  // Computed properties
  const isTeamMode = appMode === 'team';
  const isPersonalMode = appMode === 'personal';

  // Effect to handle URL-based mode detection (will be used with router)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/team')) {
      setAppMode('team');
    } else {
      setAppMode('personal');
    }
  }, []);

  const contextValue: TeamContextType = {
    // App mode
    appMode,
    setAppMode,
    
    // Team data
    teamData,
    refreshTeamData,
    
    // Current team member
    currentTeamMember,
    setCurrentTeamMember,
    
    // Team member operations
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    getTeamMemberBySlug,
    
    // Member data operations
    getMemberData,
    updateMemberData,
    
    // Goal assignment
    assignGoalToMember,
    
    // Utility
    isTeamMode,
    isPersonalMode,
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};

// Custom hook to use team context
export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

// Helper hook for team member-specific operations
export const useTeamMember = (memberSlug?: string) => {
  const { getTeamMemberBySlug, getMemberData, updateMemberData, currentTeamMember, setCurrentTeamMember } = useTeam();
  
  const member = memberSlug ? getTeamMemberBySlug(memberSlug) : currentTeamMember;
  const memberData = member ? getMemberData(member.id) : null;
  
  const updateData = (data: TeamMemberData) => {
    if (member) {
      updateMemberData(member.id, data);
    }
  };

  // Set current member if found by slug
  useEffect(() => {
    if (memberSlug && member && member.id !== currentTeamMember?.id) {
      setCurrentTeamMember(member);
    }
  }, [memberSlug, member, currentTeamMember, setCurrentTeamMember]);

  return {
    member,
    memberData,
    updateData,
    isLoading: memberSlug ? !member : false,
    notFound: memberSlug ? !member : false,
  };
};
