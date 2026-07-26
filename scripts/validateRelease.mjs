import {
  access,
  readFile,
  stat,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');

const errors = [];
const warnings = [];
const passes = [];

function report(target, label, detail) {
  target.push({ label, detail });
}

function pass(label, detail = '') {
  report(passes, label, detail);
}

function fail(label, detail) {
  report(errors, label, detail);
}

function warn(label, detail) {
  report(warnings, label, detail);
}

function resolveProjectPath(relativePath) {
  return path.join(projectRoot, relativePath);
}

async function exists(relativePath) {
  try {
    await access(resolveProjectPath(relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readText(relativePath) {
  return readFile(resolveProjectPath(relativePath), 'utf8');
}

async function readJson(relativePath) {
  const source = await readText(relativePath);

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(
      `${relativePath} is not valid JSON: ${error.message}`
    );
  }
}

function uniqueValues(items, selector) {
  const seen = new Set();
  const duplicates = new Set();

  items.forEach((item) => {
    const value = selector(item);

    if (!value) {
      return;
    }

    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  });

  return [...duplicates];
}

async function checkRequiredFiles() {
  const requiredFiles = [
    'index.html',
    'package.json',
    'src/main.jsx',
    'src/App.jsx',
    'src/components/AppNavigation.jsx',
    'src/components/AppErrorBoundary.jsx',
    'src/components/PwaStatus.jsx',
    'src/components/AboutPage.jsx',
    'src/components/SourcesPage.jsx',
    'src/components/PolicyPage.jsx',
    'src/components/MatchSearch.jsx',
    'src/components/VideoLibrary.jsx',
    'src/i18n/ja.js',
    'src/i18n/en.js',
    'src/data/matches.json',
    'src/data/videos.json',
    'public/manifest.webmanifest',
    'public/service-worker.js',
    'public/offline.html',
    'public/icons/icon-192.png',
    'public/icons/icon-512.png',
    'public/icons/icon-maskable-192.png',
    'public/icons/icon-maskable-512.png',
    'public/icons/apple-touch-icon.png',
    'docs/version-1.0-plan.md',
    'docs/brand-policy.md',
    'docs/terms-of-use.md',
    'docs/privacy-policy.md',
    'docs/disclaimer.md',
    'docs/contact-policy.md',
    'docs/pwa-operation.md',
    'docs/version-1.0-08a-export-removal.md',
    'docs/version-1.0-10-pre-release-validation.md',
    'docs/version-1.0-10-manual-checklist.md',
  ];

  const missing = [];

  for (const relativePath of requiredFiles) {
    if (!(await exists(relativePath))) {
      missing.push(relativePath);
    }
  }

  if (missing.length) {
    fail(
      'Required release files',
      `Missing: ${missing.join(', ')}`
    );
  } else {
    pass(
      'Required release files',
      `${requiredFiles.length} required files found`
    );
  }
}

async function checkRemovedExportFiles() {
  const forbiddenFiles = [
    'src/utils/exportUtils.js',
    'docs/export-operation.md',
    'docs/version-1.0-08-export.md',
  ];

  const remaining = [];

  for (const relativePath of forbiddenFiles) {
    if (await exists(relativePath)) {
      remaining.push(relativePath);
    }
  }

  if (remaining.length) {
    fail(
      'Export feature removal',
      `Delete: ${remaining.join(', ')}`
    );
  } else {
    pass(
      'Export feature removal',
      'CSV, Excel, and PDF export files are absent'
    );
  }
}

async function checkPackageScripts() {
  const packageJson = await readJson('package.json');
  const scripts = packageJson.scripts || {};
  const requiredScripts = [
    'build',
    'validate:matches',
    'validate:videos',
    'validate:data',
    'validate:release',
  ];

  const missing = requiredScripts.filter((name) => !scripts[name]);

  if (missing.length) {
    fail(
      'Package scripts',
      `Missing scripts: ${missing.join(', ')}`
    );
    return;
  }

  if (!scripts.build.includes('validate:release')) {
    fail(
      'Build integration',
      'The build script does not run validate:release'
    );
    return;
  }

  pass(
    'Package scripts',
    'Release validation is integrated into the build'
  );
}

async function checkManifestAndIndex() {
  const [manifest, index] = await Promise.all([
    readJson('public/manifest.webmanifest'),
    readText('index.html'),
  ]);

  const manifestErrors = [];

  if (manifest.name !== 'SVNS Stats Analyzer') {
    manifestErrors.push(
      `manifest name is "${manifest.name || ''}"`
    );
  }

  if (!manifest.short_name) {
    manifestErrors.push('short_name is missing');
  }

  if (!['standalone', 'fullscreen', 'minimal-ui'].includes(
    manifest.display
  )) {
    manifestErrors.push(
      `display is "${manifest.display || ''}"`
    );
  }

  if (!manifest.start_url || !manifest.scope) {
    manifestErrors.push('start_url or scope is missing');
  }

  const icons = Array.isArray(manifest.icons)
    ? manifest.icons
    : [];

  const has192 = icons.some(
    (icon) =>
      icon.sizes === '192x192' &&
      String(icon.purpose || '').includes('any')
  );
  const has512 = icons.some(
    (icon) =>
      icon.sizes === '512x512' &&
      String(icon.purpose || '').includes('any')
  );
  const hasMaskable192 = icons.some(
    (icon) =>
      icon.sizes === '192x192' &&
      String(icon.purpose || '').includes('maskable')
  );
  const hasMaskable512 = icons.some(
    (icon) =>
      icon.sizes === '512x512' &&
      String(icon.purpose || '').includes('maskable')
  );

  if (!has192 || !has512 || !hasMaskable192 || !hasMaskable512) {
    manifestErrors.push(
      'required any/maskable 192px and 512px icons are incomplete'
    );
  }

  if (manifestErrors.length) {
    fail(
      'Web App Manifest',
      manifestErrors.join('; ')
    );
  } else {
    pass(
      'Web App Manifest',
      'Name, scope, display, and required icons are present'
    );
  }

  const requiredIndexTokens = [
    '%BASE_URL%manifest.webmanifest',
    '%BASE_URL%icons/icon-192.png',
    '%BASE_URL%icons/apple-touch-icon.png',
    'name="theme-color"',
    'src="/src/main.jsx"',
  ];

  const missingTokens = requiredIndexTokens.filter(
    (token) => !index.includes(token)
  );

  if (missingTokens.length) {
    fail(
      'index.html PWA links',
      `Missing: ${missingTokens.join(', ')}`
    );
  } else {
    pass(
      'index.html PWA links',
      'Manifest, icon, theme, and entry script links found'
    );
  }
}

function readPngDimensions(buffer) {
  const signature =
    buffer.subarray(0, 8).toString('hex');

  if (signature !== '89504e470d0a1a0a') {
    throw new Error('not a PNG file');
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function checkIcons() {
  const expected = [
    ['public/icons/icon-192.png', 192, 192],
    ['public/icons/icon-512.png', 512, 512],
    ['public/icons/icon-maskable-192.png', 192, 192],
    ['public/icons/icon-maskable-512.png', 512, 512],
    ['public/icons/apple-touch-icon.png', 180, 180],
  ];

  const dimensionErrors = [];

  for (const [relativePath, width, height] of expected) {
    try {
      const buffer = await readFile(resolveProjectPath(relativePath));
      const dimensions = readPngDimensions(buffer);

      if (
        dimensions.width !== width ||
        dimensions.height !== height
      ) {
        dimensionErrors.push(
          `${relativePath}: ${dimensions.width}x${dimensions.height}`
        );
      }
    } catch (error) {
      dimensionErrors.push(
        `${relativePath}: ${error.message}`
      );
    }
  }

  if (dimensionErrors.length) {
    fail(
      'PWA icon dimensions',
      dimensionErrors.join('; ')
    );
  } else {
    pass(
      'PWA icon dimensions',
      '192px, 512px, maskable, and Apple icons are valid PNG sizes'
    );
  }

  const expectedHashes = {
    'public/icons/icon-192.png':
      '08d305b7a04f65b6979a6ab8493a3f74097d587ea71e7b4a3f1b1e627ba5df4b',
    'public/icons/icon-512.png':
      'ae7470db2d6ebadae027cf9ca58b0084843d5f08a838629b3d72db05b072f5f2',
    'public/icons/icon-maskable-192.png':
      'f200a15f9a298e57a1c137f9b524a83eed617a90b1862f299b94d0b8fc0e0ff6',
    'public/icons/icon-maskable-512.png':
      '58ed9012a50f35093486620021477ac7836d4f982c4d107a7b82d97d5486c392',
    'public/icons/apple-touch-icon.png':
      'e712e14f2a1b0a8b9447fd918697c30fff3a811ec8e8d15f573d0f4b0a824e22',
  };

  const changed = [];

  for (const [relativePath, expectedHash] of Object.entries(
    expectedHashes
  )) {
    const buffer = await readFile(resolveProjectPath(relativePath));
    const hash = createHash('sha256')
      .update(buffer)
      .digest('hex');

    if (hash !== expectedHash) {
      changed.push(relativePath);
    }
  }

  if (changed.length) {
    warn(
      'Specified app icon artwork',
      `Icon files differ from the approved artwork package: ${changed.join(', ')}`
    );
  } else {
    pass(
      'Specified app icon artwork',
      'Approved SVNS Stats Analyzer artwork is installed'
    );
  }
}

async function checkServiceWorker() {
  const source = await readText('public/service-worker.js');
  const requiredTokens = [
    'CACHE_VERSION',
    'SKIP_WAITING',
    'self.clients.claim()',
    'manifest.webmanifest',
    'offline.html',
  ];

  const missing = requiredTokens.filter(
    (token) => !source.includes(token)
  );

  if (missing.length) {
    fail(
      'Service Worker',
      `Missing: ${missing.join(', ')}`
    );
    return;
  }

  if (!/svns-stats-v1\.0\.[0-9]+[a-z]?-/i.test(source)) {
    warn(
      'Service Worker cache version',
      'CACHE_VERSION does not use the expected v1.0 release format'
    );
  } else {
    pass(
      'Service Worker',
      'Offline cache and update-control tokens found'
    );
  }
}

async function checkData() {
  const [matches, videos] = await Promise.all([
    readJson('src/data/matches.json'),
    readJson('src/data/videos.json'),
  ]);

  if (!Array.isArray(matches) || !Array.isArray(videos)) {
    fail(
      'Data files',
      'matches.json and videos.json must both contain arrays'
    );
    return;
  }

  const matchDuplicates = uniqueValues(
    matches,
    (match) => match.id
  );
  const videoDuplicates = uniqueValues(
    videos,
    (video) => video.id
  );

  if (matchDuplicates.length || videoDuplicates.length) {
    fail(
      'Unique data IDs',
      [
        matchDuplicates.length
          ? `duplicate match IDs: ${matchDuplicates.join(', ')}`
          : '',
        videoDuplicates.length
          ? `duplicate video IDs: ${videoDuplicates.join(', ')}`
          : '',
      ]
        .filter(Boolean)
        .join('; ')
    );
  } else {
    pass(
      'Unique data IDs',
      `${matches.length} matches and ${videos.length} videos`
    );
  }

  const matchIds = new Set(
    matches.map((match) => match.id).filter(Boolean)
  );
  const missingMatchReferences = videos
    .filter((video) => !matchIds.has(video.matchId))
    .map((video) => `${video.id} -> ${video.matchId}`);

  if (missingMatchReferences.length) {
    fail(
      'Video-to-match references',
      missingMatchReferences.join(', ')
    );
  } else {
    pass(
      'Video-to-match references',
      'Every video points to a registered match'
    );
  }

  const invalidVideoUrls = videos
    .filter(
      (video) =>
        !/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(
          video.videoUrl || ''
        )
    )
    .map((video) => video.id);

  if (invalidVideoUrls.length) {
    fail(
      'Video URLs',
      `Invalid or non-HTTPS YouTube URLs: ${invalidVideoUrls.join(', ')}`
    );
  } else {
    pass(
      'Video URLs',
      'All registered video URLs use HTTPS YouTube links'
    );
  }

  const realMatches = matches.filter(
    (match) =>
      match.dataType === 'real' ||
      String(match.id || '').startsWith('R-') ||
      match.sourceProvider === 'Rugby.com.au'
  ).length;

  const sampleMatches = Math.max(
    matches.length - realMatches,
    0
  );

  pass(
    'Release data summary',
    `${matches.length} matches (${realMatches} REAL, ${sampleMatches} SAMPLE), ${videos.length} videos`
  );
}

async function checkPublicIdentityAndPolicies() {
  const [
    index,
    app,
    main,
    ja,
    en,
    about,
    sources,
    policy,
    terms,
    privacy,
    disclaimer,
    contact,
    plan,
  ] = await Promise.all([
    readText('index.html'),
    readText('src/App.jsx'),
    readText('src/main.jsx'),
    readText('src/i18n/ja.js'),
    readText('src/i18n/en.js'),
    readText('src/components/AboutPage.jsx'),
    readText('src/components/SourcesPage.jsx'),
    readText('src/components/PolicyPage.jsx'),
    readText('docs/terms-of-use.md'),
    readText('docs/privacy-policy.md'),
    readText('docs/disclaimer.md'),
    readText('docs/contact-policy.md'),
    readText('docs/version-1.0-plan.md'),
  ]);

  const appSource = [
    index,
    app,
    main,
    ja,
    en,
    about,
    sources,
    policy,
  ].join('\n');

  if (!appSource.includes('SVNS Stats Analyzer')) {
    fail(
      'Public application name',
      'SVNS Stats Analyzer was not found in application sources'
    );
  } else {
    pass(
      'Public application name',
      'SVNS Stats Analyzer is present'
    );
  }

  const email = 'svnsstatsanalyzer@gmail.com';

  if (
    !appSource.includes(email) ||
    !contact.includes(email)
  ) {
    fail(
      'Contact address',
      `${email} is missing from the app or contact policy`
    );
  } else {
    pass(
      'Contact address',
      email
    );
  }

  const nonAffiliationTerms = [
    'World Rugby',
    'HSBC',
    'Rugby Australia',
    'YouTube',
  ];
  const missingTerms = nonAffiliationTerms.filter(
    (term) => !ja.includes(term) || !en.includes(term)
  );

  if (missingTerms.length) {
    fail(
      'Unofficial and non-affiliation notice',
      `Missing in Japanese or English: ${missingTerms.join(', ')}`
    );
  } else {
    pass(
      'Unofficial and non-affiliation notice',
      'Required organization and platform names are disclosed'
    );
  }

  const policyDocs = [
    ['Terms', terms],
    ['Privacy', privacy],
    ['Disclaimer', disclaimer],
    ['Contact', contact],
  ];

  const emptyDocs = policyDocs
    .filter(([, source]) => source.trim().length < 200)
    .map(([name]) => name);

  if (emptyDocs.length) {
    fail(
      'Policy documents',
      `Documents appear incomplete: ${emptyDocs.join(', ')}`
    );
  } else {
    pass(
      'Policy documents',
      'Terms, privacy, disclaimer, and contact documents found'
    );
  }

  if (
    plan.includes('PDF／CSV／Excel出力が動作する') ||
    plan.includes('Initial MVP + PWA + Export')
  ) {
    fail(
      'Version1.0 plan scope',
      'The plan still contains obsolete export requirements'
    );
  } else {
    pass(
      'Version1.0 plan scope',
      'Export removal is reflected in completion conditions'
    );
  }

  if (
    !app.includes('PwaStatus') ||
    !main.includes('AppErrorBoundary')
  ) {
    fail(
      'Runtime safeguards',
      'PwaStatus or AppErrorBoundary integration is missing'
    );
  } else {
    pass(
      'Runtime safeguards',
      'PWA status and Error Boundary are integrated'
    );
  }
}

async function checkNoExportImplementation() {
  const files = [
    'src/components/MatchSearch.jsx',
    'src/i18n/ja.js',
    'src/i18n/en.js',
    'src/styles.css',
  ];

  const forbiddenTokens = [
    'exportUtils',
    'createXlsxBlob',
    'printMatchPdf',
    'matchSearchExportPanel',
    'CSVへ出力',
    'Excelへ出力',
    'PDFへ出力',
  ];

  const findings = [];

  for (const relativePath of files) {
    const source = await readText(relativePath);

    forbiddenTokens.forEach((token) => {
      if (source.includes(token)) {
        findings.push(`${relativePath}: ${token}`);
      }
    });
  }

  if (findings.length) {
    fail(
      'Export UI and implementation',
      findings.join('; ')
    );
  } else {
    pass(
      'Export UI and implementation',
      'No CSV, Excel, or PDF export implementation detected'
    );
  }
}

function printSection(title, items, symbol) {
  if (!items.length) {
    return;
  }

  console.log(`\n${title}`);

  items.forEach((item) => {
    const detail = item.detail ? ` — ${item.detail}` : '';
    console.log(`${symbol} ${item.label}${detail}`);
  });
}

try {
  await checkRequiredFiles();
  await checkRemovedExportFiles();
  await checkPackageScripts();
  await checkManifestAndIndex();
  await checkIcons();
  await checkServiceWorker();
  await checkData();
  await checkPublicIdentityAndPolicies();
  await checkNoExportImplementation();

  printSection('PASS', passes, '✓');
  printSection('WARNINGS', warnings, '!');
  printSection('ERRORS', errors, '✗');

  console.log(
    `\nRelease validation summary: ${passes.length} passed, ` +
      `${warnings.length} warning(s), ${errors.length} error(s).`
  );

  if (warnings.length) {
    console.log(
      'Warnings do not fail the build, but should be reviewed before v1.0 completion.'
    );
  }

  if (errors.length) {
    process.exitCode = 1;
  } else {
    console.log('Version1.0 automatic pre-release validation passed.');
  }
} catch (error) {
  console.error(
    `Release validation could not complete: ${error.message}`
  );
  process.exitCode = 1;
}
