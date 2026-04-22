import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile as dbUpdateUserProfile } from '../services/db';
import type { UserProfile } from '../types';

export const useUserProfile = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!currentUser) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getUserProfile(currentUser.uid);
            
            if (data) {
                setProfile(data);
            } else {
                // Default profile data
                setProfile({
                    uid: currentUser.uid,
                    name: currentUser.displayName ?? currentUser.email?.split('@')[0] ?? 'Anonymous Athlete',
                    notes: '',
                    markedExercises: {},
                    weights: [],
                    measurements: []
                } as UserProfile);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        void fetchProfile();
    }, [fetchProfile]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!currentUser) return;
        
        try {
            await dbUpdateUserProfile(currentUser.uid, updates);
            setProfile(prev => prev ? { ...prev, ...updates } : null);
            return true;
        } catch (err) {
            console.error('Error updating user profile:', err);
            throw err;
        }
    };

    return {
        profile,
        loading,
        error,
        setProfile,
        updateProfile,
        refreshProfile: fetchProfile
    };
};
