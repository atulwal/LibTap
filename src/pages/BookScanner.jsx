import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, ArrowRight, Trash2, Library } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store';

export default function BookScanner() {
  const navigate = useNavigate();
  const { activeUser, scannedBooks, addBook, removeBook, toggleTransactionType } = useStore();
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // Redirect if no user session
    if (!activeUser) {
      navigate('/scan-user');
    }
    
    // Auto-start NFC scanning when entering this route
    startScanning();
    
    return () => {
      // Clean up scanning if we have a way to stop it natively, 
      // but NDEFReader doesn't have an explicit stop besides abort controller
    };
  }, [activeUser, navigate]);

  const startScanning = async () => {
    if (!('NDEFReader' in window)) return;

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setScanning(true);

      ndef.onreading = (event) => {
        const serialNumber = event.serialNumber;
        const decoder = new TextDecoder();
        let payloadString = '';

        for (const record of event.message.records) {
          if (record.recordType === "text" || record.recordType === "json") {
             payloadString += decoder.decode(record.data);
          }
        }

        // Vibrate to give physical feedback
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        toast.success(`Scanned: ${serialNumber || 'Book'}`);
        
        // Attempt to parse standard book data, otherwise just mock it.
        let bookData = {};
        try {
          bookData = payloadString ? JSON.parse(payloadString) : {};
        } catch(e) { /* ignore parse error */ }

        addBook({
          rfidTagID: serialNumber || `mock-rfid-${Date.now()}`,
          bookID: bookData.bookID || `B-${Math.floor(Math.random() * 1000)}`,
          title: bookData.title || `Scanned Book ${scannedBooks.length + 1}`,
          author: bookData.author || "Unknown Author",
          ISBN: bookData.ISBN || `978-${Math.floor(Math.random() * 1000000)}`
        });
      };
      
      ndef.onreadingerror = () => {
        toast.error('Scan failed. Try again.');
      };
      
    } catch (error) {
      console.error(error);
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Active Buffer</h1>
        <p className="text-secondary text-sm flex justify-between items-center">
          <span>User: <span className="font-bold text-white max-w-[120px] overflow-hidden truncate inline-block align-bottom">{activeUser}</span></span>
          <span className={`text-xs px-2 py-1 rounded-full ${scanning ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/20 text-red-400'}`}>
            {scanning ? 'NFC Active' : 'NFC Inactive'}
          </span>
        </p>
      </div>

      <div className="glass-card flex-1 overflow-y-auto min-h-[50vh]">
        {scannedBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary opacity-50 pt-10 pb-10">
            <Library size={48} className="mb-4" />
            <p>Tap a book to add to buffer</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {scannedBooks.map((book) => (
              <div key={book.rfidTagID} className="glass-card-light flex items-center justify-between">
                <div className="flex flex-col flex-1 overflow-hidden pr-2">
                  <span className="font-bold truncate">{book.title}</span>
                  <span className="text-xs text-secondary truncate">{book.author} | {book.bookID}</span>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={() => toggleTransactionType(book.rfidTagID)}
                    className={`text-xs px-2 py-1 rounded-full font-bold transition-colors ${
                      book.transactionType === 'Issue' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}
                  >
                    {book.transactionType}
                  </button>
                  
                  <button onClick={() => removeBook(book.rfidTagID)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        className="btn btn-primary mt-4" 
        onClick={() => navigate('/verification')}
        disabled={scannedBooks.length === 0}
      >
        Proceed to Verification <ArrowRight size={18} />
      </button>
    </div>
  );
}
