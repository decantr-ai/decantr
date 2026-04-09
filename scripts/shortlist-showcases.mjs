import { writeFileSync } from 'node:fs';
import { auditShowcases, rankGoldenCandidates } from './showcase-audit-lib.mjs';

const reportJsonEqArg = process.argv.find(arg => arg.startsWith('--report-json='));
const reportJsonIndex = process.argv.indexOf('--report-json');
const reportJsonPath = reportJsonEqArg
  ? reportJsonEqArg.slice('--report-json='.length)
  : reportJsonIndex !== -1
    ? process.argv[reportJsonIndex + 1] ?? null
    : null;
const limitEqArg = process.argv.find(arg => arg.startsWith('--limit='));
const limitIndex = process.argv.indexOf('--limit');
const limit = Number(limitEqArg
  ? limitEqArg.slice('--limit='.length)
  : limitIndex !== -1
    ? process.argv[limitIndex + 1] ?? '8'
    : '8');

const audit = auditShowcases();
const shortlist = rankGoldenCandidates(audit.results, Number.isFinite(limit) ? limit : 8);

console.log(`Recommended shortlist (${shortlist.length} app(s))`);
for (const [index, entry] of shortlist.entries()) {
  console.log(`${index + 1}. ${entry.slug} | class ${entry.suggestedClassification} | penalty ${entry.penalty} | inline ${entry.inlineStyleCount} | colors ${entry.hardcodedColorCount} | treatments ${entry.decantrTreatmentCount}`);
}

if (reportJsonPath) {
  writeFileSync(reportJsonPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    shortlist,
  }, null, 2));
  console.log(`Wrote shortlist report to ${reportJsonPath}`);
}
