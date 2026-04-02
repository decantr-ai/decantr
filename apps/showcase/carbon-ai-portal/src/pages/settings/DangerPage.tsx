import { css } from '@decantr/css';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { ChatPortalShell } from '@/layouts/ChatPortalShell';
import { Card, Button, Input } from '@/components';

export function DangerPage() {
  return (
    <ChatPortalShell mode="settings">
      <div className={css('_flex1 _overyauto _p6')}>
        <div className={css('_flex _col _gap6')} style={{ maxWidth: '680px' }}>
          <div className={css('_flex _col _gap1')}>
            <h2 className={css('_text2xl _fontsemi _fgtext')}>Danger Zone</h2>
            <p className={css('_textsm _fgmuted')}>Irreversible actions for your account. Proceed with caution.</p>
          </div>

          {/* Export data */}
          <Card>
            <div className={css('_flex _aic _jcsb')}>
              <div className={css('_flex _col _gap1')}>
                <h3 className={css('_textlg _fontsemi _fgtext')}>Export data</h3>
                <p className={css('_textsm _fgmuted')}>
                  Download a copy of all your conversations and account data.
                </p>
              </div>
              <Button variant="outline">
                <Download size={16} />
                Export
              </Button>
            </div>
          </Card>

          {/* Delete all conversations */}
          <Card>
            <div className={css('_flex _col _gap4')} style={{ border: '1px solid var(--d-error)', borderRadius: 'var(--d-radius)', padding: 'var(--d-gap-4)', margin: 'calc(-1 * var(--d-gap-4))' }}>
              <div className={css('_flex _aic _gap3')}>
                <AlertTriangle size={20} className={css('_fgerror')} />
                <div className={css('_flex _col _gap1')}>
                  <h3 className={css('_textlg _fontsemi _fgtext')}>Delete all conversations</h3>
                  <p className={css('_textsm _fgmuted')}>
                    Permanently delete all your chat history. This cannot be undone.
                  </p>
                </div>
              </div>
              <Button variant="danger">
                <Trash2 size={16} />
                Delete all conversations
              </Button>
            </div>
          </Card>

          {/* Delete account */}
          <Card>
            <div className={css('_flex _col _gap4')} style={{ border: '1px solid var(--d-error)', borderRadius: 'var(--d-radius)', padding: 'var(--d-gap-4)', margin: 'calc(-1 * var(--d-gap-4))' }}>
              <div className={css('_flex _aic _gap3')}>
                <AlertTriangle size={20} className={css('_fgerror')} />
                <div className={css('_flex _col _gap1')}>
                  <h3 className={css('_textlg _fontsemi _fgtext')}>Delete account</h3>
                  <p className={css('_textsm _fgmuted')}>
                    Permanently delete your account and all associated data. This action is irreversible.
                  </p>
                </div>
              </div>
              <div className={css('_flex _col _gap3')}>
                <Input
                  label="Type your email to confirm"
                  placeholder="you@example.com"
                  type="email"
                />
                <Button variant="danger">
                  <Trash2 size={16} />
                  Delete my account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ChatPortalShell>
  );
}
