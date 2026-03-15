import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import NetworkStatus from './components/NetworkStatus';
import UserScanner from './pages/UserScanner';
import BookScanner from './pages/BookScanner';
import Verification from './pages/Verification';

// Dashboard Components
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/Overview';
import OfflineQueueManager from './pages/OfflineQueueManager';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mobile Scanner Routes (with the shared mobile header) */}
        <Route element={
          <div className="app-container">
            <header className="header">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">Smart Library</span>
              </div>
              <NetworkStatus />
            </header>
            <main className="main-content">
              <Outlet />
            </main>
          </div>
        }>
          <Route path="/" element={<Navigate to="/scan-user" replace />} />
          <Route path="/scan-user" element={<UserScanner />} />
          <Route path="/scan-books" element={<BookScanner />} />
          <Route path="/verification" element={<Verification />} />
        </Route>

        {/* Desktop Dashboard Routes (uses its own layout) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="queue" element={<OfflineQueueManager />} />
        </Route>
      </Routes>
      <Toaster position="bottom-center" theme="dark" />
    </BrowserRouter>
  );
}

export default App;
