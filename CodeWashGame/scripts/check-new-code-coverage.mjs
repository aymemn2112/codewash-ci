#!/usr/bin/env node
/**
 * New-code coverage gate.
 *
 * Fails when a source file added by the current branch (relative to BASE_REF)
 * is not fully covered by tests. Modified lines in existing files are covered
 * by the separate 80% patch-coverage gate.
 *
 * Uses the JSON summary produced by `npm run coverage`.
 *
 * Environment:
 *   BASE_REF       git ref to compare against (default: origin/develop)
 *   SUMMARY_PATH   coverage summary path (default: coverage/coverage-summary.json)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const baseRef = process.env.BASE_REF || 'origin/develop';
const summaryPath = process.env.SUMMARY_PATH || 'coverage/coverage-summary.json';

const runGit = (args) =>
    execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const normalize = (filePath) =>
    filePath
        .replaceAll('\\', '/')
        .replace(/^\.\//, '')
        .replace(/^.*?CodeWashGame\//, '');

const root = runGit(['rev-parse', '--show-toplevel']).trim();

if (!existsSync(summaryPath)) {
    console.error(`[new-code-coverage] Missing ${summaryPath}. Run "npm run coverage" first.`);
    process.exit(1);
}

let base;
try {
    base = runGit(['-C', root, 'merge-base', baseRef, 'HEAD']).trim();
} catch {
    console.warn(`[new-code-coverage] Cannot resolve base ref "${baseRef}". Skipping the gate.`);
    process.exit(0);
}

const added = runGit([
    '-C',
    root,
    'diff',
    '--diff-filter=A',
    '--name-only',
    '--no-color',
    `${base}...HEAD`,
    '--',
    'CodeWashGame/src',
])
    .split('\n')
    .map((line) => normalize(line.trim()))
    .filter(
        (file) =>
            /\.(js|jsx)$/.test(file) &&
            !/\.(test|spec)\.(js|jsx)$/.test(file) &&
            !file.startsWith('src/test/'),
    );

if (added.length === 0) {
    console.log(`[new-code-coverage] No new source files vs ${baseRef}. Gate passes.`);
    process.exit(0);
}

const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
const byFile = new Map();
for (const [key, value] of Object.entries(summary)) {
    if (key !== 'total') byFile.set(normalize(key), value);
}

const metrics = ['lines', 'statements', 'functions', 'branches'];
const failures = [];
let checked = 0;

for (const file of added) {
    const coverage = byFile.get(file);
    if (!coverage) {
        console.warn(`[new-code-coverage] ${file} is not instrumented; skipping it.`);
        continue;
    }
    checked++;
    for (const metric of metrics) {
        const { pct, total } = coverage[metric];
        if (total > 0 && pct < 100) {
            failures.push(`${file} ${metric}: ${pct}% (${coverage[metric].covered}/${total})`);
        }
    }
}

console.log(
    `[new-code-coverage] ${checked} new source file(s) checked: 100% lines/statements/functions/branches required.`,
);

if (failures.length > 0) {
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
}

console.log('[new-code-coverage] Gate passed.');
