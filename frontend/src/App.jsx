import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RoutePlanner from './pages/RoutePlanner';
import CrowdPrediction from './pages/CrowdPrediction';
import BusETA from './pages/BusETA';
import RouteMap from './pages/RouteMap';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigate = (pageId, params = {}) => {
    setActivePage(pageId);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'plan-journey':
        return <RoutePlanner initialParams={pageParams} onNavigate={handleNavigate} />;
      case 'crowd-prediction':
        return <CrowdPrediction initialParams={pageParams} onNavigate={handleNavigate} />;
      case 'bus-arrivals':
        return <BusETA onNavigate={handleNavigate} />;
      case 'route-map':
        return <RouteMap onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        activePage={activePage}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activePage={activePage}
          onSelectPage={(pageId) => handleNavigate(pageId, {})}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
