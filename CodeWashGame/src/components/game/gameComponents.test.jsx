import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoadWarning from './LoadWarning';
import PlayerHealth from './PlayerHealth';
import CornerControls from './CornerControls';
import DeathOverlay from './DeathOverlay';
import LevelRestored from './LevelRestored';

vi.mock('../../utils/soundManager', () => ({ playClick: vi.fn() }));

afterEach(() => {
    vi.restoreAllMocks();
});

describe('LoadWarning', () => {
    it('shows the message and dismisses', () => {
        const onDismiss = vi.fn();
        render(<LoadWarning onDismiss={onDismiss} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/could not be read/i);
        fireEvent.click(screen.getByRole('button', { name: /dismiss warning/i }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});

describe('PlayerHealth', () => {
    it('renders ten hearts', () => {
        const { container } = render(<PlayerHealth health={7} />);
        expect(container.firstChild.children).toHaveLength(10);
    });
});

describe('CornerControls', () => {
    const handlers = () => ({
        onOpenSettings: vi.fn(),
        onOpenCosmetics: vi.fn(),
        onToggleFullscreen: vi.fn(),
        onOpenMenu: vi.fn(),
        onOpenBugReport: vi.fn(),
    });

    it('renders the five controls', () => {
        render(<CornerControls isFullscreen={false} {...handlers()} />);
        expect(screen.getByRole('button', { name: /enter fullscreen/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cosmetics/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /report a bug/i })).toBeInTheDocument();
    });

    it('wires each button to its handler', () => {
        const h = handlers();
        render(<CornerControls isFullscreen {...h} />);

        fireEvent.click(screen.getByRole('button', { name: /exit fullscreen/i }));
        fireEvent.click(screen.getByRole('button', { name: /settings/i }));
        fireEvent.click(screen.getByRole('button', { name: /cosmetics/i }));
        fireEvent.click(screen.getByRole('button', { name: /menu/i }));
        fireEvent.click(screen.getByRole('button', { name: /report a bug/i }));

        expect(h.onToggleFullscreen).toHaveBeenCalledTimes(1);
        expect(h.onOpenSettings).toHaveBeenCalledTimes(1);
        expect(h.onOpenCosmetics).toHaveBeenCalledTimes(1);
        expect(h.onOpenMenu).toHaveBeenCalledTimes(1);
        expect(h.onOpenBugReport).toHaveBeenCalledTimes(1);
    });
});

describe('overlays', () => {
    it('renders the death overlay', () => {
        render(<DeathOverlay />);
        expect(screen.getByText('YOU DIED')).toBeInTheDocument();
    });

    it('renders the level restored overlay', () => {
        render(<LevelRestored />);
        expect(screen.getByText('LEVEL RESTORED!')).toBeInTheDocument();
    });
});
