import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { useRoute } from 'decantr/router';
import { DocsLayout } from '../layouts/docs-layout.js';
import { MarkdownRenderer } from '../components/markdown-renderer.js';

const { div } = tags;

export function WorkflowPage() {
  const route = useRoute();
  const page = route().params.page || 'essence';
  return DocsLayout(
    MarkdownRenderer({ url: `/workflow/${page}.md` })
  );
}
