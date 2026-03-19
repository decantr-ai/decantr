/**
 * E2E Audit Action Plan Generator
 *
 * Transforms E2E scaffold test findings into actionable prompts
 * for improving the decantr registry.
 */

import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { classifyGap } from './gap-classifier.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Generate an action plan from validation report
 * @param {Object} options
 * @param {string} options.projectDir - Project directory path
 * @param {string} options.testId - Corpus test ID (optional)
 * @param {Object} options.report - Validation report { gaps, violations, essence }
 * @param {string} options.originalPrompt - Original scaffolding prompt (optional)
 * @returns {Promise<string>} Markdown action plan
 */
export async function generateActionPlan({ projectDir, testId, report, originalPrompt }) {
  const { gaps, violations } = report;

  // 1. Classify gaps
  const classifiedGaps = await Promise.all(
    gaps.map(gap => classifyGap(gap, projectDir))
  );

  // 2. Group by action type
  const groupedGaps = groupByType(classifiedGaps);
  const groupedViolations = groupViolations(violations);

  // 3. Load prompt templates
  const templates = await loadTemplates();

  // 4. Generate sections
  const context = { projectDir, testId, originalPrompt };
  const sections = {
    violations: generateViolationSections(groupedViolations, templates, context),
    components: generateGapSections(groupedGaps.component || [], 'promote-component', templates, context),
    patterns: generateGapSections(groupedGaps.pattern || [], 'promote-pattern', templates, context),
    presets: generateGapSections(groupedGaps.preset || [], 'add-preset', templates, context),
    archetypes: generateGapSections(groupedGaps.archetype || [], 'new-archetype', templates, context),
  };

  // 5. Assemble markdown
  return assembleMarkdown({ testId, projectDir, sections, originalPrompt });
}

/**
 * Group gaps by classification type
 */
function groupByType(gaps) {
  return gaps.reduce((acc, gap) => {
    const type = gap.classification?.type || 'component';
    acc[type] = acc[type] || [];
    acc[type].push(gap);
    return acc;
  }, {});
}

/**
 * Group violations by rule
 */
function groupViolations(violations) {
  return violations.reduce((acc, v) => {
    acc[v.rule] = acc[v.rule] || [];
    acc[v.rule].push(v);
    return acc;
  }, {});
}

/**
 * Load prompt templates from prompts/ directory
 */
async function loadTemplates() {
  const promptsDir = join(__dirname, 'prompts');
  const templates = {};

  try {
    const files = await readdir(promptsDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const name = file.replace('.md', '');
        templates[name] = await readFile(join(promptsDir, file), 'utf-8');
      }
    }
  } catch {
    // prompts/ directory doesn't exist or is empty
  }

  return templates;
}

/**
 * Fill template placeholders
 */
function fillTemplate(template, vars) {
  if (!template) return '';

  let result = template;

  // Handle {{> _base}} partial inclusion
  if (result.includes('{{> _base}}') && vars._baseTemplate) {
    result = result.replace('{{> _base}}', vars._baseTemplate);
  }

  // Replace all {{placeholder}} patterns
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value ?? '');
  }

  return result;
}

/**
 * Generate violation sections with prompts
 */
function generateViolationSections(grouped, templates, context) {
  return Object.entries(grouped).map(([rule, violations], idx) => {
    // Choose appropriate template
    let templateKey;
    if (rule === 'use-atoms' || rule === 'no-inline-css') {
      templateKey = 'fix-atoms';
    } else if (rule === 'valid-imports' || rule === 'no-foreign-frameworks') {
      templateKey = 'fix-imports';
    } else {
      templateKey = 'fix-atoms'; // fallback
    }

    const template = templates[templateKey] || templates['_base'] || '';
    const baseTemplate = templates['_base'] || '';

    const prompt = fillTemplate(template, {
      ...context,
      _baseTemplate: fillTemplate(baseTemplate, context),
      rule,
      files: violations.map(v => v.file).join(', '),
      count: violations.length,
      examples: violations.slice(0, 5).map(v => `- ${v.file}: ${v.message}`).join('\n'),
    });

    return {
      id: `V${idx + 1}`,
      rule,
      severity: violations[0]?.severity || 'warning',
      files: [...new Set(violations.map(v => v.file))],
      count: violations.length,
      prompt,
    };
  });
}

/**
 * Generate gap sections with prompts
 */
function generateGapSections(gaps, templateKey, templates, context) {
  return gaps.map((gap, idx) => {
    const template = templates[templateKey] || templates['_base'] || '';
    const baseTemplate = templates['_base'] || '';

    const prompt = fillTemplate(template, {
      ...context,
      _baseTemplate: fillTemplate(baseTemplate, context),
      gapName: gap.name,
      gapType: gap.classification?.type,
      gapCode: gap.sourceCode ? truncateCode(gap.sourceCode, 100) : '(source not available)',
      confidence: gap.classification?.confidence,
      reason: gap.classification?.reason,
      location: gap.location,
    });

    return {
      id: `G${idx + 1}`,
      name: gap.name,
      type: gap.classification?.type,
      confidence: gap.classification?.confidence,
      reason: gap.classification?.reason,
      location: gap.location,
      lineCount: gap.lineCount,
      prompt,
    };
  });
}

/**
 * Truncate code to max lines
 */
function truncateCode(code, maxLines) {
  const lines = code.split('\n');
  if (lines.length <= maxLines) return code;
  return lines.slice(0, maxLines).join('\n') +
    `\n\n... (truncated, ${lines.length - maxLines} more lines - see full file)`;
}

/**
 * Assemble final markdown document
 */
function assembleMarkdown({ testId, projectDir, sections, originalPrompt }) {
  const date = new Date().toISOString().split('T')[0];

  const summary = [
    ['Violations', sections.violations.length, 'Fix'],
    ['Gaps -> Components', sections.components.length, 'Promote'],
    ['Gaps -> Patterns', sections.patterns.length, 'Promote'],
    ['Gaps -> Presets', sections.presets.length, 'Add'],
    ['Gaps -> Archetypes', sections.archetypes.length, 'Create'],
  ].filter(([_, count]) => count > 0);

  let md = `# E2E Audit Action Plan
**Test:** ${testId || 'manual'} | **Date:** ${date} | **Project:** ${projectDir}

`;

  if (originalPrompt) {
    md += `**Original prompt:** "${originalPrompt}"\n\n`;
  }

  md += `## Summary
| Type | Count | Action |
|------|-------|--------|
${summary.map(([type, count, action]) => `| ${type} | ${count} | ${action} |`).join('\n')}

---
`;

  // Violations section
  if (sections.violations.length > 0) {
    md += `\n## 1. Violations (Fix First)\n\n`;
    for (const v of sections.violations) {
      md += `### [${v.id}] ${v.rule}\n`;
      md += `- **Severity:** ${v.severity}\n`;
      md += `- **Files:** ${v.files.join(', ')}\n`;
      md += `- **Count:** ${v.count} occurrences\n\n`;
      md += `<details>\n<summary>Prompt: Fix ${v.rule}</summary>\n\n${v.prompt}\n\n</details>\n\n`;
      md += `- [ ] Fixed\n\n---\n`;
    }
  }

  // Gap sections
  const gapSections = [
    ['2', 'Components', sections.components, 'Promote to component'],
    ['3', 'Patterns', sections.patterns, 'Promote to pattern'],
    ['4', 'Presets', sections.presets, 'Add as preset'],
    ['5', 'Archetypes', sections.archetypes, 'Create archetype'],
  ];

  for (const [num, title, items, action] of gapSections) {
    if (items.length === 0) continue;

    md += `\n## ${num}. Gaps -> ${title}\n\n`;
    for (const g of items) {
      md += `### [${g.id}] ${g.name} -> ${g.type}\n`;
      md += `- **Classification:** ${g.type} (${g.confidence} confidence)\n`;
      md += `- **Reason:** ${g.reason}\n`;
      md += `- **Source:** ${g.location} (${g.lineCount} lines)\n\n`;
      md += `<details>\n<summary>Prompt: ${action}</summary>\n\n${g.prompt}\n\n</details>\n\n`;
      md += `- [ ] Promoted\n\n---\n`;
    }
  }

  if (summary.length === 0) {
    md += `\n## No Issues Found\n\nThe scaffolded project has no gaps or violations to address.\n`;
  }

  return md;
}
