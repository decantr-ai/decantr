import { useEffect, useRef } from 'react';
import { css } from '@decantr/css';
import { Quote } from 'lucide-react';
import type { Testimonial } from '../../data/types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cards = el.querySelectorAll('[data-testimonial-card]');
            cards.forEach((card, i) => {
              const htmlCard = card as HTMLElement;
              htmlCard.style.animationDelay = `${i * 100}ms`;
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
    <div id="testimonials">
      <section
        className={css('_flex _col _aic _px6') + ' d-section'}
        role="region"
        aria-label={`Testimonials, ${testimonials.length} quotes`}
      >
        <p className="section-overline">TESTIMONIALS</p>

        <h2 className={css('_heading2 _textc _mb8')}>
          Trusted by Engineering Teams
        </h2>

        <div
          ref={sectionRef}
          className="testimonial-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            width: '100%',
            maxWidth: 1200,
          }}
        >
          {testimonials.map((t) => (
            <div
              key={t.author}
              data-testimonial-card=""
              className={css('_flex _col _gap4 _p6') + ' d-surface carbon-card'}
              style={{ opacity: 0 }}
            >
              {/* Quote icon */}
              <Quote
                size={28}
                style={{ color: 'var(--d-accent)', opacity: 0.6, flexShrink: 0 }}
              />

              {/* Quote text */}
              <p
                className={css('_italic _fgmuted')}
                style={{ lineHeight: 1.7, fontSize: '0.95rem', flex: 1 }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author row */}
              <div className={css('_flex _row _aic _gap3 _mt4')}>
                {/* Avatar circle with initials */}
                <div
                  className={css('_flex _aic _jcc _shrink0 _fontsemi _textsm')}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background:
                      'color-mix(in srgb, var(--d-primary) 20%, transparent)',
                    color: 'var(--d-primary)',
                  }}
                >
                  {t.avatar}
                </div>
                <div className={css('_flex _col')}>
                  <span className={css('_textsm _fontmedium')}>{t.author}</span>
                  <span className={css('_textxs _fgmuted')}>
                    {t.role}, {t.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
