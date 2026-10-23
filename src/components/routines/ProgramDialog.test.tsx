import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramDialog } from './ProgramDialog';
import type { TrainingTemplate } from '../../types';

describe('ProgramDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockTemplates: TrainingTemplate[] = [
        { id: 'tpl-1', userId: 'user-1', name: 'Upper Body', exercises: [] },
        { id: 'tpl-2', userId: 'user-1', name: 'Lower Body', exercises: [] },
    ];

    it('renders create program dialog with default fields', () => {
        render(
            <ProgramDialog
                open={true}
                onClose={vi.fn()}
                onSave={vi.fn()}
                editingProgram={null}
                templates={mockTemplates}
                saving={false}
            />
        );

        expect(screen.getByText('Create Program')).toBeInTheDocument();
        expect(screen.getByLabelText(/Program Name/i)).toBeInTheDocument();
        expect(screen.getByText('Program Schedule (3)')).toBeInTheDocument();
    });

    it('displays error if submitted with empty name', () => {
        const mockSave = vi.fn();

        render(
            <ProgramDialog
                open={true}
                onClose={vi.fn()}
                onSave={mockSave}
                editingProgram={null}
                templates={mockTemplates}
                saving={false}
            />
        );

        const saveBtn = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveBtn);

        expect(screen.getByText(/Program name is required/i)).toBeInTheDocument();
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('adds a new day when Add Day is clicked', () => {
        render(
            <ProgramDialog
                open={true}
                onClose={vi.fn()}
                onSave={vi.fn()}
                editingProgram={null}
                templates={mockTemplates}
                saving={false}
            />
        );

        expect(screen.getByText('Program Schedule (3)')).toBeInTheDocument();

        const addDayBtn = screen.getByRole('button', { name: /Add Day/i });
        fireEvent.click(addDayBtn);

        expect(screen.getByText('Program Schedule (4)')).toBeInTheDocument();
    });

    it('calls onSave with form data when valid', () => {
        const mockSave = vi.fn().mockResolvedValue(undefined);
        const mockClose = vi.fn();

        render(
            <ProgramDialog
                open={true}
                onClose={mockClose}
                onSave={mockSave}
                editingProgram={null}
                templates={mockTemplates}
                saving={false}
            />
        );

        const nameInput = screen.getByLabelText(/Program Name/i);
        fireEvent.change(nameInput, { target: { value: 'My 3-Day Split' } });

        const saveBtn = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveBtn);

        expect(mockSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'My 3-Day Split',
                type: 'repetitive',
            })
        );
    });
});
