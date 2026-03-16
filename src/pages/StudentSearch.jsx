import React, { useState } from 'react';
import { Search } from 'lucide-react';

const API_BASE = 'http://localhost:4000';

function StatusBadge({ status }) {
  const colors = {
    Active:   { bg: 'rgba(99,102,241,0.15)',   color: '#a5b4fc' },
    Returned: { bg: 'rgba(52,211,153,0.15)',    color: '#34d399' },
    Overdue:  { bg: 'rgba(248,113,113,0.15)',   color: '#f87171' },
  };
  const c = colors[status] || colors.Active;
  return (
    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700, background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

export default function StudentSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/search?studentId=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(120deg,#fff,#888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Student Search</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Look up a student's full transaction history, statuses, and fines.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter Student ID or NFC Tag ID..."
              style={{
                width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: 'white', fontSize: '0.95rem',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 1.5rem' }} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px', padding: '1rem', color: '#f87171', marginBottom: '1rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Summary Row */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Student ID', value: result.studentId },
              { label: 'Total Transactions', value: result.count },
              { label: 'Total Fine', value: result.totalFine > 0 ? `₹${result.totalFine}` : '₹0', alert: result.totalFine > 0 },
            ].map((card, i) => (
              <div key={i} className="dash-card" style={{ flex: 1, minWidth: '140px', padding: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{card.label}</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: card.alert ? '#f87171' : 'white' }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Transactions Table */}
          {result.data.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No transactions found for this student.</p>
          ) : (
            <div className="dash-card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Transaction History</h2>
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Type</th>
                    <th>Issued</th>
                    <th>Due</th>
                    <th>Returned</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{t.books?.[0]?.title ?? '—'}</td>
                      <td>
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, background: t.books?.[0]?.transactionType === 'Issue' ? 'rgba(99,102,241,0.15)' : 'rgba(251,146,60,0.15)', color: t.books?.[0]?.transactionType === 'Issue' ? '#818cf8' : '#fb923c' }}>
                          {t.books?.[0]?.transactionType ?? '—'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(t.issuedAt).toLocaleDateString()}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(t.dueDate).toLocaleDateString()}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{t.returnedAt ? new Date(t.returnedAt).toLocaleDateString() : '—'}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: t.fineAmount > 0 ? '#f87171' : 'var(--text-secondary)' }}>
                        {t.fineAmount > 0 ? `₹${t.fineAmount}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
