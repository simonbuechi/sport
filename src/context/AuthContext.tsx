import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { type User, onAuthStateChanged, signOut as firebaseSignOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, persistenceReady } from '../firebase/config';
import PageLoader from '../components/common/PageLoader';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    googleSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = useCallback(() => {
        return firebaseSignOut(auth);
    }, []);

    const googleSignIn = useCallback(async () => {
        await persistenceReady;
        await signInWithPopup(auth, googleProvider);
    }, []);

    const value = {
        currentUser,
        loading,
        logout,
        googleSignIn
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <PageLoader /> : children}
        </AuthContext.Provider>
    );
};
