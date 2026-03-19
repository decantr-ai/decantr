/**
 * E2E Scaffold Test Runner
 *
 * Spawns Claude Code sessions to execute scaffolding prompts,
 * captures all tool calls, outputs, and metrics.
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, 'fixtures', 'base-projects');
const DECANTR_ROOT = join(__dirname, '..', '..');

// ─── Session Types ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} RunResult
 * @property {string} id - Test ID
 * @property {'success'|'error'|'timeout'} status
 * @property {string} projectDir - Path to generated project
 * @property {Object} tokens - Token usage { input, output, total }
 * @property {number} duration - Execution time in ms
 * @property {Array} toolCalls - All tool calls made
 * @property {Array} filesWritten - Files created/modified
 * @property {Array} gaps - Detected framework gaps
 * @property {Array} violations - Compliance violations
 * @property {Array} observations - LLM observations/decisions
 * @property {string} conversationLog - Full conversation
 * @property {Object|null} essence - Generated essence.json
 * @property {Object|null} config - Generated config.json
 */

// ─── Project Setup ───────────────────────────────────────────────────────────

async function setupProject(entry, outputDir) {
  const projectDir = join(outputDir, 'project');
  await mkdir(projectDir, { recursive: true });

  // For modification tests, copy base project
  if (entry.baseProject) {
    const baseDir = join(FIXTURES_DIR, entry.baseProject);
    if (existsSync(baseDir)) {
      await cp(baseDir, projectDir, { recursive: true });
    } else {
      // Generate base project first
      await generateBaseProject(entry.baseProject, projectDir);
    }
  } else {
    // Cold-start: create minimal structure
    await mkdir(join(projectDir, 'src'), { recursive: true });
    await mkdir(join(projectDir, 'public'), { recursive: true });

    // Create minimal package.json
    await writeFile(
      join(projectDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '0.0.0',
        type: 'module',
        dependencies: {
          decantr: `file:${DECANTR_ROOT}`,
        },
      }, null, 2)
    );
  }

  return projectDir;
}

async function generateBaseProject(archetype, projectDir) {
  // Use decantr init to scaffold base project
  // This is a simplified version - real impl would call the init command
  const essences = {
    'saas-dashboard': {
      version: '1.0.0',
      terroir: 'saas-dashboard',
      vintage: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism', shape: 'rounded' },
      character: ['professional', 'data-rich'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [
        { id: 'overview', skeleton: 'sidebar-main', blend: ['kpi-grid', 'chart-grid'] },
        { id: 'analytics', skeleton: 'sidebar-main', blend: ['chart-grid', 'data-table'] },
        { id: 'users', skeleton: 'sidebar-main', blend: ['filter-bar', 'data-table'] },
      ],
      tannins: ['auth', 'mock-data'],
      cork: { enforce_style: true, enforce_recipe: true, mode: 'maintenance' },
    },
    'portfolio': {
      version: '1.0.0',
      terroir: 'portfolio',
      vintage: { style: 'glassmorphism', mode: 'dark', recipe: 'glassmorphism', shape: 'rounded' },
      character: ['creative', 'minimal'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [
        { id: 'home', skeleton: 'full-bleed', blend: ['hero', 'card-grid'] },
        { id: 'projects', skeleton: 'top-nav-main', blend: ['card-grid'] },
        { id: 'about', skeleton: 'top-nav-main', blend: ['article-content'] },
      ],
      tannins: ['analytics'],
      cork: { enforce_style: true, mode: 'maintenance' },
    },
    'content-site': {
      version: '1.0.0',
      terroir: 'content-site',
      vintage: { style: 'clean', mode: 'light', recipe: 'clean', shape: 'rounded' },
      character: ['editorial', 'readable'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [
        { id: 'home', skeleton: 'top-nav-main', blend: ['hero', 'card-grid'] },
        { id: 'articles', skeleton: 'top-nav-main', blend: ['card-grid'] },
        { id: 'article-detail', skeleton: 'top-nav-main', blend: ['article-content'] },
      ],
      tannins: ['search'],
      cork: { enforce_style: true, mode: 'maintenance' },
    },
    'ecommerce': {
      version: '1.0.0',
      terroir: 'ecommerce',
      vintage: { style: 'clean', mode: 'light', recipe: 'clean', shape: 'rounded' },
      character: ['commercial', 'trustworthy'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [
        { id: 'home', skeleton: 'top-nav-main', blend: ['hero', 'card-grid'] },
        { id: 'catalog', skeleton: 'top-nav-main', blend: ['filter-bar', 'card-grid'] },
        { id: 'product-detail', skeleton: 'top-nav-main', blend: ['detail-header'] },
        { id: 'cart', skeleton: 'top-nav-main', blend: ['checklist-card'] },
      ],
      tannins: ['cart', 'auth', 'search'],
      cork: { enforce_style: true, mode: 'maintenance' },
    },
    'docs-explorer': {
      version: '1.0.0',
      terroir: 'docs-explorer',
      vintage: { style: 'clean', mode: 'auto', recipe: 'clean', shape: 'sharp' },
      character: ['technical', 'organized'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [
        { id: 'home', skeleton: 'sidebar-main', blend: ['article-content'] },
        { id: 'docs', skeleton: 'sidebar-main', blend: ['article-content'] },
      ],
      tannins: ['search', 'version-selector'],
      cork: { enforce_style: true, mode: 'maintenance' },
    },
  };

  const essence = essences[archetype];
  if (essence) {
    await writeFile(
      join(projectDir, 'decantr.essence.json'),
      JSON.stringify(essence, null, 2)
    );
  }

  // Create minimal app.js
  await writeFile(
    join(projectDir, 'src', 'app.js'),
    `// Placeholder - will be scaffolded
import { mount } from 'decantr/core';
mount(document.getElementById('app'), () => 'Hello');
`
  );

  // Create index.html
  await writeFile(
    join(projectDir, 'public', 'index.html'),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Project</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/app.js"></script>
</body>
</html>
`
  );
}

// ─── Claude Session ──────────────────────────────────────────────────────────

async function runClaudeSession(projectDir, prompt, options) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const chunks = [];
    const toolCalls = [];
    const filesWritten = [];
    let tokens = { input: 0, output: 0, total: 0 };

    // Build the full prompt with context
    const fullPrompt = options.baseProject
      ? `I have an existing Decantr project. ${prompt}`
      : `Create a new Decantr project: ${prompt}`;

    // Spawn Claude Code process
    // In practice, this would use the Claude API directly or claude-code CLI
    const child = spawn('claude', [
      '--print',
      '--output-format', 'json',
      '--model', options.model,
      '--cwd', projectDir,
      fullPrompt,
    ], {
      cwd: projectDir,
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      },
      timeout: options.timeout,
    });

    child.stdout.on('data', (data) => {
      chunks.push(data);
      // Parse streaming JSON for tool calls
      try {
        const lines = data.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          const event = JSON.parse(line);
          if (event.type === 'tool_use') {
            toolCalls.push({
              name: event.name,
              input: event.input,
              timestamp: Date.now() - startTime,
            });
            if (['Write', 'Edit'].includes(event.name)) {
              filesWritten.push(event.input.file_path);
            }
          }
          if (event.type === 'usage') {
            tokens = {
              input: event.input_tokens || 0,
              output: event.output_tokens || 0,
              total: (event.input_tokens || 0) + (event.output_tokens || 0),
            };
          }
        }
      } catch {
        // Non-JSON output, ignore
      }
    });

    let stderr = '';
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const output = Buffer.concat(chunks).toString();

      if (code !== 0) {
        resolve({
          status: 'error',
          error: stderr || `Exit code ${code}`,
          duration,
          tokens,
          toolCalls,
          filesWritten,
          conversationLog: output,
        });
      } else {
        resolve({
          status: 'success',
          duration,
          tokens,
          toolCalls,
          filesWritten,
          conversationLog: output,
        });
      }
    });

    child.on('error', (err) => {
      resolve({
        status: 'error',
        error: err.message,
        duration: Date.now() - startTime,
        tokens,
        toolCalls,
        filesWritten,
      });
    });

    // Timeout handling
    setTimeout(() => {
      child.kill();
      resolve({
        status: 'timeout',
        duration: options.timeout,
        tokens,
        toolCalls,
        filesWritten,
      });
    }, options.timeout);
  });
}

// ─── Alternative: Direct API Runner ──────────────────────────────────────────

async function runDirectAPI(projectDir, prompt, options) {
  // For environments without claude-code CLI, use direct API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.model,
      max_tokens: 8192,
      system: await buildSystemPrompt(projectDir),
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    status: 'success',
    tokens: {
      input: data.usage?.input_tokens || 0,
      output: data.usage?.output_tokens || 0,
      total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
    toolCalls: [],
    filesWritten: [],
    conversationLog: JSON.stringify(data, null, 2),
    response: data,
  };
}

async function buildSystemPrompt(projectDir) {
  // Read CLAUDE.md
  const claudeMd = await readFile(join(DECANTR_ROOT, 'CLAUDE.md'), 'utf-8');

  // Read essence if exists
  let essence = null;
  const essencePath = join(projectDir, 'decantr.essence.json');
  if (existsSync(essencePath)) {
    essence = await readFile(essencePath, 'utf-8');
  }

  return `${claudeMd}

Current project directory: ${projectDir}
${essence ? `\nCurrent essence.json:\n${essence}` : ''}
`;
}

// ─── Post-Processing ─────────────────────────────────────────────────────────

async function analyzeResult(projectDir, sessionResult) {
  const gaps = [];
  const violations = [];
  const observations = [];

  // Check for generated essence
  let essence = null;
  const essencePath = join(projectDir, 'decantr.essence.json');
  if (existsSync(essencePath)) {
    try {
      essence = JSON.parse(await readFile(essencePath, 'utf-8'));
    } catch {
      violations.push({ rule: 'valid-essence', message: 'Invalid essence.json' });
    }
  }

  // Check for config
  let config = null;
  const configPath = join(projectDir, 'decantr.config.json');
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(await readFile(configPath, 'utf-8'));
    } catch {
      violations.push({ rule: 'valid-config', message: 'Invalid config.json' });
    }
  }

  // Analyze tool calls for patterns
  for (const call of sessionResult.toolCalls) {
    if (call.name === 'Write') {
      // Check for inline styles
      const content = call.input?.content || '';
      if (content.includes('style=') || content.includes('style:')) {
        violations.push({
          rule: 'no-inline-css',
          file: call.input?.file_path,
          message: 'Inline styles detected',
        });
      }

      // Check for pattern creation (gap detection)
      if (call.input?.file_path?.includes('src/patterns/')) {
        gaps.push({
          type: 'missing-pattern',
          name: call.input.file_path.split('/').pop().replace('.js', ''),
          workaround: 'created-local',
        });
      }

      // Check for component creation
      if (call.input?.file_path?.includes('src/components/') &&
          !call.input?.file_path?.includes('node_modules')) {
        gaps.push({
          type: 'missing-component',
          name: call.input.file_path.split('/').pop().replace('.js', ''),
          workaround: 'created-local',
        });
      }
    }
  }

  // Check conversation for observations
  const log = sessionResult.conversationLog || '';
  if (log.includes('not found') || log.includes('doesn\'t exist')) {
    observations.push({
      type: 'resource-not-found',
      context: 'LLM encountered missing resource',
    });
  }
  if (log.includes('ask') || log.includes('clarif')) {
    observations.push({
      type: 'asked-clarification',
      context: 'LLM requested user clarification',
    });
  }

  return {
    ...sessionResult,
    essence,
    config,
    gaps,
    violations,
    observations,
  };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Run a single scaffold test.
 *
 * @param {Object} entry - Corpus entry
 * @param {Object} options - Run options
 * @returns {Promise<RunResult>}
 */
export async function runTest(entry, options) {
  const { outputDir, model, timeout, verbose } = options;

  // Setup project directory
  const projectDir = await setupProject(entry, outputDir);

  if (verbose) {
    console.log(`  Project dir: ${projectDir}`);
  }

  // Run Claude session
  let sessionResult;
  try {
    // Try CLI first, fall back to direct API
    sessionResult = await runClaudeSession(projectDir, entry.prompt, {
      ...options,
      baseProject: entry.baseProject,
    });
  } catch (err) {
    if (verbose) {
      console.log(`  CLI failed, trying direct API: ${err.message}`);
    }
    sessionResult = await runDirectAPI(projectDir, entry.prompt, options);
  }

  // Analyze results
  const result = await analyzeResult(projectDir, sessionResult);

  // Save artifacts
  await writeFile(
    join(outputDir, 'session.json'),
    JSON.stringify(result, null, 2)
  );

  return {
    ...result,
    projectDir,
  };
}
