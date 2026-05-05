import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const capsulesRoot = resolve(__dirname, 'src/capsules');

function listCapsuleDirectories(): string[] {
  if (!existsSync(capsulesRoot)) return [];
  return readdirSync(capsulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readCapsuleRoutes(slug: string): string[] {
  const essencePath = resolve(capsulesRoot, slug, 'decantr.essence.json');
  if (!existsSync(essencePath)) return ['/'];

  try {
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      routes?: Record<string, unknown>;
      blueprint?: {
        routes?: Record<string, unknown>;
        sections?: Array<{ pages?: Array<{ route?: string }> }>;
        pages?: Array<{ route?: string }>;
      };
    };
    const routes = new Set<string>(['/']);

    for (const route of Object.keys(essence.routes ?? essence.blueprint?.routes ?? {})) {
      routes.add(route);
    }
    for (const section of essence.blueprint?.sections ?? []) {
      for (const page of section.pages ?? []) {
        if (typeof page.route === 'string' && page.route.length > 0) {
          routes.add(page.route);
        }
      }
    }
    for (const page of essence.blueprint?.pages ?? []) {
      if (typeof page.route === 'string' && page.route.length > 0) {
        routes.add(page.route);
      }
    }

    return [...routes].sort();
  } catch {
    return ['/'];
  }
}

function showcaseCapsulesModule(): Plugin {
  const virtualId = 'virtual:showcase-capsules';
  const resolvedVirtualId = `\0${virtualId}`;

  return {
    name: 'showcase-capsules-module',
    resolveId(id) {
      return id === virtualId ? resolvedVirtualId : null;
    },
    load(id) {
      if (id !== resolvedVirtualId) return null;

      const capsules = listCapsuleDirectories().map((slug) => {
        const routes = readCapsuleRoutes(slug);
        const publicRoutes = routes.map((route) => {
          if (route === '/') return `/showcase/${slug}`;
          return `/showcase/${slug}${route.startsWith('/') ? route : `/${route}`}`;
        });
        return {
          slug,
          title: slug
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' '),
          routes,
          publicUrl: `/showcase/${slug}`,
          publicRoutes,
        };
      });

      return `export const showcaseCapsules = ${JSON.stringify(capsules, null, 2)};`;
    },
  };
}

function capsuleAliasResolver(): Plugin {
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.css'];
  const resolveExisting = (candidate: string) => {
    for (const extension of extensions) {
      const path = `${candidate}${extension}`;
      if (existsSync(path)) return path;
    }
    for (const extension of extensions.filter(Boolean)) {
      const path = resolve(candidate, `index${extension}`);
      if (existsSync(path)) return path;
    }
    return candidate;
  };

  return {
    name: 'capsule-aware-at-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.startsWith('@/') || !importer) return null;

      const normalizedImporter = importer.replaceAll('\\', '/');
      const match = normalizedImporter.match(/\/src\/capsules\/([^/]+)\/src\//);
      if (!match) return null;

      return resolveExisting(resolve(capsulesRoot, match[1], 'src', source.slice(2)));
    },
  };
}

export default defineConfig({
  base: '/showcase/',
  plugins: [showcaseCapsulesModule(), capsuleAliasResolver(), react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
