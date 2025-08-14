import { Routes, Route, Navigate } from 'react-router-dom';
import { useTeam } from './contexts/TeamContext';

// Import the original personal app as a component
import PersonalApp from './App-personal';

// Team components (we'll create these next)
import TeamDashboard from './components/team/TeamDashboard';
import TeamMemberPage from './components/team/TeamMemberPage';
import TeamSettings from './components/team/TeamSettings';
import TeamAnalytics from './components/team/TeamAnalytics';

function App() {
  const { isTeamMode } = useTeam();

  return (
    <div className={`${isTeamMode ? 'team-mode' : 'personal-mode'}`}>
      <Routes>
        {/* Personal routes */}
        <Route path="/" element={<PersonalApp />} />
        <Route path="/personal" element={<Navigate to="/" replace />} />
        
        {/* Team routes */}
        <Route path="/team" element={<TeamDashboard />} />
        <Route path="/team/settings" element={<TeamSettings />} />
        <Route path="/team/analytics" element={<TeamAnalytics />} />
        <Route path="/team/:memberSlug" element={<TeamMemberPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
