import { useState, useMemo } from 'react';
import { css } from '@decantr/css';
import { TerminalShell } from '@/components/TerminalShell';
import { SplitPane } from '@/components/SplitPane';

/* ── Mock file system ── */
interface FileNode {
  name: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  content?: string;
}

const FILE_TREE: FileNode[] = [
  {
    name: 'my-project',
    type: 'dir',
    children: [
      {
        name: 'package.json',
        type: 'file',
        content: `{
  "name": "terminal-dashboard",
  "version": "2.4.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/ --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "@decantr/css": "workspace:*",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.5.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "typescript": "^5.8.3",
    "vite": "^6.3.0",
    "vitest": "^3.1.0"
  }
}`,
      },
      {
        name: 'tsconfig.json',
        type: 'file',
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`,
      },
      {
        name: '.env',
        type: 'file',
        content: `# Environment Configuration
VITE_API_URL=https://api.terminal-dash.internal
VITE_WS_URL=wss://ws.terminal-dash.internal
VITE_AUTH_PROVIDER=oidc
VITE_AUTH_ISSUER=https://auth.terminal-dash.internal
VITE_METRICS_INTERVAL=2000
VITE_LOG_RETENTION=86400
VITE_FEATURE_FLAGS=dark_mode,split_pane,live_logs
VITE_SENTRY_DSN=https://abc123@sentry.io/456
VITE_ANALYTICS_ID=UA-000000-01`,
      },
      {
        name: '.env.production',
        type: 'file',
        content: `# Production Overrides
VITE_API_URL=https://api.terminal-dash.prod
VITE_WS_URL=wss://ws.terminal-dash.prod
VITE_LOG_LEVEL=warn
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_PROFILING=false
VITE_CDN_PREFIX=https://cdn.terminal-dash.prod`,
      },
      {
        name: 'vite.config.ts',
        type: 'file',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, ''),
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});`,
      },
      {
        name: 'decantr.essence.json',
        type: 'file',
        content: `{
  "version": 3,
  "name": "terminal-dashboard",
  "dna": {
    "theme": "@official/phosphor-terminal",
    "mode": "dark",
    "density": "compact",
    "shape": "sharp",
    "motion": "instant",
    "accessibility": "AA"
  },
  "blueprint": {
    "archetype": "@official/dashboard",
    "shell": "@official/sidebar-shell",
    "pages": {
      "/app": {
        "title": "Home",
        "layout": ["system-overview", "log-stream"],
        "role": "primary"
      },
      "/app/config": {
        "title": "Config Editor",
        "layout": ["file-tree", "code-viewer"],
        "role": "auxiliary"
      },
      "/app/logs": {
        "title": "Log Viewer",
        "layout": ["log-filters", "log-table"],
        "role": "auxiliary"
      },
      "/app/metrics": {
        "title": "Metrics",
        "layout": ["metric-cards", "metric-charts"],
        "role": "auxiliary"
      }
    }
  },
  "guard_mode": "strict",
  "dna_enforcement": "error",
  "blueprint_enforcement": "warn"
}`,
      },
      {
        name: 'src',
        type: 'dir',
        children: [
          {
            name: 'main.tsx',
            type: 'file',
            content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/global.css';
import './styles/tokens.css';
import './styles/treatments.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);`,
          },
          {
            name: 'App.tsx',
            type: 'file',
            content: `import { Routes, Route } from 'react-router-dom';
import { ShowcaseChrome } from './showcase-chrome';
import { AuthGuard } from './components/AuthGuard';
import { HomePage } from './pages/terminal-home/HomePage';
import { ConfigPage } from './pages/config-editor/ConfigPage';
import { LogsPage } from './pages/log-viewer/LogsPage';
import { MetricsPage } from './pages/metrics-monitor/MetricsPage';

export function App() {
  return (
    <ShowcaseChrome>
      <Routes>
        <Route path="/app" element={<AuthGuard><HomePage /></AuthGuard>} />
        <Route path="/app/config" element={<AuthGuard><ConfigPage /></AuthGuard>} />
        <Route path="/app/logs" element={<AuthGuard><LogsPage /></AuthGuard>} />
        <Route path="/app/metrics" element={<AuthGuard><MetricsPage /></AuthGuard>} />
      </Routes>
    </ShowcaseChrome>
  );
}`,
          },
          {
            name: 'styles',
            type: 'dir',
            children: [
              { name: 'global.css', type: 'file', content: `/* global reset + body */\n@layer reset, tokens, treatments, decorators, utilities, app;\n\n@layer reset {\n  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n  html { color-scheme: dark; }\n  body { font-family: monospace; background: var(--d-bg); color: var(--d-text); }\n}` },
              { name: 'tokens.css', type: 'file', content: `@layer tokens {\n  :root {\n    --d-primary: #00FF00;\n    --d-bg: #000000;\n    --d-surface: #0A0A0A;\n    --d-border: #333333;\n    --d-text: #00FF00;\n    --d-text-muted: #00AA00;\n    --d-accent: #00FFFF;\n    --d-secondary: #FFB000;\n  }\n}` },
              { name: 'treatments.css', type: 'file', content: `@layer treatments {\n  .d-interactive { display: inline-flex; padding: 0.6rem 1.2rem; border: 1px solid var(--d-border); cursor: pointer; }\n  .d-surface { background: var(--d-surface); border: 1px solid var(--d-border); padding: 1.5rem; }\n  .d-data { width: 100%; border-collapse: collapse; }\n  .d-control { background: var(--d-surface); border: 1px solid var(--d-border); padding: 0.6rem 0.75rem; width: 100%; }\n}` },
            ],
          },
        ],
      },
      {
        name: 'nginx.conf',
        type: 'file',
        content: `worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    tcp_nopush    on;
    keepalive_timeout 65;
    gzip          on;
    gzip_types    text/plain text/css application/json application/javascript;

    server {
        listen 80;
        server_name terminal-dash.internal;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /ws {
            proxy_pass http://backend:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}`,
      },
      {
        name: 'Dockerfile',
        type: 'file',
        content: `FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
      },
      {
        name: 'docker-compose.yml',
        type: 'file',
        content: `version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:80"
    depends_on:
      - backend
      - redis
    environment:
      - NODE_ENV=production

  backend:
    image: terminal-dash-api:latest
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://db:5432/dashboard
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=dashboard
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=\${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:`,
      },
    ],
  },
];

/* ── Syntax highlighting (basic token coloring) ── */
function highlightLine(line: string, filename: string): React.ReactNode[] {
  const ext = filename.split('.').pop() ?? '';
  const tokens: React.ReactNode[] = [];
  let key = 0;

  if (ext === 'json' || filename === 'decantr.essence.json') {
    // JSON highlighting
    const parts = line.split(/("(?:[^"\\]|\\.)*")/g);
    for (const part of parts) {
      if (part.startsWith('"') && line.indexOf(part) < line.indexOf(':')) {
        // key
        tokens.push(<span key={key++} style={{ color: 'var(--d-accent)' }}>{part}</span>);
      } else if (part.startsWith('"')) {
        // string value
        tokens.push(<span key={key++} style={{ color: 'var(--d-secondary)' }}>{part}</span>);
      } else if (/true|false|null/.test(part)) {
        tokens.push(
          <span key={key++} style={{ color: 'var(--d-info)' }}>
            {part.replace(/(true|false|null)/g, '<kw>$1</kw>').includes('<kw>') ? part : part}
          </span>,
        );
      } else {
        // numbers and punctuation
        tokens.push(
          <span key={key++}>
            {part.split(/(\d+)/).map((seg, i) =>
              /^\d+$/.test(seg) ? (
                <span key={i} style={{ color: 'var(--d-error)' }}>{seg}</span>
              ) : (
                <span key={i}>{seg}</span>
              ),
            )}
          </span>,
        );
      }
    }
    return tokens;
  }

  if (ext === 'ts' || ext === 'tsx') {
    // TypeScript highlighting
    const kwRegex = /(import|from|export|function|const|let|return|default|if|else|throw|new|typeof|as|type|interface)\b/g;
    const strRegex = /('[^']*'|"[^"]*"|`[^`]*`)/g;
    const commentRegex = /(\/\/.*$)/;

    const commentMatch = line.match(commentRegex);
    if (commentMatch) {
      const idx = line.indexOf(commentMatch[0]);
      const before = line.slice(0, idx);
      tokens.push(<span key={key++}>{highlightLine(before, filename)}</span>);
      tokens.push(<span key={key++} style={{ color: 'var(--d-text-muted)', fontStyle: 'italic' }}>{commentMatch[0]}</span>);
      return tokens;
    }

    let remaining = line;
    const combined = new RegExp(`(${kwRegex.source})|(${strRegex.source})`, 'g');
    let match: RegExpExecArray | null;
    let lastIdx = 0;
    while ((match = combined.exec(remaining)) !== null) {
      if (match.index > lastIdx) {
        tokens.push(<span key={key++}>{remaining.slice(lastIdx, match.index)}</span>);
      }
      if (match[1]) {
        tokens.push(<span key={key++} style={{ color: 'var(--d-info)' }}>{match[0]}</span>);
      } else {
        tokens.push(<span key={key++} style={{ color: 'var(--d-secondary)' }}>{match[0]}</span>);
      }
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < remaining.length) {
      tokens.push(<span key={key++}>{remaining.slice(lastIdx)}</span>);
    }
    return tokens;
  }

  if (ext === 'css') {
    // CSS highlighting
    if (line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return [<span key={0} style={{ color: 'var(--d-text-muted)', fontStyle: 'italic' }}>{line}</span>];
    }
    if (line.includes(':') && !line.trim().startsWith('@') && !line.trim().startsWith('}')) {
      const colonIdx = line.indexOf(':');
      return [
        <span key={0} style={{ color: 'var(--d-accent)' }}>{line.slice(0, colonIdx)}</span>,
        <span key={1}>{':'}</span>,
        <span key={2} style={{ color: 'var(--d-secondary)' }}>{line.slice(colonIdx + 1)}</span>,
      ];
    }
    if (line.includes('{') || line.includes('}') || line.trim().startsWith('@') || line.trim().startsWith('.')) {
      return [<span key={0} style={{ color: 'var(--d-info)' }}>{line}</span>];
    }
    return [<span key={0}>{line}</span>];
  }

  if (filename.startsWith('.env')) {
    if (line.trim().startsWith('#')) {
      return [<span key={0} style={{ color: 'var(--d-text-muted)', fontStyle: 'italic' }}>{line}</span>];
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      return [
        <span key={0} style={{ color: 'var(--d-accent)' }}>{line.slice(0, eqIdx)}</span>,
        <span key={1} style={{ color: 'var(--d-text-muted)' }}>{'='}</span>,
        <span key={2} style={{ color: 'var(--d-secondary)' }}>{line.slice(eqIdx + 1)}</span>,
      ];
    }
    return [<span key={0}>{line}</span>];
  }

  if (ext === 'conf' || filename === 'nginx.conf') {
    if (line.trim().startsWith('#')) {
      return [<span key={0} style={{ color: 'var(--d-text-muted)', fontStyle: 'italic' }}>{line}</span>];
    }
    const directiveMatch = line.match(/^(\s*)(\w+)/);
    if (directiveMatch) {
      return [
        <span key={0}>{directiveMatch[1]}</span>,
        <span key={1} style={{ color: 'var(--d-info)' }}>{directiveMatch[2]}</span>,
        <span key={2} style={{ color: 'var(--d-secondary)' }}>{line.slice(directiveMatch[0].length)}</span>,
      ];
    }
    return [<span key={0}>{line}</span>];
  }

  if (filename === 'Dockerfile') {
    const instrMatch = line.match(/^(FROM|WORKDIR|COPY|RUN|EXPOSE|CMD|ENV|ARG|ENTRYPOINT|ADD|LABEL|USER|VOLUME|HEALTHCHECK|SHELL|ONBUILD|STOPSIGNAL|AS)\b/);
    if (instrMatch) {
      return [
        <span key={0} style={{ color: 'var(--d-info)', fontWeight: 600 }}>{instrMatch[0]}</span>,
        <span key={1} style={{ color: 'var(--d-secondary)' }}>{line.slice(instrMatch[0].length)}</span>,
      ];
    }
    if (line.trim().startsWith('#')) {
      return [<span key={0} style={{ color: 'var(--d-text-muted)', fontStyle: 'italic' }}>{line}</span>];
    }
    return [<span key={0}>{line}</span>];
  }

  if (ext === 'yml' || ext === 'yaml') {
    if (line.trim().startsWith('#')) {
      return [<span key={0} style={{ color: 'var(--d-text-muted)', fontStyle: 'italic' }}>{line}</span>];
    }
    const kvMatch = line.match(/^(\s*)([\w-]+)(:)(.*)/);
    if (kvMatch) {
      return [
        <span key={0}>{kvMatch[1]}</span>,
        <span key={1} style={{ color: 'var(--d-accent)' }}>{kvMatch[2]}</span>,
        <span key={2} style={{ color: 'var(--d-text-muted)' }}>{kvMatch[3]}</span>,
        <span key={3} style={{ color: 'var(--d-secondary)' }}>{kvMatch[4]}</span>,
      ];
    }
    if (line.trim().startsWith('-')) {
      return [<span key={0} style={{ color: 'var(--d-text-muted)' }}>{line}</span>];
    }
    return [<span key={0}>{line}</span>];
  }

  return [<span key={0}>{line}</span>];
}

/* ── File Tree Component ── */
const TREE_ICONS: Record<string, string> = {
  dir: '\u{1F4C1}',
  json: '{}',
  ts: 'TS',
  tsx: 'TX',
  css: '#',
  env: '$$',
  conf: '@@',
  yml: '::',
  yaml: '::',
  Dockerfile: 'DK',
};

function getFileIcon(node: FileNode): string {
  if (node.type === 'dir') return '';
  const ext = node.name.split('.').pop() ?? '';
  if (node.name === 'Dockerfile') return 'DK';
  return TREE_ICONS[ext] ?? '--';
}

function FileTree({
  nodes,
  depth,
  selectedFile,
  onSelect,
  expandedDirs,
  onToggleDir,
}: {
  nodes: FileNode[];
  depth: number;
  selectedFile: string;
  onSelect: (path: string, node: FileNode) => void;
  expandedDirs: Set<string>;
  onToggleDir: (path: string) => void;
}) {
  return (
    <>
      {nodes.map((node, idx) => {
        const path = `${'  '.repeat(depth)}${node.name}`;
        const isLast = idx === nodes.length - 1;
        const prefix = depth === 0 ? '' : isLast ? '\u2514\u2500 ' : '\u251C\u2500 ';
        const indent = depth === 0 ? '' : '\u2502  '.repeat(Math.max(0, depth - 1)) + (depth > 0 ? '' : '');
        const fullPath = depth === 0 ? node.name : path;
        const isExpanded = expandedDirs.has(node.name);

        if (node.type === 'dir') {
          return (
            <div key={node.name + depth}>
              <div
                className="d-data-row"
                onClick={() => onToggleDir(node.name)}
                style={{
                  padding: '0.15rem 0.25rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.75rem',
                  color: 'var(--d-accent)',
                }}
              >
                <span style={{ color: 'var(--d-text-muted)' }}>{indent}{prefix}</span>
                <span>{isExpanded ? '\u25BC' : '\u25B6'} {node.name}/</span>
              </div>
              {isExpanded && node.children && (
                <FileTree
                  nodes={node.children}
                  depth={depth + 1}
                  selectedFile={selectedFile}
                  onSelect={onSelect}
                  expandedDirs={expandedDirs}
                  onToggleDir={onToggleDir}
                />
              )}
            </div>
          );
        }

        return (
          <div
            key={node.name + depth}
            className="d-data-row"
            onClick={() => onSelect(node.name, node)}
            style={{
              padding: '0.15rem 0.25rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              background: selectedFile === node.name ? 'var(--d-surface)' : 'transparent',
              color: selectedFile === node.name ? 'var(--d-primary)' : 'var(--d-text)',
              borderLeft: selectedFile === node.name ? '2px solid var(--d-primary)' : '2px solid transparent',
            }}
          >
            <span style={{ color: 'var(--d-text-muted)' }}>{indent}{prefix}</span>
            <span style={{ color: 'var(--d-text-muted)', marginRight: '0.35rem', fontSize: '0.6rem', fontWeight: 600 }}>
              {getFileIcon(node)}
            </span>
            {node.name}
          </div>
        );
      })}
    </>
  );
}

/* ── Code Viewer Component ── */
function CodeViewer({
  filename,
  content,
  searchTerm,
}: {
  filename: string;
  content: string;
  searchTerm: string;
}) {
  const lines = content.split('\n');
  const lineCount = lines.length;
  const gutterWidth = String(lineCount).length;

  return (
    <div
      className="term-canvas"
      style={{
        flex: 1,
        overflow: 'auto',
        border: '1px solid var(--d-border)',
        fontSize: '0.75rem',
        lineHeight: 1.65,
        minHeight: 0,
      }}
    >
      <pre style={{ margin: 0, padding: '0.5rem' }}>
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isMatch = searchTerm.length > 1 && line.toLowerCase().includes(searchTerm.toLowerCase());
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                background: isMatch ? 'rgba(255, 176, 0, 0.1)' : 'transparent',
                borderLeft: isMatch ? '2px solid var(--d-warning)' : '2px solid transparent',
              }}
            >
              <span
                style={{
                  color: 'var(--d-text-muted)',
                  width: `${gutterWidth + 1}ch`,
                  textAlign: 'right',
                  paddingRight: '1ch',
                  flexShrink: 0,
                  userSelect: 'none',
                  opacity: 0.5,
                }}
              >
                {lineNum}
              </span>
              <span style={{ flex: 1 }}>{highlightLine(line, filename)}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

/* ── Flatten file tree for searching ── */
function flattenFiles(nodes: FileNode[], prefix = ''): { path: string; node: FileNode }[] {
  const result: { path: string; node: FileNode }[] = [];
  for (const n of nodes) {
    const p = prefix ? `${prefix}/${n.name}` : n.name;
    if (n.type === 'file') result.push({ path: p, node: n });
    if (n.children) result.push(...flattenFiles(n.children, p));
  }
  return result;
}

/* ── Page Component ── */
export function ConfigPage() {
  const allFiles = useMemo(() => flattenFiles(FILE_TREE), []);

  const [selectedFile, setSelectedFile] = useState<string>('package.json');
  const [selectedContent, setSelectedContent] = useState<string>(
    allFiles.find((f) => f.node.name === 'package.json')?.node.content ?? '',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(
    () => new Set(['my-project', 'src', 'styles']),
  );

  const handleSelect = (_path: string, node: FileNode) => {
    if (node.content !== undefined) {
      setSelectedFile(node.name);
      setSelectedContent(node.content);
    }
  };

  const handleToggleDir = (name: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const matchCount = useMemo(() => {
    if (searchTerm.length < 2) return 0;
    const lines = selectedContent.split('\n');
    return lines.filter((l) => l.toLowerCase().includes(searchTerm.toLowerCase())).length;
  }, [searchTerm, selectedContent]);

  const fileSize = useMemo(() => {
    return new Blob([selectedContent]).size;
  }, [selectedContent]);

  return (
    <TerminalShell title="CONFIG EDITOR">
      <SplitPane
        left={
          <div className={css('_flex _col')} style={{ height: '100%' }}>
            {/* Tree Header */}
            <div
              className="d-label"
              style={{
                borderBottom: '1px solid var(--d-border)',
                paddingBottom: '0.25rem',
                marginBottom: '0.5rem',
                flexShrink: 0,
              }}
            >
              FILE EXPLORER
            </div>

            {/* File count */}
            <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', marginBottom: '0.5rem', flexShrink: 0 }}>
              {allFiles.length} files in project
            </div>

            {/* Tree */}
            <div className="term-tree" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <FileTree
                nodes={FILE_TREE}
                depth={0}
                selectedFile={selectedFile}
                onSelect={handleSelect}
                expandedDirs={expandedDirs}
                onToggleDir={handleToggleDir}
              />
            </div>
          </div>
        }
        right={
          <div className={css('_flex _col')} style={{ height: '100%' }}>
            {/* Editor Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--d-border)',
                paddingBottom: '0.25rem',
                marginBottom: '0.5rem',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="d-label">EDITOR</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--d-accent)' }}>
                  {selectedFile}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--d-text-muted)' }}>
                  ({fileSize}B, {selectedContent.split('\n').length} lines)
                </span>
              </div>
              <span className="d-annotation" data-status="info" style={{ fontSize: '0.6rem' }}>
                READ ONLY
              </span>
            </div>

            {/* Search Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                flexShrink: 0,
              }}
            >
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>
                /
              </span>
              <input
                className="d-control"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="search in file..."
                autoComplete="off"
                spellCheck={false}
                style={{
                  flex: 1,
                  background: 'transparent',
                  borderRadius: 0,
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                }}
              />
              {searchTerm.length > 1 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--d-warning)', flexShrink: 0 }}>
                  {matchCount} match{matchCount !== 1 ? 'es' : ''}
                </span>
              )}
            </div>

            {/* Code Viewer */}
            <CodeViewer filename={selectedFile} content={selectedContent} searchTerm={searchTerm} />
          </div>
        }
        direction="horizontal"
        initialRatio={0.3}
      />
    </TerminalShell>
  );
}
