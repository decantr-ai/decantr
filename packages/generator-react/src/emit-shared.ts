import type { IRAppNode, GeneratedFile } from '@decantr/generator-core';

/** Emit package.json for the generated React project */
export function emitPackageJson(app: IRAppNode): GeneratedFile {
  const pkg = {
    name: app.shell.config.brand.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      'react': '^19.0.0',
      'react-dom': '^19.0.0',
      'react-router-dom': '^7.0.0',
      'lucide-react': '^0.460.0',
      'class-variance-authority': '^0.7.0',
      'clsx': '^2.1.0',
      'tailwind-merge': '^2.6.0',
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^4.3.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
      'tailwindcss': '^3.4.0',
      'typescript': '^5.7.0',
      'vite': '^6.0.0',
    },
  };

  return {
    path: 'package.json',
    content: JSON.stringify(pkg, null, 2) + '\n',
  };
}

/** Emit tailwind.config.ts */
export function emitTailwindConfig(): GeneratedFile {
  return {
    path: 'tailwind.config.ts',
    content: `import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
`,
  };
}

/** Emit vite.config.ts */
export function emitViteConfig(): GeneratedFile {
  return {
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`,
  };
}

/** Emit src/globals.css with shadcn theme variables */
export function emitGlobalsCss(app: IRAppNode): GeneratedFile {
  const isDark = app.theme.mode === 'dark';

  return {
    path: 'src/globals.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: ${isDark ? '222.2 84% 4.9%' : '0 0% 100%'};
    --foreground: ${isDark ? '210 40% 98%' : '222.2 84% 4.9%'};
    --card: ${isDark ? '222.2 84% 4.9%' : '0 0% 100%'};
    --card-foreground: ${isDark ? '210 40% 98%' : '222.2 84% 4.9%'};
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: ${isDark ? '217.2 32.6% 17.5%' : '210 40% 96.1%'};
    --secondary-foreground: ${isDark ? '210 40% 98%' : '222.2 47.4% 11.2%'};
    --muted: ${isDark ? '217.2 32.6% 17.5%' : '210 40% 96.1%'};
    --muted-foreground: ${isDark ? '215 20.2% 65.1%' : '215.4 16.3% 46.9%'};
    --accent: ${isDark ? '217.2 32.6% 17.5%' : '210 40% 96.1%'};
    --accent-foreground: ${isDark ? '210 40% 98%' : '222.2 47.4% 11.2%'};
    --destructive: ${isDark ? '0 62.8% 30.6%' : '0 84.2% 60.2%'};
    --destructive-foreground: 210 40% 98%;
    --border: ${isDark ? '217.2 32.6% 17.5%' : '214.3 31.8% 91.4%'};
    --input: ${isDark ? '217.2 32.6% 17.5%' : '214.3 31.8% 91.4%'};
    --ring: 262.1 83.3% 57.8%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`,
  };
}

/** Emit src/lib/utils.ts (cn helper) */
export function emitUtils(): GeneratedFile {
  return {
    path: 'src/lib/utils.ts',
    content: `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  };
}

/** Emit tsconfig.json */
export function emitTsConfig(): GeneratedFile {
  return {
    path: 'tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: 'force',
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: { '@/*': ['./src/*'] },
      },
      include: ['src'],
    }, null, 2) + '\n',
  };
}

/** Emit index.html */
export function emitIndexHtml(): GeneratedFile {
  return {
    path: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`,
  };
}

/** Emit 404 page */
export function emitNotFound(): GeneratedFile {
  return {
    path: 'src/pages/not-found.tsx',
    content: `import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full p-6">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-3xl font-semibold tracking-tight">Page Not Found</h1>
      <p className="text-muted-foreground text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
`,
  };
}
