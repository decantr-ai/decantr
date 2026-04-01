import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface DependenciesAnalysis {
  ui: string[];
  auth: string[];
  db: string[];
  state: string[];
  styling: string[];
  other: string[];
}

/**
 * Category mappings for known packages.
 */
const CATEGORIES: Record<string, string[]> = {
  ui: [
    'react', 'react-dom', 'vue', 'svelte', '@angular/core',
    'next', 'nuxt', 'astro',
    '@radix-ui', '@headlessui', '@mui', '@chakra-ui',
    'shadcn', 'antd', 'ant-design',
    'framer-motion', 'react-spring', '@react-three',
    'lucide-react', 'react-icons', '@heroicons',
    'recharts', 'chart.js', 'd3', 'visx',
    'react-hook-form', 'formik', '@tanstack/react-form',
    'react-select', 'cmdk', 'sonner', 'react-hot-toast',
    'vaul', 'react-resizable-panels', 'embla-carousel',
    '@tanstack/react-table', 'react-beautiful-dnd',
  ],
  auth: [
    'next-auth', '@auth/core', '@clerk/nextjs', '@clerk/clerk-react',
    'lucia', 'lucia-auth',
    '@supabase/ssr', '@supabase/auth-helpers-nextjs',
    'firebase', '@firebase/auth',
    'passport', 'jsonwebtoken', 'jose',
    'bcrypt', 'bcryptjs', 'argon2',
    'iron-session', '@auth0/nextjs-auth0',
  ],
  db: [
    'prisma', '@prisma/client',
    'drizzle-orm', 'drizzle-kit',
    '@supabase/supabase-js',
    'mongoose', 'mongodb',
    'pg', 'mysql2', 'better-sqlite3',
    'typeorm', 'sequelize', 'knex',
    '@planetscale/database', '@vercel/postgres',
    '@neondatabase/serverless',
    'redis', 'ioredis', '@upstash/redis',
    'convex',
  ],
  state: [
    'zustand', 'jotai', 'recoil', 'valtio',
    '@reduxjs/toolkit', 'redux', 'react-redux',
    'mobx', 'mobx-react',
    '@tanstack/react-query', 'swr', 'react-query',
    'trpc', '@trpc/client', '@trpc/server',
    'axios', 'ky', 'got',
    'zod', 'yup', 'superstruct', 'valibot',
  ],
  styling: [
    'tailwindcss', '@tailwindcss/postcss', '@tailwindcss/vite',
    'postcss', 'autoprefixer',
    'sass', 'less', 'stylus',
    'styled-components', '@emotion/react', '@emotion/styled',
    'styled-jsx', 'linaria', 'vanilla-extract',
    'clsx', 'class-variance-authority', 'tailwind-merge',
    'next-themes', 'theme-ui',
  ],
};

/**
 * Determine the category of a package.
 */
function categorize(packageName: string): keyof typeof CATEGORIES | 'other' {
  for (const [category, packages] of Object.entries(CATEGORIES)) {
    for (const pkg of packages) {
      // Match exact name or scoped package prefix
      if (packageName === pkg || packageName.startsWith(`${pkg}/`)) {
        return category as keyof typeof CATEGORIES;
      }
    }
  }
  return 'other';
}

/**
 * Scan package.json and categorize dependencies.
 */
export function scanDependencies(projectRoot: string): DependenciesAnalysis {
  const result: DependenciesAnalysis = {
    ui: [],
    auth: [],
    db: [],
    state: [],
    styling: [],
    other: [],
  };

  const pkgPath = join(projectRoot, 'package.json');
  if (!existsSync(pkgPath)) return result;

  let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch {
    return result;
  }

  const allDeps = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]);

  for (const dep of allDeps) {
    // Skip type definition packages and eslint configs
    if (dep.startsWith('@types/') || dep.startsWith('eslint')) continue;

    const category = categorize(dep);
    result[category].push(dep);
  }

  // Sort each category
  for (const key of Object.keys(result) as Array<keyof DependenciesAnalysis>) {
    result[key].sort();
  }

  return result;
}
