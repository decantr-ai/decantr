import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { Card } from 'decantr/components';

const { div, h1, a } = tags;

const articles = [
  { slug: 'getting-started', title: 'Getting Started with Web Development', excerpt: 'Learn the basics of modern web development and set up your first project.', date: '2024-03-15', category: 'Tutorial' },
  { slug: 'best-practices', title: 'Best Practices for Clean Code', excerpt: 'Writing maintainable and readable code that your team will thank you for.', date: '2024-03-10', category: 'Best Practices' },
  { slug: 'performance-tips', title: 'Performance Optimization Tips', excerpt: 'Speed up your web applications with these proven optimization techniques.', date: '2024-03-05', category: 'Performance' },
  { slug: 'accessibility-guide', title: 'Web Accessibility Guide', excerpt: 'Make your websites accessible to everyone with these essential guidelines.', date: '2024-02-28', category: 'Accessibility' },
  { slug: 'responsive-design', title: 'Mastering Responsive Design', excerpt: 'Create layouts that work beautifully on any device and screen size.', date: '2024-02-20', category: 'Design' },
  { slug: 'state-management', title: 'State Management Patterns', excerpt: 'Explore different approaches to managing state in modern applications.', date: '2024-02-15', category: 'Architecture' },
];

export function ArticlesPage() {
  return div({ class: '_py12 _px6 _maxw[1100px] _mx[auto]' },
    h1({ class: '_fs3xl _fwbold _mb8' }, 'All Articles'),
    div({ class: '_grid _gc2 _sm:gc1 _gap6' },
      articles.map(article =>
        a({ ...link(`/articles/${article.slug}`) },
          Card({
            class: '_hover:shadow _trans[box-shadow_0.2s]',
            children: Card.Body({},
              div({ class: '_flex _justifybetween _itemscenter _mb2' },
                div({ class: '_fssm _fgprimary' }, article.category),
                div({ class: '_fssm _fgmuted' }, article.date),
              ),
              div({ class: '_fwbold _fslg _mb2 _fgtext' }, article.title),
              div({ class: '_fgmuted' }, article.excerpt),
            ),
          })
        )
      )
    )
  );
}
