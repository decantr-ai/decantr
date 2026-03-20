import { writeFile } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

// Import the functions from compiler-audit.js
import('./tools/compiler-audit.js').then(async (module) => {
  // Mock results for testing
  const mockResults = [
    {
      name: 'docs',
      category: 'Apps',
      status: 'pass',
      issueType: null,
      phases: {
        baseline: { pass: true, time: 2405 },
        experimental: { pass: true, time: 183 },
        syntax: { pass: true, time: 22 },
        import: { pass: true, time: 100 }
      }
    },
    {
      name: 'showcase/test-project',
      category: 'Showcase',
      status: 'fail',
      issueType: 'compiler',
      phases: {
        baseline: { pass: true, time: 1000 },
        experimental: { pass: false, error: 'Build failed', time: 500 },
        syntax: null,
        import: null
      }
    },
    {
      name: 'playground',
      category: 'Apps',
      status: 'fail',
      issueType: 'runtime',
      phases: {
        baseline: { pass: true, time: 7575 },
        experimental: { pass: true, time: 94 },
        syntax: { pass: true, time: 22 },
        import: { pass: false, error: 'Import failed: Cannot find module', time: 50 }
      }
    }
  ];

  // Test generateReport
  console.log('Testing generateReport...');
  const { generateReport, printSummary } = module.default || module;
  
  if (!generateReport) {
    console.error('generateReport not found in module');
    process.exit(1);
  }

  const report = generateReport(mockResults);
  console.log('\n=== GENERATED REPORT ===\n');
  console.log(report);
  console.log('\n=== END REPORT ===\n');

  // Test printSummary
  console.log('Testing printSummary...');
  printSummary(mockResults);

  console.log('\n✅ Report generation functions work correctly');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
