import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Hotkey {
  key: string;   // e.g. "g a"
  route?: string;
  action?: () => void;
  label: string;
}

export function useHotkeys(hotkeys: Hotkey[]) {
  const navigate = useNavigate();
  const bufferRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      bufferRef.current.push(e.key.toLowerCase());

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        bufferRef.current = [];
      }, 500);

      const sequence = bufferRef.current.join(' ');

      for (const hotkey of hotkeys) {
        if (sequence === hotkey.key) {
          e.preventDefault();
          bufferRef.current = [];
          if (hotkey.route) navigate(hotkey.route);
          if (hotkey.action) hotkey.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(timerRef.current);
    };
  }, [hotkeys, navigate]);
}
