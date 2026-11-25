import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { fetchExercises } from '../services/db';
import { useAuth } from './AuthContext';
import type { Exercise } from '../types';

interface ExercisesContextType {
    exercises: Exercise[];
    loading: boolean;
    error: string | null;
    refreshExercises: () => Promise<void>;
}

const ExercisesContext = createContext<ExercisesContextType | undefined>(undefined);

const SESSION_SYNC_KEY = 'sport_amigo_exercises_synced';

// eslint-disable-next-line react-refresh/only-export-components
export const useExercises = () => {
    const context = useContext(ExercisesContext);
    if (context === undefined) {
        throw new Error('useExercises must be used within an ExercisesProvider');
    }
    return context;
};

export const ExercisesProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(Boolean(currentUser));
    const [error, setError] = useState<string | null>(null);

    const [prevUid, setPrevUid] = useState<string | null>(currentUser?.uid ?? null);
    const currentUid = currentUser?.uid ?? null;
    if (currentUid !== prevUid) {
        if (!currentUser) {
            setExercises([]);
            setLoading(false);
            setError(null);
        } else {
            setLoading(true);
            setError(null);
        }
        setPrevUid(currentUid);
    }

    const loadExercises = useCallback(async (forceServer = false) => {
        if (!currentUid) return;
        setLoading(true);
        setError(null);
        try {
            const alreadySyncedInSession = sessionStorage.getItem(SESSION_SYNC_KEY) === '1';
            const data = await fetchExercises(forceServer || !alreadySyncedInSession);
            sessionStorage.setItem(SESSION_SYNC_KEY, '1');
            setExercises(data);
        } catch (err) {
            console.error('Failed to load exercises:', err);
            setError('Failed to load exercises');
        } finally {
            setLoading(false);
        }
    }, [currentUid]);

    useEffect(() => {
        if (!currentUid) return;
        void loadExercises(false);
    }, [currentUid, loadExercises]);

    const refreshExercises = useCallback(async () => {
        await loadExercises(true);
    }, [loadExercises]);

    const value = useMemo(() => ({
        exercises,
        loading,
        error,
        refreshExercises
    }), [exercises, loading, error, refreshExercises]);

    return (
        <ExercisesContext.Provider value={value}>
            {children}
        </ExercisesContext.Provider>
    );
};
