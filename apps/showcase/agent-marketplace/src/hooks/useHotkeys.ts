import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Implements keyboard navigation shortcuts from the essence.
 * Hotkeys: "g a" -> /agents, "g m" -> /marketplace, "g t" -> /transparency
 * Implemented as keyboard listeners per shell guidance — NOT rendered as visible UI text.
 */
export function useHotkeys() {
  const navigate = useNavigate();
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();

      if (pendingRef.current === 'g') {
        if (timerRef.current) clearTimeout(timerRef.current);
        pendingRef.current = null;

        if (key === 'a') {
          e.preventDefault();
          navigate('/agents');
        } else if (key === 'm') {
          e.preventDefault();
          navigate('/marketplace');
        } else if (key === 't') {
          e.preventDefault();
          navigate('/transparency');
        }
        return;
      }

      if (key === 'g') {
        pendingRef.current = 'g';
        timerRef.current = setTimeout(() => {
          pendingRef.current = null;
        }, 500);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate]);
}
