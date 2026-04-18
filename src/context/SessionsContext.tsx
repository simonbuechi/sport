import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { subscribeToJournalEntries, subscribeToTemplates } from '../services/db';
import { useAuth } from './AuthContext';
import type { ActivityLog, TrainingTemplate } from '../types';

interface SessionsContextType {
    entries: ActivityLog[];
    templates: TrainingTemplate[];
    loading: boolean;
    error: string;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSessions = () => {
    const context = useContext(SessionsContext);
    if (context === undefined) {
        throw new Error('useSessions must be used within a SessionsProvider');
    }
    return context;
};

export const SessionsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<ActivityLog[]>([]);
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEntries(prev => prev.length > 0 ? [] : prev);
            setTemplates(prev => prev.length > 0 ? [] : prev);
            setLoading(prev => prev ? false : prev);
            return;
        }

        if (!loading) setLoading(true);
        setError('');

        // Subscribe to journal entries (limit to 100 for global state, pages can fetch more if needed)
        const unsubscribeEntries = subscribeToJournalEntries(
            currentUser.uid, 
            (data) => {
                setEntries(data);
                setLoading(false);
            }, 
            100
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
    }, [currentUser, loading]);

    return (
        <SessionsContext.Provider value={{ entries, templates, loading, error }}>
            {children}
        </SessionsContext.Provider>
    );
};
