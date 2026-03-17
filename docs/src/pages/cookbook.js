import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { useRoute } from 'decantr/router';
import { DocsLayout } from '../layouts/docs-layout.js';
import { MarkdownRenderer } from '../components/markdown-renderer.js';

const { div } = tags;

export function CookbookPage() {
  const route = useRoute();
  const recipe = route().params.recipe || 'dashboard';
  return DocsLayout(
    MarkdownRenderer({ url: `/cookbook/${recipe}.md` })
  );
}
