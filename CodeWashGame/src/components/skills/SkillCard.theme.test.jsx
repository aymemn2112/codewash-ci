import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillCard from './SkillCard';
import { SKILL_DATA, THEME_CONFIG } from '../../constants/gameData';

const readingConfig = SKILL_DATA.find((skill) => skill.id === 'reading');

const renderReadingCard = () =>
    render(
        <SkillCard
            config={readingConfig}
            data={{ level: 1, xp: 0, mobHealth: 60, mobMaxHealth: 60 }}
            themeData={THEME_CONFIG.kpop}
            isCenter
            isBattling={false}
            mobName="Zombie"
            mobAura={null}
            challenge={null}
            isListening={false}
            spokenText=""
            damageNumbers={[]}
            onStartBattle={vi.fn()}
            onEndBattle={vi.fn()}
            onMathSubmit={vi.fn()}
            onMicClick={vi.fn()}
            difficulty={1}
            setDifficulty={vi.fn()}
            unlockedDifficulty={1}
            selectedBorder={null}
            borderColor="#ffffff"
            bossHealing={false}
        />,
    );

describe('SkillCard themed content', () => {
    it('uses the active theme label and themed boss art', () => {
        renderReadingCard();

        expect(screen.getByText(/decryption/i)).toBeInTheDocument();
        expect(screen.getByText(/cyborg king/i)).toBeInTheDocument();
        expect(screen.getByAltText(/cyborg king/i)).toHaveAttribute(
            'src',
            'assets/mobs/boss/wither.png',
        );
    });
});
