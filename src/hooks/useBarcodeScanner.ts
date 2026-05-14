import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle USB/Keyboard barcode scanners
 * USB scanners usually transmit characters very quickly followed by 'Enter'
 */
export function useBarcodeScanner(onScan: (code: string) => void, enabled: boolean = true) {
  const buffer = useRef<string>('');
  const lastTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in a text area or another input, 
      // unless it's a very fast input (likely scanner)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      const now = Date.now();
      const diff = now - lastTime.current;
      lastTime.current = now;

      // Typical scanner speed is < 30ms between characters
      const isFast = diff < 50;

      if (e.key === 'Enter') {
        if (buffer.current.length >= 3) {
          onScan(buffer.current);
          buffer.current = '';
          // Only prevent default if we actually handled it as a scan
          // This avoids breaking normal Enter behavior in forms when not scanning
          if (isFast || !isInput) {
            e.preventDefault();
            e.stopPropagation();
          }
        } else {
          buffer.current = '';
        }
        return;
      }

      // Collect alphanumeric and common barcode special chars
      if (e.key.length === 1) {
        // If it's slow and we are in an input, don't buffer (user is typing)
        if (isInput && !isFast && buffer.current.length === 0) {
          return;
        }

        // If it's slow and we had a buffer, the user might be typing something else
        if (!isFast && buffer.current.length > 0) {
          buffer.current = '';
        }

        buffer.current += e.key;
      }

      // Reset buffer if too much time has passed since last char (timeout)
      // or if buffer is unusually long
      if (buffer.current.length > 50) {
        buffer.current = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase to intercept
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onScan, enabled]);
}
