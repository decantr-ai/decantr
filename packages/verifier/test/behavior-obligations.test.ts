import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { auditProject } from '../src/index.js';

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeEssence(root: string): void {
  writeJson(join(root, 'decantr.essence.json'), {
    version: '4.0.0',
    dna: {
      theme: { id: 'existing', mode: 'light' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
      typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
      color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'existing', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
      personality: ['observed app'],
    },
    blueprint: {
      features: [],
      sections: [
        {
          id: 'app',
          role: 'primary',
          shell: 'observed-shell',
          features: [],
          description: 'Existing app',
          pages: [{ id: 'settings', route: '/settings', layout: ['settings-panel'] }],
        },
      ],
      routes: { '/settings': { section: 'app', page: 'settings' } },
    },
    meta: {
      archetype: 'observed-brownfield',
      target: 'react',
      platform: { type: 'spa', routing: 'history' },
      guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
    },
  });
}

function writeBehaviorPatterns(root: string): void {
  mkdirSync(join(root, '.decantr'), { recursive: true });
  writeJson(join(root, '.decantr', 'local-patterns.json'), {
    version: 2,
    status: 'accepted',
    patterns: [
      {
        id: 'form-control',
        role: 'Form controls',
        componentPaths: ['src/components/Input.tsx'],
        behavior_obligations: {
          pattern_role: 'form-control',
          obligations: [
            { id: 'label-associated', label: 'Controls have labels.', evidence: 'static' },
            {
              id: 'explicit-form-button-type',
              label: 'Form buttons have explicit type.',
              evidence: 'static',
            },
          ],
        },
      },
      {
        id: 'confirmation-dialog',
        role: 'Confirmation dialogs',
        componentPaths: ['src/components/Dialog.tsx'],
        behavior_obligations: {
          pattern_role: 'confirmation-dialog',
          obligations: [
            { id: 'project-dialog-primitive', label: 'Use Dialog.', evidence: 'primitive' },
            { id: 'accessible-name', label: 'Dialog has a name.', evidence: 'static' },
            {
              id: 'visible-consequence',
              label: 'Consequence is visible.',
              evidence: 'static',
            },
            { id: 'cancel-affordance', label: 'Cancel is visible.', evidence: 'static' },
            { id: 'submitting-guard', label: 'Submitting is guarded.', evidence: 'static' },
          ],
        },
      },
    ],
  });
}

describe('behavior obligations', () => {
  let projectRoot = '';

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-behavior-obligations-'));
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'app'), { recursive: true });
    writeEssence(projectRoot);
    writeBehaviorPatterns(projectRoot);
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Dialog.tsx'),
      'export function Dialog(props) { return <div role="dialog" aria-modal="true" {...props} />; }\n',
      'utf-8',
    );
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('emits static findings for violated behavior obligations', async () => {
    writeFileSync(
      join(projectRoot, 'src', 'app', 'settings.tsx'),
      `export function Settings() {
  return (
    <main>
      <form>
        <input id="account-name" />
        <button>Reset</button>
      </form>
      <div role="dialog" aria-modal="true">
        <p>Delete account?</p>
        <button onClick={() => deleteAccount()}>Delete</button>
      </div>
    </main>
  );
}
`,
      'utf-8',
    );

    const report = await auditProject(projectRoot);
    const behaviorFindings = report.findings.filter((finding) =>
      finding.id.startsWith('behavior-'),
    );

    expect(behaviorFindings.map((finding) => finding.rule)).toEqual(
      expect.arrayContaining([
        'behavior:form-control:label-associated',
        'behavior:form-control:explicit-form-button-type',
        'behavior:confirmation-dialog:project-dialog-primitive',
        'behavior:confirmation-dialog:accessible-name',
        'behavior:confirmation-dialog:visible-consequence',
        'behavior:confirmation-dialog:cancel-affordance',
        'behavior:confirmation-dialog:submitting-guard',
      ]),
    );
    expect(behaviorFindings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        'A11Y010',
        'A11Y011',
        'INT010',
        'INT011',
        'INT012',
        'INT013',
        'COMP020',
      ]),
    );
    expect(
      behaviorFindings.find(
        (finding) => finding.rule === 'behavior:confirmation-dialog:accessible-name',
      )?.repair?.payload,
    ).toMatchObject({
      local_pattern_id: 'confirmation-dialog',
      behavior_obligation_id: 'accessible-name',
    });
  });

  it('stays quiet for compliant dialog and form behavior obligations', async () => {
    writeFileSync(
      join(projectRoot, 'src', 'app', 'settings.tsx'),
      `export function Settings() {
  const isSubmitting = false;
  return (
    <main>
      <form>
        <label htmlFor="account-name">Account name</label>
        <input id="account-name" />
        <button type="submit">Save</button>
      </form>
      <Dialog>
        <DialogTitle>Delete account</DialogTitle>
        <p>This action cannot be undone.</p>
        <button type="button">Cancel</button>
        <button type="button" disabled={isSubmitting}>Delete account</button>
      </Dialog>
    </main>
  );
}
`,
      'utf-8',
    );

    const report = await auditProject(projectRoot);
    expect(report.findings.some((finding) => finding.id.startsWith('behavior-'))).toBe(false);
  });
});
