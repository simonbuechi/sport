import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { subscribeToWorkouts, subscribeToTemplates } from '../services/db';
import { useAuth } from './AuthContext';
import type { Workout, TrainingTemplate } from '../types';

interface WorkoutsContextType {
    entries: Workout[];
    templates: TrainingTemplate[];
    loading: boolean;
    loadMore: () => void;
    hasMore: boolean;
    currentLimit: number;
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
    const [loading, setLoading] = useState(true);
    const [currentLimit, setCurrentLimit] = useState(50);
    const [hasMore, setHasMore] = useState(true);

    // Reset state during render if user logs out (React recommended pattern)
    const [prevUserUid, setPrevUserUid] = useState<string | null>(currentUser?.uid ?? null);
    if (currentUser?.uid !== prevUserUid) {
        if (!currentUser) {
            setEntries([]);
            setTemplates([]);
            setLoading(false);
            setCurrentLimit(50);
            setHasMore(true);
        } else {
            setLoading(true);
        }
        setPrevUserUid(currentUser?.uid ?? null);
    }

    useEffect(() => {
        if (!currentUser) return;

        // Subscribe to workouts with dynamic limit
        const unsubscribeEntries = subscribeToWorkouts(
            currentUser.uid, 
            (data) => {
                setEntries(data);
                setLoading(false);
                // If we got fewer items than requested, we reached the end
                setHasMore(data.length === currentLimit);
            }, 
            currentLimit
        );

        // Subscribe to templates
        const unsubscribeTemplates = subscribeToTemplates(
            currentUser.uid,
            (data) => {
                setTemplates(data);
            }
        );

        return () => {
            unsubscribeEntries();
            unsubscribeTemplates();
        };
    }, [currentUser, currentLimit]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setCurrentLimit(prev => prev + 50);
        }
    }, [loading, hasMore]);

    const value = useMemo(() => ({ 
        entries, 
        templates, 
        loading, 
        loadMore, 
        hasMore,
        currentLimit
    }), [entries, templates, loading, loadMore, hasMore, currentLimit]);

    return (
        <WorkoutsContext.Provider value={value}>
            {children}
        </WorkoutsContext.Provider>
    );
};
