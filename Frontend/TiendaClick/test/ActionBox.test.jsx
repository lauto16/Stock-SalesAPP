import { render, screen, fireEvent } from '@testing-library/react';
import ActionBox from '../src/components/dashboard/ActionBox.jsx';
import { describe, it, expect } from 'vitest';

describe('ActionBox Component', () => {
    const defaultProps = {
        name: 'Test Metric',
        number: '100',
        svgName: 'test-icon',
        cardClass: 'bg-info',
        subtext: 'Revenue',
        subtext_value: '1000'
    };

    it('renders basic information correctly', () => {
        render(<ActionBox {...defaultProps} />);

        expect(screen.getByText('Test Metric')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Revenue')).toBeInTheDocument();

        // Check if image is rendered
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', '/test-icon.svg');
        expect(image).toHaveAttribute('alt', 'test-icon');
    });

    it('handles toggle functionality for restricted values', () => {
        render(<ActionBox {...defaultProps} />);

        // Initially value should be hidden with asterisks
        expect(screen.getByText('***')).toBeInTheDocument();

        // Click the toggle button
        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        // Value should now be visible
        // formatted value for 1000 might vary by locale, but shouldn't be ***
        expect(screen.queryByText('***')).not.toBeInTheDocument();

        // Click again to hide
        fireEvent.click(toggleButton);
        expect(screen.getByText('***')).toBeInTheDocument();
    });

    it('renders correctly without subtext', () => {
        const propsWithoutSubtext = {
            name: 'Simple Metric',
            number: '50',
            svgName: 'simple',
            cardClass: 'bg-success'
        };

        render(<ActionBox {...propsWithoutSubtext} />);

        expect(screen.getByText('Simple Metric')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();

        // Button should not be present
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
