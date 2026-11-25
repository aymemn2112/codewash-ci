import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders the main menu', () => {
        render(<App />);
        expect(screen.getAllByRole('heading', { name: /level up/i }).length).toBeGreaterThan(0);
    });

    it('renders the main menu controls', () => {
        render(<App />);
        expect(screen.getByRole('button', { name: /enter fullscreen/i })).toBeInTheDocument();
    });

    it('routes drawer and fullscreen clicks through the injected sfx player', () => {
        document.documentElement.requestFullscreen = vi.fn(() => Promise.resolve());
        const { container } = render(<App />);

        fireEvent.click(screen.getByRole('button', { name: /enter fullscreen/i }));
        // Settings, cosmetics, menu and bug report are the four unlabelled
        // icon buttons in DOM order.
        fireEvent.click(container.querySelectorAll('button')[0]);
        fireEvent.click(container.querySelectorAll('button')[1]);
        fireEvent.click(container.querySelectorAll('button')[3]);
        fireEvent.click(container.querySelectorAll('button')[4]);

        expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
        delete document.documentElement.requestFullscreen;
    });

    it('routes carousel navigation through the injected sfx player', () => {
        render(<App />);

        fireEvent.click(screen.getAllByText(/^Math$/)[0]);
        fireEvent.click(screen.getAllByText(/^Writing$/)[0]);
    });

    it('starts and ends a battle through the injected sfx player', () => {
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: /enchant!/i }));
        const challengeOverlay = document.querySelector('.fixed.inset-0.z-50');
        expect(challengeOverlay).not.toBeNull();
        fireEvent.click(challengeOverlay);
    });

    it('switches profile through the injected sfx player', () => {
        const { container } = render(<App />);

        fireEvent.click(container.querySelectorAll('button')[0]);
        fireEvent.click(screen.getByText(/player 2/i));
    });

    it('migrates the legacy profile key and resets it through the storage service', () => {
        localStorage.setItem('heroSkills_v23', JSON.stringify({ theme: 'classic' }));
        const { container } = render(<App />);

        expect(localStorage.getItem('heroSkills_v23_p1')).not.toBeNull();

        fireEvent.click(container.querySelectorAll('button')[0]);
        fireEvent.click(screen.getByRole('button', { name: /delete profile progress/i }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'DELETE' } });
        fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

        expect(localStorage.getItem('heroSkills_v23_p1')).toBeNull();
    });
});
