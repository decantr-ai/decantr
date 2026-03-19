import { tags } from 'decantr/tags';
import { Card } from 'decantr/components';

const { div, h1, p } = tags;

const projects = [
  { id: 1, title: 'Project Alpha', category: 'Web App', description: 'A modern web application built with cutting-edge technologies.' },
  { id: 2, title: 'Project Beta', category: 'Design System', description: 'Mobile-first design system with comprehensive documentation.' },
  { id: 3, title: 'Project Gamma', category: 'E-commerce', description: 'Full-featured e-commerce platform with payment integration.' },
  { id: 4, title: 'Project Delta', category: 'Dashboard', description: 'Analytics dashboard with real-time data visualization.' },
  { id: 5, title: 'Project Epsilon', category: 'Mobile App', description: 'Cross-platform mobile application for iOS and Android.' },
  { id: 6, title: 'Project Zeta', category: 'SaaS', description: 'Multi-tenant SaaS platform with subscription billing.' },
];

export function ProjectsPage() {
  return div({ class: '_py12 _px6 _maxw[1200px] _mx[auto]' },
    h1({ class: '_fs3xl _fwbold _mb4' }, 'Projects'),
    p({ class: '_fgmuted _mb12 _maxw[600px]' },
      'A selection of projects I have worked on, ranging from web applications to design systems.'
    ),
    div({ class: '_grid _gc3 _md:gc2 _sm:gc1 _gap6' },
      projects.map(project =>
        Card({
          class: '_cursor[pointer] _hover:bcsurface _trans[border-color_0.2s]',
          children: [
            div({ class: '_h[180px] _bgsurface _flex _itemscenter _justifycenter _fgmuted _roundedt' },
              'Image'
            ),
            Card.Body({},
              div({ class: '_fssm _fgprimary _mb2' }, project.category),
              div({ class: '_fwbold _mb2' }, project.title),
              p({ class: '_fgmuted _fssm' }, project.description),
            ),
          ],
        })
      )
    )
  );
}
