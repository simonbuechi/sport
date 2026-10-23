import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ActiveProgramCard } from './ActiveProgramCard';
import type { Program, TrainingTemplate } from '../../types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ActiveProgramCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockTemplates: TrainingTemplate[] = [
        {
            id: 'tpl-1',
            userId: 'user-1',
            name: 'Push Day A',
            exercises: [],
        },
        {
            id: 'tpl-2',
            userId: 'user-1',
            name: 'Pull Day A',
            exercises: [],
        },
    ];

    const mockProgram: Program = {
        id: 'prog-1',
        userId: 'user-1',
        name: 'PPL Hypertrophy',
        type: 'repetitive',
        isActive: true,
        currentDayIndex: 0,
        days: [
            { id: 'd1', dayNumber: 1, templateId: 'tpl-1', note: 'Heavy bench focus' },
            { id: 'd2', dayNumber: 2, templateId: 'tpl-2', note: 'Deadlift day' },
            { id: 'd3', dayNumber: 3, templateId: null, note: 'Rest & foam rolling' },
        ],
    };

    it('renders active program header, current day, and template name', () => {
        render(
            <MemoryRouter>
                <ActiveProgramCard
                    program={mockProgram}
                    templates={mockTemplates}
                    onAdvanceDay={vi.fn()}
                    onDeactivate={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('PPL Hypertrophy')).toBeInTheDocument();
        expect(screen.getAllByText(/Push Day A/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Heavy bench focus/)[0]).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Start Workout/i })).toBeInTheDocument();
    });

    it('renders rest day information properly when templateId is null', () => {
        const restDayProgram: Program = {
            ...mockProgram,
            currentDayIndex: 2, // Day 3 is rest day
        };

        render(
            <MemoryRouter>
                <ActiveProgramCard
                    program={restDayProgram}
                    templates={mockTemplates}
                    onAdvanceDay={vi.fn()}
                    onDeactivate={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(screen.getAllByText(/Rest Day/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Rest & foam rolling/)[0]).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Start Workout/i })).not.toBeInTheDocument();
    });

    it('navigates to workout form with templateId when Start Workout is clicked', () => {
        render(
            <MemoryRouter>
                <ActiveProgramCard
                    program={mockProgram}
                    templates={mockTemplates}
                    onAdvanceDay={vi.fn()}
                    onDeactivate={vi.fn()}
                />
            </MemoryRouter>
        );

        const startBtn = screen.getByRole('button', { name: /Start Workout/i });
        fireEvent.click(startBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/journal/new?templateId=tpl-1');
    });

    it('calls onAdvanceDay with next index when next day button is clicked', async () => {
        const mockAdvance = vi.fn().mockResolvedValue(undefined);

        render(
            <MemoryRouter>
                <ActiveProgramCard
                    program={mockProgram}
                    templates={mockTemplates}
                    onAdvanceDay={mockAdvance}
                    onDeactivate={vi.fn()}
                />
            </MemoryRouter>
        );

        const nextBtn = screen.getByRole('button', { name: /Next Day/i });
        await act(async () => {
            fireEvent.click(nextBtn);
        });

        expect(mockAdvance).toHaveBeenCalledWith(1);
    });

    it('calls onDeactivate when deactivate button is clicked', () => {
        const mockDeactivate = vi.fn().mockResolvedValue(undefined);

        render(
            <MemoryRouter>
                <ActiveProgramCard
                    program={mockProgram}
                    templates={mockTemplates}
                    onAdvanceDay={vi.fn()}
                    onDeactivate={mockDeactivate}
                />
            </MemoryRouter>
        );

        const deactivateBtn = screen.getByRole('button', { name: /Deactivate/i });
        fireEvent.click(deactivateBtn);

        expect(mockDeactivate).toHaveBeenCalled();
    });
});
