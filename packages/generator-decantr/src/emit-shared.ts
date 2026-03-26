import type { IRAppNode, GeneratedFile } from '@decantr/generator-core';

/** Emit the 404 page */
export function emitNotFound(): GeneratedFile {
  const code = `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { component } from 'decantr/core';
import { link } from 'decantr/router';
import { Button, icon } from 'decantr/components';

export default component('NotFound', () => {
  const { div, h1, p } = tags;

  return div({ class: css('_flex _col _aic _jcc _gap4 _hfull _p6') },
    div({ class: css('_fgmuted') }, icon('alert-circle', { size: 48 })),
    h1({ class: css('_heading2') }, 'Page Not Found'),
    p({ class: css('_body _fgmuted _tc') }, 'The page you\\'re looking for doesn\\'t exist or has been moved.'),
    link('/', {},
      Button({ variant: 'primary' }, icon('arrow-left'), 'Back to Home')
    )
  );
});
`;

  return { path: 'src/pages/not-found.js', content: code };
}

/** Emit public/index.html with theme CSS variables */
export function emitIndexHtml(app: IRAppNode): GeneratedFile {
  const { style, mode } = app.theme;

  const html = `<!DOCTYPE html>
<html lang="en" data-theme="${mode}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${app.shell.config.brand}</title>
  <script type="module" src="/src/app.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`;

  return { path: 'public/index.html', content: html };
}
