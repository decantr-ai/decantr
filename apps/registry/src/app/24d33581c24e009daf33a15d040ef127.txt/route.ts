import { INDEXNOW_KEY } from '@/lib/seo';

export function GET() {
  return new Response(`${INDEXNOW_KEY}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
