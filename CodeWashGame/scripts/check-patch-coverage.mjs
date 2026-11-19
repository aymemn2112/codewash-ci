#!/usr/bin/env node
/**
 * Patch coverage gate.
 *
 * Fails when fewer than PATCH_COVERAGE_THRESHOLD % (default 80) of the
 * executable lines changed by the current branch (relative to BASE_REF) are
 * covered by tests.
 *
 * Uses the lcov report produced by `npm run coverage`.
 *
 * Environment:
 *   BASE_REF                 git ref to compare against (default: origin/develop)
 *   PATCH_COVERAGE_THRESHOLD minimum percentage (default: 80)
 *   LCOV_PATH                coverage report path (default: coverage/lcov.info)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const threshold = Number(process.env.PATCH_COVERAGE_THRESHOLD || 80);
const baseRef = process.env.BASE_REF || 'origin/develop';
const lcovPath = process.env.LCOV_PATH || 'coverage/lcov.info';

const runGit = (args) =>
    execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const normalize = (filePath) =>
    filePath
        .replaceAll('\\', '/')
        .replace(/^\.\//, '')
        .replace(/^.*?CodeWashGame\//, '');

const root = runGit(['rev-parse', '--show-toplevel']).trim();

if (!existsSync(lcovPath)) {
    console.error(`[patch-coverage] Missing ${lcovPath}. Run "npm run coverage" first.`);
    process.exit(1);
}

let base;
try {
    base = runGit(['-C', root, 'merge-base', baseRef, 'HEAD']).trim();
} catch {
    console.warn(`[patch-coverage] Cannot resolve base ref "${baseRef}". Skipping the gate.`);
    process.exit(0);
}

const diff = runGit([
    '-C',
    root,
    'diff',
    '-w',
    '--unified=0',
    '--no-color',
    `${base}...HEAD`,
    '--',
    'CodeWashGame/src',
]);

/** @type {Map<string, Set<number>>} file (src/...) -> changed new-side line numbers */
const changedLines = new Map();
let currentFile = null;

for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
        const raw = line.slice('+++ b/'.length);
        const file = normalize(raw);
        if (/\.(test|spec)\.(js|jsx)$/.test(file) || file.startsWith('src/test/')) {
            currentFile = null;
            continue;
        }
        currentFile = file;
        changedLines.set(file, new Set());
        continue;
    }

    if (!currentFile || !line.startsWith('@@')) continue;

    const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (!match) continue;

    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);
    for (let offset = 0; offset < count; offset++) {
        changedLines.get(currentFile).add(start + offset);
    }
}

/** @type {Map<string, Map<number, number>>} file (src/...) -> line -> hits */
const coverage = new Map();
let coverageFile = null;

for (const line of readFileSync(lcovPath, 'utf8').split('\n')) {
    if (line.startsWith('SF:')) {
        coverageFile = normalize(line.slice(3));
        coverage.set(coverageFile, new Map());
    } else if (line.startsWith('DA:') && coverageFile) {
        const [lineNumber, hits] = line.slice(3).split(',');
        coverage.get(coverageFile).set(Number(lineNumber), Number(hits));
    }
}

let executable = 0;
let covered = 0;
const uncovered = [];

for (const [file, lines] of changedLines) {
    const fileCoverage = coverage.get(file);
    if (!fileCoverage) continue; // not instrumented (constants, excluded files)

    for (const lineNumber of lines) {
        if (!fileCoverage.has(lineNumber)) continue; // not executable
        executable++;
        if (fileCoverage.get(lineNumber) > 0) {
            covered++;
        } else {
            uncovered.push(`${file}:${lineNumber}`);
        }
    }
}

if (executable === 0) {
    console.log(
        `[patch-coverage] No executable changed lines vs ${baseRef} (${base.slice(0, 8)}). Gate passes.`,
    );
    process.exit(0);
}

const ratio = (covered / executable) * 100;
const rounded = ratio.toFixed(2);
console.log(
    `[patch-coverage] ${covered}/${executable} changed executable lines covered (${rounded}%). Threshold: ${threshold}%.`,
);

if (uncovered.length > 0) {
    console.log('[patch-coverage] Uncovered changed lines (first 20):');
    for (const entry of uncovered.slice(0, 20)) {
        console.log(`  - ${entry}`);
    }
    if (uncovered.length > 20) {
        console.log(`  ... and ${uncovered.length - 20} more`);
    }
}

if (ratio + Number.EPSILON < threshold) {
    console.error(`[patch-coverage] FAILED: ${rounded}% < ${threshold}% of changed lines covered.`);
    process.exit(1);
}

console.log('[patch-coverage] Gate passed.');
