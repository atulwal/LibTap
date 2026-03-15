import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CloudLightning } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store';

export default function Verification() {
  const navigate = useNavigate();
  const { activeUser, scannedBooks, addToQueue, clearSession } = useStore();
  const [submitting, setSubmitting] = useState(false);

  // Return to start if session is invalid
  if (!activeUser || scannedBooks.length === 0) {
    navigate('/');
    return null;
  }

  const handleApprove = async () => {
    setSubmitting(true);
    
    // Construct the payload as per standard multi-book workflow
    const payload = {
      id: crypto.randomUUID(), // For local queue identification
      userID: activeUser,
      books: scannedBooks.map(b => ({
        rfidTagID: b.rfidTagID,
        bookID: b.bookID,
        transactionType: b.transactionType
      })),
      timestamp: new Date().toISOString()
    };

    if (navigator.onLine) {
      // Mock API call to Vigyan server format
      try {
        // In a real app, you would fetch `POST /api/transactions/batch` or similar.
        // For now, we simulate network delay:
        await new Promise((r) => setTimeout(r, 800));
        toast.success('Transaction synchronized with server!');
      } catch (err) {
        toast.error('Network failed. Saved offline.');
        addToQueue(payload);
      }
    } else {
      addToQueue(payload);
      toast.success('Saved locally for offline syncing.');
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
        <h2 className="text-sm font-bold text-secondary mb-2 uppercase">User ID</h2>
        <p className="font-mono bg-black/30 p-2 rounded border border-white/5 break-all">{activeUser}</p>
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
                <p className="text-xs text-secondary">{book.bookID}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-bold ${
                book.transactionType === 'Issue' ? 'text-blue-400 bg-blue-500/10' : 'text-orange-400 bg-orange-500/10'
              }`}>
                {book.transactionType}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 w-full mt-4">
        <button 
          className="btn btn-danger flex-1"
          onClick={() => navigate('/scan-books')}
          disabled={submitting}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary flex-[2]"
          onClick={handleApprove}
          disabled={submitting}
        >
          {submitting ? 'Approving...' : (
            <>Approve & Submit <CheckCircle2 size={18}/></>
          )}
        </button>
      </div>
    </div>
  );
}
