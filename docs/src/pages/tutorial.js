import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { useRoute } from 'decantr/router';
import { DocsLayout } from '../layouts/docs-layout.js';
import { MarkdownRenderer } from '../components/markdown-renderer.js';

const { div } = tags;

export function TutorialPage() {
  const route = useRoute();
  const step = route().params.step || '01-install';
  return DocsLayout(
    MarkdownRenderer({ url: `/tutorial/${step}.md` })
  );
}
