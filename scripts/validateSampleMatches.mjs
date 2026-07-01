import { matchData as sampleMatches } from '../src/data/loadMatches.js';
import { validateMatches, summarizeValidation } from '../src/utils/validateMatches.js';

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

printSection('SVNS Stats Analyzer: Sample Match Data Validation');

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
