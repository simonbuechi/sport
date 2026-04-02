import { createTheme, type PaletteMode } from '@mui/material/styles';

// ==========================================
// CENTRAL THEME CONFIGURATION
// Modify these values to quickly change the app's look and feel
// ==========================================

export const THEME_COLORS = {
    light: {
        primary: '#9123A6',    // Vibrant Blue
        secondary: '#D7195F',  // Amber/Warm Orange
        background: '#f0f5f7ff', // Soft Off-white
        paper: '#FFFFFF',
    },
    dark: {
        primary: '#D7195F',    // Light Blue
        secondary: '#9123A6',  // Light Amber
        background: '#0c1b27ff', // Slate Dark
        paper: '#1c3243ff',      // Slate Slightly Lighter
    }
};

export const getAppTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === 'dark' ? THEME_COLORS.dark.primary : THEME_COLORS.light.primary,
        },
        secondary: {
            main: mode === 'dark' ? THEME_COLORS.dark.secondary : THEME_COLORS.light.secondary,
        },
        background: {
            default: mode === 'dark' ? THEME_COLORS.dark.background : THEME_COLORS.light.background,
            paper: mode === 'dark' ? THEME_COLORS.dark.paper : THEME_COLORS.light.paper,
        },
    },
    typography: {
        fontSize: 12, // Default is 14px. Adjust this to globally change font size.
        fontFamily: '"Poppins", "Inter", "Roboto", "Segoe UI", sans-serif',
        h1: {
            fontWeight: 600,
            letterSpacing: '-0.02em',
            fontSize: 20,
        },
        h2: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
            fontSize: 20,
        },
        h3: {
            fontWeight: 600,
            fontSize: 20,
        },
        h4: {
            fontWeight: 600,
            fontSize: 20,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.02em',
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                },
                contained: ({ theme }) => ({
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: '#fff',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 10%, ${theme.palette.secondary.main} 110%)`,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: mode === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 100,
                    fontWeight: 400,
                },
            },
            variants: [
                {
                    props: { variant: 'outlined', color: 'primary' },
                    style: ({ theme }) => ({
                        backgroundColor: mode === 'dark'
                            ? 'rgba(215, 25, 95, 0.12)'
                            : 'rgba(145, 35, 166, 0.08)',
                        border: 0,
                        color: theme.palette.primary.main,
                        textTransform: 'capitalize',
                        fontSize: '0.75rem',
                        '& .MuiChip-label': {
                            paddingLeft: 10,
                            paddingRight: 10,
                        }
                    })
                }
            ]
        },
    },
});
