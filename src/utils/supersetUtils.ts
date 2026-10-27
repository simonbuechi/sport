export interface SupersetItemWrapper<T> {
    item: T;
    originalIndex: number;
    tag?: string; // e.g. "A1", "A2"
}

export interface SupersetGroup<T> {
    isSuperset: boolean;
    supersetId?: string;
    letter?: string; // e.g. "A"
    label?: string; // e.g. "Superset A"
    note?: string;
    items: SupersetItemWrapper<T>[];
}

/**
 * Converts a 0-based index to an alphabetical label (0 -> A, 1 -> B, ..., 26 -> AA).
 */
export function getAlphabeticalLabel(index: number): string {
    let result = '';
    let current = index;
    while (current >= 0) {
        result = String.fromCharCode(65 + (current % 26)) + result;
        current = Math.floor(current / 26) - 1;
    }
    return result;
}

/**
 * Generates a unique superset ID.
 */
export function generateSupersetId(): string {
    return `ss_${String(Date.now())}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Groups an array of exercises into sequential blocks (standalone exercises or supersets).
 */
export function groupExercisesIntoBlocks<T extends { supersetId?: string; supersetNote?: string }>(
    exercises: T[]
): SupersetGroup<T>[] {
    if (exercises.length === 0) {
        return [];
    }

    // Map each unique supersetId that has at least 2 items to an alphabetical letter
    const supersetCounts = new Map<string, number>();
    for (const ex of exercises) {
        if (ex.supersetId) {
            supersetCounts.set(ex.supersetId, (supersetCounts.get(ex.supersetId) ?? 0) + 1);
        }
    }

    const supersetLetterMap = new Map<string, string>();
    let letterIndex = 0;
    for (const ex of exercises) {
        if (ex.supersetId && (supersetCounts.get(ex.supersetId) ?? 0) >= 2) {
            if (!supersetLetterMap.has(ex.supersetId)) {
                supersetLetterMap.set(ex.supersetId, getAlphabeticalLabel(letterIndex++));
            }
        }
    }

    const groups: SupersetGroup<T>[] = [];
    let currentGroup: SupersetGroup<T> | null = null;
    const supersetItemCounters = new Map<string, number>();

    for (let originalIndex = 0; originalIndex < exercises.length; originalIndex++) {
        const ex = exercises[originalIndex];
        const sid = ex.supersetId;
        const isValidSuperset = Boolean(sid && (supersetCounts.get(sid) ?? 0) >= 2);

        if (isValidSuperset && sid) {
            const letter = supersetLetterMap.get(sid) ?? 'A';
            const count = (supersetItemCounters.get(sid) ?? 0) + 1;
            supersetItemCounters.set(sid, count);
            const tag = `${letter}${String(count)}`;

            // If the current group is already collecting this supersetId, append to it
            if (currentGroup && currentGroup.isSuperset && currentGroup.supersetId === sid) {
                currentGroup.items.push({ item: ex, originalIndex, tag });
                if (!currentGroup.note && ex.supersetNote) {
                    currentGroup.note = ex.supersetNote;
                }
            } else {
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                currentGroup = {
                    isSuperset: true,
                    supersetId: sid,
                    letter,
                    label: `Superset ${letter}`,
                    note: ex.supersetNote,
                    items: [{ item: ex, originalIndex, tag }]
                };
            }
        } else {
            // Standalone exercise
            if (currentGroup) {
                groups.push(currentGroup);
                currentGroup = null;
            }
            groups.push({
                isSuperset: false,
                items: [{ item: ex, originalIndex }]
            });
        }
    }

    if (currentGroup) {
        groups.push(currentGroup);
    }

    return groups;
}

/**
 * Links an exercise with the next adjacent exercise into a superset.
 */
export function linkWithNext<T extends { supersetId?: string; supersetNote?: string }>(
    exercises: T[],
    index: number
): T[] {
    if (index < 0 || index >= exercises.length - 1) {
        return [...exercises];
    }

    const nextIndex = index + 1;
    const current = exercises[index];
    const next = exercises[nextIndex];

    const result = exercises.map(ex => ({ ...ex }));

    const targetSupersetId = current.supersetId ?? next.supersetId ?? generateSupersetId();
    const targetNote = current.supersetNote ?? next.supersetNote ?? '';

    result[index] = {
        ...result[index],
        supersetId: targetSupersetId,
        ...(targetNote ? { supersetNote: targetNote } : {})
    };

    result[nextIndex] = {
        ...result[nextIndex],
        supersetId: targetSupersetId,
        ...(targetNote ? { supersetNote: targetNote } : {})
    };

    return result;
}

/**
 * Unlinks an exercise from its superset.
 * If only 1 exercise remains with that supersetId, that remaining exercise is also unlinked.
 */
export function unlinkFromSuperset<T extends { supersetId?: string; supersetNote?: string }>(
    exercises: T[],
    index: number
): T[] {
    if (index < 0 || index >= exercises.length) {
        return [...exercises];
    }

    const sid = exercises[index].supersetId;
    if (!sid) {
        return [...exercises];
    }

    const result = exercises.map((ex, idx) => {
        if (idx === index) {
            const copy = { ...ex };
            delete copy.supersetId;
            delete copy.supersetNote;
            return copy;
        }
        return { ...ex };
    });

    // Check how many items still have this supersetId
    const remainingMatching = result.filter(ex => ex.supersetId === sid);
    if (remainingMatching.length === 1) {
        // Auto-clean the lone item
        return result.map(ex => {
            if (ex.supersetId === sid) {
                const copy = { ...ex };
                delete copy.supersetId;
                delete copy.supersetNote;
                return copy;
            }
            return ex;
        });
    }

    return result;
}

/**
 * Updates the superset note across all exercises that share the given supersetId.
 */
export function updateSupersetNote<T extends { supersetId?: string; supersetNote?: string }>(
    exercises: T[],
    supersetId: string,
    note: string
): T[] {
    return exercises.map(ex => {
        if (ex.supersetId === supersetId) {
            const copy = { ...ex };
            if (note.trim()) {
                copy.supersetNote = note;
            } else {
                delete copy.supersetNote;
            }
            return copy;
        }
        return { ...ex };
    });
}
