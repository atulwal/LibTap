import React, { useEffect, useState } from 'react';
import { BookOpen, AlertCircle, Clock, BookUp } from 'lucide-react';
import { useStore } from '../store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function fetchOverview() {
  const [overviewRes, peakRes, txnRes] = await Promise.all([
    fetch(`${API_BASE}/api/analytics/overview`),
    fetch(`${API_BASE}/api/analytics/peak-hour`),
    fetch(`${API_BASE}/api/transactions`),
  ]);
  const overview = await overviewRes.json();
  const peak = await peakRes.json();
  const txns = await txnRes.json();
  return { overview: overview.data, peakHours: peak.data, recent: txns.data };
}

function formatHour(h) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:00 ${suffix}`;
}

export default function Overview() {
  const offlineQueue = useStore((s) => s.offlineQueue);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    fetchOverview()
      .then(d => setData(d))
      .catch(e => setError(e.message));
  };

  useEffect(() => {
    load();

    // SSE — real-time dashboard updates
    const sse = new EventSource(`${API_BASE}/api/events`);
    sse.addEventListener('new_transaction', () => load());
    sse.addEventListener('transaction_returned', () => load());
    sse.onerror = () => sse.close();

    return () => sse.close();
  }, []);

  const overview = data?.overview;
  const recent = data?.recent?.slice(0, 6) ?? [];
  const topHour = data?.peakHours?.[0];

  const stats = [
    { label: 'Books Issued Today', value: overview ? String(overview.issuedToday) : '—', icon: BookUp, iconColor: '#818cf8', iconBg: 'rgba(99,102,241,0.1)' },
    { label: 'Total Active Issues', value: overview ? String(overview.totalActive) : '—', icon: BookOpen, iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.1)' },
    { label: 'Overdue Now', value: overview ? String(overview.overdueCount) : '—', icon: AlertCircle, iconColor: overview?.overdueCount > 0 ? '#f87171' : '#6b7280', iconBg: overview?.overdueCount > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(107,114,128,0.1)' },
    { label: 'Peak Hour', value: topHour ? formatHour(topHour.hour) : '—', icon: Clock, iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.1)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(120deg,#fff,#888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>System Overview</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          {error ? <span style={{ color: '#f87171' }}>⚠ Cannot reach backend — showing last known data. ({error})</span> : 'Live data from NFC scanner.'}
        </p>
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

      {/* Recent + Health */}
      <div className="dash-grid-3">
        <div className="dash-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Transactions</h2>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No transactions yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Book</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Fine</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.studentId}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.books?.[0]?.title ?? '—'}</td>
                    <td>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 700, background: t.books?.[0]?.transactionType === 'Issue' ? 'rgba(99,102,241,0.15)' : 'rgba(251,146,60,0.15)', color: t.books?.[0]?.transactionType === 'Issue' ? '#818cf8' : '#fb923c' }}>
                        {t.books?.[0]?.transactionType ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 700,
                        background: t.status === 'Overdue' ? 'rgba(248,113,113,0.15)' : t.status === 'Returned' ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.1)',
                        color: t.status === 'Overdue' ? '#f87171' : t.status === 'Returned' ? '#34d399' : '#a5b4fc'
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '0.8rem', color: t.fineAmount > 0 ? '#f87171' : 'var(--text-secondary)', fontWeight: t.fineAmount > 0 ? 700 : 400 }}>
                      {t.fineAmount > 0 ? `₹${t.fineAmount}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dash-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>System Health</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>API Backend</span>
                <span style={{ color: error ? '#f87171' : '#34d399', fontWeight: 600 }}>{error ? 'Offline' : 'Online'}</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: error ? '0%' : '100%', background: error ? '#f87171' : '#34d399' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Local Offline Queue</span>
                <span style={{ color: offlineQueue.length > 0 ? '#fbbf24' : '#34d399', fontWeight: 600 }}>{offlineQueue.length} pending</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: offlineQueue.length > 0 ? '50%' : '100%', background: offlineQueue.length > 0 ? '#fbbf24' : '#34d399' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</p>
            <a href="/dashboard/search" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>🔍 Search Student</span>
            </a>
            <a href="/dashboard/queue" className="btn" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              <span>Offline Queue</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem' }}>{offlineQueue.length}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
