import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      activeUser: null,
      scannedBooks: [],
      offlineQueue: [],
      
      setUser: (userId) => set({ activeUser: userId }),
      
      addBook: (book) => set((state) => {
        // Prevent duplicates based on bookID or rfidTagID
        const exists = state.scannedBooks.some(b => b.rfidTagID === book.rfidTagID || b.bookID === book.bookID);
        if (exists) return state;
        return { scannedBooks: [...state.scannedBooks, { ...book, transactionType: 'Issue' }] };
      }),
      
      removeBook: (rfidTagID) => set((state) => ({
        scannedBooks: state.scannedBooks.filter(b => b.rfidTagID !== rfidTagID)
      })),

      toggleTransactionType: (rfidTagID) => set((state) => ({
        scannedBooks: state.scannedBooks.map(b => 
          b.rfidTagID === rfidTagID 
            ? { ...b, transactionType: b.transactionType === 'Issue' ? 'Return' : 'Issue' }
            : b
        )
      })),
      
      clearSession: () => set({ activeUser: null, scannedBooks: [] }),
      
      addToQueue: (transaction) => set((state) => ({
        offlineQueue: [...state.offlineQueue, transaction]
      })),
      
      clearQueue: () => set({ offlineQueue: [] }),
      removeQueuedItem: (id) => set((state) => ({ 
        offlineQueue: state.offlineQueue.filter(q => q.id !== id) 
      }))
    }),
    {
      name: 'smart-library-storage',
      // We only persist the offline queue
      partialize: (state) => ({ offlineQueue: state.offlineQueue }),
    }
  )
);
