import { css } from '@decantr/css';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button, Card, Input } from '@/components';

function Hero() {
  return (
    <section className={css('_flex _col _aic _textc _py16 _px4') + ' carbon-fade-slide'}>
      <h1 className={css('_heading1')} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
        Get in touch
      </h1>
      <p className={css('_textlg _fgmuted _mt4')} style={{ maxWidth: 480 }}>
        Have a question, feedback, or enterprise inquiry? We'd love to hear from you.
      </p>
    </section>
  );
}

function ContactForm() {
  return (
    <section className="section-gap-sm">
      <div className={css('_grid _gc1 _lg:gc2 _gap8') + ' container'} style={{ maxWidth: 1000 }}>
        {/* Form */}
        <Card>
          <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
            <div className={css('_grid _gc1 _sm:gc2 _gap4')}>
              <Input label="First name" placeholder="Jane" />
              <Input label="Last name" placeholder="Doe" />
            </div>
            <Input label="Email" type="email" placeholder="jane@example.com" />
            <Input label="Subject" placeholder="How can we help?" />
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontsemi _fgtext')}>Message</label>
              <textarea
                className="carbon-textarea"
                placeholder="Tell us more about your inquiry..."
                rows={5}
              />
            </div>
            <Button variant="primary" type="submit" className={css('_wfull')}>
              Send message
            </Button>
          </form>
        </Card>

        {/* Contact info */}
        <div className={css('_flex _col _gap6')}>
          <div>
            <h3 className={css('_fontsemi _textlg _mb4')}>Contact information</h3>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>
              Fill out the form and our team will get back to you within 24 hours.
            </p>
          </div>
          <div className={css('_flex _col _gap4')}>
            {[
              { icon: Mail, label: 'hello@carbonai.dev' },
              { icon: Phone, label: '+1 (555) 000-0000' },
              { icon: MapPin, label: 'San Francisco, CA' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={css('_flex _aic _gap3')}>
                  <div
                    className={css('_flex _aic _jcc _rounded _shrink0')}
                    style={{
                      width: 36,
                      height: 36,
                      background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <span className={css('_textsm _fgmuted')}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactPage() {
  return (
    <>
      <Hero />
      <ContactForm />
    </>
  );
}
