import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const ENVIRONMENT_REGISTRY_PREFIX =
  'https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/';

/**
 * Removes environment-specific registry tarball locations from an npm lockfile
 * while preserving versions, integrity hashes and non-registry URLs.
 */
export function stripEnvironmentRegistryResolved(lockfile) {
  let removed = 0;

  const visit = (value) => {
    if (value === null || typeof value !== 'object') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (
      typeof value.resolved === 'string' &&
      value.resolved.startsWith(ENVIRONMENT_REGISTRY_PREFIX)
    ) {
      delete value.resolved;
      removed += 1;
    }

    Object.values(value).forEach(visit);
  };

  visit(lockfile);
  return removed;
}

/**
 * Synchronizes the root dependency specifiers stored in an older npm lockfile
 * with the exact direct-dependency versions declared in package.json.
 *
 * This project historically used `latest` in both files. npm 11 resolves those
 * tags before `npm ci` and therefore rejects the older locked graph once newer
 * releases exist. v1.1-09 pins package.json to the already-locked versions and
 * this helper updates only the root lockfile metadata to the same exact values.
 */
export function syncRootDependencySpecifiers(lockfile, packageJson) {
  const rootPackage = lockfile?.packages?.[''];
  const manifestDependencies = packageJson?.dependencies;

  if (!rootPackage || !manifestDependencies) {
    throw new Error('package-lock.json or package.json is missing root dependencies.');
  }

  rootPackage.dependencies = { ...manifestDependencies };

  if (typeof packageJson.name === 'string' && packageJson.name) {
    lockfile.name = packageJson.name;
  }

  return Object.keys(manifestDependencies).length;
}

export async function preparePortableLockfile(
  lockfileUrl = new URL('../package-lock.json', import.meta.url),
  packageJsonUrl = new URL('../package.json', import.meta.url)
) {
  const [lockSource, manifestSource] = await Promise.all([
    readFile(lockfileUrl, 'utf8'),
    readFile(packageJsonUrl, 'utf8'),
  ]);

  const lockfile = JSON.parse(lockSource);
  const packageJson = JSON.parse(manifestSource);

  const synced = syncRootDependencySpecifiers(lockfile, packageJson);
  const removed = stripEnvironmentRegistryResolved(lockfile);

  if (JSON.stringify(lockfile).includes(ENVIRONMENT_REGISTRY_PREFIX)) {
    throw new Error(
      'Environment-specific registry URL remains in package-lock.json after normalization.'
    );
  }

  await writeFile(lockfileUrl, `${JSON.stringify(lockfile, null, 2)}\n`, 'utf8');

  console.log(
    `Prepared portable package-lock.json (${synced} root dependency specifiers synced; ${removed} environment-specific resolved URL entries removed).`
  );

  return { synced, removed };
}

const invokedUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;

if (invokedUrl === import.meta.url) {
  await preparePortableLockfile();
}
