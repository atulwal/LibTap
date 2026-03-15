import React from 'react';
import { BookOpen, AlertCircle, Clock, BookUp } from 'lucide-react';
import { useStore } from '../store';

const recentActivity = [
  { user: 'Rahul Sharma', book: 'Advanced Calculus', type: 'Issue', time: '10 mins ago' },
  { user: 'Priya Patel', book: 'Data Structures using C++', type: 'Return', time: '25 mins ago' },
  { user: 'Amit Kumar', book: 'University Physics', type: 'Issue', time: '1 hour ago' },
  { user: 'Sneha Gupta', book: 'Discrete Mathematics', type: 'Issue', time: '2 hours ago' },
];

export default function Overview() {
  const offlineQueue = useStore((s) => s.offlineQueue);

  const stats = [
    { label: 'Books Issued Today', value: '42', icon: BookUp, iconColor: '#818cf8', iconBg: 'rgba(99,102,241,0.1)' },
    { label: 'Total Books in System', value: '3,841', icon: BookOpen, iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.1)' },
    { label: 'Pending Offline Scans', value: String(offlineQueue.length), icon: AlertCircle, iconColor: offlineQueue.length > 0 ? '#f87171' : '#6b7280', iconBg: offlineQueue.length > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(107,114,128,0.1)' },
    { label: 'Avg Scan Time', value: '1.2s', icon: Clock, iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.1)' },
  ];

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(120deg,#fff,#888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>System Overview</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Real-time statistics for the Smart Library.</p>
      </div>

      {/* Metric Cards */}
      <div className="dash-grid-4">
        {stats.map((s, i) => (
          <div key={i} className="dash-card" style={{ cursor: 'default' }}>
            <div className="stat-row">
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.label}</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{s.value}</h3>
              </div>
              <div className="dash-metric-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                <s.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lower grid */}
      <div className="dash-grid-3">
        {/* Recent Transactions */}
        <div className="dash-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Book Title</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{a.user}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.book}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700,
                      background: a.type === 'Issue' ? 'rgba(99,102,241,0.15)' : 'rgba(251,146,60,0.15)',
                      color: a.type === 'Issue' ? '#818cf8' : '#fb923c',
                      border: `1px solid ${a.type === 'Issue' ? 'rgba(99,102,241,0.3)' : 'rgba(251,146,60,0.3)'}`,
                    }}>
                      {a.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Health */}
        <div className="dash-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>System Health</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'API Server (Vigyan)', status: 'Online', fill: '100%', color: '#34d399' },
              { label: 'Local Sync Status', status: 'Uptime 99%', fill: '99%', color: '#818cf8' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 600 }}>{item.status}</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: item.fill, background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</p>
            <a href="/dashboard/queue" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', fontSize: '0.875rem' }}>
              <span>Manage Offline Queue</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem' }}>{offlineQueue.length}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
