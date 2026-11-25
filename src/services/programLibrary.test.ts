import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cloneProgramFromLibrary } from './db';
import type { ProgramLibraryItem, Exercise } from '../types';

const mockBatchSet = vi.fn();
const mockBatchCommit = vi.fn(() => Promise.resolve());
let docCounter = 0;

vi.mock('../firebase/config', () => ({
    db: {},
    auth: { currentUser: null },
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn((_db, ...segments: string[]) => ({ path: segments.join('/') })),
    doc: vi.fn((colRef: { path?: string }) => {
        docCounter += 1;
        if (colRef.path?.endsWith('/programs')) {
            return { id: 'mock-program-id' };
        }
        return { id: `mock-tpl-${String(docCounter)}` };
    }),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
    limit: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    getDocsFromCache: vi.fn(),
    arrayUnion: vi.fn(),
    where: vi.fn(),
    writeBatch: vi.fn(() => ({
        set: mockBatchSet,
        update: vi.fn(),
        delete: vi.fn(),
        commit: mockBatchCommit,
    })),
}));

describe('cloneProgramFromLibrary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        docCounter = 0;
    });

    const mockExercises: Exercise[] = [
        {
            id: 'ex-squat',
            name: 'Barbell Squat',
            type: 'strength',
            bodypart: 'Legs',
            category: 'Barbell',
            aliases: [],
        },
        {
            id: 'ex-bench',
            name: 'Barbell Bench Press',
            type: 'strength',
            bodypart: 'Chest',
            category: 'Barbell',
            aliases: [],
        }
    ];

    const mockItem: ProgramLibraryItem = {
        id: 'starter-split',
        name: 'Starter Split',
        description: 'Test starter split',
        type: 'repetitive',
        difficulty: 'beginner',
        goal: 'strength',
        durationDays: 3,
        days: [
            { id: 'd1', dayNumber: 1, templateKey: 'push', note: 'Push hard' },
            { id: 'd2', dayNumber: 2, templateKey: null, note: 'Rest day' },
            { id: 'd3', dayNumber: 3, templateKey: 'legs', note: 'Leg day' },
        ],
        templates: {
            push: {
                name: 'Push Workout',
                notes: 'Chest and shoulders',
                exercises: [
                    {
                        exerciseName: 'Barbell Bench Press',
                        sets: [{ id: 's1', reps: 10, weight: 60 }]
                    }
                ]
            },
            legs: {
                name: 'Leg Workout',
                notes: 'Quads and hamstrings',
                exercises: [
                    {
                        exerciseName: 'Barbell Squat',
                        sets: [{ id: 's2', reps: 8, weight: 80 }]
                    }
                ]
            }
        }
    };

    it('atomically clones all templates and maps them to program days in one batch', async () => {
        const result = await cloneProgramFromLibrary('user-123', mockItem, mockExercises);

        expect(result.programId).toBe('mock-program-id');
        expect(result.createdTemplateIds).toEqual(['mock-tpl-1', 'mock-tpl-2']);
        expect(mockBatchSet).toHaveBeenCalledTimes(3); // 2 templates + 1 program
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);

        // Verify cloned set IDs are regenerated UUIDs rather than reusing static 's1'
        const firstTplCall = mockBatchSet.mock.calls[0][1] as { exercises: { sets: { id: string }[] }[] };
        expect(firstTplCall.exercises[0].sets[0].id).not.toBe('s1');
    });

    it('handles library programs with no templates gracefully', async () => {
        const itemNoTpl: ProgramLibraryItem = {
            id: 'rest-only',
            name: 'Rest Only',
            type: 'one-time',
            durationDays: 1,
            days: [{ id: 'd1', dayNumber: 1, templateKey: null, note: 'Recovery' }],
        };

        const result = await cloneProgramFromLibrary('user-123', itemNoTpl, mockExercises);
        expect(result.programId).toBe('mock-program-id');
        expect(result.createdTemplateIds.length).toBe(0);
        expect(mockBatchSet).toHaveBeenCalledTimes(1);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });
});
