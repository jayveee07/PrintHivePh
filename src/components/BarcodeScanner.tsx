import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    // Create scanner instance
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScanRef.current(decodedText);
        // We don't stop immediately if the user wants to scan multiple items
      },
      () => {
        // Silencing common errors like "No QR code found"
      }
    );

    scannerRef.current = scanner;

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
      <div className="relative w-full max-w-md bg-[#0B0F19] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Scan Barcode</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div id="reader" className="rounded-2xl overflow-hidden border border-white/10 bg-black/20"></div>
        
        <p className="mt-4 text-center text-xs text-gray-500 font-medium">
          Center the barcode within the box to scan automatically.
        </p>
      </div>
    </div>
  );
}
