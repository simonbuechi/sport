import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExerciseCard from './ExerciseCard';

// Mock the router navigate function
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import type { Exercise } from '../../types';

describe('ExerciseCard', () => {
  const mockExercise = {
    id: 'test-id-1',
    name: 'Bench Press',
    type: 'strength',
    bodypart: 'Chest',
    category: 'Barbell',
    aliases: ['BP'],
    description: 'A classic chest exercise.',
  } as unknown as Exercise; // Type assertion to bypass full Exercise type requirements for this simple test

  it('renders the exercise name correctly', () => {
    render(
      <MemoryRouter>
        <ExerciseCard exercise={mockExercise} />
      </MemoryRouter>
    );

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('strength')).toBeInTheDocument();
    expect(screen.getByText('Chest')).toBeInTheDocument();
    expect(screen.getByText('Barbell')).toBeInTheDocument();
  });
});
