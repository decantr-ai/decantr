'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  command: string;
}

export function TerminalCard({ command }: Props) {
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayedText(command);
      setTypingDone(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let i = 0;
          const interval = setInterval(() => {
            i++;
            setDisplayedText(command.slice(0, i));
            if (i >= command.length) {
              clearInterval(interval);
              setTypingDone(true);
            }
          }, Math.max(30, 1500 / command.length));
        }
      },
      { threshold: 0.3 },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [command]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command]);

  return (
    <div
      ref={containerRef}
      className={`lum-bento-card col-span-2 p-0 overflow-hidden ${copied ? 'lum-terminal-ripple' : ''}`}
      role="region"
      aria-label="Install command"
    >
      <div className="lum-terminal">
        {/* Title bar */}
        <div className="lum-terminal-titlebar">
          <div className="lum-terminal-dots">
            <span
              className="terminal-dot rounded-full"
              data-color={copied ? 'green' : 'red'}
            />
            <span
              className="terminal-dot rounded-full"
              data-color={copied ? 'green' : 'yellow'}
            />
            <span
              className="terminal-dot rounded-full"
              data-color={copied ? 'green' : 'green'}
            />
          </div>
          <span className="flex-1 text-center text-xs font-mono text-d-muted">
            decantr
          </span>
          {typingDone && (
            <button
              className="d-interactive text-xs py-1 px-2.5"
              data-variant="ghost"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="lum-terminal-body" aria-live="polite">
          <span className="accent-type-text">$</span>{' '}
          <span aria-hidden="true">{displayedText}</span>
          {!typingDone && <span className="terminal-cursor">&#9608;</span>}
          <span className="sr-only">{command}</span>
        </div>
      </div>

      {/* What happens next */}
      <div className="px-5 pb-4 pt-2">
        <button
          className="d-interactive text-xs w-full justify-center"
          data-variant="ghost"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide steps' : 'What happens next?'}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {expanded && (
          <ol className="mt-3 flex flex-col gap-2 text-xs text-d-muted list-decimal list-inside">
            <li>Run the command in your project directory</li>
            <li>Read the generated DECANTR.md for the design spec</li>
            <li>Let your AI assistant build from the context files</li>
          </ol>
        )}
      </div>
    </div>
  );
}
