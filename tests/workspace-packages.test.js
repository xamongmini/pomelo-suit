'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

const expectedPackages = [
  ['spangrid', '@pomelo-suite/spangrid', 'stable'],
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

test('root package is a private npm workspace for SpanGrid', () => {
  const pkg = readJson('package.json');

  assert.equal(pkg.name, 'pomelo-suite');
  assert.equal(pkg.private, true);
  assert.deepEqual(pkg.workspaces, ['packages/spangrid']);
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.js && npm run test --workspace @pomelo-suite/spangrid --if-present');
  assert.equal(pkg.scripts['lint:syntax'], 'node scripts/check-js-syntax.cjs');
  assert.equal(pkg.scripts['pack:dry-run'], 'npm pack --workspace @pomelo-suite/spangrid --dry-run');
});

test('SpanGrid package has package metadata and a readme', () => {
  for (const [directory, packageName, stability] of expectedPackages) {
    const packageRoot = path.join(ROOT, 'packages', directory);
    const pkg = readJson(path.join('packages', directory, 'package.json'));

    assert.equal(pkg.name, packageName);
    assert.equal(pkg.version, '0.1.0');
    assert.equal(pkg.license, 'MIT');
    assert.equal(pkg.private, false);
    assert.equal(pkg.pomeloSuite.stability, stability);
    assert.equal(fs.existsSync(path.join(packageRoot, 'README.md')), true);
    assert.equal(fs.existsSync(path.join(packageRoot, 'LICENSE')), true);
  }
});

test('public workspace files do not contain Korean text', () => {
  const publicFiles = [
    'README.md',
    'package.json',
    'tests/workspace-packages.test.js',
    'scripts/check-js-syntax.cjs',
    'packages/spangrid/README.md',
    'packages/spangrid/docs/API.md',
    'packages/spangrid/docs/USAGE.md',
    'examples/spangrid/index.html',
    'examples/spangrid/showcase.html',
    'packages/spangrid/package.json',
    'packages/spangrid/src/span-grid.js',
    'packages/spangrid/test/span-grid.test.js',
  ];

  for (const file of publicFiles) {
    const contents = fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert.equal(/[\uac00-\ud7af]/.test(contents), false, `${file} contains Korean text`);
  }
});
