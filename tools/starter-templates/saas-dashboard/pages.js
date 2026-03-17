/**
 * Starter template pages: SaaS Dashboard
 */
export function pageFiles() {
  return [
    ['src/pages/overview.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h2, p } = tags;

export default function OverviewPage() {
  return div({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
    h2({ class: css('_heading3') }, 'Dashboard Overview'),
    p({ class: css('_fgmuted _body') }, 'KPI grid and data table go here. Run decantr generate to scaffold from your essence.')
  );
}
`],
    ['src/pages/settings.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h2, p } = tags;

export default function SettingsPage() {
  return div({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
    h2({ class: css('_heading3') }, 'Settings'),
    p({ class: css('_fgmuted _body') }, 'Settings form goes here. Run decantr generate to scaffold from your essence.')
  );
}
`]
  ];
}
