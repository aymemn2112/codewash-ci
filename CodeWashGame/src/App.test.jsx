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
