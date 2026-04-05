import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ErrorBoundary from '../components/ErrorBoundary';
import WelcomeTour from '../components/WelcomeTour';

const AppLayout = () => (
  <div className="flex min-h-screen bg-ink-50">
    <WelcomeTour />
    <Sidebar />
    <main className="flex-1 overflow-y-auto min-h-screen">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </main>
  </div>
);

export default AppLayout;
