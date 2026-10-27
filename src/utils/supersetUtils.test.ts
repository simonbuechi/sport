import { describe, it, expect } from 'vitest';
import {
    getAlphabeticalLabel,
    groupExercisesIntoBlocks,
    linkWithNext,
    unlinkFromSuperset,
    updateSupersetNote
} from './supersetUtils';

interface TestExercise {
    exerciseId: string;
    supersetId?: string;
    supersetNote?: string;
}

describe('supersetUtils', () => {
    describe('getAlphabeticalLabel', () => {
        it('returns correct letters for 0-25', () => {
            expect(getAlphabeticalLabel(0)).toBe('A');
            expect(getAlphabeticalLabel(1)).toBe('B');
            expect(getAlphabeticalLabel(25)).toBe('Z');
        });

        it('returns AA for 26', () => {
            expect(getAlphabeticalLabel(26)).toBe('AA');
        });
    });

    describe('groupExercisesIntoBlocks', () => {
        it('handles empty exercises', () => {
            expect(groupExercisesIntoBlocks([])).toEqual([]);
        });

        it('groups standalone exercises without supersetId', () => {
            const exercises: TestExercise[] = [
                { exerciseId: 'ex1' },
                { exerciseId: 'ex2' }
            ];
            const blocks = groupExercisesIntoBlocks(exercises);
            expect(blocks.length).toBe(2);
            expect(blocks[0].isSuperset).toBe(false);
            expect(blocks[0].items[0].originalIndex).toBe(0);
            expect(blocks[1].isSuperset).toBe(false);
            expect(blocks[1].items[0].originalIndex).toBe(1);
        });

        it('groups exercises sharing a supersetId with letters and tags', () => {
            const exercises: TestExercise[] = [
                { exerciseId: 'ex1', supersetId: 'ss1', supersetNote: 'Rest 60s' },
                { exerciseId: 'ex2', supersetId: 'ss1', supersetNote: 'Rest 60s' },
                { exerciseId: 'ex3' },
                { exerciseId: 'ex4', supersetId: 'ss2' },
                { exerciseId: 'ex5', supersetId: 'ss2' }
            ];

            const blocks = groupExercisesIntoBlocks(exercises);
            expect(blocks.length).toBe(3);

            // Block 0: Superset A
            expect(blocks[0].isSuperset).toBe(true);
            expect(blocks[0].letter).toBe('A');
            expect(blocks[0].label).toBe('Superset A');
            expect(blocks[0].note).toBe('Rest 60s');
            expect(blocks[0].items.length).toBe(2);
            expect(blocks[0].items[0].tag).toBe('A1');
            expect(blocks[0].items[0].originalIndex).toBe(0);
            expect(blocks[0].items[1].tag).toBe('A2');
            expect(blocks[0].items[1].originalIndex).toBe(1);

            // Block 1: Standalone
            expect(blocks[1].isSuperset).toBe(false);
            expect(blocks[1].items[0].originalIndex).toBe(2);

            // Block 2: Superset B
            expect(blocks[2].isSuperset).toBe(true);
            expect(blocks[2].letter).toBe('B');
            expect(blocks[2].label).toBe('Superset B');
            expect(blocks[2].items[0].tag).toBe('B1');
            expect(blocks[2].items[1].tag).toBe('B2');
        });

        it('treats a solitary supersetId as standalone (requires at least 2)', () => {
            const exercises: TestExercise[] = [
                { exerciseId: 'ex1', supersetId: 'ss_lone' },
                { exerciseId: 'ex2' }
            ];
            const blocks = groupExercisesIntoBlocks(exercises);
            expect(blocks.length).toBe(2);
            expect(blocks[0].isSuperset).toBe(false);
            expect(blocks[1].isSuperset).toBe(false);
        });
    });

    describe('linkWithNext', () => {
        it('links two standalone exercises into a new superset', () => {
            const exercises: TestExercise[] = [
                { exerciseId: 'ex1' },
                { exerciseId: 'ex2' },
                { exerciseId: 'ex3' }
            ];

            const linked = linkWithNext(exercises, 0);
            expect(linked[0].supersetId).toBeDefined();
            expect(linked[0].supersetId).toBe(linked[1].supersetId);
            expect(linked[2].supersetId).toBeUndefined();
        });

        it('expands existing superset to include the next exercise', () => {
            const exercises: TestExercise[] = [
                { exerciseId: 'ex1', supersetId: 'ss1', supersetNote: 'Burnout' },
                { exerciseId: 'ex2', supersetId: 'ss1', supersetNote: 'Burnout' },
                { exerciseId: 'ex3' }
            ];

            const linked = linkWithNext(exercises, 1);
            expect(linked[2].supersetId).toBe('ss1');
            expect(linked[2].supersetNote).toBe('Burnout');
        });

        it('does nothing when called on last index', () => {
            const exercises: TestExercise[] = [{ exerciseId: 'ex1' }];
            const linked = linkWithNext(exercises, 0);
            expect(linked).toEqual(exercises);
        });
    });

    describe('unlinkFromSuperset', () => {
        it('unlinks an exercise from a 3-exercise superset', () => {
            const exercises: TestExercise[] = [
                { exerciseId: 'ex1', supersetId: 'ss1' },
                { exerciseId: 'ex2', supersetId: 'ss1' },
                { exerciseId: 'ex3', supersetId: 'ss1' }
            ];

            const unlinked = unlinkFromSuperset(exercises, 1);
            expect(unlinked[1].supersetId).toBeUndefined();
            expect(unlinked[0].supersetId).toBe('ss1');
            expect(unlinked[2].supersetId).toBe('ss1');
        });

        it('auto-cleans remaining exercise if unlinking drops superset count below 2', () => {
            const exercises: TestExercise[] = [
                { exerciseId: 'ex1', supersetId: 'ss1', supersetNote: 'Pair' },
                { exerciseId: 'ex2', supersetId: 'ss1', supersetNote: 'Pair' }
            ];

            const unlinked = unlinkFromSuperset(exercises, 0);
            expect(unlinked[0].supersetId).toBeUndefined();
            expect(unlinked[1].supersetId).toBeUndefined();
            expect(unlinked[1].supersetNote).toBeUndefined();
        });
    });

    describe('updateSupersetNote', () => {
        it('updates note across all matching superset items', () => {
            const exercises: TestExercise[] = [
                { exerciseId: 'ex1', supersetId: 'ss1', supersetNote: 'Old' },
                { exerciseId: 'ex2', supersetId: 'ss1', supersetNote: 'Old' },
                { exerciseId: 'ex3', supersetId: 'ss2' }
            ];

            const updated = updateSupersetNote(exercises, 'ss1', 'New Note');
            expect(updated[0].supersetNote).toBe('New Note');
            expect(updated[1].supersetNote).toBe('New Note');
            expect(updated[2].supersetNote).toBeUndefined();
        });
    });
});
