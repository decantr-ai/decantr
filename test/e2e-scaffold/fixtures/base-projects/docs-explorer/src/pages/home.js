import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { Button, Card } from 'decantr/components';

const { div, h1, h2, p, a, code } = tags;

export function HomePage() {
  return div({ class: '_p8 _maxw[800px]' },
    h1({ class: '_fs3xl _fwbold _mb4' }, 'Welcome to the Docs'),

    p({ class: '_fslg _fgmuted _mb8 _lh[1.6]' },
      'This documentation will help you get started with our library. Learn how to build modern web applications with ease.'
    ),

    // Quick links
    div({ class: '_grid _gc3 _gap4 _mb12' },
      Card({
        children: Card.Body({ class: '_textcenter' },
          h2({ class: '_fwbold _mb2' }, 'Quick Start'),
          p({ class: '_fgmuted _fssm _mb4' }, 'Get up and running in 5 minutes'),
          a({ ...link('/docs/quick-start') },
            Button({ variant: 'primary', size: 'sm' }, 'Start')
          ),
        ),
      }),
      Card({
        children: Card.Body({ class: '_textcenter' },
          h2({ class: '_fwbold _mb2' }, 'Guides'),
          p({ class: '_fgmuted _fssm _mb4' }, 'Learn the fundamentals'),
          a({ ...link('/docs/routing') },
            Button({ variant: 'outline', size: 'sm' }, 'Read')
          ),
        ),
      }),
      Card({
        children: Card.Body({ class: '_textcenter' },
          h2({ class: '_fwbold _mb2' }, 'API'),
          p({ class: '_fgmuted _fssm _mb4' }, 'Detailed API reference'),
          a({ ...link('/api/core') },
            Button({ variant: 'outline', size: 'sm' }, 'Explore')
          ),
        ),
      }),
    ),

    // Installation
    h2({ class: '_fs2xl _fwbold _mb4' }, 'Installation'),
    Card({
      class: '_mb8',
      children: Card.Body({},
        code({ class: '_block _bgsurface _p4 _rounded _fsmono' }, 'npm install my-library'),
      ),
    }),

    p({ class: '_fgmuted _lh[1.6]' },
      'Once installed, you can import and use any of the available components and utilities in your project.'
    ),
  );
}
