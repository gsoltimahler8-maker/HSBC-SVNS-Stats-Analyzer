import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ENVIRONMENT_REGISTRY_PREFIX,
  stripEnvironmentRegistryResolved,
  syncRootDependencySpecifiers,
} from '../scripts/preparePortableLockfile.mjs';

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('release validation includes the Node test suite', async () => {
  const packageJson = JSON.parse(await readText('package.json'));

  assert.equal(packageJson.scripts.test, 'node --test');
  assert.equal(
    packageJson.scripts['prepare:lockfile'],
    'node scripts/preparePortableLockfile.mjs'
  );
  assert.match(packageJson.scripts['validate:release'], /npm run test/);
});

test('direct dependencies are exact and match the committed locked package versions', async () => {
  const packageJson = JSON.parse(await readText('package.json'));
  const packageLock = JSON.parse(await readText('package-lock.json'));

  for (const [name, specifier] of Object.entries(packageJson.dependencies)) {
    assert.match(
      specifier,
      /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/,
      `${name} must use an exact version rather than a tag/range`
    );

    assert.equal(
      packageLock.packages?.[`node_modules/${name}`]?.version,
      specifier,
      `${name} package.json version must match the committed lock entry`
    );
  }
});

test('the committed npm lockfile is present for frozen installs', async () => {
  const packageLock = JSON.parse(await readText('package-lock.json'));

  assert.ok(packageLock.lockfileVersion >= 2);
  assert.ok(packageLock.packages?.['']?.dependencies);
});

test('portable lockfile preparation removes only environment-specific registry URLs', () => {
  const fixture = {
    packages: {
      'node_modules/example': {
        version: '1.0.0',
        resolved: `${ENVIRONMENT_REGISTRY_PREFIX}example/-/example-1.0.0.tgz`,
        integrity: 'sha512-example',
      },
      'node_modules/external': {
        version: '1.0.0',
        resolved: 'https://github.com/example/external/archive/v1.0.0.tar.gz',
      },
    },
  };

  const removed = stripEnvironmentRegistryResolved(fixture);

  assert.equal(removed, 1);
  assert.equal(
    Object.hasOwn(fixture.packages['node_modules/example'], 'resolved'),
    false
  );
  assert.equal(
    fixture.packages['node_modules/external'].resolved,
    'https://github.com/example/external/archive/v1.0.0.tar.gz'
  );
  assert.equal(fixture.packages['node_modules/example'].integrity, 'sha512-example');
});

test('portable lockfile preparation synchronizes legacy root dependency specifiers', () => {
  const lockfile = {
    name: 'legacy-name',
    packages: {
      '': {
        dependencies: {
          react: 'latest',
          vite: 'latest',
        },
      },
    },
  };
  const packageJson = {
    name: 'hsbc-svns-stats-analyzer',
    dependencies: {
      react: '19.2.7',
      vite: '8.0.16',
    },
  };

  const synced = syncRootDependencySpecifiers(lockfile, packageJson);

  assert.equal(synced, 2);
  assert.equal(lockfile.name, packageJson.name);
  assert.deepEqual(lockfile.packages[''].dependencies, packageJson.dependencies);
});

test('project npm configuration uses the public registry without credentials', async () => {
  const npmrc = await readText('.npmrc');

  assert.match(npmrc, /^registry=https:\/\/registry\.npmjs\.org\/$/m);
  assert.match(npmrc, /^omit-lockfile-registry-resolved=true$/m);
  assert.doesNotMatch(npmrc, /replace-registry-host=/);
  assert.doesNotMatch(npmrc, /_auth|token|password/i);
});

const assertWorkflowInstallOrder = (workflow) => {
  const prepareIndex = workflow.indexOf('npm run prepare:lockfile');
  const ciIndex = workflow.indexOf('npm ci --no-audit --no-fund');
  const buildIndex = workflow.indexOf('npm run build');

  assert.ok(prepareIndex >= 0);
  assert.ok(ciIndex > prepareIndex);
  assert.ok(buildIndex > ciIndex);
};

const assertPinnedNodeRuntime = (workflow) => {
  assert.match(workflow, /node-version:\s*24\.19\.0/);
  assert.match(workflow, /node --version/);
  assert.match(workflow, /npm --version/);
};

test('GitHub Pages build installs reproducibly from the prepared lockfile', async () => {
  const workflow = await readText('.github/workflows/deploy.yml');

  assertPinnedNodeRuntime(workflow);
  assert.match(workflow, /cache:\s*npm/);
  assertWorkflowInstallOrder(workflow);
  assert.doesNotMatch(workflow, /pnpm install/);
  assert.doesNotMatch(workflow, /pnpm@latest/);
});

test('feature branch validation uses the same install/build path', async () => {
  const workflow = await readText('.github/workflows/ci.yml');

  assertPinnedNodeRuntime(workflow);
  assert.match(workflow, /cache:\s*npm/);
  assertWorkflowInstallOrder(workflow);
});
