import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';

const TeamSettings: React.FC = () => {
  const { teamData, addTeamMember, removeTeamMember } = useTeam();
  const [newMemberName, setNewMemberName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsAdding(true);
    setError('');

    try {
      await addTeamMember(newMemberName.trim());
      setNewMemberName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      try {
        await removeTeamMember(memberId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove team member');
      }
    }
  };

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
              <Users className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
              Team Settings
            </h1>
          </div>
        </header>

        {/* Add New Member */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Add Team Member
          </h2>
          <form onSubmit={handleAddMember} className="flex gap-3">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Enter full name (e.g., Anna Smith)"
              className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-blue-800 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newMemberName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              {isAdding ? 'Adding...' : 'Add Member'}
            </button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* Current Team Members */}
        <div>
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Current Team Members ({teamData.members.length})
          </h2>
          
          {teamData.members.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <Users className="mx-auto w-12 h-12 text-blue-400 mb-4" />
              <p className="text-blue-600 dark:text-blue-400">
                No team members yet. Add your first member above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamData.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700"
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
                        URL: /team/{member.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/team/${member.slug}`}
                      className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleRemoveMember(member.id, member.fullName)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                      aria-label={`Remove ${member.fullName}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        {teamData.members.length > 0 && (
          <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              How to share with team members:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Share the individual URLs with each team member</li>
              <li>• They can bookmark their personal page for easy access</li>
              <li>• No login required - they just need the link</li>
              <li>• You can assign goals to them from their individual pages</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSettings;
