import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import {
    subscribeToWorkouts,
    subscribeToTemplates,
    subscribeToPrograms,
    setActiveProgram as dbSetActiveProgram,
    advanceProgramDay as dbAdvanceProgramDay
} from '../services/db';
import { useAuth } from './AuthContext';
import type { Workout, TrainingTemplate, Program } from '../types';

interface WorkoutsContextType {
    entries: Workout[];
    templates: TrainingTemplate[];
    programs: Program[];
    activeProgram: Program | null;
    loading: boolean;
    programsLoading: boolean;
    loadMore: () => void;
    hasMore: boolean;
    currentLimit: number;
    activateProgram: (programId: string | null) => Promise<void>;
    advanceActiveDay: (targetIndex?: number) => Promise<void>;
}

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkouts = () => {
    const context = useContext(WorkoutsContext);
    if (context === undefined) {
        throw new Error('useWorkouts must be used within a WorkoutsProvider');
    }
    return context;
};

export const WorkoutsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<Workout[]>([]);
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [programsLoading, setProgramsLoading] = useState(true);
    const [currentLimit, setCurrentLimit] = useState(10);
    const [hasMore, setHasMore] = useState(true);

    // Reset state during render if user logs out (React recommended pattern)
    const [prevUserUid, setPrevUserUid] = useState<string | null>(currentUser?.uid ?? null);
    const currentUid = currentUser?.uid ?? null;
    if (currentUid !== prevUserUid) {
        if (!currentUser) {
            setEntries([]);
            setTemplates([]);
            setPrograms([]);
            setLoading(false);
            setProgramsLoading(false);
            setCurrentLimit(10);
            setHasMore(true);
        } else {
            setLoading(true);
            setProgramsLoading(true);
        }
        setPrevUserUid(currentUid);
    }

    useEffect(() => {
        const uid = currentUser?.uid;
        if (!uid) return;

        // Subscribe to workouts with dynamic limit
        const unsubscribeEntries = subscribeToWorkouts(
            uid,
            (data) => {
                setEntries(data);
                setLoading(false);
                setHasMore(data.length === currentLimit);
            },
            currentLimit
        );

        return () => {
            unsubscribeEntries();
        };
    }, [currentUser?.uid, currentLimit]);

    useEffect(() => {
        const uid = currentUser?.uid;
        if (!uid) return;

        // Subscribe to templates
        const unsubscribeTemplates = subscribeToTemplates(
            uid,
            (data) => {
                setTemplates(data);
            }
        );

        // Subscribe to programs
        const unsubscribePrograms = subscribeToPrograms(
            uid,
            (data) => {
                setPrograms(data);
                setProgramsLoading(false);
            }
        );

        return () => {
            unsubscribeTemplates();
            unsubscribePrograms();
        };
    }, [currentUser?.uid]);

    const activeProgram = useMemo(() => {
        return programs.find(p => p.isActive) ?? null;
    }, [programs]);

    const activateProgram = useCallback(async (programId: string | null) => {
        const uid = currentUser?.uid;
        if (!uid) return;
        await dbSetActiveProgram(uid, programId, programs);
    }, [currentUser?.uid, programs]);

    const advanceActiveDay = useCallback(async (targetIndex?: number) => {
        const uid = currentUser?.uid;
        if (!uid || !activeProgram) return;
        await dbAdvanceProgramDay(uid, activeProgram, targetIndex);
    }, [currentUser?.uid, activeProgram]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setCurrentLimit(prev => prev + 50);
        }
    }, [loading, hasMore]);

    const value = useMemo(() => ({
        entries,
        templates,
        programs,
        activeProgram,
        loading,
        programsLoading,
        loadMore,
        hasMore,
        currentLimit,
        activateProgram,
        advanceActiveDay
    }), [
        entries,
        templates,
        programs,
        activeProgram,
        loading,
        programsLoading,
        loadMore,
        hasMore,
        currentLimit,
        activateProgram,
        advanceActiveDay
    ]);

    return (
        <WorkoutsContext.Provider value={value}>
            {children}
        </WorkoutsContext.Provider>
    );
};
