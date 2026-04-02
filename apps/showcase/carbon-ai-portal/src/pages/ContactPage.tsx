import { css } from '@decantr/css';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { Send, Mail, MapPin, Clock } from 'lucide-react';

export function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className={css('_flex _col _aic _textc _px4 _py20')} style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className={css('_flex _col _aic _gap4')} style={{ maxWidth: '560px' }}>
          <h1 className={css('_heading1 _fgtext')} style={{ fontSize: '2.75rem', lineHeight: 1.15 }}>
            Get in touch
          </h1>
          <p className={css('_textlg _fgmuted')} style={{ lineHeight: 1.7 }}>
            Have a question, partnership inquiry, or feedback? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact form + info */}
      <section className={css('_px4 _pb20')} style={{ paddingBottom: '5rem' }}>
        <div
          className={css('_grid _gc1 _md:gc2 _gap8')}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          {/* Form */}
          <form
            className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}
            onSubmit={(e) => e.preventDefault()}
          >
            <h2 className={css('_fontsemi _textlg _fgtext')}>Send a message</h2>
            <div className={css('_grid _gc1 _md:gc2 _gap4')}>
              <InputField label="First name" placeholder="Jane" />
              <InputField label="Last name" placeholder="Doe" />
            </div>
            <InputField label="Email" type="email" placeholder="jane@example.com" />
            <div className={css('_flex _col _gap1')}>
              <label htmlFor="message" className={css('_textsm _fontsemi _fgtext')}>
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell us what you need..."
                className={css('_textbase _rounded _trans') + ' carbon-input'}
                style={{ resize: 'vertical' }}
              />
            </div>
            <Button variant="primary" icon={<Send size={16} />} type="submit">
              Send message
            </Button>
          </form>

          {/* Info cards */}
          <div className={css('_flex _col _gap4')}>
            <div className={css('_flex _gap4 _p5 _rounded') + ' carbon-card'}>
              <Mail size={20} style={{ color: 'var(--d-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div className={css('_flex _col _gap1')}>
                <span className={css('_fontsemi _textsm _fgtext')}>Email</span>
                <span className={css('_textsm _fgmuted')}>hello@carbonai.dev</span>
              </div>
            </div>
            <div className={css('_flex _gap4 _p5 _rounded') + ' carbon-card'}>
              <MapPin size={20} style={{ color: 'var(--d-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div className={css('_flex _col _gap1')}>
                <span className={css('_fontsemi _textsm _fgtext')}>Office</span>
                <span className={css('_textsm _fgmuted')}>San Francisco, CA</span>
              </div>
            </div>
            <div className={css('_flex _gap4 _p5 _rounded') + ' carbon-card'}>
              <Clock size={20} style={{ color: 'var(--d-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div className={css('_flex _col _gap1')}>
                <span className={css('_fontsemi _textsm _fgtext')}>Response time</span>
                <span className={css('_textsm _fgmuted')}>
                  We typically respond within 24 hours on business days.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
