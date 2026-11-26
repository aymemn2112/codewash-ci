import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../constants/achievements';
import {
    BADGE_TIERS,
    BASE_ASSETS,
    SKILL_DATA,
    THEME_CONFIG,
    THEMES_LIST,
} from '../constants/gameData';
import {
    DEFAULT_LOCALE,
    LOCALES,
    TRANSLATIONS,
    interpolate,
    isLocaleSupported,
    translate,
} from './translations';

const placeholders = (value) => (value.match(/\{\w+\}/g) || []).sort();

const BORDER_EFFECT_IDS = [
    'solid',
    'solid-picker',
    'gradient',
    'sparkle',
    'electric',
    'lifestream',
    'frost',
    'fire',
    'shadow',
    'rainbow',
    'livewire',
    'void',
    'toxic',
    'holo',
    'crystal',
];

const achievementKeys = () =>
    Object.values(ACHIEVEMENTS).flatMap((achievement) => [
        `achievement.${achievement.id}.name`,
        `achievement.${achievement.id}.description`,
        ...(achievement.isTiered
            ? achievement.tiers.map((_, index) => `achievement.tier.${achievement.id}.${index}`)
            : []),
    ]);

const skillKeys = () =>
    SKILL_DATA.flatMap((skill) => [
        `skill.${skill.id}.name`,
        `skill.${skill.id}.fantasyName`,
        `skill.${skill.id}.action`,
        `skill.${skill.id}.task`,
    ]);

const themeKeys = () => THEMES_LIST.map((theme) => `theme.${theme.id}`);

const themeSkillKeys = () =>
    Object.entries(THEME_CONFIG).flatMap(([themeId, config]) =>
        SKILL_DATA.map((skill) => {
            expect(config.skills[skill.id].name).toBeTruthy();
            return `themeSkill.${themeId}.${skill.id}`;
        }),
    );

const badgeKeys = () => [
    ...BADGE_TIERS.map((tier) => `badge.${tier.title}`),
    'badge.Legendary',
    'badge.Star',
];

const colorKeys = () => Object.keys(BASE_ASSETS.axolotls).map((color) => `color.${color}`);

const tierKeys = () => Array.from({ length: 9 }, (_, index) => `tier.${index}`);

const borderKeys = () =>
    BORDER_EFFECT_IDS.flatMap((id) => [`border.${id}.name`, `border.${id}.description`]);

const dataDrivenKeys = () => [
    ...achievementKeys(),
    ...skillKeys(),
    ...themeKeys(),
    ...themeSkillKeys(),
    ...badgeKeys(),
    ...colorKeys(),
    ...tierKeys(),
    ...borderKeys(),
];

describe('translations', () => {
    it('keeps the English and French dictionaries in sync', () => {
        const englishKeys = Object.keys(TRANSLATIONS.en).sort();
        const frenchKeys = Object.keys(TRANSLATIONS.fr).sort();

        expect(frenchKeys).toEqual(englishKeys);

        for (const key of englishKeys) {
            expect(typeof TRANSLATIONS.en[key]).toBe('string');
            expect(typeof TRANSLATIONS.fr[key]).toBe('string');
            expect(TRANSLATIONS.en[key].length).toBeGreaterThan(0);
            expect(TRANSLATIONS.fr[key].length).toBeGreaterThan(0);
            expect(placeholders(TRANSLATIONS.fr[key])).toEqual(placeholders(TRANSLATIONS.en[key]));
        }
    });

    it('translates every data-driven label', () => {
        for (const key of dataDrivenKeys()) {
            expect(TRANSLATIONS.en[key], `missing English key ${key}`).toBeTruthy();
            expect(TRANSLATIONS.fr[key], `missing French key ${key}`).toBeTruthy();
        }
    });

    it('exposes the supported locales', () => {
        expect(DEFAULT_LOCALE).toBe('en');
        expect(LOCALES.map((locale) => locale.id)).toEqual(['en', 'fr']);
        expect(isLocaleSupported('fr')).toBe(true);
        expect(isLocaleSupported('de')).toBe(false);
    });

    it('interpolates known placeholders and keeps unknown ones', () => {
        expect(interpolate('Lvl {level}', { level: 7 })).toBe('Lvl 7');
        expect(interpolate('Lvl {level}')).toBe('Lvl {level}');
        expect(interpolate('Hi {name}', { other: 'hero' })).toBe('Hi {name}');
    });

    it('translates, falls back to English, then to the key itself', () => {
        expect(translate('fr', 'menu.title')).toBe('Succès');
        expect(translate('de', 'menu.title')).toBe('Achievements');
        expect(translate('en', 'does.not.exist')).toBe('does.not.exist');

        const frenchTitle = TRANSLATIONS.fr['menu.title'];
        TRANSLATIONS.fr['menu.title'] = undefined;
        try {
            expect(translate('fr', 'menu.title')).toBe('Achievements');
        } finally {
            TRANSLATIONS.fr['menu.title'] = frenchTitle;
        }
    });
});
