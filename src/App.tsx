import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTeam } from './contexts/TeamContext';

// Import the original personal app as a component
import PersonalApp from './App-personal';

// Lazy-loaded team components for better code splitting
const TeamDashboard = lazy(() => import('./components/team/TeamDashboard'));
const TeamMemberPage = lazy(() => import('./components/team/TeamMemberPage'));
const TeamSettings = lazy(() => import('./components/team/TeamSettings'));
const TeamAnalytics = lazy(() => import('./components/team/TeamAnalytics'));

// Loading fallback for lazy-loaded routes
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const { isTeamMode } = useTeam();

  return (
    <div className={`${isTeamMode ? 'team-mode' : 'personal-mode'}`}>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Personal routes */}
          <Route path="/" element={<PersonalApp />} />
          <Route path="/personal" element={<Navigate to="/" replace />} />
          
          {/* Team routes (lazy loaded) */}
          <Route path="/team" element={<TeamDashboard />} />
          <Route path="/team/settings" element={<TeamSettings />} />
          <Route path="/team/analytics" element={<TeamAnalytics />} />
          <Route path="/team/:memberSlug" element={<TeamMemberPage />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
