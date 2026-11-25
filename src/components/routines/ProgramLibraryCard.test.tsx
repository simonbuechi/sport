import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramLibraryCard } from './ProgramLibraryCard';
import type { ProgramLibraryItem } from '../../types';

describe('ProgramLibraryCard', () => {
    const mockProgram: ProgramLibraryItem = {
        id: 'full-body-foundation',
        name: 'Full Body Foundation',
        description: 'A balanced 3-day full body strength and hypertrophy routine.',
        type: 'repetitive',
        difficulty: 'beginner',
        goal: 'strength',
        daysPerWeek: 3,
        durationDays: 7,
        days: [
            { id: 'd1', dayNumber: 1, templateKey: 'fb_a', note: 'Heavy compound day' },
            { id: 'd2', dayNumber: 2, templateKey: null, note: 'Rest' },
            { id: 'd3', dayNumber: 3, templateKey: 'fb_b', note: 'Hinge day' },
        ],
        templates: {
            fb_a: {
                name: 'Full Body A',
                exercises: [],
            },
            fb_b: {
                name: 'Full Body B',
                exercises: [],
            }
        }
    };

    it('renders program title, description, and difficulty', () => {
        render(
            <ProgramLibraryCard
                program={mockProgram}
                onSelect={vi.fn()}
                onCopy={vi.fn()}
            />
        );

        expect(screen.getByText('Full Body Foundation')).toBeInTheDocument();
        expect(screen.getByText('A balanced 3-day full body strength and hypertrophy routine.')).toBeInTheDocument();
        expect(screen.getByText(/Beginner/i)).toBeInTheDocument();
        expect(screen.getByText(/3 days\/week/i)).toBeInTheDocument();
    });

    it('triggers onSelect when the list item is clicked', () => {
        const onSelect = vi.fn();
        render(
            <ProgramLibraryCard
                program={mockProgram}
                onSelect={onSelect}
                onCopy={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Full Body Foundation'));
        expect(onSelect).toHaveBeenCalledWith(mockProgram);
    });

    it('triggers onCopy without triggering onSelect when Use Program button is clicked', () => {
        const onSelect = vi.fn();
        const onCopy = vi.fn().mockResolvedValue(undefined);
        render(
            <ProgramLibraryCard
                program={mockProgram}
                onSelect={onSelect}
                onCopy={onCopy}
            />
        );

        const useBtn = screen.getByRole('button', { name: /Use Program/i });
        fireEvent.click(useBtn);
        expect(onCopy).toHaveBeenCalledWith(mockProgram);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('disables button and shows copying state when isCopying is true', () => {
        render(
            <ProgramLibraryCard
                program={mockProgram}
                onSelect={vi.fn()}
                onCopy={vi.fn()}
                isCopying={true}
            />
        );

        const btn = screen.getByRole('button', { name: /Copying\.\.\./i });
        expect(btn).toBeDisabled();
    });
});
