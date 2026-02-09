import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DynamicField from '../components/DynamicField';

describe('DynamicField', () => {
    const mockField: any = {
        id: 'f1',
        label: 'Test Field',
        field_type: 'short_text',
        required: true,
        help_text: 'Help me',
        options: null
    };

    it('renders short_text correctly', () => {
        render(<DynamicField field={mockField} value="" onChange={() => { }} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders number field correctly', () => {
        render(<DynamicField field={{ ...mockField, field_type: 'number' }} value="" onChange={() => { }} />);
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('renders date field correctly', () => {
        render(<DynamicField field={{ ...mockField, field_type: 'date' }} value="" onChange={() => { }} />);
        const input = screen.getByLabelText(/Test Field/);
        expect(input).toHaveAttribute('type', 'date');
    });

    it('renders checkbox group', () => {
        render(<DynamicField field={{ ...mockField, field_type: 'checkbox', options: { choices: ['A', 'B'] } }} value={['A']} onChange={() => { }} />);
        expect(screen.getByLabelText('A')).toBeChecked();
        expect(screen.getByLabelText('B')).not.toBeChecked();
    });

    it('renders section_title correctly', () => {
        render(<DynamicField field={{ ...mockField, field_type: 'section_title' }} />);
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Field');
    });
});
