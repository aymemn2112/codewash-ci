#!/usr/bin/env node
/**
 * Reproducible performance snapshot: bundle sizes and the heaviest assets.
 * Usage: npm run build && node scripts/perf-report.mjs
 */
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';

const walk = (dir, files = []) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path, files);
        else files.push({ path, size: statSync(path).size });
    }
    return files;
};

const kb = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

if (!statSync(DIST, { throwIfNoEntry: false })) {
    console.error(`Missing ${DIST}/ — run "npm run build" first.`);
    process.exit(1);
}

const files = walk(DIST);
const total = files.reduce((sum, file) => sum + file.size, 0);
const byExt = (ext) => files.filter((file) => extname(file.path) === ext);

console.log('=== dist ===');
console.log(`total: ${mb(total)} across ${files.length} files`);

for (const ext of ['.js', '.css']) {
    const subset = byExt(ext);
    const sum = subset.reduce((acc, file) => acc + file.size, 0);
    console.log(`${ext}: ${kb(sum)} (${subset.length} files)`);
}

console.log('\n=== heaviest assets ===');
for (const file of [...files].sort((a, b) => b.size - a.size).slice(0, 10)) {
    console.log(`${mb(file.size).padStart(10)}  ${file.path}`);
}
