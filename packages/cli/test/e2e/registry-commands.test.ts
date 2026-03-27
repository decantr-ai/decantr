import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

describe('registry commands', () => {
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');

  it('search returns results', () => {
    const output = execSync(`node ${cliPath} search dashboard`, {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });

    // Should contain some output (results or "no results")
    expect(output.length).toBeGreaterThan(0);
  });

  it('list blueprints returns items', () => {
    const output = execSync(`node ${cliPath} list blueprints`, {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });

    // Should list at least one blueprint
    expect(output).toContain('blueprint');
  });

  it('get pattern returns JSON', () => {
    const output = execSync(`node ${cliPath} get pattern hero`, {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });

    const json = JSON.parse(output);
    expect(json.id).toBe('hero');
  });

  it('list shells returns items', () => {
    const output = execSync(`node ${cliPath} list shells`, {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });

    // Should return shells found count
    expect(output).toContain('shells found');
  });
});
