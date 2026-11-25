import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MenuDrawer from './MenuDrawer';
import { I18nProvider } from '../../i18n/I18nProvider';
import { STORAGE_KEYS } from '../../services/storageKeys';
import { SKILL_DATA } from '../../constants/gameData';

const skills = Object.fromEntries(
    SKILL_DATA.map(({ id }) => [id, { level: 1, xp: 0, difficulty: 1, earnedBadges: [] }]),
);

const stats = {
    themeChanges: 0,
    borderChanges: 0,
    totalBattles: 0,
    phantomsCaught: 0,
    playedDays: [],
    mobDefeats: {},
    miniBossDefeats: {},
    bossDefeats: {},
    perfectMemoryGames: 0,
    maxDifficulty: 1,
};

describe('MenuDrawer language selector', () => {
    it('switches the drawer from English to French', async () => {
        const user = userEvent.setup();
        const storage = {
            getItem: () => null,
            setItem: () => {},
        };

        render(
            <I18nProvider storage={storage}>
                <MenuDrawer isOpen skills={skills} stats={stats} />
            </I18nProvider>,
        );

        expect(screen.getByRole('heading', { name: 'Achievements' })).toBeTruthy();
        expect(screen.getByText('Total Level:')).toBeTruthy();

        await user.click(screen.getByRole('button', { name: 'Français' }));

        expect(screen.getByRole('heading', { name: 'Succès' })).toBeTruthy();
        expect(screen.getByText('Niveau total :')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Français' }).getAttribute('aria-pressed')).toBe(
            'true',
        );
    });

    it('writes the selected locale to storage', async () => {
        const user = userEvent.setup();
        const values = new Map();
        const storage = {
            getItem: (key) => values.get(key) ?? null,
            setItem: (key, value) => values.set(key, value),
        };

        render(
            <I18nProvider storage={storage}>
                <MenuDrawer isOpen skills={skills} stats={stats} />
            </I18nProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'English' }));
        await user.click(screen.getByRole('button', { name: 'Français' }));

        expect(values.get(STORAGE_KEYS.LOCALE)).toBe('fr');
    });
});
