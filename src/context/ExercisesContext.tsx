import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { getExercises as fetchExercises, getAllExercises } from '../services/db';
import type { Exercise } from '../types';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

interface ExercisesContextType {
    exercises: Exercise[];
    allExercises: Exercise[];
    loading: boolean;
    loadingMore: boolean;
    error: string;
    hasMore: boolean;
    loadExercises: () => Promise<void>;
    loadMore: () => Promise<void>;
    refreshExercises: () => Promise<void>;
    fetchAllExercises: () => Promise<void>;
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
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const lastVisibleRef = useRef<QueryDocumentSnapshot | null>(null);
    const hasFetched = useRef(false);

    const PAGE_SIZE = 20;

    const loadExercises = useCallback(async (force = false) => {
        // Return cached data if already fetched and not forced
        if (hasFetched.current && !force) return;

        try {
            setLoading(true);
            setError('');
            const result = await fetchExercises(PAGE_SIZE);
            
            setExercises(result.exercises);
            lastVisibleRef.current = result.lastVisible;
            setHasMore(result.exercises.length === PAGE_SIZE);
            hasFetched.current = true;
        } catch (err) {
            console.error(err);
            setError('Failed to load exercises.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || loading) return;

        try {
            setLoadingMore(true);
            setError('');
            const result = await fetchExercises(PAGE_SIZE, lastVisibleRef.current ?? undefined);
            
            setExercises(prev => [...prev, ...result.exercises]);
            lastVisibleRef.current = result.lastVisible;
            setHasMore(result.exercises.length === PAGE_SIZE);
        } catch (err) {
            console.error(err);
            setError('Failed to load more exercises.');
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, loading]);

    const fetchAllExercises = useCallback(async () => {
        if (allExercises.length > 0) return;

        try {
            setLoading(true);
            setError('');
            const data = await getAllExercises();
            setAllExercises(data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch all exercises.');
        } finally {
            setLoading(false);
        }
    }, [allExercises.length]);

    const refreshExercises = useCallback(async () => {
        hasFetched.current = false;
        lastVisibleRef.current = null;
        setHasMore(true);
        setAllExercises([]); // Reset all exercises on refresh
        await loadExercises(true);
    }, [loadExercises]);

    return (
        <ExercisesContext.Provider value={{ 
            exercises, 
            allExercises,
            loading, 
            loadingMore, 
            error, 
            hasMore, 
            loadExercises: () => loadExercises(false), 
            loadMore, 
            refreshExercises,
            fetchAllExercises
        }}>
            {children}
        </ExercisesContext.Provider>
    );
};
