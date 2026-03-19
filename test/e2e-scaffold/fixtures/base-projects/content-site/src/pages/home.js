import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { Card, Button } from 'decantr/components';

const { div, h1, h2, p, section, a } = tags;

const featuredArticles = [
  { slug: 'getting-started', title: 'Getting Started with Web Development', excerpt: 'Learn the basics of modern web development...', date: '2024-03-15' },
  { slug: 'best-practices', title: 'Best Practices for Clean Code', excerpt: 'Writing maintainable and readable code...', date: '2024-03-10' },
  { slug: 'performance-tips', title: 'Performance Optimization Tips', excerpt: 'Speed up your web applications...', date: '2024-03-05' },
];

export function HomePage() {
  return div({},
    // Hero
    section({ class: '_py20 _px6 _textcenter _bgsurface' },
      div({ class: '_maxw[700px] _mx[auto]' },
        h1({ class: '_fs4xl _fwbold _mb4 _fgtext' }, 'Welcome to Our Blog'),
        p({ class: '_fslg _fgmuted _mb8' },
          'Discover articles about web development, design, and technology.'
        ),
        a({ ...link('/articles') },
          Button({ variant: 'primary', size: 'lg' }, 'Browse Articles')
        ),
      ),
    ),

    // Featured articles
    section({ class: '_py16 _px6 _maxw[1100px] _mx[auto]' },
      h2({ class: '_fs2xl _fwbold _mb8' }, 'Latest Articles'),
      div({ class: '_grid _gc3 _md:gc2 _sm:gc1 _gap6' },
        featuredArticles.map(article =>
          a({ ...link(`/articles/${article.slug}`) },
            Card({
              class: '_hover:shadow _trans[box-shadow_0.2s]',
              children: [
                div({ class: '_h[160px] _bgsurface _roundedt' }),
                Card.Body({},
                  div({ class: '_fssm _fgmuted _mb2' }, article.date),
                  div({ class: '_fwbold _mb2 _fgtext' }, article.title),
                  p({ class: '_fgmuted _fssm' }, article.excerpt),
                ),
              ],
            })
          )
        )
      ),
    )
  );
}
