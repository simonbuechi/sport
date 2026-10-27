export type ExertionMode = 'rpe' | 'rir';

/**
 * Converts RPE (Rate of Perceived Exertion) to RIR (Reps In Reserve).
 * Formula: RIR = max(0, 10 - RPE)
 */
export function rpeToRir(rpe: number): number {
    const val = 10 - rpe;
    return Math.max(0, Math.round(val * 10) / 10);
}

/**
 * Converts RIR (Reps In Reserve) to RPE (Rate of Perceived Exertion).
 * Formula: RPE = max(0, 10 - RIR)
 */
export function rirToRpe(rir: number): number {
    const val = 10 - rir;
    return Math.max(0, Math.round(val * 10) / 10);
}

/**
 * Calculates both rpe and rir from a user-entered value given the active mode.
 */
export function calculateExertionValues(
    value: number | undefined,
    mode: ExertionMode
): { rpe?: number; rir?: number } {
    if (value === undefined || isNaN(value)) {
        return { rpe: undefined, rir: undefined };
    }

    if (mode === 'rpe') {
        const clampedRpe = Math.min(10, Math.max(0, Math.round(value * 2) / 2));
        return {
            rpe: clampedRpe,
            rir: rpeToRir(clampedRpe)
        };
    } else {
        const clampedRir = Math.max(0, Math.round(value * 2) / 2);
        return {
            rir: clampedRir,
            rpe: rirToRpe(clampedRir)
        };
    }
}

/**
 * Returns the exertion value to display in the user's preferred mode ('rpe' or 'rir').
 */
export function getDisplayedExertion(
    set: { rpe?: number; rir?: number } | undefined,
    mode: ExertionMode
): number | undefined {
    if (!set) return undefined;

    if (mode === 'rpe') {
        if (set.rpe !== undefined) return set.rpe;
        if (set.rir !== undefined) return rirToRpe(set.rir);
    } else {
        if (set.rir !== undefined) return set.rir;
        if (set.rpe !== undefined) return rpeToRir(set.rpe);
    }
    return undefined;
}

/**
 * Formats an exertion string for chip/summary labels (e.g. "@ RPE 8" or "@ 2 RIR").
 */
export function formatExertionLabel(
    set: { rpe?: number; rir?: number } | undefined,
    mode: ExertionMode
): string {
    const value = getDisplayedExertion(set, mode);
    if (value === undefined) return '';

    if (mode === 'rpe') {
        return `@ RPE ${String(value)}`;
    }
    return `@ ${String(value)} RIR`;
}
