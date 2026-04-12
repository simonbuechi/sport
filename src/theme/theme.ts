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
        warning: '#fbc02d',    // Vibrant Yellow-Gold (less orange)
    },
    dark: {
        primary: '#D7195F',    // Light Blue
        secondary: '#9123A6',  // Light Amber
        background: '#0c1b27ff', // Slate Dark
        paper: '#1c3243ff',      // Slate Slightly Lighter
        warning: '#ffb300',      // Balanced Amber for Dark Mode
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
        warning: {
            main: mode === 'dark' ? THEME_COLORS.dark.warning : THEME_COLORS.light.warning,
        },
    },
    typography: {
        fontSize: 12, // Default is 14px. Adjust this to globally change font size.
        fontFamily: '"Poppins", "Inter", "Roboto", "Segoe UI", sans-serif',
        h1: {
            fontSize: 18,
            fontWeight: 600,
        },
        h2: {
            fontSize: 18,
            fontWeight: 600,
        },
        h3: {
            fontSize: 18,
            fontWeight: 600,
        },
        h4: {
            fontSize: 18,
            fontWeight: 600,
        },
        h5: {
            fontSize: 14,
            fontWeight: 600,
        },
        h6: {
            fontSize: 14,
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
                    padding: 0, // Cards usually have their own internal structure (CardContent)
                    boxShadow: mode === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
                rounded: {
                    borderRadius: 12,
                },
                outlined: {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                }
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    padding: '24px 24px 16px', // Title stays consistent for now
                    '@media (max-width: 600px)': {
                        padding: '16px 16px 8px',
                    },
                    fontWeight: 600,
                }
            }
        },
        MuiDialogContent: {
            styleOverrides: {
                root: ({ theme }) => ({
                    padding: theme.spacing(1, 3, 3),
                    '@media (max-width: 600px)': {
                        padding: theme.spacing(1, 2, 2),
                    },
                })
            }
        },
        MuiDialogActions: {
            styleOverrides: {
                root: ({ theme }) => ({
                    padding: theme.spacing(2, 3),
                    '@media (max-width: 600px)': {
                        padding: theme.spacing(1.5, 2),
                    },
                })
            }
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
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.05)',
                        border: '1px solid',
                        borderColor: mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 0, 0, 0.12)',
                        color: theme.palette.text.secondary,
                        textTransform: 'capitalize',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        '& .MuiChip-label': {
                            paddingLeft: 10,
                            paddingRight: 10,
                        }
                    })
                }
            ]
        },
        MuiAvatar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }),
                img: {
                    padding: '6px',
                    objectFit: 'contain',
                },
            },
        },
    },
});
