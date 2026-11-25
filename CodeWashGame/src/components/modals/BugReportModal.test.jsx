import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BugReportModal from './BugReportModal';

const endpoint = 'http://localhost:8787/report';

const renderModal = (props = {}) =>
    render(
        <BugReportModal
            isOpen
            onClose={vi.fn()}
            endpoint={endpoint}
            sendReport={vi.fn().mockResolvedValue(true)}
            readFile={vi.fn().mockResolvedValue('data:image/png;base64,abc')}
            {...props}
        />,
    );

beforeEach(() => {
    localStorage.clear();
});

describe('BugReportModal', () => {
    it('renders nothing when closed', () => {
        const { container } = render(
            <BugReportModal isOpen={false} onClose={vi.fn()} endpoint={endpoint} />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('asks for an endpoint when none is configured', () => {
        renderModal({ endpoint: '' });
        expect(screen.getByRole('status')).toHaveTextContent(/no report endpoint/i);
        expect(screen.getByRole('button', { name: /send report/i })).toBeDisabled();
    });

    it('sends a report and shows success', async () => {
        const sendReport = vi.fn().mockResolvedValue(true);
        renderModal({ sendReport });

        fireEvent.change(screen.getByLabelText(/bug description/i), {
            target: { value: 'The menu froze' },
        });
        fireEvent.change(screen.getByLabelText(/steps to reproduce/i), {
            target: { value: '1. open the game' },
        });
        fireEvent.click(screen.getByRole('button', { name: /send report/i }));

        await screen.findByText(/report sent/i);
        expect(sendReport).toHaveBeenCalledTimes(1);
        const [url, report] = sendReport.mock.calls[0];
        expect(url).toBe(endpoint);
        expect(report.description).toBe('The menu froze');
        expect(report.steps).toBe('1. open the game');
        expect(report.screenshots).toEqual([]);
    });

    it('attaches selected screenshots', async () => {
        const sendReport = vi.fn().mockResolvedValue(true);
        const readFile = vi.fn().mockResolvedValue('data:image/png;base64,xyz');
        renderModal({ sendReport, readFile });

        fireEvent.change(screen.getByLabelText(/bug description/i), {
            target: { value: 'Screenshot bug' },
        });
        const file = new File(['img'], 'shot.png', { type: 'image/png' });
        fireEvent.change(screen.getByLabelText(/screenshots/i), {
            target: { files: [file] },
        });
        fireEvent.click(screen.getByRole('button', { name: /send report/i }));

        await screen.findByText(/report sent/i);
        expect(readFile).toHaveBeenCalledWith(file);
        expect(sendReport.mock.calls[0][1].screenshots).toEqual(['data:image/png;base64,xyz']);
    });

    it('shows an error when delivery fails', async () => {
        const sendReport = vi.fn().mockRejectedValue(new Error('HTTP 500'));
        renderModal({ sendReport });

        fireEvent.change(screen.getByLabelText(/bug description/i), {
            target: { value: 'Boom' },
        });
        fireEvent.click(screen.getByRole('button', { name: /send report/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(/HTTP 500/);
        });
    });
});
