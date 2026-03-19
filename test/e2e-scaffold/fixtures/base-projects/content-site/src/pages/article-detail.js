import { tags } from 'decantr/tags';
import { useRoute } from 'decantr/router';

const { div, h1, p, article, time } = tags;

const articlesData = {
  'getting-started': {
    title: 'Getting Started with Web Development',
    date: '2024-03-15',
    content: `
      Web development is an exciting field that combines creativity with technical skills.
      In this article, we'll explore the fundamentals you need to know to start your journey.

      First, you'll need to understand HTML, the backbone of all web pages. HTML provides
      the structure and content of your web pages.

      Next comes CSS, which handles the visual presentation. With CSS, you can style your
      HTML elements, control layouts, and create responsive designs.

      Finally, JavaScript adds interactivity to your pages. It allows you to respond to
      user actions, manipulate the DOM, and communicate with servers.
    `,
  },
  'best-practices': {
    title: 'Best Practices for Clean Code',
    date: '2024-03-10',
    content: `
      Writing clean code is essential for maintaining large codebases and collaborating
      with other developers. Here are some key principles to follow.

      Use meaningful names for variables and functions. A name should describe what the
      variable holds or what the function does.

      Keep functions small and focused on a single task. This makes them easier to test,
      understand, and reuse.

      Write comments only when necessary. Good code should be self-documenting through
      clear naming and structure.
    `,
  },
};

export function ArticleDetailPage() {
  const route = useRoute();
  const slug = () => route().params.slug;
  const articleData = () => articlesData[slug()] || { title: 'Article Not Found', content: 'The requested article could not be found.' };

  return div({ class: '_py12 _px6 _maxw[700px] _mx[auto]' },
    article({},
      time({ class: '_fssm _fgmuted _block _mb4' }, () => articleData().date),
      h1({ class: '_fs3xl _fwbold _mb8' }, () => articleData().title),
      div({ class: '_prose _fgtext _lh[1.8]' },
        () => articleData().content.split('\n\n').map(para =>
          p({ class: '_mb4' }, para.trim())
        )
      )
    )
  );
}
