import { useEffect, useRef } from 'react';
import { css } from '@decantr/css';
import type { HowItWorksStep } from '../../data/types';

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const items = el.querySelectorAll('[data-step]');
            items.forEach((item, i) => {
              const htmlItem = item as HTMLElement;
              htmlItem.style.animationDelay = `${i * 120}ms`;
              htmlItem.classList.add('stagger-fade-up');
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={css('_flex _col _aic _px6') + ' d-section'}
      role="region"
      aria-label={`Process overview with ${steps.length} steps`}
    >
      <p className="section-overline">HOW IT WORKS</p>

      <h2 className={css('_heading2 _textc _mb8')}>
        From Deploy to Scale in Four Steps
      </h2>

      {/* Desktop: horizontal row */}
      <div
        ref={sectionRef}
        className="hiw-desktop"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
          gap: '2rem',
          width: '100%',
          maxWidth: 1000,
          position: 'relative',
        }}
      >
        {steps.map((step, i) => (
          <div
            key={step.number}
            data-step=""
            className={css('_flex _col _aic _textc _gap3 _rel')}
            style={{ opacity: 0 }}
            aria-label={`Step ${step.number} of ${steps.length}: ${step.title}`}
          >
            {/* Number circle */}
            <div
              className={css('_flex _aic _jcc _fontbold _shrink0 _rel _z10')}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--d-primary)',
                color: '#fff',
                fontSize: '1.125rem',
              }}
            >
              {step.number}
            </div>

            {/* Connector line (after circle, before next) */}
            {i < steps.length - 1 && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 24,
                  left: 'calc(50% + 28px)',
                  width: 'calc(100% - 56px + 2rem)',
                  height: 2,
                  background: 'var(--d-border)',
                  zIndex: 0,
                }}
              />
            )}

            <h4 className={css('_heading4 _fontmedium')}>{step.title}</h4>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: vertical timeline */}
      <div
        className="hiw-mobile"
        style={{
          display: 'none',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
          position: 'relative',
          paddingLeft: '3rem',
        }}
      >
        {/* Vertical line */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 23,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--d-border)',
          }}
        />

        {steps.map((step) => (
          <div
            key={step.number}
            className={css('_flex _col _gap2 _rel')}
          >
            <div
              className={css('_flex _aic _jcc _fontbold _shrink0 _abs')}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--d-primary)',
                color: '#fff',
                fontSize: '1.125rem',
                left: '-3rem',
                top: 0,
                transform: 'translateX(calc(-50% + 24px))',
              }}
            >
              {step.number}
            </div>
            <h4 className={css('_heading4 _fontmedium')}>{step.title}</h4>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 639px) {
          .hiw-desktop { display: none !important; }
          .hiw-mobile { display: flex !important; }
        }
      `}</style>
    </section>
  );
}
