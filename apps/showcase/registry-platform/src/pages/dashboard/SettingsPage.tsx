import { css } from '@decantr/css';
import { AccountSettings } from '@/components/AccountSettings';

export function SettingsPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <h3 className={css('_textlg _fontsemi')}>Settings</h3>

      <section className="d-section" data-density="compact">
        <AccountSettings />
      </section>
    </div>
  );
}
