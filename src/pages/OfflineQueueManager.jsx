import React, { useState } from 'react';
import { useStore } from '../store';
import { WifiOff, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineQueueManager() {
  const { offlineQueue, removeQueuedItem } = useStore();
  const [syncingId, setSyncingId] = useState(null);

  const handleSyncRow = async (item) => {
    if (!navigator.onLine) {
      toast.error('You are currently offline. Cannot sync.');
      return;
    }

    setSyncingId(item.id);
    try {
      // Mock API call
      await new Promise(r => setTimeout(r, 1000));
      removeQueuedItem(item.id);
      toast.success(`Successfully synced transaction for ${item.userID}`);
    } catch (err) {
      toast.error('Sync failed. Server might be down.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    if (offlineQueue.length === 0) return;
    if (!navigator.onLine) {
      toast.error('You are currently offline.');
      return;
    }

    let successCount = 0;
    for (const item of offlineQueue) {
      setSyncingId(item.id);
      try {
        await new Promise(r => setTimeout(r, 600)); // Simulate sequential sync
        removeQueuedItem(item.id);
        successCount++;
      } catch (e) {
        break; // Stop on first failure
      }
    }
    setSyncingId(null);
    if (successCount > 0) {
      toast.success(`Successfully synced ${successCount} transactions!`);
    } else {
      toast.error('Batch sync failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500 flex items-center gap-2">
            <WifiOff size={24} className="text-red-400" /> Offline Queue
          </h1>
          <p className="text-secondary mt-1">Manage transactions that were saved while the device had no connection.</p>
        </div>
        <button 
          onClick={handleSyncAll}
          disabled={offlineQueue.length === 0 || syncingId !== null}
          className="btn btn-primary !w-auto !py-2"
        >
          <RefreshCw size={18} className={syncingId ? "animate-spin" : ""} />
          Sync All Now
        </button>
      </div>

      <div className="glass-card border border-[#ffffff10] min-h-[50vh]">
        {offlineQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-secondary opacity-50">
            <CheckCircle size={48} className="mb-4 text-emerald-500" />
            <p className="font-bold">Queue is empty</p>
            <p className="text-sm">All transactions are synced with the server.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ffffff10] text-secondary text-sm">
                  <th className="pb-3 font-medium px-4">User ID</th>
                  <th className="pb-3 font-medium px-4">Books Scanned</th>
                  <th className="pb-3 font-medium px-4">Time Saved</th>
                  <th className="pb-3 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffffff05]">
                {offlineQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-4 font-mono text-sm">{item.userID}</td>
                    <td className="py-4 px-4">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold font-mono">
                        {item.books.length} items
                      </span>
                    </td>
                    <td className="py-4 px-4 text-secondary text-sm">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleSyncRow(item)}
                          disabled={syncingId !== null}
                          className="text-emerald-400 hover:bg-emerald-500/10 p-2 rounded transition-colors disabled:opacity-50"
                          title="Retry Sync"
                        >
                          <RefreshCw size={18} className={syncingId === item.id ? "animate-spin" : ""} />
                        </button>
                        <button 
                          onClick={() => removeQueuedItem(item.id)}
                          disabled={syncingId !== null}
                          className="text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors disabled:opacity-50"
                          title="Delete from Queue"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
