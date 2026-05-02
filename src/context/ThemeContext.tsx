import { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from '../theme/theme';
import { useUserProfile } from '../hooks/useUserProfile';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'sport-amigo-theme-mode';

interface ThemeContextType {
    mode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useAppTheme must be used within a ThemeProvider');
    }
    return context;
};

const getStoredTheme = (): ThemeMode => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light' || stored === 'system') return stored as ThemeMode;
    } catch {
        // localStorage may be unavailable
    }
    return 'system';
};

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    const { profile } = useUserProfile();
    const [mode, setMode] = useState<ThemeMode>(getStoredTheme);

    // Sync theme from profile when it loads (React recommendation for mirroring state)
    const [prevProfileTheme, setPrevProfileTheme] = useState<ThemeMode | undefined>(undefined);
    if (profile?.settings?.theme && profile.settings.theme !== prevProfileTheme) {
        setMode(profile.settings.theme);
        setPrevProfileTheme(profile.settings.theme);
    }

    const setThemeMode = useCallback((newMode: ThemeMode) => {
        setMode(newMode);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newMode);
        } catch {
            // localStorage may be unavailable
        }
    }, []);

    // Helper to get the actual palette mode (light or dark)
    const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() => {
        const initialMode = getStoredTheme();
        if (initialMode === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return initialMode;
    });

    // Sync resolvedMode during render if not system
    const [prevMode, setPrevMode] = useState<ThemeMode>(mode);
    if (mode !== prevMode) {
        if (mode !== 'system') {
            setResolvedMode(mode);
        } else {
            setResolvedMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }
        setPrevMode(mode);
    }

    useEffect(() => {
        if (mode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setResolvedMode(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [mode]);

    const theme = useMemo(() => getAppTheme(resolvedMode), [resolvedMode]);

    return (
        <ThemeContext.Provider value={{ mode, setThemeMode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
