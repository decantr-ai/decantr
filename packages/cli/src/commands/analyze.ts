import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectProject, formatDetection } from '../detect.js';
import { scanRoutes } from '../analyzers/routes.js';
import { scanComponents } from '../analyzers/components.js';
import { scanStyling } from '../analyzers/styling.js';
import { scanLayout } from '../analyzers/layout.js';
import { scanFeatures } from '../analyzers/features.js';
import { scanDependencies } from '../analyzers/dependencies.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

export function cmdAnalyze(projectRoot: string = process.cwd()): void {
  console.log(`\n${BOLD}Analyzing project...${RESET}\n`);

  // 1. Detect project basics
  const project = detectProject(projectRoot);
  console.log(`${DIM}Detected:${RESET} ${formatDetection(project).split('\n').join(', ')}`);

  // 2. Run all scanners
  console.log(`${DIM}Scanning routes...${RESET}`);
  const routes = scanRoutes(projectRoot);

  console.log(`${DIM}Scanning components...${RESET}`);
  const components = scanComponents(projectRoot);

  console.log(`${DIM}Scanning styling...${RESET}`);
  const styling = scanStyling(projectRoot);

  console.log(`${DIM}Scanning layout...${RESET}`);
  const layout = scanLayout(projectRoot);

  console.log(`${DIM}Scanning features...${RESET}`);
  const features = scanFeatures(projectRoot);

  console.log(`${DIM}Scanning dependencies...${RESET}`);
  const dependencies = scanDependencies(projectRoot);

  // 3. Combine into analysis object
  const analysis = {
    version: 1,
    analyzedAt: new Date().toISOString(),
    project: {
      framework: project.framework,
      frameworkVersion: project.version ?? null,
      packageManager: project.packageManager,
      hasTypeScript: project.hasTypeScript,
      hasTailwind: project.hasTailwind,
    },
    routes,
    components,
    styling,
    layout,
    features,
    dependencies,
  };

  // 4. Write to .decantr/analysis.json
  const decantrDir = join(projectRoot, '.decantr');
  if (!existsSync(decantrDir)) {
    mkdirSync(decantrDir, { recursive: true });
  }
  const outputPath = join(decantrDir, 'analysis.json');
  writeFileSync(outputPath, JSON.stringify(analysis, null, 2) + '\n', 'utf-8');

  // 5. Print summary
  console.log(`\n${GREEN}Analysis complete.${RESET}\n`);

  console.log(`${BOLD}Summary${RESET}`);
  console.log(`  Framework:    ${CYAN}${project.framework}${project.version ? ` ${project.version}` : ''}${RESET}`);
  console.log(`  Router:       ${routes.strategy}`);
  console.log(`  Routes:       ${routes.routes.length}`);
  console.log(`  Pages:        ${components.pageCount}`);
  console.log(`  Components:   ${components.componentCount}`);
  console.log(`  Styling:      ${styling.approach}${styling.configFile ? ` (${styling.configFile})` : ''}`);
  console.log(`  CSS vars:     ${styling.cssVariables.length}`);
  console.log(`  Dark mode:    ${styling.darkMode ? 'yes' : 'no'}`);
  console.log(`  Shell:        ${layout.shellPattern}`);
  console.log(`  Features:     ${features.detected.length > 0 ? features.detected.join(', ') : 'none detected'}`);

  const depCounts = [
    dependencies.ui.length && `${dependencies.ui.length} ui`,
    dependencies.auth.length && `${dependencies.auth.length} auth`,
    dependencies.db.length && `${dependencies.db.length} db`,
    dependencies.state.length && `${dependencies.state.length} state`,
    dependencies.styling.length && `${dependencies.styling.length} styling`,
  ].filter(Boolean).join(', ');
  console.log(`  Dependencies: ${depCounts || 'none categorized'}`);

  console.log(`\n${DIM}Written to:${RESET} ${outputPath}`);
  console.log(`\n${YELLOW}Next step:${RESET} Ask your AI assistant to read ${BOLD}.decantr/analysis.json${RESET} and set up Decantr\n`);
}
