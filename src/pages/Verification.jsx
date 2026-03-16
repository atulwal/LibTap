import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store';

const API_BASE = 'http://localhost:4000';

export default function Verification() {
  const navigate = useNavigate();
  const { activeUser, scannedBooks, addToQueue, clearSession } = useStore();
  const [submitting, setSubmitting] = useState(false);

  if (!activeUser || scannedBooks.length === 0) {
    navigate('/');
    return null;
  }

  const handleApprove = async () => {
    setSubmitting(true);

    const payload = {
      id: crypto.randomUUID(),
      studentId: activeUser,
      books: scannedBooks.map(b => ({
        bookId: b.bookID || b.rfidTagID,
        rfidTagID: b.rfidTagID,
        title: b.title || 'Unknown Title',
        transactionType: b.transactionType,
      })),
      timestamp: new Date().toISOString(),
    };

    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Server error');
        toast.success(`Transaction saved! ${data.count} book(s) recorded.`);
      } catch (err) {
        toast.error(`Backend unavailable. Saved offline. (${err.message})`);
        addToQueue(payload);
      }
    } else {
      addToQueue(payload);
      toast.success('Saved locally — will sync when online.');
    }

    setSubmitting(false);
    clearSession();
    navigate('/scan-user');
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold mb-1">Verify Transaction</h1>
        <p className="text-secondary text-sm">Please physically verify the books against this list.</p>
      </div>

      <div className="glass-card mb-4">
        <h2 className="text-sm font-bold text-secondary mb-2 uppercase">Student / User ID</h2>
        <p className="font-mono bg-black/30 p-2 rounded border border-white/5 break-all" style={{ fontSize: '0.85rem' }}>{activeUser}</p>
      </div>

      <div className="glass-card flex-1 overflow-y-auto min-h-[30vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-secondary uppercase">Items ({scannedBooks.length})</h2>
        </div>
        <div className="flex flex-col gap-2">
          {scannedBooks.map((book, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <div>
                <p className="font-bold">{book.title}</p>
                <p className="text-xs text-secondary">{book.bookID || book.rfidTagID}</p>
              </div>
              <span style={{
                fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700,
                background: book.transactionType === 'Issue' ? 'rgba(99,102,241,0.15)' : 'rgba(251,146,60,0.15)',
                color: book.transactionType === 'Issue' ? '#818cf8' : '#fb923c',
              }}>
                {book.transactionType}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => navigate('/scan-books')} disabled={submitting}>
          Cancel
        </button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleApprove} disabled={submitting}>
          {submitting ? 'Saving...' : <><CheckCircle2 size={18} /> Approve &amp; Submit</>}
        </button>
      </div>
    </div>
  );
}
