import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  summarizeVideoValidation,
  validateVideos,
} from '../src/utils/validateVideos.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');

function getArgumentValue(name) {
  const inlinePrefix = `${name}=`;
  const inlineArgument = process.argv.find((argument) =>
    argument.startsWith(inlinePrefix)
  );

  if (inlineArgument) {
    return inlineArgument.slice(inlinePrefix.length);
  }

  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function resolveInputPath(argumentValue, fallbackPath) {
  if (!argumentValue) {
    return fallbackPath;
  }

  return path.isAbsolute(argumentValue)
    ? argumentValue
    : path.resolve(projectRoot, argumentValue);
}

async function readJson(filePath, label) {
  let source;

  try {
    source = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`${label} could not be read at ${filePath}: ${error.message}`);
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${label} is not valid JSON at ${filePath}: ${error.message}`);
  }
}

function printIssues(heading, issues) {
  if (!issues.length) {
    return;
  }

  console.log(`\n${heading}`);

  issues.forEach((issue) => {
    console.log(
      `- [${issue.severity.toUpperCase()}] ${issue.videoId} / ${issue.field}: ${issue.message}`
    );
  });
}

const videosPath = resolveInputPath(
  getArgumentValue('--videos'),
  path.join(projectRoot, 'src', 'data', 'videos.json')
);
const matchesPath = resolveInputPath(
  getArgumentValue('--matches'),
  path.join(projectRoot, 'src', 'data', 'matches.json')
);

try {
  const [videos, matches] = await Promise.all([
    readJson(videosPath, 'videos.json'),
    readJson(matchesPath, 'matches.json'),
  ]);

  const result = validateVideos(videos, matches);

  console.log(summarizeVideoValidation(result));
  console.log(`Videos: ${videosPath}`);
  console.log(`Matches: ${matchesPath}`);

  printIssues('Errors', result.errors);
  printIssues('Warnings', result.warnings);

  if (!result.valid) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`Video validation could not run: ${error.message}`);
  process.exitCode = 1;
}
