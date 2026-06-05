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
    it('renders the main app container', () => {
        render(<App />);
        expect(document.querySelector('#app-root-container')).toBeInTheDocument();
    });

    it('defaults to viewer mode (renders viewer panel)', () => {
        render(<App isGutenberg={false} />);
        expect(document.querySelector('#tab-content-viewer')).toBeInTheDocument();
    });

    it('renders header with edit button when in Gutenberg and defaults to viewer', () => {
        render(<App isGutenberg={true} />);
        expect(screen.getByText('Chỉnh sửa bản đồ (Full)')).toBeInTheDocument();
    });
});
