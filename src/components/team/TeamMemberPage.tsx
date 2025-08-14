import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useTeamMember } from '../../contexts/TeamContext';

// Import the original personal app component
import PersonalApp from '../../App-personal';

const TeamMemberPage: React.FC = () => {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const { member, memberData, isLoading, notFound } = useTeamMember(memberSlug);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400">Loading team member...</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (notFound || !member) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="mx-auto w-16 h-16 text-blue-400 mb-4" />
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Team Member Not Found
          </h1>
          <p className="text-blue-600 dark:text-blue-400 mb-6">
            The team member "{memberSlug}" doesn't exist.
          </p>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Team Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Render the personal app with team member context
  return (
    <div className="team-member-page" data-member-id={member.id} data-member-name={member.fullName}>
      {/* Team Member Header */}
      <div className="bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700">
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/team"
                className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                aria-label="Back to team dashboard"
              >
                <ArrowLeft className="text-blue-600 dark:text-blue-400" size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: member.color }}
                >
                  {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {member.fullName}
                  </h1>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Team Focus Coach
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/team"
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Team Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Personal App with Team Member Data */}
      <div className="team-member-app">
        <PersonalApp 
          teamMember={member}
          teamMemberData={memberData}
          isTeamMode={true}
        />
      </div>
    </div>
  );
};

export default TeamMemberPage;
