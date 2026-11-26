import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CosmeticsDrawer from './CosmeticsDrawer';

const buildProps = (overrides = {}) => ({
    isOpen: true,
    activeTheme: 'classic',
    setActiveTheme: vi.fn(),
    selectedBorder: 'solid',
    setSelectedBorder: vi.fn(),
    borderColor: '#FFD700',
    setBorderColor: vi.fn(),
    unlockedBorders: [],
    unlockedAchievements: [],
    ...overrides,
});

describe('CosmeticsDrawer', () => {
    it('shows the six themes with a visible themed scrollbar', () => {
        const { container } = render(<CosmeticsDrawer {...buildProps()} />);

        expect(screen.getByText('Fantasy Quest')).toBeInTheDocument();
        expect(screen.getByText('Sci-Fi Orbit')).toBeInTheDocument();
        expect(container.querySelector('.themed-scroll')).toBeInTheDocument();
    });

    it('calls setActiveTheme with the selected theme id', () => {
        const setActiveTheme = vi.fn();
        render(<CosmeticsDrawer {...buildProps({ setActiveTheme })} />);

        fireEvent.click(screen.getByRole('button', { name: /fantasy quest/i }));

        expect(setActiveTheme).toHaveBeenCalledWith('fantasy');
    });
});
