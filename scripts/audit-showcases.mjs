import { writeFileSync } from 'node:fs';
import { auditShowcases } from './showcase-audit-lib.mjs';

const reportJsonEqArg = process.argv.find(arg => arg.startsWith('--report-json='));
const reportJsonIndex = process.argv.indexOf('--report-json');
const reportJsonPath = reportJsonEqArg
  ? reportJsonEqArg.slice('--report-json='.length)
  : reportJsonIndex !== -1
    ? process.argv[reportJsonIndex + 1] ?? null
    : null;
const includeRemoved = process.argv.includes('--include-removed');
const report = auditShowcases({ includeRemoved });
const { summary } = report;

console.log(`Audited ${summary.appCount} showcase app(s).`);
console.log(`Inline styles: ${summary.totalInlineStyleCount}`);
console.log(`Hardcoded colors: ${summary.totalHardcodedColorCount}`);
console.log(`Utility leakage signals: ${summary.totalUtilityLeakageCount}`);
console.log(`Decantr treatment signals: ${summary.totalDecantrTreatmentCount}`);
console.log(`Pack manifests present: ${summary.withPackManifest}/${summary.appCount}`);
console.log(`Dist outputs present: ${summary.withDist}/${summary.appCount}`);
console.log(`Classifications: ${JSON.stringify(summary.classificationCounts)}`);

if (reportJsonPath) {
  writeFileSync(reportJsonPath, JSON.stringify(report, null, 2));
  console.log(`Wrote report to ${reportJsonPath}`);
}
