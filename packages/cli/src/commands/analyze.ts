import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { scanAmbientContext } from '../ambient-context.js';
import { scanComponents } from '../analyzers/components.js';
import { scanDependencies } from '../analyzers/dependencies.js';
import { scanFeatures } from '../analyzers/features.js';
import { scanLayout } from '../analyzers/layout.js';
import { scanRoutes } from '../analyzers/routes.js';
import { scanStyling } from '../analyzers/styling.js';
import { writeBrownfieldIntelligenceArtifacts } from '../brownfield-intelligence.js';
import {
  createBrownfieldProposal,
  generateBrownfieldReport,
  writeBrownfieldProposal,
} from '../brownfield-proposal.js';
import { detectProject, formatDetection } from '../detect.js';
import { createDoctrineMap, writeDoctrineMap } from '../doctrine-map.js';
import { sendAnalyzeCompletedTelemetry } from '../telemetry.js';
import { createBrownfieldInitSeed } from '../workflow-model.js';
import type { WorkspaceInfo } from '../workspace.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

export async function cmdAnalyze(
  projectRoot: string = process.cwd(),
  workspace?: WorkspaceInfo,
): Promise<void> {
  const startedAt = Date.now();
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

  console.log(`${DIM}Scanning ambient project context...${RESET}`);
  const ambient = scanAmbientContext(projectRoot);
  const doctrine = createDoctrineMap(ambient);

  const initSeed = createBrownfieldInitSeed(project, layout, styling);
  initSeed.projectScope = workspace?.projectScope ?? 'single-app';
  const proposal = createBrownfieldProposal({
    project,
    routes,
    components,
    styling,
    layout,
    features,
    dependencies,
    ambient,
  });

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
      existingRuleFiles: project.existingRuleFiles,
      workspaceRoot: workspace?.workspaceRoot ?? projectRoot,
      appRoot: workspace?.appRoot ?? projectRoot,
      projectScope: workspace?.projectScope ?? 'single-app',
    },
    routes,
    components,
    styling,
    layout,
    features,
    dependencies,
    decantr: {
      workflow: 'brownfield-adoption',
      registryOptional: true,
      attach: {
        entrypoint: 'decantr analyze',
        contractOnly: true,
        adoptionMode: 'contract-only',
        initSeedPath: '.decantr/init-seed.json',
        proposalPath: '.decantr/observed-essence.proposal.json',
        recommendedCommand: 'decantr init --existing --accept-proposal',
      },
      hybrid: {
        ownerCommands: [
          'decantr add',
          'decantr remove',
          'decantr theme switch',
          'decantr registry',
          'decantr upgrade',
        ],
      },
    },
    retrofitPlan: {
      recommendedWorkflowMode: 'brownfield-attach',
      recommendedAdoptionMode: 'contract-only',
      assistantBridge:
        project.existingRuleFiles.length > 0
          ? 'preview existing rule files before applying'
          : 'none detected',
      routeAnchors: routes.routes.map((route) => route.path),
      stylingAnchors: [styling.configFile].filter(Boolean),
      ruleFiles: project.existingRuleFiles,
      ambientContextPath: '.decantr/ambient-context.json',
      doctrineMapPath: '.decantr/doctrine-map.json',
      proposalPath: '.decantr/observed-essence.proposal.json',
      preserve: [
        'framework',
        'package manager',
        'router',
        'build tooling',
        'existing styling system',
      ],
    },
  };

  // 4. Write to .decantr/analysis.json
  const decantrDir = join(projectRoot, '.decantr');
  if (!existsSync(decantrDir)) {
    mkdirSync(decantrDir, { recursive: true });
  }
  const outputPath = join(decantrDir, 'analysis.json');
  const initSeedPath = join(decantrDir, 'init-seed.json');
  const ambientPath = join(decantrDir, 'ambient-context.json');
  const doctrinePath = join(decantrDir, 'doctrine-map.json');
  const reportPath = join(decantrDir, 'brownfield-report.md');
  writeFileSync(outputPath, JSON.stringify(analysis, null, 2) + '\n', 'utf-8');
  writeFileSync(initSeedPath, JSON.stringify(initSeed, null, 2) + '\n', 'utf-8');
  writeFileSync(ambientPath, JSON.stringify(ambient, null, 2) + '\n', 'utf-8');
  writeDoctrineMap(projectRoot, doctrine);
  writeBrownfieldProposal(projectRoot, proposal);
  writeFileSync(reportPath, generateBrownfieldReport(proposal, ambient, doctrine), 'utf-8');
  const intelligenceArtifacts = writeBrownfieldIntelligenceArtifacts({
    projectRoot,
    project,
    routes,
    components,
    styling,
    layout,
    features,
    dependencies,
  });

  // 5. Print summary
  console.log(`\n${GREEN}Analysis complete.${RESET}\n`);

  console.log(`${BOLD}Summary${RESET}`);
  console.log(
    `  Framework:    ${CYAN}${project.framework}${project.version ? ` ${project.version}` : ''}${RESET}`,
  );
  console.log(`  Router:       ${routes.strategy}`);
  console.log(`  Routes:       ${routes.routes.length}`);
  console.log(`  Pages:        ${components.pageCount}`);
  console.log(`  Components:   ${components.componentCount}`);
  console.log(
    `  Styling:      ${styling.approach}${styling.configFile ? ` (${styling.configFile})` : ''}`,
  );
  console.log(`  CSS vars:     ${styling.cssVariables.length}`);
  console.log(`  Dark mode:    ${styling.darkMode ? 'yes' : 'no'}`);
  console.log(`  Shell:        ${layout.shellPattern}`);
  console.log(
    `  Features:     ${features.detected.length > 0 ? features.detected.join(', ') : 'none detected'}`,
  );
  console.log(`  Context:      ${ambient.items.length} ambient item(s)`);
  console.log(`  Doctrine:     ${doctrine.sources.length} ranked source(s)`);

  const depCounts = [
    dependencies.ui.length && `${dependencies.ui.length} ui`,
    dependencies.auth.length && `${dependencies.auth.length} auth`,
    dependencies.db.length && `${dependencies.db.length} db`,
    dependencies.state.length && `${dependencies.state.length} state`,
    dependencies.styling.length && `${dependencies.styling.length} styling`,
  ]
    .filter(Boolean)
    .join(', ');
  console.log(`  Dependencies: ${depCounts || 'none categorized'}`);

  console.log(`\n${DIM}Written to:${RESET} ${outputPath}`);
  console.log(`${DIM}Init seed:${RESET} ${initSeedPath}`);
  console.log(`${DIM}Ambient context:${RESET} ${ambientPath}`);
  console.log(`${DIM}Doctrine map:${RESET} ${doctrinePath}`);
  console.log(
    `${DIM}Observed proposal:${RESET} ${join(decantrDir, 'observed-essence.proposal.json')}`,
  );
  console.log(`${DIM}Brownfield report:${RESET} ${reportPath}`);
  console.log(`${DIM}Brownfield intelligence:${RESET} ${intelligenceArtifacts.intelligencePath}`);
  console.log(`${DIM}Theme inventory:${RESET} ${intelligenceArtifacts.themeInventoryPath}`);
  console.log(`${DIM}Enrichment backlog:${RESET} ${intelligenceArtifacts.backlogPath}`);
  console.log(
    `\n${YELLOW}Next step:${RESET} Review ${BOLD}.decantr/brownfield-report.md${RESET}, then run ${BOLD}decantr init --existing --accept-proposal${RESET} to attach Decantr using the observed proposal.\n`,
  );

  await sendAnalyzeCompletedTelemetry({
    componentCount: components.componentCount,
    dependencyCategoryCount: [
      dependencies.auth,
      dependencies.db,
      dependencies.state,
      dependencies.styling,
      dependencies.ui,
    ].filter((items) => items.length > 0).length,
    durationMs: Date.now() - startedAt,
    pageCount: components.pageCount,
    projectRoot,
    routeCount: routes.routes.length,
    success: true,
    targetFramework: project.framework,
  });
}
