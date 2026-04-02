import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface CritiqueScore {
  category: string;
  score: number;
  details: string;
  suggestions: string[];
}

interface CritiqueResult {
  file: string;
  overall: number;
  scores: CritiqueScore[];
}

export async function critiqueFile(
  filePath: string,
  projectRoot: string,
): Promise<CritiqueResult> {
  const code = await readFile(filePath, 'utf-8');
  const codeLower = code.toLowerCase();

  let treatments = '';
  try {
    treatments = await readFile(join(projectRoot, 'src', 'styles', 'treatments.css'), 'utf-8');
  } catch { /* no treatments file */ }

  const scores: CritiqueScore[] = [];

  // 1. Treatment usage
  const treatmentClasses = ['d-interactive', 'd-surface', 'd-data', 'd-control', 'd-section', 'd-annotation', 'd-label'];
  const usedTreatments = treatmentClasses.filter(t => code.includes(t));
  scores.push({
    category: 'Treatment Usage',
    score: Math.min(5, Math.max(1, Math.round(usedTreatments.length / treatmentClasses.length * 5))),
    details: `${usedTreatments.length}/${treatmentClasses.length} base treatments used: ${usedTreatments.join(', ') || 'none'}`,
    suggestions: treatmentClasses.filter(t => !code.includes(t)).map(t => `Consider using \`${t}\` where appropriate`),
  });

  // 2. Theme decorator usage
  const decoratorMatches = treatments.match(/\.([\w-]+)\s*\{/g) || [];
  const decoratorNames = decoratorMatches
    .map(m => m.slice(1).replace(/\s*\{$/, ''))
    .filter(n => !n.startsWith('d-') && !['neon-glow','neon-glow-hover','neon-text-glow','neon-border-glow','mono-data','status-ring','entrance-fade'].includes(n));
  const usedDecorators = decoratorNames.filter(d => code.includes(d));
  const decTarget = Math.min(decoratorNames.length, 5);
  scores.push({
    category: 'Decorator Usage',
    score: decTarget > 0 ? Math.min(5, Math.max(1, Math.round(usedDecorators.length / decTarget * 5))) : 3,
    details: `${usedDecorators.length}/${decoratorNames.length} theme decorators used`,
    suggestions: decoratorNames.filter(d => !code.includes(d)).slice(0, 3).map(d => `Theme decorator \`${d}\` available but unused`),
  });

  // 3. Personality utility usage
  const personalityUtils = ['neon-glow', 'neon-text-glow', 'neon-border-glow', 'mono-data', 'status-ring', 'entrance-fade'];
  const availableUtils = personalityUtils.filter(u => treatments.includes(u));
  const usedUtils = availableUtils.filter(u => code.includes(u));
  const utilTarget = Math.min(availableUtils.length, 3);
  scores.push({
    category: 'Personality Alignment',
    score: utilTarget > 0 ? Math.min(5, Math.max(1, Math.round(usedUtils.length / utilTarget * 5))) : 3,
    details: `${usedUtils.length}/${availableUtils.length} personality utilities used`,
    suggestions: availableUtils.filter(u => !code.includes(u)).map(u => `Personality utility \`${u}\` defined but not used`),
  });

  // 4. Motion/animation
  const hasTransition = codeLower.includes('transition') || codeLower.includes('animate') || codeLower.includes('keyframe') || codeLower.includes('framer');
  const hasHover = codeLower.includes(':hover') || codeLower.includes('onmouseenter') || codeLower.includes('hover:');
  scores.push({
    category: 'Motion & Interaction',
    score: Math.min(5, (hasTransition ? 3 : 1) + (hasHover ? 1 : 0)),
    details: `Transitions: ${hasTransition ? 'yes' : 'no'}, Hover states: ${hasHover ? 'yes' : 'no'}`,
    suggestions: hasTransition ? [] : ['Add transition effects for interactive elements'],
  });

  // 5. Accessibility
  const hasAria = codeLower.includes('aria-') || codeLower.includes('role=');
  const hasFocus = codeLower.includes('focus-visible') || codeLower.includes('focusvisible');
  const hasKeyboard = codeLower.includes('onkeydown') || codeLower.includes('onkeyup');
  scores.push({
    category: 'Accessibility',
    score: Math.min(5, 1 + (hasAria ? 2 : 0) + (hasFocus ? 1 : 0) + (hasKeyboard ? 1 : 0)),
    details: `ARIA: ${hasAria}, Focus: ${hasFocus}, Keyboard: ${hasKeyboard}`,
    suggestions: [
      ...(!hasAria ? ['Add ARIA attributes to interactive regions'] : []),
      ...(!hasKeyboard ? ['Add keyboard event handlers'] : []),
    ],
  });

  // 6. Responsive
  const hasMedia = codeLower.includes('@media') || codeLower.includes('usemediaquery') || codeLower.includes('breakpoint');
  const hasResponsive = codeLower.includes('sm:') || codeLower.includes('md:') || codeLower.includes('lg:') || codeLower.includes('_sm_') || codeLower.includes('_md_');
  scores.push({
    category: 'Responsive Design',
    score: Math.min(5, (hasMedia ? 3 : 1) + (hasResponsive ? 2 : 0)),
    details: `Media queries: ${hasMedia}, Responsive classes: ${hasResponsive}`,
    suggestions: !hasMedia && !hasResponsive ? ['Add responsive breakpoint handling'] : [],
  });

  const overall = Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length * 10) / 10;
  return { file: filePath, overall, scores };
}
