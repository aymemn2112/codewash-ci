import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const root = dirname(sourceRoot);

const sourceFiles = (() => {
    const found = [];
    const walk = (directory) => {
        for (const entry of readdirSync(directory)) {
            const path = join(directory, entry);
            if (statSync(path).isDirectory()) {
                walk(path);
                continue;
            }
            if (!/\.(js|jsx)$/.test(entry) || entry.includes('.test.')) continue;
            if (relative(sourceRoot, path).startsWith('i18n')) continue;
            if (relative(sourceRoot, path).startsWith('constants')) continue;
            found.push(path);
        }
    };
    walk(sourceRoot);
    return found;
})();

const stripComments = (source) =>
    source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const containsPhrase = (source, phrase) =>
    new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(phrase)}([^A-Za-z0-9_]|$)`).test(source);

const BANNED_UI_STRINGS = [
    'Music Volume',
    'SFX Volume',
    'Audio Configuration',
    'Danger Zone',
    'DELETE PROFILE PROGRESS',
    'Select File',
    'Themes & Cosmetics',
    'Theme Select',
    'Border Effects',
    'Total Level:',
    'Badges:',
    'Achievements:',
    'Special Achievements',
    'LEGENDARY! (Lvl 180+)',
    'Progress:',
    'Next:',
    'MAX TIER REACHED!',
    'Are you sure you want to delete',
    'This action is irreversible!',
    'Type DELETE to confirm',
    'Please type DELETE to confirm.',
    'Discovered a bug?',
    'Whoa... That sucks...',
    'What is this?',
    'Incorrect answer. Try again!',
    'Some saved data could not be read',
    'Dismiss warning',
    'YOU DIED',
    'Level -1',
    'Take a moment to rest...',
    'LEVEL RESTORED!',
    'Welcome back, hero!',
    'Skill Proficiency',
    'Parent?',
    'New Rank!',
    'Phantom Bonus!',
    'Unlocked',
    'Game Logo',
    'Round:',
    'Watch!',
    'Your turn!',
    'Game Over!',
    'Retry',
    'Tap to Speak',
    'Complete!',
    'Skip / Manual Success',
    'ACHIEVEMENT UNLOCKED!',
    'Report a bug',
    'Enter fullscreen',
    'Exit fullscreen',
];

describe('UI copy', () => {
    it('does not keep translated literals in source components', () => {
        const offenders = [];

        for (const file of sourceFiles) {
            const source = stripComments(readFileSync(file, 'utf8'));
            for (const phrase of BANNED_UI_STRINGS) {
                if (containsPhrase(source, phrase)) {
                    offenders.push(`${relative(root, file)}: ${phrase}`);
                }
            }
        }

        expect(offenders).toEqual([]);
    });
});
