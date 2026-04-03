import { useEffect, useRef } from 'react';
import { css } from '@decantr/css';
import { Bot, Activity, Brain, Target, Shield, Store } from 'lucide-react';
import type { Feature } from '../../data/types';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Bot,
  Activity,
  Brain,
  Target,
  Shield,
  Store,
};

interface FeaturesProps {
  features: Feature[];
}

export function Features({ features }: FeaturesProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cards = el.querySelectorAll('[data-feature-card]');
            cards.forEach((card, i) => {
              const htmlCard = card as HTMLElement;
              htmlCard.style.animationDelay = `${i * 80}ms`;
              htmlCard.classList.add('stagger-fade-up');
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
    <div id="features">
      <section
        className={css('_flex _col _aic _px6') + ' d-section'}
        role="region"
        aria-label={`Feature section with ${features.length} items`}
      >
        {/* Overline */}
        <p className="section-overline">CAPABILITIES</p>

        {/* Heading */}
        <h2
          className={css('_heading2 _textc _mb8')}
        >
          Everything You Need to Manage AI Agents
        </h2>

        {/* Grid */}
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            width: '100%',
            maxWidth: 1200,
          }}
        >
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <div
                key={feature.title}
                data-feature-card=""
                className={css('_flex _col _gap3')}
                style={{ opacity: 0 }}
              >
                {/* Icon circle */}
                <div
                  className={css('_flex _aic _jcc _shrink0')}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background:
                      'color-mix(in srgb, var(--d-accent) 15%, transparent)',
                  }}
                >
                  {Icon && (
                    <Icon size={22} />
                  )}
                </div>

                <h4 className={css('_heading4 _fontmedium')}>
                  {feature.title}
                </h4>
                <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
