import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { subscribeToUserProfile, updateUserProfile as dbUpdateUserProfile } from '../services/db';
import { useAuth } from './AuthContext';
import type { UserProfile } from '../types';

interface UserProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useUserProfile = () => {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Reset state during render if user logs out (React recommended pattern)
    const [prevUserUid, setPrevUserUid] = useState<string | null>(currentUser?.uid ?? null);
    if (currentUser?.uid !== prevUserUid) {
        if (!currentUser) {
            setProfile(null);
            setLoading(false);
        } else {
            setLoading(true);
            setError(null);
        }
        setPrevUserUid(currentUser?.uid ?? null);
    }

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToUserProfile(currentUser.uid, (data) => {
            if (data) {
                setProfile(data);
            } else {
                // Initial default profile if none exists in DB
                setProfile({
                    uid: currentUser.uid,
                    name: currentUser.displayName ?? currentUser.email?.split('@')[0] ?? 'Anonymous Athlete',
                    notes: '',
                    markedExercises: {},
                    weights: [],
                    measurements: [],
                    settings: {
                        showTimer: true
                    }
                } as UserProfile);
            }
            setLoading(false);
        });

        return () => { unsubscribe(); };
    }, [currentUser]);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        if (!currentUser) return false;
        
        try {
            await dbUpdateUserProfile(currentUser.uid, updates);
            // State will be updated via onSnapshot
            return true;
        } catch (_err) {
            // console.error('Error updating user profile:', _err);
            setError('Failed to update profile');
            throw _err;
        }
    }, [currentUser]);

    const value = useMemo(() => ({
        profile,
        loading,
        error,
        updateProfile
    }), [profile, loading, error, updateProfile]);

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
};
