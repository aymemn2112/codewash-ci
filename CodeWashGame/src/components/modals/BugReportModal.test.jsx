import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BugReportModal from './BugReportModal';

describe('BugReportModal', () => {
    it('renders nothing when closed', () => {
        const { container } = render(<BugReportModal isOpen={false} onClose={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the placeholder content when open', () => {
        render(<BugReportModal isOpen onClose={vi.fn()} />);
        expect(screen.getByText('Discovered a bug?')).toBeInTheDocument();
        expect(screen.getByText('Whoa... That sucks...')).toBeInTheDocument();
    });
});
