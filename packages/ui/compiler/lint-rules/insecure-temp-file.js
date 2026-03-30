/**
 * Decantr Compiler Lint Rule — insecure-temp-file
 *
 * Detects writeFileSync, writeFile, or createWriteStream calls with hardcoded
 * /tmp/ paths, which are a security risk due to symlink and race-condition attacks.
 * Use fs.mkdtempSync(path.join(os.tmpdir(), prefix)) instead.
 */

const PATTERN = /(?:writeFileSync|writeFile|createWriteStream)\s*\(\s*['"`]\/tmp\//g;

export function insecureTempFile(graph) {
  for (const mod of graph.modules.values()) {
    if (mod.isFramework) continue;
    const { rawSource } = mod.ast;
    if (!rawSource) continue;

    PATTERN.lastIndex = 0;
    let match;
    while ((match = PATTERN.exec(rawSource)) !== null) {
      mod._lintIssues = mod._lintIssues || [];
      mod._lintIssues.push({
        rule: 'insecure-temp-file',
        loc: { start: match.index },
        message:
          'Hardcoded /tmp/ path. Use fs.mkdtempSync(path.join(os.tmpdir(), prefix)) instead.',
        severity: 'error',
      });
    }
  }
}
