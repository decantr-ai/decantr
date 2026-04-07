'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BentoCard } from './bento-card';

interface TerminalCardProps {
  command: string;
}

export function TerminalCard({ command }: TerminalCardProps) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dotsGreen, setDotsGreen] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) {
      setDisplayedChars(command.length);
      setTypingDone(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let i = 0;
          const interval = setInterval(() => {
            i++;
            setDisplayedChars(i);
            if (i >= command.length) {
              clearInterval(interval);
              setTypingDone(true);
            }
          }, 30);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [command]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setDotsGreen(true);
      setRipple(true);

      setTimeout(() => setRipple(false), 600);
      setTimeout(() => setDotsGreen(false), 1500);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked */
    }
  }, [command]);

  const dotColors = dotsGreen
    ? ['#27C93F', '#27C93F', '#27C93F']
    : ['#FF5F57', '#FFBD2E', '#27C93F'];

  return (
    <BentoCard span={2} label="Install command">
      <div
        ref={containerRef}
        className={`lum-terminal ${ripple ? 'lum-terminal-ripple' : ''}`}
      >
        {/* Title bar */}
        <div className="lum-terminal-titlebar">
          <div className="lum-terminal-dots">
            {dotColors.map((color, i) => (
              <span
                key={i}
                className="terminal-dot inline-block rounded-full shrink-0"
                data-color={dotsGreen ? 'green' : ['red', 'yellow', 'green'][i]}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="flex-1 text-center text-xs font-mono text-d-muted">
            decantr
          </span>
          {typingDone && (
            <button
              className="d-interactive text-xs px-2 py-1"
              data-variant="ghost"
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy command'}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27C93F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <span className="text-d-success">Copied!</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Terminal body */}
        <div className="lum-terminal-body">
          <span className="text-d-green mr-1">$</span>
          {/* Full command for screen readers */}
          <span className="sr-only" aria-live="polite">{command}</span>
          {/* Animated typing */}
          <span aria-hidden="true">
            {command.slice(0, displayedChars)}
          </span>
          {!typingDone && (
            <span
              className="inline-block w-2 h-4 bg-white/80 align-middle ml-px animate-[lum-cursor-blink_1s_step-end_infinite]"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* What happens next? */}
      <div className="mt-3">
        <button
          className="d-interactive text-xs w-full justify-center"
          data-variant="ghost"
          onClick={() => setStepsOpen(!stepsOpen)}
          aria-expanded={stepsOpen}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${stepsOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>What happens next?</span>
        </button>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: stepsOpen ? '12rem' : 0 }}
        >
          <ol className="flex flex-col gap-2 pt-3 pl-1 text-xs text-d-muted list-none">
            <li className="flex items-start gap-2">
              <span className="d-annotation shrink-0 text-[0.625rem] tabular-nums">1</span>
              <span>Run the command in your project directory</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="d-annotation shrink-0 text-[0.625rem] tabular-nums">2</span>
              <span>Read the generated DECANTR.md for the design spec</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="d-annotation shrink-0 text-[0.625rem] tabular-nums">3</span>
              <span>Let your AI assistant build from the context files</span>
            </li>
          </ol>
        </div>
      </div>

    </BentoCard>
  );
}
