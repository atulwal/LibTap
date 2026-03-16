import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, WifiOff, Users, BookMarked, Settings, Search } from 'lucide-react';
import NetworkStatus from './NetworkStatus';
import { useStore } from '../store';

export default function DashboardLayout() {
  const offlineQueue = useStore((s) => s.offlineQueue);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
    { to: '/dashboard/queue', icon: WifiOff, label: 'Offline Queue', badge: offlineQueue.length },
    { to: '/dashboard/search', icon: Search, label: 'Student Search' },
    { to: '#', icon: BookMarked, label: 'Inventory' },
    { to: '#', icon: Users, label: 'Students' },
    { to: '#', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <nav className="dash-sidebar">
        <div className="dash-sidebar-brand">
          <h1>Smart Library Hub</h1>
          <p>Admin Dashboard</p>
        </div>

        <div className="dash-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `dash-nav-item${isActive ? ' active' : ''}`
              }
            >
              <item.icon size={18} />
              {item.label}
              {item.badge > 0 && (
                <span className="dash-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="dash-user-card">
          <div className="dash-avatar">AD</div>
          <div className="dash-user-info">
            <p>Admin User</p>
            <p>admin@vigyan.edu</p>
          </div>
        </div>
      </nav>

      {/* Main Area */}
      <main className="dash-main">
        <header className="dash-topbar">
          <span className="dash-topbar-title">Dashboard</span>
          <div className="dash-topbar-right">
            <NetworkStatus />
            <a href="/scan-user" className="open-scanner-btn" target="_blank" rel="noreferrer">
              Open Scanner
            </a>
          </div>
        </header>

        <div className="dash-workspace">
          <div className="dash-inner">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
