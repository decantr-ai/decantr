import { css } from '@decantr/css';
import { Mail, Clock, ExternalLink } from 'lucide-react';
import { Button, Card, Input } from '@/components';

/* ---------- hero ---------- */
function Hero() {
  return (
    <section className={css('_flex _col _aic _textc _py6 _px4') + ' carbon-fade-slide'}>
      <h1 className={css('_heading1')}>Get in touch</h1>
      <p className={css('_textlg _fgmuted _mt2')} style={{ maxWidth: 480 }}>
        Have questions about AgentHub? We'd love to hear from you.
      </p>
    </section>
  );
}

/* ---------- form ---------- */
function ContactForm() {
  return (
    <section className="section-gap">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className={css('_grid _gc1 _lg:gc3 _gap6')}>
          {/* form column — spans 2 */}
          <div style={{ gridColumn: 'span 2' }}>
            <Card>
              <form
                className={css('_flex _col _gap4')}
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className={css('_grid _gc1 _sm:gc2 _gap4')}>
                  <Input label="Name" placeholder="Your name" required />
                  <Input label="Email" type="email" placeholder="you@company.com" required />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label htmlFor="subject" className={css('_textsm _fontsemi _fgtext')}>Subject</label>
                  <select
                    id="subject"
                    className="carbon-input"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>Select a subject</option>
                    <option value="general">General inquiry</option>
                    <option value="sales">Sales</option>
                    <option value="support">Technical support</option>
                    <option value="enterprise">Enterprise plans</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label htmlFor="message" className={css('_textsm _fontsemi _fgtext')}>Message</label>
                  <textarea
                    id="message"
                    className="carbon-input"
                    rows={6}
                    placeholder="Tell us how we can help..."
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div>
                  <Button variant="primary" type="submit">
                    Send message
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* sidebar */}
          <div className={css('_flex _col _gap4')}>
            <Card>
              <div className={css('_flex _col _gap4')}>
                <div className={css('_flex _aic _gap3')}>
                  <div
                    className={css('_flex _aic _jcc _rounded _shrink0')}
                    style={{
                      width: 40,
                      height: 40,
                      background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
                    }}
                  >
                    <Mail size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <div>
                    <div className={css('_textsm _fontsemi')}>Email</div>
                    <a href="mailto:hello@agenthub.dev" className={css('_textsm _fgmuted')}>
                      hello@agenthub.dev
                    </a>
                  </div>
                </div>
                <div className="carbon-divider" />
                <div className={css('_flex _aic _gap3')}>
                  <div
                    className={css('_flex _aic _jcc _rounded _shrink0')}
                    style={{
                      width: 40,
                      height: 40,
                      background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
                    }}
                  >
                    <Clock size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <div>
                    <div className={css('_textsm _fontsemi')}>Response time</div>
                    <div className={css('_textsm _fgmuted')}>Within 24 hours</div>
                  </div>
                </div>
                <div className="carbon-divider" />
                <div className={css('_flex _aic _gap3')}>
                  <div
                    className={css('_flex _aic _jcc _rounded _shrink0')}
                    style={{
                      width: 40,
                      height: 40,
                      background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
                    }}
                  >
                    <ExternalLink size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <div>
                    <div className={css('_textsm _fontsemi')}>Links</div>
                    <div className={css('_flex _col _gap1 _mt1')}>
                      <a href="https://docs.agenthub.dev" className={css('_textsm _fgmuted')} target="_blank" rel="noopener noreferrer">Documentation</a>
                      <a href="https://status.agenthub.dev" className={css('_textsm _fgmuted')} target="_blank" rel="noopener noreferrer">System status</a>
                      <a href="https://github.com/agenthub" className={css('_textsm _fgmuted')} target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- page ---------- */
export function ContactPage() {
  return (
    <>
      <Hero />
      <ContactForm />
    </>
  );
}
