import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { getAllExercises } from '../services/db';
import type { Exercise } from '../types';

interface ExercisesContextType {
    exercises: Exercise[];
    loading: boolean;
    error: string;
    loadExercises: () => Promise<void>;
    refreshExercises: () => Promise<void>;
}

const ExercisesContext = createContext<ExercisesContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useExercises = () => {
    const context = useContext(ExercisesContext);
    if (context === undefined) {
        throw new Error('useExercises must be used within an ExercisesProvider');
    }
    return context;
};

export const ExercisesProvider = ({ children }: { children: ReactNode }) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const hasFetched = useRef(false);

    const loadExercises = useCallback(async (force = false) => {
        // Return cached data if already fetched and not forced
        if (hasFetched.current && !force) return;

        try {
            setLoading(true);
            setError('');
            const data = await getAllExercises();
            setExercises(data);
            hasFetched.current = true;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to load exercises.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadExercises();
    }, [loadExercises]);

    const refreshExercises = useCallback(async () => {
        hasFetched.current = false;
        await loadExercises(true);
    }, [loadExercises]);

    return (
        <ExercisesContext.Provider value={{ 
            exercises, 
            loading, 
            error, 
            loadExercises: () => loadExercises(false), 
            refreshExercises
        }}>
            {children}
        </ExercisesContext.Provider>
    );
};
