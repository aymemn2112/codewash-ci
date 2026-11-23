import { describe, it, expect } from 'vitest';
import { DEFAULT_THEME_ID, THEME_CONFIG, THEMES_LIST, normalizeThemeId } from './gameData';

describe('theme identity', () => {
    it('uses a neutral default theme', () => {
        expect(DEFAULT_THEME_ID).toBe('classic');
        expect(THEME_CONFIG[DEFAULT_THEME_ID]).toBeDefined();
        expect(THEMES_LIST.map((theme) => theme.id)).toContain('classic');
    });

    it('migrates the legacy minecraft theme id', () => {
        expect(normalizeThemeId('minecraft')).toBe('classic');
    });

    it('leaves other theme ids untouched', () => {
        expect(normalizeThemeId('kpop')).toBe('kpop');
        expect(normalizeThemeId('spy')).toBe('spy');
    });
});
