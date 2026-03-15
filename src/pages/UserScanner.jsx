import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store';

export default function UserScanner() {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // Clear any previous session when returning here
    useStore.getState().clearSession();
  }, []);

  const startScan = async () => {
    if (!('NDEFReader' in window)) {
      toast.error('Web NFC is not supported on this device/browser. Please use Chrome on Android.');
      return;
    }

    try {
      setScanning(true);
      const ndef = new window.NDEFReader();
      await ndef.scan();
      
      toast.success('Ready to scan! Tap a User ID card.');

      ndef.onreading = (event) => {
        const serialNumber = event.serialNumber;
        
        // Mocking user fetch based on serial number. 
        // In a real app, you might decode the NDEF message or lookup on the fly.
        toast.success('User identified!');
        setUser(serialNumber || 'mock-user-123'); // Store the tag's serial number or decoded ID
        
        // Vibrate to give physical feedback
        if (navigator.vibrate) navigator.vibrate(200);

        // Transition to next step
        setScanning(false);
        navigate('/scan-books');
      };
      
      ndef.onreadingerror = () => {
        toast.error('Failed to read NFC tag. Please try again.');
        setScanning(false);
      };
      
    } catch (error) {
      toast.error(`Error starting NFC: ${error.message}`);
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-2">Identify User</h1>
        <p className="text-secondary text-sm">Tap the user's NFC ID card to start a new session buffer.</p>
      </div>

      <div className="scanner-circle" style={{ animationPlayState: scanning ? 'running' : 'paused' }}>
        <ScanFace />
      </div>

      <div className="scanner-status mb-6">
        {scanning ? 'Listening for NFC...' : 'Ready to scan'}
      </div>

      <button 
        className="btn btn-primary" 
        onClick={startScan}
        disabled={scanning}
      >
        Start Scan
      </button>
    </div>
  );
}
