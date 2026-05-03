import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { subscribeToUserProfile, updateUserProfile as dbUpdateUserProfile, addWeightEntry, addMeasurementEntry, updateExerciseStatusInProfile } from '../services/db';
import { useAuth } from './AuthContext';
import type { UserProfile, WeightEntry, MeasurementEntry, MarkedStatus } from '../types';

interface UserProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
    addWeight: (entry: WeightEntry) => Promise<boolean>;
    addMeasurement: (entry: MeasurementEntry) => Promise<boolean>;
    updateExerciseStatus: (exerciseId: string, status: Partial<MarkedStatus>) => Promise<boolean>;
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
    const currentUid = currentUser?.uid ?? null;
    if (currentUid !== prevUserUid) {
        if (!currentUser) {
            setProfile(null);
            setLoading(false);
        } else {
            setLoading(true);
            setError(null);
        }
        setPrevUserUid(currentUid);
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

    const addWeight = useCallback(async (entry: WeightEntry) => {
        if (!currentUser) return false;
        try {
            await addWeightEntry(currentUser.uid, entry);
            return true;
        } catch (_err) {
            setError('Failed to add weight entry');
            throw _err;
        }
    }, [currentUser]);

    const addMeasurement = useCallback(async (entry: MeasurementEntry) => {
        if (!currentUser) return false;
        try {
            await addMeasurementEntry(currentUser.uid, entry);
            return true;
        } catch (_err) {
            setError('Failed to add measurement entry');
            throw _err;
        }
    }, [currentUser]);

    const updateExerciseStatus = useCallback(async (exerciseId: string, status: Partial<MarkedStatus>) => {
        if (!currentUser) return false;
        try {
            await updateExerciseStatusInProfile(currentUser.uid, exerciseId, status);
            return true;
        } catch (_err) {
            setError('Failed to update exercise status');
            throw _err;
        }
    }, [currentUser]);

    const value = useMemo(() => ({
        profile,
        loading,
        error,
        updateProfile,
        addWeight,
        addMeasurement,
        updateExerciseStatus
    }), [profile, loading, error, updateProfile, addWeight, addMeasurement, updateExerciseStatus]);

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
};
