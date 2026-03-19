import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { Button, Card } from 'decantr/components';

const { div, h1, p, section, a } = tags;

const featuredProjects = [
  { id: 1, title: 'Project Alpha', description: 'A modern web application', image: '/placeholder.jpg' },
  { id: 2, title: 'Project Beta', description: 'Mobile-first design system', image: '/placeholder.jpg' },
  { id: 3, title: 'Project Gamma', description: 'E-commerce platform', image: '/placeholder.jpg' },
];

export function HomePage() {
  return div({},
    // Hero section
    section({ class: '_minh[80vh] _flex _col _justifycenter _itemscenter _textcenter _px6' },
      h1({ class: '_fs5xl _fwbold _mb6' }, 'Creative Developer'),
      p({ class: '_fslg _fgmuted _maxw[600px] _mb8' },
        'I craft beautiful digital experiences with attention to detail and a passion for clean code.'
      ),
      div({ class: '_flex _gap4' },
        a({ ...link('/projects') },
          Button({ variant: 'primary', size: 'lg' }, 'View Projects')
        ),
        a({ ...link('/contact') },
          Button({ variant: 'outline', size: 'lg' }, 'Get in Touch')
        ),
      ),
    ),

    // Featured projects
    section({ class: '_py20 _px6 _maxw[1200px] _mx[auto]' },
      h1({ class: '_fs2xl _fwbold _mb8 _textcenter' }, 'Featured Work'),
      div({ class: '_grid _gc3 _md:gc2 _sm:gc1 _gap6' },
        featuredProjects.map(project =>
          Card({
            class: '_overflow[hidden] _hover:translate[0_-4px] _trans[transform_0.3s]',
            children: [
              div({ class: '_h[200px] _bgsurface _flex _itemscenter _justifycenter _fgmuted' },
                'Image'
              ),
              Card.Body({},
                div({ class: '_fwbold _mb2' }, project.title),
                p({ class: '_fgmuted _fssm' }, project.description),
              ),
            ],
          })
        )
      ),
    )
  );
}
