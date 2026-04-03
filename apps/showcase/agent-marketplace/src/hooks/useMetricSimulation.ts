import { useState, useEffect } from 'react';
import type { MetricSnapshot } from '../data/types';

export function useMetricSimulation(initialMetrics: MetricSnapshot[]) {
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(m => {
          const drift = (Math.random() - 0.5) * m.value * 0.05; // ±2.5%
          const newValue = Math.max(0, m.value + drift);
          const rounded = m.unit === '%'
            ? Math.round(newValue * 100) / 100
            : Math.round(newValue);
          return {
            ...m,
            value: rounded,
            trend: Math.round((Math.random() - 0.45) * 20 * 10) / 10,
            history: [...m.history.slice(1), rounded],
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { metrics };
}
