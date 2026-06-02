import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock Lucide icons to avoid rendering heavy SVG icons in tests
vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react');
    return {
        ...actual as any,
        Map: () => <div data-testid="mock-icon-map" />,
        Eye: () => <div data-testid="mock-icon-eye" />,
        Settings: () => <div data-testid="mock-icon-settings" />,
    };
});

describe('App Component', () => {
    it('renders the header title', () => {
        render(<App />);
        expect(screen.getByRole('heading', { level: 1, name: /SVG Data Map/i })).toBeInTheDocument();
    });

    it('defaults to viewer mode when not in Gutenberg', () => {
        render(<App isGutenberg={false} />);
        expect(screen.getByText('Chế độ Trình chiếu')).toBeInTheDocument();
    });

    it('defaults to builder mode when in Gutenberg', () => {
        render(<App isGutenberg={true} />);
        expect(screen.getByText('Chế độ Soạn thảo (Builder)')).toBeInTheDocument();
    });
});
