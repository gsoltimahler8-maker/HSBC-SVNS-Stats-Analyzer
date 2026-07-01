import { readFileSync } from 'node:fs';
import { validateMatches, summarizeValidation } from '../src/utils/validateMatches.js';

const sampleMatches = JSON.parse(
  readFileSync(new URL('../src/data/matches.json', import.meta.url), 'utf8')
);

function printIssue(issue) {
  const label = issue.severity === 'error' ? 'ERROR' : 'WARNING';

  console.log(
    `[${label}] ${issue.matchId} / ${issue.field}: ${issue.message}`
  );
}

function printSection(title) {
  console.log('');
  console.log(`=== ${title} ===`);
}

const result = validateMatches(sampleMatches);

printSection('SVNS Stats Analyzer: Match Data Validation');

console.log(`Total matches: ${result.totalMatches}`);
console.log(`Errors: ${result.errorCount}`);
console.log(`Warnings: ${result.warningCount}`);
console.log(summarizeValidation(result));

if (result.errors.length > 0) {
  printSection('Errors');
  result.errors.forEach(printIssue);
}

if (result.warnings.length > 0) {
  printSection('Warnings');
  result.warnings.forEach(printIssue);
}

if (result.valid) {
  console.log('');
  console.log('Validation completed. No blocking errors found.');
} else {
  console.log('');
  console.log('Validation failed. Fix blocking errors before importing real data.');
  process.exitCode = 1;
}
