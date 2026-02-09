import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingScreen from '../components/LoadingScreen';
import NotFoundPage from '../pages/NotFoundPage';
import { BrowserRouter } from 'react-router-dom';

describe('Simple Components', () => {
    it('renders LoadingScreen', () => {
        render(<LoadingScreen />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders NotFoundPage', () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );
        expect(screen.getByText(/404/)).toBeInTheDocument();
        expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });
});
