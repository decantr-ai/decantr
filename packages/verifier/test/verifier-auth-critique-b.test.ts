import { describe, expect, it } from 'vitest';
import { critiqueSource } from '../src/index.js';

describe('verifier auth critique evidence B', () => {
  it('flags auth redirects that trust wrapper-based browser-global bigint repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.BigInt;
          return (key) => readRedirectValue.call(globalThis, params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust apply-based browser-global bigint repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.BigInt;
          return (key) => readRedirectValue.apply(globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected browser-global bigint repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.BigInt;
          return (key) => Reflect.apply(readRedirectValue, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapper-based browser-global symbol repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Symbol;
          return (key) => readRedirectValue.call(globalThis, params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust apply-based browser-global symbol repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Symbol;
          return (key) => readRedirectValue.apply(globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected browser-global symbol repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Symbol;
          return (key) => Reflect.apply(readRedirectValue, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured JSON.parse repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { parse } = JSON;
          return (key) => parse(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound JSON.parse repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const parseRedirect = JSON.parse.bind(JSON);
          return (key) => parseRedirect(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected JSON.parse repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const parseRedirect = JSON.parse;
          return (key) => {
            const parseArgs = [params.getAll(key)[0]];
            return Reflect.apply(parseRedirect, JSON, parseArgs);
          };
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured JSON.stringify repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { stringify } = JSON;
          return (key) => stringify(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound JSON.stringify repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const stringifyRedirect = JSON.stringify.bind(JSON);
          return (key) => stringifyRedirect(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected JSON.stringify repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const stringifyRedirect = JSON.stringify;
          return (key) => {
            const stringifyArgs = [params.getAll(key)[0]];
            return Reflect.apply(stringifyRedirect, JSON, stringifyArgs);
          };
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured structuredClone repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { structuredClone: cloneRedirect } = globalThis;
          return (key) => cloneRedirect(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound structuredClone repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const cloneRedirect = globalThis.structuredClone.bind(globalThis);
          return (key) => cloneRedirect(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected structuredClone repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const cloneRedirect = globalThis.structuredClone;
          return (key) => {
            const cloneArgs = [params.getAll(key)[0]];
            return Reflect.apply(cloneRedirect, globalThis, cloneArgs);
          };
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust base64-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => btoa(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust Buffer-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Buffer.from(params.getAll(key)[0], 'utf8').toString('base64');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured Buffer.from repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { from } = Buffer;
          return (key) => from(params.getAll(key)[0], 'utf8').toString('base64');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured global-object Buffer repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { Buffer: BufferCtor } = globalThis;
          return (key) => BufferCtor.from(params.getAll(key)[0], 'utf8').toString('base64');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected Buffer.from repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const decodeRedirect = Buffer.from;
          return (key) => Reflect.apply(decodeRedirect, Buffer, [params.getAll(key)[0], 'utf8']).toString('base64');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound global-object Buffer.from repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const decodeRedirect = globalThis.Buffer.from.bind(globalThis.Buffer);
          return (key) => decodeRedirect(params.getAll(key)[0], 'utf8').toString('base64');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust browser-global base64-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => globalThis.btoa(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound browser-global base64-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const encodeRedirect = globalThis.btoa.bind(globalThis);
          return (key) => encodeRedirect(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected browser-global base64-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Reflect.apply(globalThis.btoa, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust browser-global legacy URI-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => window.escape(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over filtered repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).filter(Boolean)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over filtered repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).filter(Boolean)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust local function helper readers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function readRedirect(searchParams, key) {
          return searchParams.get(key);
        }

        export function LoginRedirect({ searchParams }) {
          return redirect(readRedirect(searchParams, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust searchParams getter call wrappers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const { get } = searchParams;
          return redirect(get.call(searchParams, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust optional query property carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const query = Object.fromEntries(new URLSearchParams(window.location.search));
          return redirect(query?.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bracketed searchParams getter props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          return redirect(searchParams['get']('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust nested destructured searchParams props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams: { next } }) {
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bracketed router push transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ router, searchParams }) {
          router['push'](searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased router push transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect({ searchParams }) {
          const { push } = useRouter();
          push(searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust optional router push transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect({ searchParams }) {
          const router = useRouter();
          router?.push(searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust router push call transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect({ searchParams }) {
          const router = useRouter();
          router.push.call(router, searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased router replace apply transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect({ searchParams }) {
          const router = useRouter();
          const navigate = router.replace;
          navigate.apply(router, [searchParams.get('next') ?? '/dashboard']);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased router apply argument arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect({ searchParams }) {
          const router = useRouter();
          const navigate = router.replace;
          const args = [searchParams.get('next') ?? '/dashboard'];
          navigate.apply(router, args);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust router Reflect.apply transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect({ searchParams }) {
          const router = useRouter();
          Reflect.apply(router.replace, router, [searchParams.get('next') ?? '/dashboard']);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust router Reflect.apply argument arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect({ searchParams }) {
          const router = useRouter();
          const args = [searchParams.get('next') ?? '/dashboard'];
          Reflect.apply(router.replace, router, args);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound router replace transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect({ searchParams }) {
          const router = useRouter();
          const navigate = router.replace.bind(router);
          navigate(searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust history replaceState call transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          history.replaceState.call(history, {}, '', searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust history Reflect.apply transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const args = [{}, '', searchParams.get('next') ?? '/dashboard'];
          Reflect.apply(history.replaceState, history, args);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust location assign call transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          window.location.assign.call(window.location, searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust location Reflect.apply transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          Reflect.apply(window.location.assign, window.location, [searchParams.get('next') ?? '/dashboard']);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust window open apply transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          window.open.apply(window, [searchParams.get('next') ?? '/dashboard', '_self']);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust location Reflect.apply argument arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const args = [searchParams.get('next') ?? '/dashboard'];
          Reflect.apply(window.location.assign, window.location, args);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust window open Reflect.apply transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          Reflect.apply(window.open, window, [searchParams.get('next') ?? '/dashboard', '_self']);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust window open Reflect.apply argument arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const args = [searchParams.get('next') ?? '/dashboard', '_self'];
          Reflect.apply(window.open, window, args);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased history apply argument arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const updateHistory = history.replaceState;
          const args = [{}, '', searchParams.get('next') ?? '/dashboard'];
          updateHistory.apply(history, args);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased location apply argument arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const navigate = window.location.assign;
          const args = [searchParams.get('next') ?? '/dashboard'];
          navigate.apply(window.location, args);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased window open apply argument arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const popup = window.open;
          const args = [searchParams.get('next') ?? '/dashboard', '_self'];
          popup.apply(window, args);
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust history replaceState transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const browserHistory = window.history;
          browserHistory.replaceState({}, '', searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased history replaceState transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const updateHistory = history.replaceState;
          updateHistory({}, '', searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured history pushState transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const { pushState: updateHistory } = window.history;
          updateHistory({}, '', searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound history replaceState transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const updateHistory = history.replaceState.bind(history);
          updateHistory({}, '', searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured bound history pushState transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const { pushState } = window.history;
          const updateHistory = pushState.bind(window.history);
          updateHistory({}, '', searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust window.open transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          window.open(searchParams.get('next') ?? '/dashboard', '_self');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased window.open transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const popup = window.open;
          popup(searchParams.get('next') ?? '/dashboard', '_self');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured window.open transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const { open: popup } = window;
          popup(searchParams.get('next') ?? '/dashboard', '_self');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased location.assign transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const navigate = window.location.assign;
          navigate(searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust optional location assign transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          window.location?.assign(searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured location.replace transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const { replace: navigate } = window.location;
          navigate(searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound location.assign transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const navigate = window.location.assign.bind(window.location);
          navigate(searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured bound location.replace transitions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const { replace } = window.location;
          const navigate = replace.bind(window.location);
          navigate(searchParams.get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased useSearchParams hook carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useSearchParams } from 'react-router-dom';

        export function LoginRedirect() {
          const params = useSearchParams();
          return redirect(params.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust tuple-destructured useSearchParams hook carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useSearchParams } from 'react-router-dom';

        export function LoginRedirect() {
          const [params] = useSearchParams();
          return redirect(params.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased useRouter hook query carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect() {
          const appRouter = useRouter();
          return redirect(appRouter.query.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust helper-wrapped query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const next = decodeURIComponent(searchParams.get('next') ?? '/dashboard');
          return redirect(next);
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const next = searchParams.getAll('next')[0];
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased useLocation hook carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useLocation } from 'react-router-dom';

        export function LoginRedirect() {
          const routeLocation = useLocation();
          const next = new URLSearchParams(routeLocation.search).get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured useLocation hook search carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useLocation } from 'react-router-dom';

        export function LoginRedirect() {
          const { search } = useLocation();
          const next = new URLSearchParams(search).get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust cloned nextUrl carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function middleware(req) {
          const nextUrl = req.nextUrl.clone();
          return redirect(nextUrl.searchParams.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased cloned nextUrl searchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function middleware(req) {
          const params = req.nextUrl.clone().searchParams;
          const next = params.get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust nextUrl search-string carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function middleware(req) {
          const next = new URLSearchParams(req.nextUrl.search).get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust nextUrl href carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function middleware(req) {
          const nextUrl = req.nextUrl.clone();
          const next = new URL(nextUrl.href).searchParams.get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust stringified nextUrl carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function middleware(req) {
          const next = new URL(req.nextUrl.toString()).searchParams.get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust String-wrapped nextUrl carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function middleware(req) {
          const nextUrl = req.nextUrl.clone();
          const next = new URL(String(nextUrl)).searchParams.get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust Object.fromEntries query carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function middleware(req) {
          const query = Object.fromEntries(req.nextUrl.searchParams);
          return redirect(query.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured Object.fromEntries query carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const { next } = Object.fromEntries(new URLSearchParams(window.location.search));
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased searchParams entries in Object.fromEntries during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const entries = new URLSearchParams(window.location.search).entries();
          const query = Object.fromEntries(entries);
          return redirect(query.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust Array.from wrapped entries in Object.fromEntries during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const entries = Array.from(new URLSearchParams(window.location.search).entries());
          const query = Object.fromEntries(entries);
          return redirect(query.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust spread wrapped searchParams iterables in Object.fromEntries during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const query = Object.fromEntries([...new URLSearchParams(window.location.search)]);
          return redirect(query.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust normalized location search carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const params = new URLSearchParams(window.location.search.slice(1));
          return redirect(params.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust normalized nextUrl search carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function middleware(req) {
          const params = new URLSearchParams(req.nextUrl.search.slice(1));
          return redirect(params.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased destructured useRouter query carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { useRouter } from 'next/router';

        export function LoginRedirect() {
          const { query: params } = useRouter();
          return redirect(params.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust template-wrapped query aliases during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ router }) {
          const next = router.query.next;
          return redirect(\`\${next ?? '/dashboard'}\`);
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust template-wrapped searchParams props in JSX during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams: { next } }) {
          return <Link to={\`\${next ?? '/dashboard'}\`}>Continue</Link>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust snake-case search param keys during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          return redirect(searchParams.get('return_to') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust snake-case query aliases during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ router }) {
          const queryKey = 'redirect_to';
          return <Link to={{ pathname: router.query[queryKey] ?? '/dashboard' }}>Continue</Link>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust snake-case callback URL params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const queryKey = 'callback_url';
          const next = new URLSearchParams(window.location.search).get(queryKey);
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth flows that redirect directly to external URLs during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          async function handleSubmit() {
            await auth.signIn();
            return redirect('https://accounts.example.com/continue');
          }

          return <button onClick={handleSubmit}>Sign in</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-external-redirect-risk'),
    ).toBe(true);
  });

  it('flags provider authorize URLs without state during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginProvider.tsx',
      code: `
        export function LoginProvider() {
          async function handleSubmit() {
            await auth.signIn();
            return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code');
          }

          return <button onClick={handleSubmit}>Sign in with SSO</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-provider-state-missing'),
    ).toBe(true);
  });

  it('does not flag provider authorize URLs with state during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginProvider.tsx',
      code: `
        export function LoginProvider() {
          async function handleSubmit() {
            await auth.signIn();
            return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code&state=opaque123');
          }

          return <button onClick={handleSubmit}>Sign in with SSO</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-provider-state-missing'),
    ).toBe(false);
  });

  it('flags provider code-flow URLs without PKCE during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginProvider.tsx',
      code: `
        export function LoginProvider() {
          async function handleSubmit() {
            await auth.signIn();
            return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code&state=opaque123');
          }

          return <button onClick={handleSubmit}>Sign in with SSO</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-provider-pkce-missing'),
    ).toBe(true);
  });

  it('does not flag provider code-flow URLs with PKCE during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginProvider.tsx',
      code: `
        export function LoginProvider() {
          async function handleSubmit() {
            await auth.signIn();
            return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code&state=opaque123&code_challenge=pkce123&code_challenge_method=S256');
          }

          return <button onClick={handleSubmit}>Sign in with SSO</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-provider-pkce-missing'),
    ).toBe(false);
  });

  it('flags provider id_token URLs without nonce during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginProvider.tsx',
      code: `
        export function LoginProvider() {
          async function handleSubmit() {
            await auth.signIn();
            return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=id_token&state=opaque123');
          }

          return <button onClick={handleSubmit}>Sign in with SSO</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-provider-nonce-missing'),
    ).toBe(true);
  });

  it('does not flag provider id_token URLs with nonce during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginProvider.tsx',
      code: `
        export function LoginProvider() {
          async function handleSubmit() {
            await auth.signIn();
            return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=id_token&state=opaque123&nonce=nonce123');
          }

          return <button onClick={handleSubmit}>Sign in with SSO</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-provider-nonce-missing'),
    ).toBe(false);
  });

  it('flags auth callback flows that never scrub URL codes during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
          }

          return <p>Signing you in...</p>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'callback', path: '/auth/callback', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-callback-url-scrub-missing'),
    ).toBe(true);
  });

  it('flags auth callback flows that never handle provider error returns during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
          }

          return <p>Signing you in...</p>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'callback', path: '/auth/callback', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-callback-error-missing'),
    ).toBe(true);
  });

  it('does not flag auth callback flows when provider error returns are handled during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const providerError = searchParams.get('error');
          if (providerError) {
            return <p>Authentication failed. Please try again.</p>;
          }

          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
            history.replaceState({}, '', '/dashboard');
          }

          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'callback', path: '/auth/callback', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-callback-error-missing'),
    ).toBe(false);
  });

  it('flags auth callback flows that read provider state without validating it during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const state = searchParams.get('state');
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
          }

          return <p data-state={state}>Signing you in...</p>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'callback', path: '/auth/callback', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'security-auth-callback-state-validation-missing',
      ),
    ).toBe(true);
  });

  it('does not flag auth callback flows when provider state is validated during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const returnedState = searchParams.get('state');
          const expectedState = sessionStorage.getItem('oauth_state');
          if (!returnedState || returnedState !== expectedState) {
            return <p>Authentication failed. Please try again.</p>;
          }

          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
            history.replaceState({}, '', '/dashboard');
          }

          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'callback', path: '/auth/callback', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'security-auth-callback-state-validation-missing',
      ),
    ).toBe(false);
  });

  it('flags auth callback flows that validate provider state but never clear stored state during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const returnedState = searchParams.get('state');
          const expectedState = sessionStorage.getItem('oauth_state');
          if (!returnedState || returnedState !== expectedState) {
            return <p>Authentication failed. Please try again.</p>;
          }

          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
          }

          history.replaceState({}, '', '/dashboard');
          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'callback', path: '/auth/callback', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'security-auth-callback-state-teardown-missing',
      ),
    ).toBe(true);
  });

  it('does not flag auth callback flows when stored provider state is cleared during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const returnedState = searchParams.get('state');
          const expectedState = sessionStorage.getItem('oauth_state');
          if (!returnedState || returnedState !== expectedState) {
            sessionStorage.removeItem('oauth_state');
            return <p>Authentication failed. Please try again.</p>;
          }

          sessionStorage.removeItem('oauth_state');
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
            history.replaceState({}, '', '/dashboard');
          }

          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'callback', path: '/auth/callback', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'security-auth-callback-state-teardown-missing',
      ),
    ).toBe(false);
  });

  it('flags auth callback failure handling that never routes back to sign-in during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const providerError = searchParams.get('error');
          if (providerError) {
            return <p>Authentication failed. Please try again.</p>;
          }

          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
            history.replaceState({}, '', '/dashboard');
          }

          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login', 'callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
          ],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-callback-entry-return-missing'),
    ).toBe(true);
  });

  it('does not flag auth callback failure handling when it routes back to sign-in during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const providerError = searchParams.get('error');
          if (providerError) {
            return <a href="/login">Back to sign in</a>;
          }

          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
            history.replaceState({}, '', '/dashboard');
          }

          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login', 'callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
          ],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-callback-entry-return-missing'),
    ).toBe(false);
  });

  it('flags auth callback flows that never surface success state or protected transition during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
          }

          return <p>Signing you in...</p>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          focusAreas: ['route-topology', 'state-handling'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['hero'] },
          ],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-callback-success-missing'),
    ).toBe(true);
  });

  it('does not flag auth callback flows when they transition into a protected route during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
          }

          history.replaceState({}, '', '/dashboard');
          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          focusAreas: ['route-topology', 'state-handling'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['hero'] },
          ],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-callback-success-missing'),
    ).toBe(false);
  });

  it('flags auth callback exchanges without explicit rejection handling during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
          }

          history.replaceState({}, '', '/dashboard');
          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['hero'] },
          ],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'state-auth-callback-exchange-error-missing',
      ),
    ).toBe(true);
  });

  it('does not flag auth callback exchanges when rejection handling is explicit during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code).catch(() => {
              toast.error('Unable to sign you in.');
            });
          }

          history.replaceState({}, '', '/dashboard');
          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['hero'] },
          ],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'state-auth-callback-exchange-error-missing',
      ),
    ).toBe(false);
  });

  it('flags auth callback exchange failures that never route back to sign-in during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code).catch(() => {
              toast.error('Unable to sign you in.');
            });
          }

          return <p>Still working...</p>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['hero'] },
          ],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-callback-entry-return-missing'),
    ).toBe(true);
  });

  it('does not flag auth callback exchange failures when they route back to sign-in during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code).catch(() => {
              history.replaceState({}, '', '/login');
            });
          }

          return <a href="/login">Back to sign in</a>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['hero'] },
          ],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-callback-entry-return-missing'),
    ).toBe(false);
  });

  it('does not flag auth callback flows when callback URLs are scrubbed during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const code = searchParams.get('code');
          if (code) {
            void auth.exchangeCodeForSession(code);
            history.replaceState({}, '', '/dashboard');
          }

          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'callback', path: '/auth/callback', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-callback-url-scrub-missing'),
    ).toBe(false);
  });

  it('flags auth callback error returns that never scrub provider params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const providerError = searchParams.get('error');
          if (providerError) {
            return <a href="/login">Back to sign in</a>;
          }

          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
          ],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-callback-url-scrub-missing'),
    ).toBe(true);
  });

  it('does not flag auth callback error returns when provider params are scrubbed during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback({ searchParams }) {
          const providerError = searchParams.get('error');
          if (providerError) {
            history.replaceState({}, '', '/login');
            return <a href="/login">Back to sign in</a>;
          }

          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
          ],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-callback-url-scrub-missing'),
    ).toBe(false);
  });

  it('does not flag auth/session exit logic when logout returns users to an anonymous route during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu() {
          const { status } = useSession();

          async function handleLogout() {
            await auth.signOut();
            return redirect('/login');
          }

          if (status === 'loading') {
            return <Spinner />;
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-exit-redirect-missing'),
    ).toBe(false);
  });

  it('flags auth/session exit logic that redirects away without tearing down the session during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu() {
          const { status } = useSession();

          async function handleLogout() {
            return redirect('/login');
          }

          if (status === 'loading') {
            return <Spinner />;
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-exit-teardown-missing'),
    ).toBe(true);
  });

  it('does not flag auth/session exit teardown gaps when logout explicitly signs out during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu() {
          const { status } = useSession();

          async function handleLogout() {
            await auth.signOut();
            return redirect('/login');
          }

          if (status === 'loading') {
            return <Spinner />;
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-exit-teardown-missing'),
    ).toBe(false);
  });

  it('flags client-managed auth persistence that is never cleared during critique sign-out flows', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu({ token }) {
          localStorage.setItem('auth_token', token);
          document.cookie = \`auth_token=\${token}; path=/\`;
          fetch('/api/me', { headers: { Authorization: \`Bearer \${token}\` } });

          async function handleLogout() {
            await auth.signOut();
            return redirect('/login');
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling', 'security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-storage-teardown-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'state-auth-cookie-teardown-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'state-auth-header-teardown-missing'),
    ).toBe(true);
  });

  it('does not treat Decantr dev-auth bypass storage as credential persistence during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu() {
          localStorage.setItem('decantr_authenticated', 'true');

          function handleLogout() {
            localStorage.removeItem('decantr_authenticated');
            return redirect('/login');
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling', 'security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-storage-teardown-missing'),
    ).toBe(false);
    expect(report.findings.some((finding) => finding.id === 'security-auth-storage-write')).toBe(
      false,
    );
  });

  it('flags client data caches that are never cleared during critique sign-out flows', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        import { useQueryClient } from '@tanstack/react-query';

        export function UserMenu() {
          const queryClient = useQueryClient();
          const { data: session } = useSession();

          async function handleLogout() {
            await auth.signOut();
            return redirect('/login');
          }

          if (!session) {
            return null;
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling', 'security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-cache-teardown-missing'),
    ).toBe(true);
  });

  it('flags auth refresh timers that are never torn down during critique sign-out flows', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu() {
          const { data: session } = useSession();

          setInterval(() => auth.refreshSession(), 60_000);

          async function handleLogout() {
            await auth.signOut();
            return redirect('/login');
          }

          if (!session) {
            return null;
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-refresh-teardown-missing'),
    ).toBe(true);
  });

  it('flags realtime channels that are never torn down during critique sign-out flows', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu() {
          const realtime = new WebSocket('wss://example.com/live');
          const { data: session } = useSession();

          async function handleLogout() {
            await auth.signOut();
            return redirect('/login');
          }

          if (!session) {
            return null;
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-realtime-teardown-missing'),
    ).toBe(true);
  });

  it('flags cross-tab auth coordination that is never torn down during critique sign-out flows', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu() {
          const authChannel = new BroadcastChannel('auth');
          window.addEventListener('storage', syncSession);
          const { data: session } = useSession();

          async function handleLogout() {
            await auth.signOut();
            return redirect('/login');
          }

          if (!session) {
            return null;
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-coordination-teardown-missing'),
    ).toBe(true);
  });

  it('flags protected session-aware files that never branch on unauthenticated state during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-handling-missing'),
    ).toBe(true);
  });

  it('flags protected session-aware files that branch on auth loss but never return users to an anonymous route during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return null;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-redirect-missing'),
    ).toBe(true);
  });

  it('flags protected session-aware files that render protected shells inside loading branches during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <DashboardShell path="/dashboard" pendingSession={session} />;
          }

          if (!session) {
            return redirect('/login');
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth/session loading branches that return nothing during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return null;
          }

          if (!session) {
            return redirect('/login');
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-blank-render'),
    ).toBe(true);
  });

  it('flags auth/session loading branches that redirect to anonymous routes during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return redirect('/login');
          }

          if (!session) {
            return redirect('/login');
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-anonymous-redirect'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still render protected shells during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <DashboardShell path="/dashboard" />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags protected-looking unauthenticated shell renders even without explicit route props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <DashboardShell />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags protected-looking unauthenticated child renders even without explicit route props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <DashboardSummary />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still return outlet-like protected content during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Outlet />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that pass auth-scoped props into generic components during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <SummaryPanel currentUser={session?.user} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that pass auth-scoped props into generic components during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <SummaryPanel currentUser={session?.user} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still interpolate auth-scoped data into generic jsx during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <section>{session?.user?.email}</section>;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still interpolate auth-scoped data into generic jsx during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <section>{session?.user?.email}</section>;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose protected route links inside generic markup during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return (
              <section>
                <a href="/dashboard">Continue to dashboard</a>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose protected route links inside generic markup during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section>
                <a href="/dashboard">Continue to dashboard</a>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose protected route actions inside generic markup during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return (
              <section>
                <button onClick={() => navigate('/dashboard')}>Continue to dashboard</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose protected route actions inside generic markup during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section>
                <button onClick={() => navigate('/dashboard')}>Continue to dashboard</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose protected form actions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return (
              <section>
                <form action="/dashboard">
                  <button type="submit">Continue to dashboard</button>
                </form>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose protected form actions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section>
                <form action="/dashboard">
                  <button type="submit">Continue to dashboard</button>
                </form>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose protected browser redirects inside generic markup during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return (
              <section>
                <button onClick={() => window.location.assign('/dashboard')}>Continue to dashboard</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose protected browser redirects inside generic markup during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section>
                <button onClick={() => window.location.assign('/dashboard')}>Continue to dashboard</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still stash protected hidden redirects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return (
              <section>
                <input type="hidden" name="redirectTo" value="/dashboard" />
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still stash protected hidden redirects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section>
                <input type="hidden" name="redirectTo" value="/dashboard" />
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still stash protected redirect metadata during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return (
              <section data-redirect="/dashboard">
                <p>Loading account context...</p>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still stash protected redirect metadata during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section data-next="/dashboard">
                <p>Sign in again.</p>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still pass protected redirect props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard redirectTo="/dashboard" />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still pass protected redirect props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard returnTo="/dashboard" />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still pass protected redirect object props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard state={{ redirectTo: '/dashboard' }} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still pass protected redirect object props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard options={{ returnTo: '/dashboard' }} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still pass protected generic route objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard config={{ to: '/dashboard' }} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still pass protected generic route objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard config={{ path: '/dashboard' }} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still serialize protected route payloads during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard payload={JSON.stringify({ redirectTo: '/dashboard' })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still serialize protected route payloads during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard payload={JSON.stringify({ path: '/dashboard' })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still encode protected route payloads with URLSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard payload={new URLSearchParams({ next: '/dashboard' }).toString()} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose raw URLSearchParams next payload objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard payload={new URLSearchParams({ next: '/dashboard' })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still encode protected route payloads with URLSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard payload={new URLSearchParams({ path: '/dashboard' }).toString()} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose raw URLSearchParams route payload objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard payload={new URLSearchParams({ path: '/dashboard' })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still encode protected route payloads with createSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard payload={createSearchParams({ next: '/dashboard' }).toString()} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still encode protected route payloads with createSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard payload={createSearchParams({ path: '/dashboard' }).toString()} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose raw createSearchParams route payload objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard payload={createSearchParams({ next: '/dashboard' })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose raw createSearchParams path payload objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard payload={createSearchParams({ path: '/dashboard' })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still encode auth-scoped payloads with JSON.stringify during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard payload={JSON.stringify({ label: session?.user?.email })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still encode auth-scoped payloads with createSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();
          const currentUser = session?.user;

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard payload={createSearchParams({ email: currentUser?.email }).toString()} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose raw createSearchParams auth payload objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();
          const currentUser = session?.user;

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard payload={createSearchParams({ email: currentUser?.email })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose URLSearchParams payload objects in route arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ payload: new URLSearchParams({ next: '/dashboard' }), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose raw URLSearchParams route payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ payload: new URLSearchParams({ path: '/dashboard' }), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose direct URLSearchParams auth payload objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();
          const currentUser = session?.user;

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard payload={new URLSearchParams({ email: currentUser?.email })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose raw URLSearchParams auth payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ payload: new URLSearchParams({ email: session?.user?.email }), href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose raw URLSearchParams auth payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();
          const currentUser = session?.user;

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ payload: new URLSearchParams({ email: currentUser?.email }), href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose raw URLSearchParams auth payload objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <StatusCard payload={new URLSearchParams({ email: session?.user?.email })} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose protected route props through JSX expressions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Navigate to={'/dashboard'} replace />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose protected route arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ to: '/dashboard', label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose helper-generated protected route arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { generatePath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ to: generatePath('/dashboard'), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose helper-prop route arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ redirectTo: '/dashboard', label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose nested redirect state arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ state: { redirectTo: '/dashboard' }, label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose serialized redirect payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ payload: JSON.stringify({ redirectTo: '/dashboard' }), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose auth-scoped data arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ label: session?.user?.email, href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose nested auth-scoped data arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ meta: { label: session?.user?.email }, href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose encoded auth-scoped payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ payload: JSON.stringify({ label: session?.user?.email }), href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose protected helper props through JSX expressions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard redirectTo={\`/dashboard\`} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose protected route arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ href: '/dashboard', label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose helper-generated protected route arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createPath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ pathname: createPath({ pathname: '/dashboard' }), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose helper-generated helper-prop route arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { generatePath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ returnTo: generatePath('/dashboard'), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose nested redirect state arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ options: { returnTo: '/dashboard' }, label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose encoded redirect payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ payload: createSearchParams({ path: '/dashboard' }).toString(), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose raw createSearchParams route payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ payload: createSearchParams({ path: '/dashboard' }), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose raw createSearchParams next payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <QuickNav items={[{ payload: createSearchParams({ next: '/dashboard' }), label: 'Dashboard' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose auth-scoped data arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();
          const currentUser = session?.user;

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ label: currentUser?.email, href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose nested auth-scoped data arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();
          const currentUser = session?.user;

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ details: { subtitle: currentUser?.email }, href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose encoded auth-scoped payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();
          const currentUser = session?.user;

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ payload: createSearchParams({ email: currentUser?.email }).toString(), href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose raw createSearchParams auth payload arrays during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createSearchParams } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();
          const currentUser = session?.user;

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <Sidebar links={[{ payload: createSearchParams({ email: currentUser?.email }), href: '/login' }]} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose protected route objects through pathname props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Navigate to={{ pathname: '/dashboard' }} replace />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose protected route objects through pathname props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard redirect={{ pathname: '/dashboard' }} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose protected route objects through callback navigation during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return (
              <section>
                <button onClick={() => navigate({ pathname: '/dashboard' })}>Continue</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose protected route objects through callback navigation during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section>
                <button onClick={() => navigate({ pathname: '/dashboard' })}>Continue</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose helper-generated protected route props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { generatePath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Navigate to={generatePath('/dashboard')} replace />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose helper-generated protected route props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { generatePath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return <StatusCard redirectTo={generatePath('/dashboard')} />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose helper-generated protected callback destinations during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createPath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return (
              <section>
                <button onClick={() => navigate(createPath({ pathname: '/dashboard' }))}>Continue</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose helper-generated protected callback destinations during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createPath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section>
                <button onClick={() => navigate(createPath({ pathname: '/dashboard' }))}>Continue</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('flags auth-loading branches that still expose helper-generated protected route objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { generatePath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Navigate to={{ pathname: generatePath('/dashboard') }} replace />;
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-loading-protected-render'),
    ).toBe(true);
  });

  it('flags unauthenticated branches that still expose helper-generated protected route objects through callback navigation during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGate.tsx',
      code: `
        import { createPath } from 'react-router-dom';

        export function DashboardGate() {
          const { status, data: session } = useSession();

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return (
              <section>
                <button onClick={() => navigate({ pathname: createPath({ pathname: '/dashboard' }) })}>Continue</button>
              </section>
            );
          }

          return <DashboardShell session={session} path="/dashboard" />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology', 'state-handling'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-session-loss-protected-render'),
    ).toBe(true);
  });

  it('does not flag auth entry flows when success transitions into the protected app during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginPage.tsx',
      code: `
        export function LoginPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signIn();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login', 'dashboard'], patternIds: ['form', 'panel'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-success-redirect-missing'),
    ).toBe(false);
  });

  it('does not flag auth/session critique files when loading and error states are present', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGuard.tsx',
      code: `
        export function DashboardGuard() {
          const { data: session, status } = useSession();
          const [errorMessage, setErrorMessage] = useState('');

          async function handleRefresh() {
            try {
              await auth.refresh();
            } catch (error) {
              setErrorMessage(String(error));
            }
          }

          if (status === 'loading') {
            return <Spinner />;
          }

          if (!session) {
            return redirect('/login');
          }

          return (
            <>
              {errorMessage ? <p role="alert">{errorMessage}</p> : null}
              <button onClick={handleRefresh}>Refresh</button>
              <Dashboard />
            </>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['panel'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] }],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'state-auth-loading-missing')).toBe(
      false,
    );
    expect(report.findings.some((finding) => finding.id === 'state-auth-error-missing')).toBe(
      false,
    );
  });

  it('flags recovery critique files that omit a visible success confirmation', () => {
    const report = critiqueSource({
      filePath: 'src/routes/ForgotPasswordPage.tsx',
      code: `
        export function ForgotPasswordPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await requestPasswordReset();
            return redirect('/login');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <button type="submit">Reset password</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['forgot-password'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'forgot-password', path: '/forgot-password', patternIds: ['form'] }],
          focusAreas: ['state-handling', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-recovery-success-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'route-auth-success-redirect-missing'),
    ).toBe(false);
  });

  it('does not flag recovery critique files when confirmation state is present', () => {
    const report = critiqueSource({
      filePath: 'src/routes/ForgotPasswordPage.tsx',
      code: `
        export function ForgotPasswordPage() {
          const [successMessage, setSuccessMessage] = useState('');

          async function handleSubmit(event) {
            event.preventDefault();
            await requestPasswordReset();
            setSuccessMessage('Check your email');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              {successMessage ? <p role="status">{successMessage}</p> : null}
              <button type="submit">Reset password</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['forgot-password'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'forgot-password', path: '/forgot-password', patternIds: ['form'] }],
          focusAreas: ['state-handling', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-recovery-success-missing'),
    ).toBe(false);
    expect(
      report.findings.some((finding) => finding.id === 'route-auth-success-redirect-missing'),
    ).toBe(false);
  });

  it('flags registration critique files that show neither success state nor protected transition', () => {
    const report = critiqueSource({
      filePath: 'src/routes/RegisterPage.tsx',
      code: `
        export function RegisterPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await createAccount();
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="new-password" />
              <button type="submit">Create account</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['register', 'dashboard'], patternIds: ['form', 'panel'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'register', path: '/register', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['state-handling', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-registration-success-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'route-auth-success-redirect-missing'),
    ).toBe(false);
  });

  it('does not flag registration critique files when they transition into the protected app', () => {
    const report = critiqueSource({
      filePath: 'src/routes/RegisterPage.tsx',
      code: `
        export function RegisterPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await createAccount();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="new-password" />
              <button type="submit">Create account</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['register', 'dashboard'], patternIds: ['form', 'panel'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'register', path: '/register', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['state-handling', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'state-auth-registration-success-missing'),
    ).toBe(false);
    expect(
      report.findings.some((finding) => finding.id === 'route-auth-success-redirect-missing'),
    ).toBe(false);
  });

  it('flags auth inputs that disable autocomplete during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form method="post">
              <input type="email" name="email" autoComplete="off" />
              <input type="password" name="password" autoComplete="off" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-autocomplete-missing'),
    ).toBe(true);
  });

  it('flags auth inputs whose autocomplete values do not match the field purpose during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form method="post">
              <input type="email" name="email" autoComplete="current-password" />
              <input type="password" name="password" autoComplete="email" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-autocomplete-missing'),
    ).toBe(true);
  });

  it('flags auth inputs with semantic type mismatches during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form method="post">
              <input type="text" name="email" autoComplete="email" />
              <input type="text" name="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-autocomplete-missing'),
    ).toBe(true);
  });

  it('flags unlabeled form controls during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form>
              <input type="email" placeholder="Email" />
              <label>
                Password
                <input type="password" />
              </label>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/', patternIds: ['form'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-form-control-label-missing'),
    ).toBe(true);
  });

  it('flags placeholder navigation targets during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/NavLinks.tsx',
      code: `
        export function NavLinks() {
          return (
            <nav>
              <a href="#">Overview</a>
              <Link to="javascript:void(0)">Settings</Link>
            </nav>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['overview', 'settings'], patternIds: ['nav'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [
            { pageId: 'overview', path: '/', patternIds: ['nav'] },
            { pageId: 'settings', path: '/settings', patternIds: ['nav'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-placeholder-navigation-target'),
    ).toBe(true);
  });

  it('flags auth inputs without autocomplete hints during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AuthForm.tsx',
      code: `
        export function AuthForm() {
          return (
            <form>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" />
              <label htmlFor="password">Password</label>
              <input id="password" type="password" />
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/', patternIds: ['form'] }],
          focusAreas: ['accessibility', 'security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-autocomplete-missing'),
    ).toBe(true);
  });

  it('flags OTP inputs without one-time-code autocomplete during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/VerifyCodeForm.tsx',
      code: `
        export function VerifyCodeForm() {
          return (
            <form method="post">
              <label htmlFor="verification-code">Verification code</label>
              <input id="verification-code" name="verificationCode" type="text" />
              <button type="submit">Verify</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['verify'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'verify', path: '/verify', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-autocomplete-missing'),
    ).toBe(true);
  });

  it('accepts OTP inputs with one-time-code autocomplete during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/VerifyCodeForm.tsx',
      code: `
        export function VerifyCodeForm() {
          return (
            <form method="post">
              <label htmlFor="verification-code">Verification code</label>
              <input
                id="verification-code"
                name="verificationCode"
                type="text"
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              <button type="submit">Verify</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['verify'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'verify', path: '/verify', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-autocomplete-missing'),
    ).toBe(false);
  });

  it('flags buttons inside forms that omit an explicit type', () => {
    const report = critiqueSource({
      filePath: 'src/components/ProfileForm.tsx',
      code: `
        export function ProfileForm() {
          return (
            <form>
              <button>Open help</button>
              <button type="submit">Save</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['profile'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'profile', path: '/profile', patternIds: ['form'] }],
          focusAreas: ['motion-interaction'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'interaction-button-type-missing'),
    ).toBe(true);
  });

  it('flags auth-like credential writes into browser storage during critique', () => {
    const report = critiqueSource({
      filePath: 'src/lib/session.ts',
      code: `
        export function persistSession(token: string) {
          localStorage.setItem('auth_token', token);
          sessionStorage.jwt = token;
          document.cookie = \`auth_token=\${token}; path=/\`;
          fetch('/api/me', { headers: { Authorization: \`Bearer \${token}\` } });
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'security-auth-storage-write')).toBe(
      true,
    );
    expect(report.findings.some((finding) => finding.id === 'security-auth-cookie-write')).toBe(
      true,
    );
    expect(report.findings.some((finding) => finding.id === 'security-auth-header-write')).toBe(
      true,
    );
  });

  it('flags hardcoded secret literals and client-exposed secret env references during critique', () => {
    const report = critiqueSource({
      filePath: 'src/app/login/page.tsx',
      code: `
        'use client';

        const leaked = "sk_live_1234567890";
        const serviceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

        export default function LoginPage() {
          return <button>Continue</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-hardcoded-secret-literal'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'security-client-secret-env-reference'),
    ).toBe(true);
  });

  it('flags wildcard postMessage target origins during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/EmbedBridge.tsx',
      code: `
        export function EmbedBridge() {
          function sendReady(payload: unknown) {
            window.parent.postMessage({ type: 'ready', payload }, '*');
          }

          return <button onClick={() => sendReady({ ok: true })}>Send</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-postmessage-wildcard-origin'),
    ).toBe(true);
  });

  it('flags imperative new-tab opens without noopener protections during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/OpenDocs.tsx',
      code: `
        export function OpenDocs() {
          return (
            <button
              onClick={() => {
                window.open('https://example.com/docs', '_blank');
              }}
            >
              Open docs
            </button>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-window-open-noopener-missing'),
    ).toBe(true);
  });

  it('flags message listeners that do not validate event origin during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/InboundBridge.tsx',
      code: `
        export function InboundBridge() {
          window.addEventListener('message', (event) => {
            if (event.data?.type === 'sync') {
              console.log(event.data.payload);
            }
          });

          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'security-message-listener-origin-check-missing',
      ),
    ).toBe(true);
  });

  it('flags auth cookies that are set without explicit hardening during critique', () => {
    const report = critiqueSource({
      filePath: 'src/server/session.ts',
      code: `
        export async function issueSession(cookies, token) {
          cookies.set('session_token', token, {
            secure: true,
          });
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-cookie-hardening-missing'),
    ).toBe(true);
  });

  it('flags insecure realtime transport constructors during critique', () => {
    const report = critiqueSource({
      filePath: 'src/lib/socket.ts',
      code: `
        export function connectRealtime() {
          return new WebSocket('ws://example.com/live');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-transport-endpoint-insecure'),
    ).toBe(true);
  });

  it('flags under-hardened auth set-cookie headers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/server/route.ts',
      code: `
        export function issueSession(res, token) {
          res.setHeader('Set-Cookie', 'session_token=' + token + '; Path=/; Secure');
          return res;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-cookie-hardening-missing'),
    ).toBe(true);
  });
});
