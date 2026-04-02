import { css } from '@decantr/css';
import { Mail, MapPin, Clock } from 'lucide-react';
import { TopNavFooterShell } from '@/layouts/TopNavFooterShell';
import { Input, Button, Card } from '@/components';

/* -- Hero --------------------------------------------------------- */
function HeroSection() {
  return (
    <section className={css('_flex _col _aic _textc _py16 _px4')}>
      <div className={css('_flex _col _aic _gap4')} style={{ maxWidth: '600px' }}>
        <h1 className={css('_text3xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.15 }}>
          Get in touch
        </h1>
        <p className={css('_textlg _fgmuted')}>
          Have a question, partnership opportunity, or just want to say hello? We'd love to hear from you.
        </p>
      </div>
    </section>
  );
}

/* -- Contact form ------------------------------------------------- */
function ContactForm() {
  return (
    <section className={css('_px4 _pb16')}>
      <div className={css('_grid _gap8')} style={{ maxWidth: '1000px', margin: '0 auto', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card>
          <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
            <h2 className={css('_textlg _fontsemi _fgtext')}>Send a message</h2>
            <div className={css('_grid _gap4')} style={{ gridTemplateColumns: '1fr 1fr' }}>
              <Input label="First name" placeholder="John" />
              <Input label="Last name" placeholder="Doe" />
            </div>
            <Input label="Email" type="email" placeholder="you@example.com" />
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium _fgtext')}>Subject</label>
              <select
                className={css('_wfull _px3 _py2 _textbase _rounded _bgbg _fgtext _bw1 _pointer') + ' carbon-input'}
                defaultValue=""
              >
                <option value="" disabled>Select a topic</option>
                <option value="general">General inquiry</option>
                <option value="sales">Sales & pricing</option>
                <option value="support">Technical support</option>
                <option value="partnership">Partnership</option>
                <option value="press">Press & media</option>
              </select>
            </div>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium _fgtext')}>Message</label>
              <textarea
                className={css('_wfull _px3 _py2 _textbase _rounded _bgbg _fgtext _bw1') + ' carbon-input'}
                rows={5}
                placeholder="Tell us what you need..."
              />
            </div>
            <Button variant="primary" type="submit" className={css('_wfull')}>
              Send message
            </Button>
          </form>
        </Card>

        <div className={css('_flex _col _gap6')}>
          <div className={css('_flex _col _gap4')}>
            <h2 className={css('_textlg _fontsemi _fgtext')}>Other ways to reach us</h2>
            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _gap3')}>
                <Mail size={20} className={css('_fgprimary _shrink0 _mt1')} />
                <div className={css('_flex _col _gap1')}>
                  <span className={css('_fontmedium _fgtext')}>Email</span>
                  <span className={css('_textsm _fgmuted')}>hello@carbonai.dev</span>
                </div>
              </div>
              <div className={css('_flex _gap3')}>
                <MapPin size={20} className={css('_fgprimary _shrink0 _mt1')} />
                <div className={css('_flex _col _gap1')}>
                  <span className={css('_fontmedium _fgtext')}>Office</span>
                  <span className={css('_textsm _fgmuted')}>548 Market St, Suite 92<br />San Francisco, CA 94104</span>
                </div>
              </div>
              <div className={css('_flex _gap3')}>
                <Clock size={20} className={css('_fgprimary _shrink0 _mt1')} />
                <div className={css('_flex _col _gap1')}>
                  <span className={css('_fontmedium _fgtext')}>Business hours</span>
                  <span className={css('_textsm _fgmuted')}>Monday - Friday, 9am - 6pm PST</span>
                </div>
              </div>
            </div>
          </div>

          <Card className={css('_flex _col _gap3')}>
            <h3 className={css('_fontmedium _fgtext')}>Need enterprise support?</h3>
            <p className={css('_textsm _fgmuted')}>
              For team plans, custom deployments, and SLA inquiries, reach out to our sales team directly.
            </p>
            <a href="mailto:sales@carbonai.dev" className={css('_textsm _fgprimary _fontmedium')}>
              sales@carbonai.dev
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* -- Page --------------------------------------------------------- */
export function ContactPage() {
  return (
    <TopNavFooterShell>
      <HeroSection />
      <ContactForm />
    </TopNavFooterShell>
  );
}
