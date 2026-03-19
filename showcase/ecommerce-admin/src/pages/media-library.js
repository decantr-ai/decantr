import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Breadcrumb, Button, Card, Dropdown, icon } from 'decantr/components';
import { mediaFiles } from '../data/mock.js';

const { div, span, h2 } = tags;

function FileCard(file) {
  const ic = file.type === 'folder' ? 'folder' : file.type === 'image' ? 'image' : 'file-text';
  const meta = file.type === 'folder' ? `${file.items} items` : file.size;

  return Card({ class: css('d-glass _cursor[pointer]'), hover: true },
    Card.Body({ class: css('_flex _col _aic _gap3 _p5') },
      div({ class: css('_w12 _h12 _flex _center _r3 _bgprimary/10') },
        icon(ic, { size: '1.5em', class: css('_fgprimary') })
      ),
      div({ class: css('_flex _col _aic _gap1 _tc') },
        span({ class: css('_textsm _medium _truncate _wfull') }, file.name),
        span({ class: css('_textxs _fgmuted') }, meta)
      ),
      span({ class: css('_textxs _fgmuted') }, file.modified)
    )
  );
}

function FileRow(file) {
  const ic = file.type === 'folder' ? 'folder' : file.type === 'image' ? 'image' : 'file-text';
  const meta = file.type === 'folder' ? `${file.items} items` : file.size;

  return Card({ class: css('d-glass'), hover: true },
    Card.Body({ class: css('_flex _aic _gap3 _py2 _px4 _cursor[pointer]') },
      icon(ic, { size: '1em', class: css('_fgprimary') }),
      span({ class: css('_textsm _medium _flex1') }, file.name),
      span({ class: css('_textxs _fgmuted _w[100px]') }, meta),
      span({ class: css('_textxs _fgmuted _w[100px]') }, file.modified)
    )
  );
}

export default function MediaLibraryPage() {
  const [view, setView] = createSignal('grid');
  onMount(() => { document.title = 'Media Library — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5') }, 'Media Library'),
      Breadcrumb({ items: [{ label: 'Media Library' }, { label: 'All Files' }], separator: 'slash' })
    ),

    Card({ class: css('d-glass') },
      Card.Body({ class: css('_flex _aic _jcsb _gap3') },
        div({ class: css('_flex _aic _gap2') },
          Button({ variant: view() === 'grid' ? 'primary' : 'outline', size: 'sm', onclick: () => setView('grid') },
            icon('grid-3x3', { size: '1em' })
          ),
          Button({ variant: view() === 'list' ? 'primary' : 'outline', size: 'sm', onclick: () => setView('list') },
            icon('list', { size: '1em' })
          )
        ),
        div({ class: css('_flex _aic _gap2') },
          Dropdown({
            trigger: () => Button({ variant: 'outline', size: 'sm' }, icon('arrow-up-down', { size: '1em' }), ' Sort'),
            items: [
              { label: 'Name' }, { label: 'Date Modified' }, { label: 'Size' }
            ]
          }),
          Button({ variant: 'primary', size: 'sm' }, icon('upload', { size: '1em' }), ' Upload')
        )
      )
    ),

    () => view() === 'grid'
      ? div({ class: css('_grid _gc2 _sm:gc3 _lg:gc4 _gap4 d-stagger') },
          ...mediaFiles.map(f => FileCard(f))
        )
      : div({ class: css('_flex _col _gap2 d-stagger') },
          ...mediaFiles.map(f => FileRow(f))
        )
  );
}
