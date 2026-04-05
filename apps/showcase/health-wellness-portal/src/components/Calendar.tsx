import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  eventDays?: number[];
  selectedDay?: number;
  onSelect?: (day: number) => void;
  monthLabel?: string;
}

export function Calendar({ eventDays = [], selectedDay, onSelect, monthLabel = 'April 2026' }: CalendarProps) {
  const [selected, setSelected] = useState<number | undefined>(selectedDay);
  const today = 5;
  const daysInMonth = 30;
  const firstDayOffset = 3; // April 2026 starts on Wednesday (0=Sun)
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const cells: Array<{ day?: number; muted?: boolean }> = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push({ muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ muted: true });

  function handleSelect(day: number) {
    setSelected(day);
    onSelect?.(day);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{monthLabel}</div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem', border: 'none' }} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem', border: 'none' }} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: '0.375rem' }}>
        {dayNames.map((n, i) => (
          <div key={i} className="d-label" style={{ textAlign: 'center', padding: '0.375rem 0' }}>{n}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, i) => (
          <div
            key={i}
            className="hw-calendar-day"
            data-muted={cell.muted ? 'true' : undefined}
            data-today={cell.day === today ? 'true' : undefined}
            data-selected={cell.day !== undefined && cell.day === selected ? 'true' : undefined}
            data-has-event={cell.day !== undefined && eventDays.includes(cell.day) ? 'true' : undefined}
            onClick={cell.day !== undefined && !cell.muted ? () => handleSelect(cell.day!) : undefined}
            role={cell.day !== undefined ? 'button' : undefined}
            tabIndex={cell.day !== undefined && !cell.muted ? 0 : undefined}
            aria-label={cell.day !== undefined ? `April ${cell.day}${eventDays.includes(cell.day) ? ', has appointment' : ''}` : undefined}
            onKeyDown={cell.day !== undefined && !cell.muted ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(cell.day!); }
            } : undefined}
          >
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  );
}
