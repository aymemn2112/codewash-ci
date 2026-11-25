import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { describe, it, expect } from 'vitest';
import {
    DEFAULT_THEME_ID,
    SKILL_DATA,
    THEME_CONFIG,
    THEMES_LIST,
    normalizeThemeId,
} from './gameData';

const publicDir = resolve(cwd(), 'public');
const themeIds = THEMES_LIST.map((theme) => theme.id);

describe('theme identity', () => {
    it('uses a neutral default theme', () => {
        expect(DEFAULT_THEME_ID).toBe('classic');
        expect(THEME_CONFIG[DEFAULT_THEME_ID]).toBeDefined();
        expect(themeIds).toContain('classic');
    });

    it('migrates the legacy minecraft theme id', () => {
        expect(normalizeThemeId('minecraft')).toBe('classic');
    });

    it('leaves other theme ids untouched', () => {
        expect(normalizeThemeId('kpop')).toBe('kpop');
        expect(normalizeThemeId('spy')).toBe('spy');
        expect(normalizeThemeId('fantasy')).toBe('fantasy');
        expect(normalizeThemeId('scifi')).toBe('scifi');
    });
});

describe('theme catalog', () => {
    it('exposes six configured themes including fantasy and scifi', () => {
        expect(themeIds).toHaveLength(6);
        expect(themeIds).toEqual(Object.keys(THEME_CONFIG));
        expect(themeIds).toEqual(expect.arrayContaining(['fantasy', 'scifi']));
    });

    it('defines labels, music, scrollbar colors and themed art for every skill', () => {
        for (const id of themeIds) {
            const theme = THEME_CONFIG[id];
            expect(theme.name).toBeTruthy();
            expect(theme.bgm.length).toBeGreaterThanOrEqual(2);
            expect(theme.scrollbar.track).toMatch(/^#[0-9a-f]{6}$/i);
            expect(theme.scrollbar.thumb).toMatch(/^#[0-9a-f]{6}$/i);

            for (const skill of SKILL_DATA) {
                const skillTheme = theme.skills[skill.id];
                expect(skillTheme).toEqual(
                    expect.objectContaining({
                        name: expect.any(String),
                        boss: expect.any(String),
                    }),
                );
                expect(theme.assets.mobs[skillTheme.boss]).toBeTruthy();
            }
        }
    });

    it('references only local assets that exist', () => {
        const assets = themeIds.flatMap((id) => {
            const theme = THEME_CONFIG[id];
            const listItem = THEMES_LIST.find((item) => item.id === id);
            const background = theme.style.backgroundImage.match(/url\('([^']+)'\)/)[1];
            return [
                listItem.img,
                background,
                theme.assets.logo,
                theme.assets.cardBack,
                ...theme.bgm,
                ...Object.values(theme.assets.mobs),
            ];
        });

        for (const asset of assets) {
            expect(existsSync(resolve(publicDir, asset))).toBe(true);
        }
    });
});
